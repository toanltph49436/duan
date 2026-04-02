import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

type Location = { locationName?: string; country?: string };

type Hotel = { _id: string; hotelName: string; address?: string; starRating?: number; status?: boolean; location?: Location };

type Employee = { _id: string; full_name?: string; firstName?: string; lastName?: string; email: string; department: string; status: string };

type Assignment = { _id: string; hotelId: string; employeeId: string; status: string };

const HotelAssignment: React.FC = () => {
    const { getToken } = useAuth();
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selected, setSelected] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true); setError("");
                const token = await getToken();
                const [h, e, a] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/hotels', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:8080/api/employee/admin/list', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:8080/api/hotel-assignment/admin/all', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const hd = await h.json(); const ed = await e.json(); const ad = await a.json();
                if (!h.ok) throw new Error(hd.message || 'Load hotels failed');
                if (!e.ok) throw new Error(ed.message || 'Load employees failed');
                if (!a.ok) throw new Error(ad.message || 'Load assignments failed');
                setHotels(hd.hotels || hd.data || []);
                const hotelEmployees: Employee[] = (ed.employees || ed.data || []).filter((x: Employee) => x.status === 'active' && x.department === 'hotel');
                setEmployees(hotelEmployees);
                const as: Assignment[] = (ad.assignments || []).map((x: any) => ({ _id: x._id, hotelId: String(x.hotelId?._id || x.hotelId), employeeId: String(x.employeeId?._id || x.employeeId), status: x.status }));
                setAssignments(as);
                const pre: Record<string, string> = {}; as.forEach(a => { if (a.status === 'active') pre[a.hotelId] = a.employeeId; });
                setSelected(pre);
            } catch (err: any) { setError(err?.message || 'Load failed'); } finally { setLoading(false); }
        };
        load();
    }, [getToken]);

    const assignmentByHotel = useMemo(() => {
        const m: Record<string, Assignment> = {}; assignments.forEach(a => m[a.hotelId] = a); return m;
    }, [assignments]);

    const onChange = (hotelId: string, employeeId: string) => setSelected(p => ({ ...p, [hotelId]: employeeId }));

    const validateUnique = (hotelId: string, employeeId: string) => !assignments.find(a => a.status === 'active' && a.employeeId === employeeId && a.hotelId !== hotelId);

    const assign = async (hotel: Hotel) => {
        const employeeId = selected[hotel._id];
        if (!employeeId) { alert('Vui lòng chọn nhân viên'); return; }
        if (!validateUnique(hotel._id, employeeId)) { alert('Mỗi nhân viên chỉ được quản lý 1 khách sạn.'); return; }
        try {
            setLoading(true);
            const token = await getToken();
            const exist = assignmentByHotel[hotel._id];
            const url = exist ? `http://localhost:8080/api/hotel-assignment/admin/update/${exist._id}` : `http://localhost:8080/api/hotel-assignment/admin/create`;
            const method = exist ? 'PUT' : 'POST';
            const body = exist ? { employeeId, status: 'active' } : { hotelId: hotel._id, employeeId, status: 'active' };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
            const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.message || 'Assign failed');
            const a = await fetch('http://localhost:8080/api/hotel-assignment/admin/all', { headers: { Authorization: `Bearer ${token}` } });
            const ad = await a.json(); const as: Assignment[] = (ad.assignments || []).map((x: any) => ({ _id: x._id, hotelId: String(x.hotelId?._id || x.hotelId), employeeId: String(x.employeeId?._id || x.employeeId), status: x.status }));
            setAssignments(as);
            alert('Phân công thành công!');
        } catch (err: any) { alert(err?.message || 'Lỗi khi phân công'); } finally { setLoading(false); }
    };

    const assignedCount = assignments.filter(a => a.status === 'active').length;
    const unassignedCount = Math.max(hotels.length - assignedCount, 0);
    const availableEmployees = employees.length;

    return (
        <div className="p-6 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 min-h-screen">
            {/* Header */}
            <div className="mb-6 rounded-xl p-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 text-white shadow">
                <h1 className="text-2xl font-bold mb-1">Phân công quản lý khách sạn</h1>
                <p className="opacity-90">Chỉ hiển thị nhân viên phòng ban "Hotel" (Active). Mỗi nhân viên chỉ quản lý một khách sạn.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-5 bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300">
                    <p className="text-emerald-800 text-sm">Đã phân công</p>
                    <p className="text-3xl font-extrabold text-emerald-700">{assignedCount}</p>
                    <p className="text-emerald-700 text-xs mt-1">Đang hoạt động</p>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300">
                    <p className="text-amber-800 text-sm">Chưa phân công</p>
                    <p className="text-3xl font-extrabold text-amber-700">{unassignedCount}</p>
                    <p className="text-amber-700 text-xs mt-1">Cần gán nhân viên</p>
                </div>
                <div className="rounded-xl p-5 bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 border border-fuchsia-300">
                    <p className="text-fuchsia-800 text-sm">Nhân viên khả dụng</p>
                    <p className="text-3xl font-extrabold text-fuchsia-700">{availableEmployees}</p>
                    <p className="text-fuchsia-700 text-xs mt-1">Phòng ban Hotel - Active</p>
                </div>
            </div>

            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách sạn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên quản lý</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {hotels.map(h => (
                                <tr key={h._id} className="hover:bg-teal-50/40">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{h.hotelName}</div>
                                        <div className="text-sm text-gray-500 break-words">📍 {h.location?.locationName || 'N/A'}, {h.location?.country || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            <div className="font-medium">⭐ {h.starRating || 0} sao</div>
                                            <div className="text-gray-500 break-words max-w-xs">{h.address || '—'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select value={selected[h._id] || ''} onChange={e => onChange(h._id, e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-teal-500 focus:border-teal-500" disabled={loading}>
                                            <option value="">— Chọn nhân viên (Hotel) —</option>
                                            {employees.map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.full_name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => assign(h)} disabled={loading || !selected[h._id]} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md disabled:opacity-50 shadow">
                                            {assignmentByHotel[h._id] ? 'Cập nhật' : 'Phân công'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {hotels.length === 0 && <div className="p-6 text-center text-gray-500">Chưa có khách sạn nào.</div>}
            </div>
        </div>
    );
};

export default HotelAssignment;

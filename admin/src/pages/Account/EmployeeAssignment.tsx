import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface Tour {
  _id: string;
  nameTour: string;
  destination: {
    _id: string;
    name: string;
    locationName: string;
  };
  departure_location: string;
  duration: string;
  price: number;
  finalPrice: number;
  tourType: string;
  status: boolean;
  assignedEmployee?: Employee;
}

interface Employee {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  full_name: string;
  phone_number?: string;
  employee_id: string;
  position: 'tour_guide' | 'customer_service' | 'manager' | 'other';
  department: 'tour' | 'hotel' | 'transport' | 'general';
  status: 'active' | 'inactive' | 'suspended';
}

interface DateSlot {
  _id: string;
  tour: string;
  dateTour: Date;
  availableSeats: number;
  bookedSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalRevenue: number;
}

const EmployeeAssignment: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateSlots, setDateSlots] = useState<DateSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTourType, setSelectedTourType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [dateAssignments, setDateAssignments] = useState<{[dateSlotId: string]: string}>({});
  const { getToken } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch tours with populated assignedEmployee
      const toursResponse = await fetch('http://localhost:8080/api/tour', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch employees (HDV)
      const employeesResponse = await fetch('http://localhost:8080/api/employee/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch date slots
      const dateSlotsResponse = await fetch('http://localhost:8080/api/dateslots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!toursResponse.ok || !employeesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const toursData = await toursResponse.json();
      const employeesData = await employeesResponse.json();
      
      console.log("Tours data:", toursData);
      setTours(toursData.tours || toursData.tour || []);
      // Filter only active employees for assignment
      const activeEmployees = (employeesData.employees || []).filter((emp: Employee) => emp.status === 'active');
      setEmployees(activeEmployees);
      
      if (dateSlotsResponse.ok) {
        const dateSlotsData = await dateSlotsResponse.json();
        console.log("DateSlots data:", dateSlotsData);
        setDateSlots(dateSlotsData.dateSlots || dateSlotsData.data || []);
      } else {
        console.warn("DateSlots API failed:", dateSlotsResponse.status);
        // Tạm thời set empty array để tránh lỗi
        setDateSlots([]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };



  const handleDateAssignment = (dateSlotId: string, employeeId: string) => {
    setDateAssignments(prev => ({
      ...prev,
      [dateSlotId]: employeeId
    }));
  };



  const saveDateAssignment = async (dateSlotId: string, tourId: string) => {
    try {
      const employeeId = dateAssignments[dateSlotId];
      if (!employeeId) {
        alert('Vui lòng chọn hướng dẫn viên');
        return;
      }

      const selectedEmployee = employees.find(emp => emp._id === employeeId);
      if (!selectedEmployee) {
        alert('Không tìm thấy thông tin hướng dẫn viên');
        return;
      }

      const currentSlot = dateSlots.find(slot => slot._id === dateSlotId);
      if (!currentSlot) {
        alert('Không tìm thấy thông tin ngày tour');
        return;
      }

      // Kiểm tra xung đột lịch trình cho ngày cụ thể
      const conflictSlots = dateSlots.filter(slot => {
        if (slot._id === dateSlotId) return false;
        if (!slot.assignedEmployee || slot.assignedEmployee._id !== employeeId) return false;
        return new Date(slot.dateTour).toDateString() === new Date(currentSlot.dateTour).toDateString();
      });

      if (conflictSlots.length > 0) {
        const conflictDate = new Date(currentSlot.dateTour).toLocaleDateString('vi-VN');
        const confirmMessage = `Hướng dẫn viên ${selectedEmployee.full_name || `${selectedEmployee.firstName} ${selectedEmployee.lastName}`} đã được phân công cho tour khác vào ngày ${conflictDate}. Bạn có muốn tiếp tục phân công không?`;
        
        if (!confirm(confirmMessage)) {
          return;
        }
      }

      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/dateslot/${dateSlotId}/assign-employee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId })
      });

      if (!response.ok) {
        throw new Error('Failed to assign employee to date slot');
      }

      alert('Phân công thành công!');
      fetchData();
      setDateAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[dateSlotId];
        return newAssignments;
      });
    } catch (error) {
      console.error('Lỗi khi phân công:', error);
      alert('Có lỗi xảy ra khi phân công. Vui lòng thử lại.');
    }
  };

  const getUpcomingToursForTour = (tourId: string) => {
    return dateSlots.filter(slot => {
      const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
      return slotTourId === tourId && slot.status === 'upcoming';
    }).length;
  };

  const getOngoingToursForTour = (tourId: string) => {
    return dateSlots.filter(slot => {
      const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
      return slotTourId === tourId && slot.status === 'ongoing';
    }).length;
  };

  // Kiểm tra tour có date slots trong 7 ngày tới không
  const hasUpcomingDatesIn7Days = (tourId: string) => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    
    console.log(`Checking tour ${tourId} for dates between ${now.toISOString()} and ${sevenDaysLater.toISOString()}`);
    
    const relevantSlots = dateSlots.filter(slot => {
      // Kiểm tra tour ID (có thể là string hoặc object)
      const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
      if (slotTourId !== tourId) return false;
      
      const slotDate = new Date(slot.dateTour);
      const isInRange = slotDate >= now && slotDate <= sevenDaysLater;
      const isUpcoming = slot.status === 'upcoming';
      
      console.log(`  Slot ${slot._id}: date=${slotDate.toISOString()}, status=${slot.status}, inRange=${isInRange}, isUpcoming=${isUpcoming}`);
      
      return isInRange && isUpcoming;
    });
    
    console.log(`  Found ${relevantSlots.length} relevant slots for tour ${tourId}`);
    return relevantSlots.length > 0;
  };

  const filteredTours = tours.filter(tour => {
    // Chỉ hiển thị tour có lịch trình trong 7 ngày tới
    const hasUpcomingDates = hasUpcomingDatesIn7Days(tour._id);
    if (!hasUpcomingDates) return false;

    const matchesSearch = tour.nameTour.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.departure_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTourType === 'all' || tour.tourType === selectedTourType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && tour.status) ||
                         (selectedStatus === 'inactive' && !tour.status);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const tourTypes = [...new Set(tours.map(tour => tour.tourType))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Lỗi: {error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Phân công Hướng dẫn viên Du lịch</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý và phân công HDV cho các tour trong 7 ngày tới
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          value={selectedTourType}
          onChange={(e) => setSelectedTourType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả loại tour</option>
          {tourTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800">Tour 7 ngày tới</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredTours.length}</p>
          <p className="text-xs text-blue-600 mt-1">Cần phân công HDV</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800">Ngày đã phân công</h3>
          <p className="text-2xl font-bold text-green-600">
            {dateSlots.filter(slot => slot.assignedEmployee && slot.status === 'upcoming').length}
          </p>
          <p className="text-xs text-green-600 mt-1">Trong 7 ngày tới</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800">Ngày chưa phân công</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {dateSlots.filter(slot => !slot.assignedEmployee && slot.status === 'upcoming').length}
          </p>
          <p className="text-xs text-yellow-600 mt-1">Cần HDV</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800">HDV có sẵn</h3>
          <p className="text-2xl font-bold text-purple-600">{employees.length}</p>
        </div>
      </div>

      {/* Tours Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại & Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian diễn ra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HDV phụ trách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour) => (
                <tr key={tour._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tour.nameTour}</div>
                      <div className="text-sm text-gray-500">
                        📍 {tour.departure_location} → {tour.destination?.locationName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">⏱️ {tour.duration}</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tour.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tour.status ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{tour.tourType}</div>
                      <div className="text-green-600 font-semibold">
                        {tour.finalPrice?.toLocaleString() || tour.price?.toLocaleString()} VNĐ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {/* Hiển thị thời gian tour trong 7 ngày tới */}
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        if (upcomingSlots.length > 0) {
                          const departureTime = tour.departure_time || "06:00";
                          const returnTime = tour.return_time || "18:00";
                          
                          return (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                📅 Lịch trình 7 ngày tới ({upcomingSlots.length} ngày):
                              </div>
                              {upcomingSlots.map((slot, index) => {
                                const tourDate = new Date(slot.dateTour);
                                const isToday = tourDate.toDateString() === new Date().toDateString();
                                const isTomorrow = tourDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                
                                let dateLabel = tourDate.toLocaleDateString('vi-VN');
                                if (isToday) dateLabel += " (Hôm nay)";
                                else if (isTomorrow) dateLabel += " (Ngày mai)";
                                
                                return (
                                  <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                                    <div className={`font-medium text-xs px-2 py-1 rounded mb-1 ${
                                      isToday ? 'bg-red-50 border-red-200 text-red-700' :
                                      isTomorrow ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                      'bg-blue-50 border-blue-200 text-blue-700'
                                    }`}>
                                      {dateLabel}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      🚀 {departureTime} - 🏁 {returnTime}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      👥 {slot.availableSeats - slot.bookedSeats}/{slot.availableSeats} chỗ trống
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="text-xs text-gray-600 mt-1">
                                ⏱️ Thời lượng: {tour.duration}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-xs text-gray-500 italic">
                              Không có lịch trình trong 7 ngày tới
                            </div>
                          );
                        }
                      })()} 
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        return upcomingSlots.map((slot, index) => {
                          const tourDate = new Date(slot.dateTour);
                          const assignedEmployee = slot.assignedEmployee;
                          
                          return (
                            <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {tourDate.toLocaleDateString('vi-VN')}
                              </div>
                              {assignedEmployee ? (
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                      <span className="text-green-600 font-medium text-xs">
                                        {(assignedEmployee.firstName?.[0] || '') + (assignedEmployee.lastName?.[0] || '')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-xs font-medium text-gray-900">
                                      {assignedEmployee.full_name || 
                                       `${assignedEmployee.firstName || ''} ${assignedEmployee.lastName || ''}`.trim() || 
                                       'Chưa cập nhật'}
                                    </div>
                                    <div className="text-xs text-gray-500">{assignedEmployee.email}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 italic">Chưa phân công</span>
                              )}
                            </div>
                          );
                        });
                      })()} 
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        return upcomingSlots.map((slot, index) => {
                          const tourDate = new Date(slot.dateTour);
                          
                          return (
                            <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {tourDate.toLocaleDateString('vi-VN')}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={dateAssignments[slot._id] || ''}
                                  onChange={(e) => handleDateAssignment(slot._id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                                >
                                  <option value="">Chọn HDV</option>
                                  {employees
                                    .filter(emp => emp.position === 'tour_guide' && emp.department === 'tour')
                                    .map(employee => {
                                      // Kiểm tra HDV có bị xung đột lịch cho ngày này không
                                      const hasConflict = dateSlots.some(otherSlot => {
                                        if (otherSlot._id === slot._id || !otherSlot.assignedEmployee) return false;
                                        if (otherSlot.assignedEmployee._id !== employee._id) return false;
                                        return new Date(otherSlot.dateTour).toDateString() === new Date(slot.dateTour).toDateString();
                                      });
                                      
                                      const displayName = `${employee.full_name || `${employee.firstName} ${employee.lastName}`} (${employee.employee_id})`;
                                      
                                      return (
                                        <option key={employee._id} value={employee._id}>
                                          {displayName} {hasConflict ? '⚠️ Xung đột' : ''}
                                        </option>
                                      );
                                    })}
                                </select>
                                {dateAssignments[slot._id] && (
                                  <button
                                    onClick={() => saveDateAssignment(slot._id, tour._id)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                  >
                                    Lưu
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()} 
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tour trong 7 ngày tới</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Không có tour nào phù hợp với từ khóa tìm kiếm trong 7 ngày tới.' : 'Không có tour nào diễn ra trong 7 ngày tới.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Old Table - Hidden but kept for reference */}
      <div className="hidden bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại & Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian diễn ra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HDV phụ trách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour) => (
                <tr key={tour._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tour.nameTour}</div>
                      <div className="text-sm text-gray-500">
                        📍 {tour.departure_location} → {tour.destination?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">⏱️ {tour.duration}</div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tour.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tour.status ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{tour.tourType}</div>
                      <div className="text-green-600 font-semibold">
                        {tour.finalPrice?.toLocaleString() || tour.price?.toLocaleString()} VNĐ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {/* Hiển thị thời gian tour trong 7 ngày tới */}
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        if (upcomingSlots.length > 0) {
                          const departureTime = tour.departure_time || "06:00";
                          const returnTime = tour.return_time || "18:00";
                          
                          return (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                📅 Lịch trình 7 ngày tới ({upcomingSlots.length} ngày):
                              </div>
                              {upcomingSlots.map((slot, index) => {
                                const tourDate = new Date(slot.dateTour);
                                const isToday = tourDate.toDateString() === new Date().toDateString();
                                const isTomorrow = tourDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                
                                let dateLabel = tourDate.toLocaleDateString('vi-VN');
                                if (isToday) dateLabel += " (Hôm nay)";
                                else if (isTomorrow) dateLabel += " (Ngày mai)";
                                
                                return (
                                  <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                                    <div className={`font-medium text-xs px-2 py-1 rounded mb-1 ${
                                      isToday ? 'bg-red-50 border-red-200 text-red-700' :
                                      isTomorrow ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                      'bg-blue-50 border-blue-200 text-blue-700'
                                    }`}>
                                      {dateLabel}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      🚀 {departureTime} - 🏁 {returnTime}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      👥 {slot.availableSeats - slot.bookedSeats}/{slot.availableSeats} chỗ trống
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="text-xs text-gray-600 mt-1">
                                ⏱️ Thời lượng: {tour.duration}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-xs text-gray-500 italic">
                              Không có lịch trình trong 7 ngày tới
                            </div>
                          );
                        }
                      })()} 
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        return upcomingSlots.map((slot, index) => {
                          const tourDate = new Date(slot.dateTour);
                          const assignedEmployee = slot.assignedEmployee;
                          
                          return (
                            <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {tourDate.toLocaleDateString('vi-VN')}
                              </div>
                              {assignedEmployee ? (
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-6 w-6">
                                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                      <span className="text-green-600 font-medium text-xs">
                                        {(assignedEmployee.firstName?.[0] || '') + (assignedEmployee.lastName?.[0] || '')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-xs font-medium text-gray-900">
                                      {assignedEmployee.full_name || 
                                       `${assignedEmployee.firstName || ''} ${assignedEmployee.lastName || ''}`.trim() || 
                                       'Chưa cập nhật'}
                                    </div>
                                    <div className="text-xs text-gray-500">{assignedEmployee.email}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500 italic">Chưa phân công</span>
                              )}
                            </div>
                          );
                        });
                      })()} 
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {(() => {
                        const now = new Date();
                        const sevenDaysLater = new Date();
                        sevenDaysLater.setDate(now.getDate() + 7);
                        
                        const upcomingSlots = dateSlots
                          .filter(slot => {
                            const slotTourId = typeof slot.tour === 'string' ? slot.tour : slot.tour?._id;
                            if (slotTourId !== tour._id) return false;
                            const slotDate = new Date(slot.dateTour);
                            return slotDate >= now && slotDate <= sevenDaysLater && slot.status === 'upcoming';
                          })
                          .sort((a, b) => new Date(a.dateTour).getTime() - new Date(b.dateTour).getTime());
                        
                        return upcomingSlots.map((slot, index) => {
                          const tourDate = new Date(slot.dateTour);
                          
                          return (
                            <div key={slot._id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {tourDate.toLocaleDateString('vi-VN')}
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={dateAssignments[slot._id] || ''}
                                  onChange={(e) => handleDateAssignment(slot._id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                                >
                                  <option value="">Chọn HDV</option>
                                  {employees
                                    .filter(emp => emp.position === 'tour_guide' && emp.department === 'tour')
                                    .map(employee => {
                                      // Kiểm tra HDV có bị xung đột lịch cho ngày này không
                                      const hasConflict = dateSlots.some(otherSlot => {
                                        if (otherSlot._id === slot._id || !otherSlot.assignedEmployee) return false;
                                        if (otherSlot.assignedEmployee._id !== employee._id) return false;
                                        return new Date(otherSlot.dateTour).toDateString() === new Date(slot.dateTour).toDateString();
                                      });
                                      
                                      const displayName = `${employee.full_name || `${employee.firstName} ${employee.lastName}`} (${employee.employee_id})`;
                                      
                                      return (
                                        <option key={employee._id} value={employee._id}>
                                          {displayName} {hasConflict ? '⚠️ Xung đột' : ''}
                                        </option>
                                      );
                                    })}
                                </select>
                                {dateAssignments[slot._id] && (
                                  <button
                                    onClick={() => saveDateAssignment(slot._id, tour._id)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                  >
                                    Lưu
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()} 
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tour trong 7 ngày tới</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Không có tour nào phù hợp với từ khóa tìm kiếm trong 7 ngày tới.' : 'Không có tour nào diễn ra trong 7 ngày tới.'}
            </p>
          </div>
        )}
      </div>

      {/* Assignment Guide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Hướng dẫn phân công</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Chọn HDV từ dropdown và nhấn "Lưu" để phân công</p>
              <p>• Mỗi ngày tour có thể được phân công cho một HDV riêng biệt</p>
              <p>• HDV được phân công sẽ chịu trách nhiệm hướng dẫn tour trong ngày đó</p>
              <p>• Chỉ HDV thuộc bộ phận tour mới xuất hiện trong danh sách</p>
              <p>• Hệ thống tự động kiểm tra xung đột lịch trình khi phân công</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAssignment;
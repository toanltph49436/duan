import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface Employee {
  _id: string;
  employee_id: string;
  email: string;
  firstName: string;
  lastName: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  position: string;
  department: string;
  status: 'active' | 'inactive';
  last_login?: Date;
  createdAt: Date;
  updatedAt: Date;
  created_by?: {
    full_name: string;
    email: string;
  };
}

const EmployeeAccounts: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/employee/admin/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone_number?.includes(searchTerm) ||
    employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEmployees = employees.filter(emp => emp.status === 'active');
  const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateEmployee = async (employeeData: any) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8080/api/employee/admin/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchEmployees(); // Refresh the list
        // Show success message
      } else {
        // Handle error
        console.error('Failed to create employee');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleResetPassword = async (employeeId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8080/api/employee/admin/${employeeId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowResetModal(false);
        setSelectedEmployee(null);
        // Show success message
      } else {
        // Handle error
        console.error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: string) => {
    try {
      const token = await getToken();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`http://localhost:8080/api/employee/admin/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchEmployees(); // Refresh the list
        // Show success message
      } else {
        // Handle error
        console.error('Failed to update employee status');
      }
    } catch (error) {
      console.error('Error updating employee status:', error);
    }
  };

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
          onClick={fetchEmployees}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Tài khoản HDV</h1>
          <p className="text-gray-600">Danh sách tất cả tài khoản hướng dẫn viên trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Tạo tài khoản HDV
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800">Tổng số HDV</h3>
          <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800">Đang hoạt động</h3>
          <p className="text-2xl font-bold text-green-600">{activeEmployees.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800">Kết quả tìm kiếm</h3>
          <p className="text-2xl font-bold text-yellow-600">{filteredEmployees.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800">Hướng dẫn viên</h3>
          <p className="text-2xl font-bold text-purple-600">{employees.filter(emp => emp.position === 'tour_guide').length}</p>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {employee.firstName?.charAt(0).toUpperCase()}{employee.lastName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {employee.employee_id}</div>
                        <div className="text-sm text-gray-500">
                          {employee.position === 'tour_guide' ? 'Hướng dẫn viên' : employee.position} • {employee.department === 'tour' ? 'Tour' : 
                          employee.department === 'hotel' ? 'Khách sạn' :
                          employee.department === 'transport' ? 'Vận chuyển' :
                          employee.department === 'general' ? 'Tổng hợp' : employee.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone_number || 'Chưa cập nhật'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.address || 'Chưa cập nhật'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(employee.createdAt)}
                    {employee.last_login && (
                      <div className="text-xs text-gray-400">
                        Đăng nhập: {formatDate(employee.last_login)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowResetModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reset MK"
                      >
                        Reset MK
                      </button>
                      <button
                        onClick={() => toggleEmployeeStatus(employee._id, employee.status)}
                        className={`${
                          employee.status === 'active' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={employee.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {employee.status === 'active' ? 'Xóa' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy nhân viên HDV</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Không có nhân viên HDV nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có nhân viên HDV nào trong hệ thống.'}
            </p>
          </div>
        )}
      </div>

      {/* Admin Info Note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Thông tin quan trọng</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Tài khoản nhân viên được quản lý thông qua hệ thống Clerk Authentication</p>
              <p>• Mỗi nhân viên có một Clerk ID duy nhất để xác thực</p>
              <p>• Hệ thống hiện tại chỉ cho phép 1 tài khoản admin chính</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo tài khoản HDV mới</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const employeeData = {
                   firstName: formData.get('firstName'),
                   lastName: formData.get('lastName'),
                   email: formData.get('email'),
                   password: formData.get('password'),
                   phone_number: formData.get('phone_number'),
                   address: formData.get('address'),
                   position: formData.get('position'),
                   department: formData.get('department'),
                   status: 'active'
                 };
                handleCreateEmployee(employeeData);
              }}>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Họ</label>
                       <input
                         type="text"
                         name="firstName"
                         required
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Tên</label>
                       <input
                         type="text"
                         name="lastName"
                         required
                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Email</label>
                     <input
                       type="email"
                       name="email"
                       required
                       className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                     <input
                       type="password"
                       name="password"
                       required
                       className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                     <input
                       type="tel"
                       name="phone_number"
                       className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Vị trí</label>
                        <select
                          name="position"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Chọn vị trí</option>
                          <option value="tour_guide">Hướng dẫn viên</option>
                          <option value="manager">Quản lý</option>
                        </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                         <select
                           name="department"
                           required
                           className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                         >
                           <option value="">Chọn phòng ban</option>
                           <option value="tour">Tour</option>
                           <option value="hotel">Khách sạn</option>
                           <option value="transport">Vận chuyển</option>
                           <option value="general">Tổng hợp</option>
                         </select>
                       </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                     <textarea
                       name="address"
                       rows={3}
                       className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                   </div>
                 </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reset mật khẩu</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn reset mật khẩu cho nhân viên <strong>{selectedEmployee.full_name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Mật khẩu mới sẽ được gửi qua email: {selectedEmployee.email}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleResetPassword(selectedEmployee._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reset mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAccounts;
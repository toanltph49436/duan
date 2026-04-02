import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Input, Card, Tag, Select, DatePicker } from 'antd';
import { EyeOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { instanceAdmin } from "../../configs/axios";
import { useUser } from '@clerk/clerk-react';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface HotelBooking {
  _id: string;
  hotelId: {
    _id: string;
    hotelName: string;
    location: {
      locationName: string;
      country: string;
    };
    address: string;
  };
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  fullNameUser: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalGuests: number;
  totalPrice: number;
  payment_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'pending_cancel' | 'deposit_paid';
  payment_method: 'cash' | 'bank_transfer';
  paymentImage?: string;
  fullPaymentImage?: string;
  roomBookings: Array<{
    roomTypeName: string;
    numberOfRooms: number;
    pricePerNight: number;
    totalPrice: number;
    floorNumber?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ListHotelBooking: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  // Modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);
  const [depositNote, setDepositNote] = useState('');
  const [depositImage, setDepositImage] = useState<File | null>(null);
  const [fullPaymentNote, setFullPaymentNote] = useState('');
  const [fullPaymentImage, setFullPaymentImage] = useState<File | null>(null);

  // Fetch hotel bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['hotel-bookings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/admin/hotel-bookings');
      if (!response.ok) throw new Error('Failed to fetch hotel bookings');
      const data = await response.json();
      return data.bookings || [];
    }
  });

  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/hotel-bookings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] });
      message.success('Xóa đặt phòng thành công!');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa đặt phòng!');
    }
  });

  // Confirm deposit payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, note, image }: { bookingId: string; note?: string; image?: File }) => {
      const formData = new FormData();
      const adminId = user?.id || '';
      
      formData.append('adminId', adminId);
      if (note) formData.append('note', note);
      if (image) formData.append('paymentImage', image);
      
      return instanceAdmin.put(`/admin/hotel-bookings/confirm-payment/${bookingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] });
      setShowDepositModal(false);
      setSelectedBooking(null);
      setDepositNote('');
      setDepositImage(null);
      message.success('Xác nhận đặt cọc thành công!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận đặt cọc!');
    }
  });

  // Confirm full payment mutation
  const confirmFullPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, note, image }: { bookingId: string; note?: string; image?: File }) => {
      const formData = new FormData();
      const adminId = user?.id || '';
      
      formData.append('adminId', adminId);
      if (note) formData.append('note', note);
      if (image) formData.append('paymentImage', image);
      
      return instanceAdmin.put(`/admin/hotel-bookings/confirm-full-payment/${bookingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] });
      setShowFullPaymentModal(false);
      setSelectedBooking(null);
      setFullPaymentNote('');
      setFullPaymentImage(null);
      message.success('Xác nhận thanh toán đầy đủ thành công!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán!');
    }
  });

  const handleDelete = (id: string, hotelName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đặt phòng tại "${hotelName}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id)
    });
  };

  // Handle deposit confirmation
  const handleConfirmDeposit = (booking: HotelBooking) => {
    setSelectedBooking(booking);
    setShowDepositModal(true);
  };

  const confirmDeposit = () => {
    if (!depositImage) {
      message.error('Vui lòng chọn hình ảnh xác nhận thanh toán!');
      return;
    }

    if (selectedBooking) {
      confirmPaymentMutation.mutate({
        bookingId: selectedBooking._id,
        note: depositNote,
        image: depositImage
      });
    }
  };

  const closeDepositModal = () => {
    setShowDepositModal(false);
    setSelectedBooking(null);
    setDepositNote('');
    setDepositImage(null);
  };

  // Handle full payment confirmation
  const handleConfirmFullPayment = (booking: HotelBooking) => {
    setSelectedBooking(booking);
    setShowFullPaymentModal(true);
  };

  const confirmFullPayment = () => {
    if (!fullPaymentImage) {
      message.error('Vui lòng chọn hình ảnh xác nhận thanh toán!');
      return;
    }

    if (selectedBooking) {
      confirmFullPaymentMutation.mutate({
        bookingId: selectedBooking._id,
        note: fullPaymentNote,
        image: fullPaymentImage
      });
    }
  };

  const closeFullPaymentModal = () => {
    setShowFullPaymentModal(false);
    setSelectedBooking(null);
    setFullPaymentNote('');
    setFullPaymentImage(null);
  };

  const filteredBookings = bookings.filter((booking: HotelBooking) => {
    const matchesSearch = 
      booking.hotelId?.hotelName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.fullNameUser?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.phone?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.payment_status === statusFilter;
    const matchesPayment = !paymentFilter || booking.payment_method === paymentFilter;
    
    const matchesDate = !dateRange || (
      dayjs(booking.checkInDate).isBetween(dateRange[0], dateRange[1], 'day', '[]') ||
      dayjs(booking.checkOutDate).isBetween(dateRange[0], dateRange[1], 'day', '[]')
    );

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      case 'pending_cancel': return 'volcano';
      case 'deposit_paid': return 'cyan';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'blue';
      case 'cash': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      case 'pending_cancel': return 'Chờ hủy';
      case 'deposit_paid': return 'Đã đặt cọc';
      default: return status;
    }
  };

  const getPaymentStatusText = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Chuyển khoản';
      case 'cash': return 'Tiền mặt';
      default: return method;
    }
  };

  const columns = [
    {
      title: 'Khách sạn',
      key: 'hotel',
      render: (record: HotelBooking) => (
        <div>
          <div className="font-medium">{record.hotelId?.hotelName || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.hotelId?.location?.locationName || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (record: HotelBooking) => (
        <div>
          <div className="font-medium">{record.fullNameUser || 'N/A'}</div>
          <div className="text-sm text-gray-500">{record.email || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Loại phòng',
      key: 'roomType',
      render: (record: HotelBooking) => (
        <div>
          {record.roomBookings?.map((room, index) => (
            <div key={index} className="text-sm">
              {room.roomTypeName} ({room.numberOfRooms} phòng)
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Check-in / Check-out',
      key: 'dates',
      render: (record: HotelBooking) => (
        <div>
          <div className="text-sm">
            <strong>Nhận:</strong> {dayjs(record.checkInDate).format('DD/MM/YYYY')}
          </div>
          <div className="text-sm">
            <strong>Trả:</strong> {dayjs(record.checkOutDate).format('DD/MM/YYYY')}
          </div>
        </div>
      )
    },
    {
      title: 'Số khách',
      dataIndex: 'totalGuests',
      key: 'totalGuests',
      align: 'center' as const
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount: number) => (
        <span className="font-medium text-green-600">
          {amount?.toLocaleString('vi-VN')} VNĐ
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => (
        <Tag color={getPaymentStatusColor(method)}>
          {getPaymentStatusText(method)}
        </Tag>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: HotelBooking) => (
        <Space size="middle" wrap>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              Modal.info({
                title: 'Chi tiết đặt phòng',
                content: (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p><strong>Mã đặt phòng:</strong> {record._id}</p>
                      <p><strong>Khách sạn:</strong> {record.hotelId?.hotelName}</p>
                      <p><strong>Địa điểm:</strong> {record.hotelId?.location?.locationName}</p>
                      <p><strong>Khách hàng:</strong> {record.fullNameUser}</p>
                      <p><strong>Email:</strong> {record.email}</p>
                      <p><strong>Điện thoại:</strong> {record.phone}</p>
                      <p><strong>Loại phòng:</strong></p>
                      {record.roomBookings?.map((room, index) => (
                        <div key={index} className="ml-4">
                          <p>- {room.roomTypeName}{room.floorNumber ? ` (Tầng ${room.floorNumber})` : ''}: {room.numberOfRooms} phòng × {room.pricePerNight?.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                      ))}
                      <p><strong>Số khách:</strong> {record.totalGuests}</p>
                      <p><strong>Số đêm:</strong> {record.numberOfNights}</p>
                      <p><strong>Tổng tiền:</strong> {record.totalPrice?.toLocaleString('vi-VN')} VNĐ</p>
                      <p><strong>Trạng thái:</strong> {getStatusText(record.payment_status)}</p>
                      <p><strong>Phương thức thanh toán:</strong> {getPaymentStatusText(record.payment_method)}</p>
                    </div>
                    
                    {/* Hiển thị hình ảnh xác nhận thanh toán */}
                    {(record.paymentImage || record.fullPaymentImage) && (
                      <div className="border-t pt-4">
                        <p><strong>Hình ảnh xác nhận thanh toán:</strong></p>
                        <div className="mt-2 space-y-2">
                          {record.paymentImage && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Ảnh xác nhận đặt cọc:</p>
                              <img 
                                src={`http://localhost:8080/uploads/payment-confirmations/${record.paymentImage}`}
                                alt="Ảnh xác nhận đặt cọc"
                                className="max-w-full h-auto max-h-64 border rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktow7RuZyB0aOG7gyBoaeG7g24gdGjhu4sgaOG7i25oIOG6o25oPC90ZXh0Pjwvc3ZnPic=';
                                }}
                              />
                            </div>
                          )}
                          {record.fullPaymentImage && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Ảnh xác nhận thanh toán đầy đủ:</p>
                              <img 
                                src={`http://localhost:8080/uploads/payment-confirmations/${record.fullPaymentImage}`}
                                alt="Ảnh xác nhận thanh toán đầy đủ"
                                className="max-w-full h-auto max-h-64 border rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktow7RuZyB0aOG7gyBoaeG7g24gdGjhu4sgaOG7i25oIOG6o25oPC90ZXh0Pjwvc3ZnPic=';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ),
                width: 600
              });
            }}
          >
            Chi tiết
          </Button>
          {record.payment_status === 'pending' && (
            <Button 
              type="default"
              icon={<CheckOutlined />} 
              size="small"
              onClick={() => handleConfirmDeposit(record)}
              loading={confirmPaymentMutation.isPending}
            >
              Xác nhận cọc
            </Button>
          )}
          {record.payment_status === 'deposit_paid' && (
            <Button 
              type="default"
              icon={<DollarOutlined />} 
              size="small"
              onClick={() => handleConfirmFullPayment(record)}
              loading={confirmFullPaymentMutation.isPending}
            >
              Xác nhận thanh toán
            </Button>
          )}
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record._id, record.hotelId?.hotelName || 'N/A')}
            loading={deleteMutation.isPending}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý đặt phòng khách sạn</h1>
            <p className="text-gray-600 mt-1">Danh sách tất cả đặt phòng khách sạn trong hệ thống</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo khách sạn, khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          
          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="pending">Chờ xác nhận</Option>
            <Option value="confirmed">Đã xác nhận</Option>
            <Option value="cancelled">Đã hủy</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="pending_cancel">Chờ hủy</Option>
            <Option value="deposit_paid">Đã đặt cọc</Option>
          </Select>

          <Select
            placeholder="Lọc theo phương thức thanh toán"
            value={paymentFilter}
            onChange={setPaymentFilter}
            allowClear
          >
            <Option value="cash">Tiền mặt</Option>
            <Option value="bank_transfer">Chuyển khoản</Option>
          </Select>

          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đặt phòng`
          }}
          scroll={{ x: 1200 }}
          className="shadow-sm"
        />
      </Card>

      {/* Deposit Confirmation Modal */}
      {showDepositModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Xác nhận đặt cọc khách sạn
              </h2>
              <button
                onClick={closeDepositModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Booking Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Khách sạn:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.hotelId?.hotelName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Khách hàng:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.fullNameUser}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Điện thoại:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Số đêm:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.numberOfNights} đêm</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Số khách:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.totalGuests} khách</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-900 mb-3">Thông tin thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Tổng tiền:</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Số tiền cọc (50%):</span>
                    <span className="text-lg font-bold text-orange-600">
                      {(selectedBooking.totalPrice * 0.5)?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Phương thức:</span>
                    <span className="text-gray-900">{getPaymentStatusText(selectedBooking.payment_method)}</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <div className="text-yellow-800">
                  <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bắt buộc phải có hình ảnh chứng minh đã nhận tiền cọc</li>
                    <li>Hình ảnh có thể là biên lai, ảnh chụp tiền mặt, ảnh chuyển khoản</li>
                    <li>Chỉ upload 1 hình ảnh rõ nét, không quá 10MB</li>
                    <li>Thông tin này sẽ được lưu trữ làm bằng chứng pháp lý</li>
                  </ul>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh xác nhận thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        message.error('Kích thước file không được vượt quá 10MB!');
                        return;
                      }
                      setDepositImage(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {depositImage && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Đã chọn: {depositImage.name}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Nhập ghi chú về việc xác nhận thanh toán..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeDepositModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={confirmPaymentMutation.isPending}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeposit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={confirmPaymentMutation.isPending || !depositImage}
              >
                {confirmPaymentMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  'Xác nhận đặt cọc'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Payment Confirmation Modal */}
      {showFullPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Xác nhận thanh toán đầy đủ
              </h2>
              <button
                onClick={closeFullPaymentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Booking Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Khách sạn:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.hotelId?.hotelName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Khách hàng:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.fullNameUser}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Điện thoại:</span>
                    <span className="ml-2 text-gray-900">{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-900 mb-3">Thông tin thanh toán</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Tổng tiền:</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedBooking.totalPrice?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Đã đặt cọc:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {(selectedBooking.totalPrice * 0.5)?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Còn lại cần thanh toán:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {(selectedBooking.totalPrice * 0.5)?.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Phương thức:</span>
                    <span className="text-gray-900">{getPaymentStatusText(selectedBooking.payment_method)}</span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <div className="text-yellow-800">
                  <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bắt buộc phải có hình ảnh chứng minh đã nhận thanh toán đầy đủ</li>
                    <li>Hình ảnh có thể là biên lai, ảnh chụp tiền mặt, ảnh chuyển khoản</li>
                    <li>Chỉ upload 1 hình ảnh rõ nét, không quá 10MB</li>
                    <li>Sau khi xác nhận, đặt phòng sẽ chuyển sang trạng thái "Đã thanh toán đầy đủ"</li>
                  </ul>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh xác nhận thanh toán <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        message.error('Kích thước file không được vượt quá 10MB!');
                        return;
                      }
                      setFullPaymentImage(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {fullPaymentImage && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Đã chọn: {fullPaymentImage.name}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={fullPaymentNote}
                  onChange={(e) => setFullPaymentNote(e.target.value)}
                  placeholder="Nhập ghi chú về việc xác nhận thanh toán..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeFullPaymentModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                disabled={confirmFullPaymentMutation.isPending}
              >
                Hủy
              </button>
              <button
                onClick={confirmFullPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={confirmFullPaymentMutation.isPending || !fullPaymentImage}
              >
                {confirmFullPaymentMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  'Xác nhận thanh toán đầy đủ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListHotelBooking;
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Space,
  Spin,
  message,
  Steps,
  Alert,
  Modal,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface HotelBooking {
  _id: string;
  hotelId: {
    _id: string;
    hotelName: string;
    location: {
      locationName: string;
      country: string;
    };
    contactInfo: {
      phone: string;
      email: string;
    };
    starRating: number;
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  fullNameUser: string;
  email: string;
  phone: string;
  address?: string;
  roomBookings: Array<{
    roomTypeIndex: number;
    roomTypeName: string;
    numberOfRooms: number;
    pricePerNight: number;
    totalPrice: number;
    guests: Array<{
      fullName: string;
      gender: string;
      birthDate: string;
    }>;
    specialRequests?: string;
  }>;
  totalGuests: number;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  totalPrice: number;
  payment_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'pending_cancel' | 'deposit_paid';
  booking_status?: string;
  payment_method: 'cash' | 'bank_transfer';
  paymentType: 'deposit' | 'full' | 'remaining';
  note?: string;
  specialRequests?: string;
  createdAt: string;
  cashPaymentDeadline?: string;
  isDeposit: boolean;
  depositAmount: number;
  isFullyPaid: boolean;
}

const HotelBookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingDetail();
    }
  }, [id]);

  const fetchBookingDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hotel-booking/${id}`);
      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        message.error('Không tìm thấy thông tin đặt phòng');
        navigate('/hotels');
      }
    } catch (error) {
      message.error('Không thể tải thông tin đặt phòng');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    setCancelling(true);
    try {
      const response = await axios.put(`http://localhost:8080/api/hotel-booking/${booking._id}/cancel`);
      
      if (response.data.success) {
        message.success('Hủy đặt phòng thành công');
        setBooking({ ...booking, booking_status: 'cancelled', payment_status: 'cancelled' });
        setCancelModalVisible(false);
      } else {
        message.error(response.data.message || 'Không thể hủy đặt phòng');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đặt phòng');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = () => {
    if (!booking) return;
    
    // Redirect to payment page (similar to tour payment)
    navigate(`/payment/hotel-booking/${booking._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'blue';
      default:
        return 'orange';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'confirmed':
        return 'blue';
      case 'deposit_paid':
        return 'orange';
      case 'pending':
        return 'gold';
      case 'cancelled':
      case 'pending_cancel':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Chờ xử lý';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'deposit_paid':
        return 'Đã cọc';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      case 'pending_cancel':
        return 'Chờ hủy';
      default:
        return 'Chưa thanh toán';
    }
  };

  const getCurrentStep = () => {
    if (!booking) return 0;
    
    if (booking.booking_status === 'cancelled' || booking.payment_status === 'cancelled') return -1;
    if (booking.booking_status === 'completed') return 3;
    if (booking.payment_status === 'completed') return 2;
    if (booking.payment_status === 'deposit_paid') return 1;
    return 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Title level={3}>Không tìm thấy thông tin đặt phòng</Title>
        <Button type="primary" onClick={() => navigate('/hotels')}>Quay lại danh sách khách sạn</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={2}>Đặt phòng thành công!</Title>
          <Text style={{ fontSize: '1.1rem' }}>Mã đặt phòng: <strong>{booking._id}</strong></Text>
        </Card>

        {/* Booking Status */}
        {booking.bookingStatus !== 'cancelled' && (
          <Card title="Trạng thái đặt phòng" style={{ marginBottom: 24 }}>
            <Steps current={getCurrentStep()} status={booking.bookingStatus === 'cancelled' ? 'error' : 'process'}>
              <Step title="Đặt phòng" description="Đã tạo đơn đặt phòng" icon={<CheckCircleOutlined />} />
              <Step title="Thanh toán" description="Thanh toán đặt cọc/toàn bộ" icon={<CreditCardOutlined />} />
              <Step title="Xác nhận" description="Khách sạn xác nhận" icon={<CheckCircleOutlined />} />
              <Step title="Hoàn thành" description="Check-in thành công" icon={<CheckCircleOutlined />} />
            </Steps>
          </Card>
        )}

        {/* Alert for cancelled booking */}
        {booking.bookingStatus === 'cancelled' && (
          <Alert
            message="Đặt phòng đã bị hủy"
            description="Đặt phòng này đã được hủy. Vui lòng liên hệ với chúng tôi nếu bạn có thắc mắc."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Row gutter={24}>
          {/* Booking Details */}
          <Col xs={24} lg={16}>
            {/* Hotel Information */}
            <Card title="Thông tin khách sạn" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Title level={4}>{booking.hotelId?.hotelName}</Title>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    <Text>{booking.hotelId?.location?.locationName}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text>{booking.hotelId?.contactInfo?.phone}</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text>{booking.hotelId?.contactInfo?.email}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Booking Information */}
            <Card title="Thông tin đặt phòng" style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    <Text strong>Ngày nhận phòng:</Text>
                  </div>
                  <Text style={{ fontSize: '1.1rem' }}>
                    {moment(booking.checkInDate).format('DD/MM/YYYY')}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    <Text strong>Ngày trả phòng:</Text>
                  </div>
                  <Text style={{ fontSize: '1.1rem' }}>
                    {moment(booking.checkOutDate).format('DD/MM/YYYY')}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Số đêm:</Text>
                  <div style={{ fontSize: '1.1rem' }}>{booking.numberOfNights} đêm</div>
                </Col>
                <Col xs={24} sm={12}>
                  <Text strong>Ngày đặt:</Text>
                  <div style={{ fontSize: '1.1rem' }}>
                    {moment(booking.createdAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Chi tiết phòng</Title>
              {booking.roomBookings?.map((room, index) => (
                <div key={index} style={{ marginBottom: 12, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>{room.roomTypeName}</Text>
                    </Col>
                    <Col span={6}>
                      <Text>Số lượng: {room.numberOfRooms}</Text>
                    </Col>
                    <Col span={6}>
                      <Text>{room.pricePerNight.toLocaleString('vi-VN')} VNĐ/đêm</Text>
                    </Col>
                  </Row>
                </div>
              )) || []}

              {booking.specialRequests && (
                <>
                  <Divider />
                  <Title level={5}>Yêu cầu đặc biệt</Title>
                  <Paragraph>{booking.specialRequests}</Paragraph>
                </>
              )}
            </Card>

            {/* Contact Information */}
            <Card title="Thông tin liên hệ">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    <Text strong>Họ và tên:</Text>
                  </div>
                  <Text style={{ fontSize: '1.1rem' }}>{booking.fullNameUser}</Text>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text strong>Số điện thoại:</Text>
                  </div>
                  <Text style={{ fontSize: '1.1rem' }}>{booking.phone}</Text>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text strong>Email:</Text>
                  </div>
                  <Text style={{ fontSize: '1.1rem' }}>{booking.email}</Text>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Payment Summary */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin thanh toán" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Trạng thái đặt phòng:</Text>
                  <Tag color={getStatusColor(booking.booking_status)}>
                    {getStatusText(booking.booking_status)}
                  </Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Trạng thái thanh toán:</Text>
                  <Tag color={getPaymentStatusColor(booking.payment_status)}>
                    {getPaymentStatusText(booking.payment_status)}
                  </Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Phương thức thanh toán:</Text>
                  <Text>{booking.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</Text>
                </div>
              </div>

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: '1.1rem' }}>Tổng tiền:</Text>
                  <Text strong style={{ fontSize: '1.2rem', color: '#1890ff' }}>
                    {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </div>
                
                {booking.isDeposit && booking.depositAmount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Tiền cọc (50%):</Text>
                      <Text style={{ color: '#52c41a' }}>
                        {booking.depositAmount.toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Còn lại:</Text>
                      <Text style={{ color: '#fa8c16' }}>
                        {(booking.totalPrice - booking.depositAmount).toLocaleString('vi-VN')} VNĐ
                      </Text>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: '100%' }}>
                {booking.booking_status !== 'cancelled' && booking.payment_status !== 'completed' && booking.payment_status !== 'cancelled' && (
                  <Button type="primary" block onClick={handlePayment}>
                    <CreditCardOutlined /> Thanh toán
                  </Button>
                )}
                
                {booking.booking_status === 'confirmed' && booking.payment_status !== 'cancelled' && (
                  <Button 
                    danger 
                    block 
                    onClick={() => setCancelModalVisible(true)}
                  >
                    Hủy đặt phòng
                  </Button>
                )}
                
                <Button block icon={<PrinterOutlined />}>
                  In phiếu đặt phòng
                </Button>
                
                <Button block icon={<DownloadOutlined />}>
                  Tải xuống PDF
                </Button>
              </Space>
            </Card>


          </Col>
        </Row>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        title="Xác nhận hủy đặt phòng"
        open={cancelModalVisible}
        onOk={handleCancelBooking}
        onCancel={() => setCancelModalVisible(false)}
        okText="Xác nhận hủy"
        cancelText="Không hủy"
        okButtonProps={{ danger: true, loading: cancelling }}
      >
        <p>Bạn có chắc chắn muốn hủy đặt phòng này không?</p>
        <p style={{ color: '#fa8c16' }}>
          <strong>Lưu ý:</strong> Việc hủy đặt phòng có thể áp dụng phí hủy theo chính sách của khách sạn.
        </p>
      </Modal>
    </div>
  );
};

export default HotelBookingConfirmation;
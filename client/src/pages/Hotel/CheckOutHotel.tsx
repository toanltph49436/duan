/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Spin, message, Typography, Row, Col, Divider, Modal } from 'antd';
import { CreditCardOutlined, DollarOutlined, BankOutlined, WalletOutlined } from '@ant-design/icons';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import { useMutation } from '@tanstack/react-query';
import instanceClient from '../../../configs/instance';

const { Title, Text } = Typography;

interface HotelBooking {
  _id: string;
  hotelId: {
    hotelName: string;
    location: { locationName: string; country: string };
  };
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  roomBookings: Array<{
    roomTypeName: string;
    numberOfRooms: number;
    pricePerNight: number;
    totalPrice: number;
  }>;
  totalPrice: number;
  depositAmount: number;
  isDeposit: boolean;
  payment_status: string;
  booking_status: string;
  guestInfo: { fullName: string; email: string; phone: string };
}

const CheckOutHotel: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositModalVisible, setDepositModalVisible] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/hotel-booking/${bookingId}`);
      if (res.data.success) setBooking(res.data.booking);
      else {
        message.error('Không thể tải thông tin đặt phòng');
        navigate('/hotels');
      }
    } catch (error: any) {
      console.error(error);
      message.error('Có lỗi xảy ra khi tải thông tin đặt phòng');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  // Callback VNPay
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnp_ResponseCode = params.get('vnp_ResponseCode');
    const messageText = params.get('message');

    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === '00') message.success('Thanh toán thành công!');
      else message.error(`Thanh toán thất bại: ${messageText || 'Lỗi từ VNPay'}`);
      navigate(location.pathname, { replace: true });
      fetchBookingDetails();
    }
  }, [location.search, navigate, fetchBookingDetails]);

  // useMutation thanh toán
  const { mutate: payBooking, isLoading: isProcessingPayment } = useMutation({
    mutationFn: async (data: { paymentType: 'deposit' | 'full' | 'remaining' | 'cash' }) => {
      if (!booking) throw new Error('Booking không tồn tại');

      let amount = 0;
      if (data.paymentType === 'deposit') amount = booking.depositAmount;
      else if (data.paymentType === 'full') amount = booking.totalPrice;
      else if (data.paymentType === 'remaining') amount = booking.totalPrice - booking.depositAmount;

      if (data.paymentType === 'cash') {
        const res = await axios.put(
          `http://localhost:8080/api/hotel-booking/confirm-payment/${booking._id}`,
          { payment_method: 'cash', payment_status: 'pending_cash_payment' }
        );
        return { ...res.data, isCash: true };
      }

      const res = await instanceClient.post('http://localhost:8080/api/vnpay/create-hotel-payment', {
        bookingId: booking._id,
        amount,
        orderInfo: `Thanh toán ${data.paymentType} đặt phòng khách sạn ${booking.hotelId.hotelName}`,
        orderType: 'hotel_booking',
        locale: 'vn',
        returnUrl: `${window.location.origin}/checkout-hotel/${booking._id}`,
        ipAddr: '127.0.0.1'
      });

      return res.data;
    },

    onSuccess: async (data: any) => {
      console.log("Response data from payment:", data);

      // Nếu chọn tiền mặt
      if (data.isCash) {
        message.success('Chọn thanh toán tiền mặt thành công. Vui lòng thanh toán trong vòng 24h');
        fetchBookingDetails();
        return;
      }

      // Nếu có VNPay URL trả về từ backend
      if (data.paymentUrl) {
        try {
          // Chuyển hướng trực tiếp đến URL thanh toán VNPay
          console.log("Chuyển trang tới VNPAY:", data.paymentUrl);
          window.location.href = data.paymentUrl;
          return;
        } catch (error) {
          console.error("Lỗi khi chuyển hướng đến VNPay:", error);
          message.error("Đã xảy ra lỗi khi chuyển hướng đến VNPay");
          return;
        }
      }

      // Nếu có trường payment phương thức bank_transfer
      if (data.payment?.payment_method === 'bank_transfer') {
        try {
          const res = await instanceClient.post(`/vnpay/${booking?._id}`, null, { params: { bookingType: 'hotel' } });
          if (res.data?.success && res.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            message.error('Không thể lấy liên kết thanh toán từ VNPay');
          }
        } catch (error) {
          console.error(error);
          message.error('Đã xảy ra lỗi khi kết nối VNPay');
        }
        return;
      }

      // Nếu có URL thanh toán trực tiếp từ response
      if (data.url) {
        try {
          console.log("Chuyển trang tới VNPAY:", data.url);
          window.location.href = data.url;
          return;
        } catch (error) {
          console.error("Lỗi khi chuyển hướng đến VNPay:", error);
          message.error("Đã xảy ra lỗi khi chuyển hướng đến VNPay");
          return;
        }
      }

      // Nếu không phải cash hoặc VNPay, vẫn thông báo thành công
      message.success(data.message || 'Thanh toán thành công');
      setTimeout(() => window.location.href = '/', 1500);
    },

    onError: (err: any) => {
      message.error(err.message || 'Thanh toán thất bại');
    }
  });

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );

  if (!booking)
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Không tìm thấy thông tin đặt phòng</Text>
      </div>
    );

  const remainingAmount = booking.totalPrice - booking.depositAmount;
  const canPayRemaining = booking.isDeposit && booking.payment_status === 'deposit_paid';
  const canPayFull = booking.payment_status === 'pending';
  const canPayDeposit = booking.payment_status === 'pending';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Title level={2}>Thanh toán đặt phòng khách sạn</Title>

      {/* Booking Info */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>Thông tin đặt phòng</Title>
        <Row gutter={[16, 8]}>
          <Col span={12}><Text strong>Khách sạn:</Text><br /><Text>{booking.hotelId.hotelName}</Text></Col>
          <Col span={12}><Text strong>Địa điểm:</Text><br /><Text>{booking.hotelId.location.locationName}, {booking.hotelId.location.country}</Text></Col>
          <Col span={12}><Text strong>Ngày nhận phòng:</Text><br /><Text>{moment(booking.checkInDate).format('DD/MM/YYYY')}</Text></Col>
          <Col span={12}><Text strong>Ngày trả phòng:</Text><br /><Text>{moment(booking.checkOutDate).format('DD/MM/YYYY')}</Text></Col>
          <Col span={12}><Text strong>Số đêm:</Text><br /><Text>{booking.numberOfNights} đêm</Text></Col>
          <Col span={12}><Text strong>Khách hàng:</Text><br /><Text>{booking.guestInfo.fullName}</Text></Col>
        </Row>

        <Divider />
        <Title level={5}>Chi tiết phòng</Title>
        {booking.roomBookings.map((room, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <Text>{room.roomTypeName} - {room.numberOfRooms} phòng</Text><br />
            <Text type="secondary">{room.pricePerNight.toLocaleString('vi-VN')} VNĐ/đêm × {room.numberOfRooms} = {room.totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
          </div>
        ))}

        <Divider />
        <Row justify="space-between">
          <Col><Text strong>Tổng tiền:</Text></Col>
          <Col><Text strong style={{ fontSize: '18px', color: '#1890ff' }}>{booking.totalPrice.toLocaleString('vi-VN')} VNĐ</Text></Col>
        </Row>
        {booking.isDeposit && <Row justify="space-between" style={{ marginTop: '8px' }}>
          <Col><Text>Tiền cọc:</Text></Col>
          <Col><Text style={{ color: '#52c41a' }}>{booking.depositAmount.toLocaleString('vi-VN')} VNĐ</Text></Col>
        </Row>}
      </Card>

      {/* Payment Options */}
      <Card>
        <Title level={4}>Tùy chọn thanh toán</Title>
        <Row gutter={[16, 16]}>
          {canPayDeposit && <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', border: '1px solid #52c41a' }} bodyStyle={{ padding: '20px' }}>
              <DollarOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 10 }} />
              <Title level={5} style={{ color: '#52c41a' }}>Đặt cọc</Title>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>{booking.depositAmount.toLocaleString('vi-VN')} VNĐ</Text><br />
              <Button type="primary" style={{ marginTop: 10, backgroundColor: '#52c41a', borderColor: '#52c41a' }} loading={isProcessingPayment} onClick={() => payBooking({ paymentType: 'deposit' })}>
                Thanh toán cọc
              </Button>
            </Card>
          </Col>}
          {canPayFull && <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', border: '1px solid #1890ff' }} bodyStyle={{ padding: '20px' }}>
              <CreditCardOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 10 }} />
              <Title level={5} style={{ color: '#1890ff' }}>Thanh toán toàn bộ</Title>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>{booking.totalPrice.toLocaleString('vi-VN')} VNĐ</Text><br />
              <Button type="primary" style={{ marginTop: 10 }} loading={isProcessingPayment} onClick={() => payBooking({ paymentType: 'full' })}>
                Thanh toán toàn bộ
              </Button>
            </Card>
          </Col>}
          {canPayRemaining && <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ textAlign: 'center', border: '1px solid #fa8c16' }} bodyStyle={{ padding: '20px' }}>
              <CreditCardOutlined style={{ fontSize: 24, color: '#fa8c16', marginBottom: 10 }} />
              <Title level={5} style={{ color: '#fa8c16' }}>Thanh toán còn lại</Title>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fa8c16' }}>{remainingAmount.toLocaleString('vi-VN')} VNĐ</Text><br />
              <Button type="primary" style={{ marginTop: 10, backgroundColor: '#fa8c16', borderColor: '#fa8c16' }} loading={isProcessingPayment} onClick={() => payBooking({ paymentType: 'remaining' })}>
                Thanh toán còn lại
              </Button>
            </Card>
          </Col>}
        </Row>
      </Card>

      {/* Deposit Modal */}
      <Modal title="Thông báo thanh toán cọc" open={depositModalVisible} onCancel={() => setDepositModalVisible(false)} footer={null} width={600}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card hoverable style={{ textAlign: 'center', border: '2px solid #1890ff' }} bodyStyle={{ padding: '20px' }}>
              <BankOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 10 }} />
              <Title level={5} style={{ color: '#1890ff' }}>VNPay (Khuyến nghị)</Title>
              <Button type="primary" style={{ width: '100%' }} loading={isProcessingPayment} onClick={() => { payBooking({ paymentType: 'deposit' }); setDepositModalVisible(false); }}>
                Thanh toán VNPay
              </Button>
            </Card>
          </Col>
          <Col span={12}>
            <Card hoverable style={{ textAlign: 'center', border: '1px solid #d9d9d9' }} bodyStyle={{ padding: '20px' }}>
              <WalletOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 10 }} />
              <Title level={5} style={{ color: '#52c41a' }}>Tiền mặt</Title>
              <Button type="default" style={{ width: '100%', borderColor: '#52c41a', color: '#52c41a' }} loading={isProcessingPayment} onClick={() => payBooking({ paymentType: 'cash' })}>
                Chọn tiền mặt
              </Button>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default CheckOutHotel;


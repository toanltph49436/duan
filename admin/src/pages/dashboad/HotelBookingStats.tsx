/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Row, Col, Statistic, Progress, Typography, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import instance from '../../configs/axios';
import {
  HomeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const HotelBookingStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['checkOutBookingHotel'],
    queryFn: () => instance.get('/checkOutBookingHotel'),
    refetchInterval: 10000, // Cập nhật mỗi 10 giây
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const bookings = data?.data?.data || [];

  // Debug: Kiểm tra dữ liệu
  console.log("HotelBookingStats - Total bookings:", bookings.length);
  if (bookings.length > 0) {
    console.log("First booking sample:", {
      booking_status: bookings[0].booking_status,
      payment_status: bookings[0].payment_status,
      totalPrice: bookings[0].totalPrice,
      roomBookings: bookings[0].roomBookings
    });
    
    // Kiểm tra tất cả các trạng thái có trong dữ liệu
    const allBookingStatuses = [...new Set(bookings.map((b: any) => b.booking_status))];
    const allPaymentStatuses = [...new Set(bookings.map((b: any) => b.payment_status))];
    console.log("All booking_status values:", allBookingStatuses);
    console.log("All payment_status values:", allPaymentStatuses);
  }

  // Tính số lượng - Sử dụng cả booking_status và payment_status
  const total = bookings.length;
  const pending = bookings.filter((b:any) => 
    b.booking_status === 'pending' || 
    b.booking_status === 'pending_payment' || 
    b.payment_status === 'pending' ||
    b.payment_status === 'pending_payment'
  ).length;
  const completed = bookings.filter((b: any) => 
    b.booking_status === 'confirmed' || 
    b.booking_status === 'completed' || 
    b.payment_status === 'completed'
  ).length;
  const cancelled = bookings.filter((b: any) => 
    b.booking_status === 'cancelled' || 
    b.payment_status === 'cancelled'
  ).length;
  const pendingCancel = bookings.filter((b: any) => 
    b.booking_status === 'pending_cancellation' || 
    b.payment_status === 'pending_cancellation'
  ).length;

  // Tính tổng doanh thu từ các booking đã hoàn thành
  const totalRevenue = bookings
    .filter((b: any) => 
      b.booking_status === 'confirmed' || 
      b.booking_status === 'completed' || 
      b.payment_status === 'completed'
    )
    .reduce((sum: any, b: any) => sum + (b.totalPrice || 0), 0);

  // Tính số phòng đã đặt
  const totalRooms = bookings
    .filter((b: any) => 
      b.booking_status === 'confirmed' || 
      b.booking_status === 'completed' || 
      b.payment_status === 'completed'
    )
    .reduce((sum: any, b: any) => {
      const roomCount = b.roomBookings?.reduce((roomSum: any, room: any) => roomSum + room.numberOfRooms, 0) || 0;
      return sum + roomCount;
    }, 0);

  // Debug: Kiểm tra kết quả
  console.log("HotelBookingStats - Results:", {
    total,
    pending,
    completed,
    cancelled,
    pendingCancel,
    totalRevenue,
    totalRooms
  });

  const getCompletionRate = () => total ? Math.round((completed / total) * 100) : 0;
  const getCancellationRate = () => total ? Math.round((cancelled / total) * 100) : 0;

  if (isLoading) {
    return (
      <Card style={{ marginBottom: 24, borderRadius: 16 }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        marginBottom: 24,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: 'none',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Title level={3} style={{ marginBottom: 24 }}>🏨 Thống kê đặt phòng khách sạn</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#667eea', color: 'white' }}>
            <Statistic 
              title="Tổng đặt phòng" 
              value={total} 
              prefix={<HomeOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#faad14', color: 'white' }}>
            <Statistic 
              title="Chờ thanh toán" 
              value={pending} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#52c41a', color: 'white' }}>
            <Statistic 
              title="Đã thanh toán" 
              value={completed} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#ff4d4f', color: 'white' }}>
            <Statistic 
              title="Đã hủy" 
              value={cancelled} 
              prefix={<CloseCircleOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#13c2c2', color: 'white' }}>
            <Statistic 
              title="Tổng phòng đã đặt" 
              value={totalRooms} 
              prefix={<HomeOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#722ed1', color: 'white' }}>
            <Statistic 
              title="Tổng doanh thu" 
              value={totalRevenue ? (totalRevenue / 1000000).toFixed(1) : 0} 
              suffix="M VNĐ"
              prefix={<DollarOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#eb2f96', color: 'white' }}>
            <Statistic 
              title="Doanh thu TB/phòng" 
              value={totalRooms > 0 && totalRevenue > 0 ? (totalRevenue / totalRooms / 1000000).toFixed(1) : 0} 
              suffix="M VNĐ"
              prefix={<DollarOutlined />} 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#fa8c16', color: 'white' }}>
            <Statistic 
              title="Tỷ lệ hoàn thành" 
              value={getCompletionRate()} 
              suffix="%" 
              valueStyle={{ color: 'white' }} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Title level={5} style={{ margin: 0, color: '#52c41a' }}>Tỷ lệ hoàn thành</Title>
            <Progress percent={getCompletionRate()} strokeColor={{ '0%': '#52c41a', '100%': '#73d13d' }} format={p => `${p}%`} />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {completed} / {total} đặt phòng đã hoàn thành
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Title level={5} style={{ margin: 0, color: '#ff4d4f' }}>Tỷ lệ hủy</Title>
            <Progress percent={getCancellationRate()} strokeColor={{ '0%': '#ff4d4f', '100%': '#ff7875' }} format={p => `${p}%`} />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {cancelled} / {total} đặt phòng đã hủy
            </div>
          </Card>
        </Col>
      </Row>

      {pendingCancel > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card size="small" style={{ borderRadius: 12, background: '#faad14', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: 'white' }}>⚠️ Cần xử lý</Title>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{pendingCancel} đặt phòng đang chờ xác nhận hủy</div>
                </div>
                <ExclamationCircleOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default HotelBookingStats;

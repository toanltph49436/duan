/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Row, Col, Statistic, Progress, Typography, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { instanceAdmin } from '../../configs/axios';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const BookingStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin/bookings'],
    queryFn: () => instanceAdmin.get('admin/bookings'),
    refetchInterval: 10000, // Cập nhật mỗi 10 giây
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const bookings = data?.data?.bookings || [];

  // Tính số lượng
  const total = bookings.length;
  const pending = bookings.filter((b:any) => !b.isFullyPaid).length;
  const completed = bookings.filter((b: any) => b.isFullyPaid).length;
  const cancelled = bookings.filter((b: any) => b.cancel_status === 'cancelled').length;

  const pendingCancel = bookings.filter((b: any) => b.cancel_status === 'pending').length;

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
      <Title level={3} style={{ marginBottom: 24 }}>📊 Thống kê đặt chỗ</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#667eea', color: 'white' }}>
            <Statistic title="Tổng đặt chỗ" value={total} prefix={<UserOutlined />} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#faad14', color: 'white' }}>
            <Statistic title="Chờ thanh toán" value={pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#52c41a', color: 'white' }}>
            <Statistic title="Đã thanh toán" value={completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderRadius: 12, background: '#ff4d4f', color: 'white' }}>
            <Statistic title="Đã hủy" value={cancelled} prefix={<CloseCircleOutlined />} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Title level={5} style={{ margin: 0, color: '#52c41a' }}>Tỷ lệ hoàn thành</Title>
            <Progress percent={getCompletionRate()} strokeColor={{ '0%': '#52c41a', '100%': '#73d13d' }} format={p => `${p}%`} />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {completed} / {total} đặt chỗ đã hoàn thành
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Title level={5} style={{ margin: 0, color: '#ff4d4f' }}>Tỷ lệ hủy</Title>
            <Progress percent={getCancellationRate()} strokeColor={{ '0%': '#ff4d4f', '100%': '#ff7875' }} format={p => `${p}%`} />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {cancelled} / {total} đặt chỗ đã hủy
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
                  <div style={{ fontSize: 14, marginTop: 4 }}>{pendingCancel} đặt chỗ đang chờ xác nhận hủy</div>
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

export default BookingStats;

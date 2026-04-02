import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Divider, Typography, Space, Tag } from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface BookingData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tourName: string;
  departureDate: string;
  departureLocation: string;
  schedule: string;
  adults: number;
  children: number;
  totalAmount: number;
  depositAmount: number;
  paymentDeadline: string;
  paymentStatus: string;
}

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    // Lấy dữ liệu từ state hoặc localStorage
    const data = location.state?.bookingData || JSON.parse(localStorage.getItem('bookingData') || '{}');
    if (data && data.bookingId) {
      setBookingData(data);
    } else {
      // Nếu không có dữ liệu, chuyển về trang chủ
      navigate('/');
    }
  }, [location, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!bookingData) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ 
            backgroundColor: '#e6f7ff',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </div>
          <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
            CHI TIẾT ĐẶT PHÒNG
          </Title>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Cột trái - Thông tin khách hàng và tour */}
          <Col xs={24} lg={14}>
            {/* Thông tin khách hàng */}
            <Card 
              title="Thông tin khách hàng" 
              style={{ marginBottom: '20px' }}
              headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row>
                  <Col span={8}><Text strong>Họ tên:</Text></Col>
                  <Col span={16}><Text>{bookingData.customerName}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Điện thoại:</Text></Col>
                  <Col span={16}><Text>{bookingData.customerPhone}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Email:</Text></Col>
                  <Col span={16}><Text>{bookingData.customerEmail}</Text></Col>
                </Row>
              </Space>
            </Card>

            {/* Chi tiết booking */}
            <Card 
              title="CHI TIẾT ĐẶT PHÒNG" 
              style={{ marginBottom: '20px' }}
              headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Row>
                  <Col span={8}><Text strong>Ngày đặt:</Text></Col>
                  <Col span={16}><Text>{formatDate(new Date().toISOString())}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Khách sạn:</Text></Col>
                  <Col span={16}><Text>{bookingData.tourName}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>Phương thức thanh toán:</Text></Col>
                  <Col span={16}><Text>Tiền mặt</Text></Col>
                </Row>
              </Space>

              <Divider />

              {/* Thông báo thanh toán tiền mặt */}
              <div style={{
                backgroundColor: '#fff7e6',
                border: '1px solid #ffd591',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '10px'
                }}>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                  <Text strong style={{ color: '#fa8c16' }}>THÔNG BÁO THANH TOÁN TIỀN MẶT</Text>
                </div>
                <Text style={{ color: '#d46b08', fontSize: '14px' }}>
                  Thời gian có hiệu lực: 48h từ thời điểm đặt phòng
                </Text>
                <br />
                <Text style={{ color: '#d46b08', fontSize: '14px' }}>
                  Địa chỉ thanh toán: Số 25 - Ngõ 38 Phố Yên Lãng – Quận Đống Đa – Hà Nội
                </Text>
                <br />
                <Text style={{ color: '#d46b08', fontSize: '14px' }}>
                  Thời gian làm việc: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7
                </Text>
              </div>
            </Card>

            {/* Danh sách khách */}
            <Card 
              title="DANH SÁCH KHÁCH" 
              style={{ marginBottom: '20px' }}
              headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
            >
              <Row>
                <Col span={4}><Text strong>Họ tên</Text></Col>
                <Col span={4}><Text strong>Giới tính</Text></Col>
                <Col span={4}><Text strong>Ngày sinh</Text></Col>
                <Col span={4}><Text strong>Phòng đơn</Text></Col>
                <Col span={4}><Text strong>Ghi chú</Text></Col>
              </Row>
              <Divider style={{ margin: '10px 0' }} />
              <Row>
                <Col span={4}><Text>{bookingData.customerName}</Text></Col>
                <Col span={4}><Text>Nam</Text></Col>
                <Col span={4}><Text>Người lớn</Text></Col>
                <Col span={4}><Text>Không</Text></Col>
                <Col span={4}><Text>-</Text></Col>
              </Row>
              <Divider style={{ margin: '10px 0' }} />
              <Row>
                <Col span={24}>
                  <Text strong>Tổng cộng: </Text>
                  <Text style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                    {formatPrice(bookingData.totalAmount)} đ
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Cột phải - Thông tin tour và thanh toán */}
          <Col xs={24} lg={10}>
            {/* Thông tin khách sạn */}
            <Card 
              title="PHIẾU XÁC NHẬN ĐẶT PHÒNG" 
              style={{ marginBottom: '20px' }}
              headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <img 
                  src="/api/placeholder/200/120" 
                  alt="Hotel" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '200px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }} 
                />
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {bookingData.tourName}
                </Text>
                <Text>Phòng Superior</Text>
                <Text>2 ngày 1 đêm</Text>
                
                <Divider style={{ margin: '10px 0' }} />
                
                <Row>
                  <Col span={12}><Text>Mã đặt phòng:</Text></Col>
                  <Col span={12}><Text strong>{bookingData.bookingId}</Text></Col>
                </Row>
                
                <Row>
                  <Col span={12}><Text>Ngày nhận phòng:</Text></Col>
                  <Col span={12}><Text>{formatDate(bookingData.departureDate)}</Text></Col>
                </Row>
                
                <Row>
                  <Col span={12}><Text>Địa chỉ khách sạn:</Text></Col>
                  <Col span={12}><Text>Hà Nội</Text></Col>
                </Row>
                
                <Row>
                  <Col span={12}><Text>Số khách:</Text></Col>
                  <Col span={12}><Text>{bookingData.adults + bookingData.children} người</Text></Col>
                </Row>
              </Space>
            </Card>

            {/* Thanh toán */}
            <Card 
              title="THANH TOÁN" 
              style={{ marginBottom: '20px' }}
              headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{
                  backgroundColor: '#fff2e8',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ffd591'
                }}>
                  <Text strong style={{ color: '#fa8c16', fontSize: '16px' }}>
                    Cần thanh toán: {formatPrice(bookingData.depositAmount)} đ
                  </Text>
                </div>
                
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  style={{ 
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  onClick={() => window.print()}
                >
                  Gọi ngay 1.934.004 đ
                </Button>
                
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  style={{ 
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  onClick={() => navigate('/')}
                >
                  Thanh toán tiền mặt: {formatPrice(bookingData.depositAmount)} đ
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookingSuccess;
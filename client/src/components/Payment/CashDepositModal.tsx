import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Card, Divider, Alert, Row, Col } from 'antd';
import './CashDepositModal.css';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined,
  CreditCardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { PaymentBill } from './PaymentBill';

const { Title, Text, Paragraph } = Typography;

interface CashDepositModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirmCash: () => void;
  onChooseVNPay: () => void;
  loading?: boolean;
  depositAmount?: number;
  hotelName?: string;
  totalAmount?: number;
  numberOfNights?: number;
  pricePerNight?: number;
  bookingId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  customerName?: string;
  customerPhone?: string;
}

export const CashDepositModal: React.FC<CashDepositModalProps> = ({
  visible,
  onCancel,
  onConfirmCash,
  onChooseVNPay,
  loading = false,
  depositAmount,
  hotelName,
  totalAmount,
  numberOfNights,
  pricePerNight,
  bookingId,
  checkInDate,
  checkOutDate,
  customerName,
  customerPhone
}) => {
  const [billVisible, setBillVisible] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      // You might want to show a success message here
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WarningOutlined style={{ color: '#faad14' }} />
          <span>Thông báo thanh toán cọc tiền mặt</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      className="cash-deposit-modal"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Mã đặt phòng */}
        {bookingId && (
          <Card size="small" style={{ backgroundColor: '#f0f9ff', border: '2px dashed #1890ff', textAlign: 'center' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>MÃ ĐẶT PHÒNG</Text>
              <Title level={3} style={{ margin: '5px 0', color: '#1890ff' }}>
                {bookingId}
              </Title>
              <Text style={{ color: '#999', fontSize: 12 }}>
                (Vui lòng mang theo mã này khi đến thanh toán)
              </Text>
              <Space>
                <Button 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={copyBookingId}
                >
                  Sao chép
                </Button>
                <Button 
                  size="small" 
                  type="primary" 
                  icon={<FileTextOutlined />}
                  onClick={() => setBillVisible(true)}
                >
                  Xem hóa đơn
                </Button>
              </Space>
            </Space>
          </Card>
        )}

        {/* Thông tin đặt cọc */}
        {depositAmount && (
          <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
            {/* Chi tiết tính toán */}
            {totalAmount && numberOfNights && pricePerNight && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#d46b08' }}>Chi tiết tính toán:</Text>
                <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Col><Text>Giá phòng/đêm:</Text></Col>
                    <Col><Text>{formatPrice(pricePerNight)} VNĐ</Text></Col>
                  </Row>
                  <Row justify="space-between" style={{ marginBottom: 4 }}>
                    <Col><Text>Số đêm:</Text></Col>
                    <Col><Text>{numberOfNights} đêm</Text></Col>
                  </Row>
                  <Row justify="space-between" style={{ marginBottom: 8 }}>
                    <Col><Text strong>Tổng tiền:</Text></Col>
                    <Col><Text strong>{formatPrice(totalAmount)} VNĐ</Text></Col>
                  </Row>
                  <Divider style={{ margin: '8px 0' }} />
                  <Row justify="space-between">
                    <Col><Text strong style={{ color: '#d46b08' }}>Tiền cọc (50%):</Text></Col>
                    <Col><Text strong style={{ color: '#d46b08' }}>{formatPrice(depositAmount)} VNĐ</Text></Col>
                  </Row>
                </div>
              </div>
            )}
            
            {/* Thông tin tóm tắt */}
            <Row align="middle" justify="space-between">
              <Col>
                <Text strong>Số tiền cần đặt cọc:</Text>
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>
                  {formatPrice(depositAmount)} VNĐ
                </Title>
              </Col>
            </Row>
            {hotelName && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Khách sạn: {hotelName}</Text>
              </div>
            )}
          </Card>
        )}

        {/* Cảnh báo quan trọng */}
        <Alert
          message="⚠️ Lưu ý quan trọng"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>• Bạn phải thanh toán tiền cọc trong vòng <strong>24 giờ</strong> kể từ khi đặt phòng</Text>
              <Text>• Nếu quá thời hạn, đặt phòng sẽ <strong>tự động bị hủy</strong></Text>
              <Text>• Không hoàn lại phí nếu thanh toán muộn</Text>
            </Space>
          }
          type="warning"
          showIcon
        />

        {/* Hướng dẫn thanh toán */}
        <Card title="📍 Nơi thanh toán tiền mặt" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                <EnvironmentOutlined /> Văn phòng công ty
              </Title>
              <Paragraph style={{ margin: 0, paddingLeft: 24 }}>
                <Text strong>Địa chỉ:</Text> Số 25 - Ngõ 38 Phố Yên Lãng – Quận Đống Đa – Hà Nội
                <br />
                <Text strong>Giờ làm việc:</Text> 8:00 - 17:30 (Thứ 2 - Thứ 6)
                <br />
                <Text strong>Giờ làm việc:</Text> 8:00 - 12:00 (Thứ 7)
              </Paragraph>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                <PhoneOutlined /> Liên hệ hỗ trợ
              </Title>
              <Paragraph style={{ margin: 0, paddingLeft: 24 }}>
                <Text strong>Hotline:</Text> 0922222016 (24/7)
                <br />
                <Text strong>Email:</Text> elitebooking.tour@gmail.com
                <br />
                <Text strong>Zalo:</Text> 0922222016
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Quy trình thanh toán */}
        <Card title="📝 Quy trình thanh toán" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                1
              </div>
              <Text>Đến văn phòng công ty trong giờ làm việc</Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                2
              </div>
              <Text>Cung cấp mã đặt phòng: <strong style={{ color: '#1890ff' }}>{bookingId || '[MÃ ĐẶT PHÒNG]'}</strong> và thanh toán tiền mặt</Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                3
              </div>
              <Text>Nhận biên lai xác nhận và thông tin liên hệ</Text>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%', 
                backgroundColor: '#52c41a', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                ✓
              </div>
              <Text style={{ color: '#52c41a', fontWeight: 500 }}>Đặt phòng được xác nhận!</Text>
            </div>
          </Space>
        </Card>

        {/* Khuyến nghị VNPay */}
        <Alert
          message="💡 Khuyến nghị sử dụng VNPay"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>• <strong>Nhanh chóng:</strong> Thanh toán ngay lập tức, không cần di chuyển</Text>
              <Text>• <strong>An toàn:</strong> Bảo mật cao với công nghệ mã hóa</Text>
              <Text>• <strong>Tiện lợi:</strong> Thanh toán 24/7, hỗ trợ nhiều ngân hàng</Text>
              <Text>• <strong>Xác nhận tức thì:</strong> Đặt phòng được xác nhận ngay</Text>
            </Space>
          }
          type="info"
          showIcon
        />

        {/* Action Buttons */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12}>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              block
              size="large"
              onClick={onChooseVNPay}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
                height: 48,
                fontWeight: 600
              }}
            >
              Chọn VNPay (Khuyến nghị)
            </Button>
          </Col>
          
          <Col xs={24} sm={12}>
            <Button
              icon={<CheckCircleOutlined />}
              block
              size="large"
              onClick={onConfirmCash}
              loading={loading}
              style={{
                height: 48,
                fontWeight: 600,
                borderColor: '#52c41a',
                color: '#52c41a'
              }}
            >
              Xác nhận thanh toán tiền mặt
            </Button>
          </Col>
        </Row>

        {/* Thời gian countdown */}
        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ClockCircleOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ color: '#52c41a' }}>
              Thời hạn thanh toán: 24 giờ kể từ khi xác nhận
            </Text>
          </div>
        </Card>
      </Space>

      {/* Bill Modal */}
      <Modal
        title="Hóa đơn đặt phòng"
        open={billVisible}
        onCancel={() => setBillVisible(false)}
        footer={null}
        width={700}
        centered
      >
        {bookingId && hotelName && customerName && customerPhone && checkInDate && checkOutDate && (
          <PaymentBill
            bookingId={bookingId}
            hotelName={hotelName}
            customerName={customerName}
            customerPhone={customerPhone}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            numberOfNights={numberOfNights || 1}
            totalAmount={totalAmount || 0}
            depositAmount={depositAmount || 0}
            pricePerNight={pricePerNight || 0}
          />
        )}
      </Modal>
    </Modal>
  );
};

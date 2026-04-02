import React from 'react';
import { Card, Typography, Row, Col, Divider, Button, Space } from 'antd';
import { 
  PrinterOutlined,
  DownloadOutlined,
  CalendarOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

interface PaymentBillProps {
  bookingId: string;
  hotelName: string;
  customerName: string;
  customerPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalAmount: number;
  depositAmount: number;
  pricePerNight: number;
  createdAt?: string;
}

export const PaymentBill: React.FC<PaymentBillProps> = ({
  bookingId,
  hotelName,
  customerName,
  customerPhone,
  checkInDate,
  checkOutDate,
  numberOfNights,
  totalAmount,
  depositAmount,
  pricePerNight,
  createdAt
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (date: string) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const formatDateTime = (date: string) => {
    return moment(date).format('DD/MM/YYYY HH:mm');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hóa đơn đặt phòng - ${bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1890ff; padding-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #1890ff; margin-bottom: 5px; }
            .company-info { font-size: 14px; color: #666; }
            .bill-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-align: center; color: #333; }
            .booking-code { background: #f0f9ff; padding: 15px; border: 2px dashed #1890ff; text-align: center; margin: 20px 0; }
            .booking-code .code { font-size: 18px; font-weight: bold; color: #1890ff; }
            .info-section { margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .info-label { font-weight: bold; color: #333; }
            .info-value { color: #666; }
            .payment-section { background: #fff7e6; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .total-amount { font-size: 18px; font-weight: bold; color: #fa8c16; text-align: center; }
            .deposit-amount { font-size: 16px; font-weight: bold; color: #52c41a; text-align: center; }
            .instructions { background: #f6ffed; padding: 15px; border-left: 4px solid #52c41a; margin: 20px 0; }
            .instructions h4 { color: #389e0d; margin-top: 0; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
            .divider { border-top: 1px solid #ddd; margin: 15px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">HOTEL BOOKING COMPANY</div>
            <div class="company-info">
              Địa chỉ: Số 25 - Ngõ 38 Phố Yên Lãng – Quận Đống Đa – Hà Nội<br>
              Hotline: 0922222016 | Email: elitebooking.tour@gmail.com
            </div>
          </div>

          <div class="bill-title">HÓA ĐƠN ĐẶT PHÒNG KHÁCH SẠN</div>

          <div class="booking-code">
            <div>MÃ ĐẶT PHÒNG</div>
            <div class="code">${bookingId}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
              (Vui lòng mang theo mã này khi đến thanh toán)
            </div>
          </div>

          <div class="info-section">
            <h4>THÔNG TIN KHÁCH HÀNG</h4>
            <div class="info-row">
              <span class="info-label">Họ tên:</span>
              <span class="info-value">${customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Điện thoại:</span>
              <span class="info-value">${customerPhone}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="info-section">
            <h4>THÔNG TIN BOOKING</h4>
            <div class="info-row">
              <span class="info-label">Khách sạn:</span>
              <span class="info-value">${hotelName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày nhận phòng:</span>
              <span class="info-value">${formatDate(checkInDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày trả phòng:</span>
              <span class="info-value">${formatDate(checkOutDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số đêm:</span>
              <span class="info-value">${numberOfNights} đêm</span>
            </div>
            <div class="info-row">
              <span class="info-label">Giá phòng/đêm:</span>
              <span class="info-value">${formatPrice(pricePerNight)} VNĐ</span>
            </div>
          </div>

          <div class="payment-section">
            <div class="info-row">
              <span class="info-label">Tổng tiền:</span>
              <span class="total-amount">${formatPrice(totalAmount)} VNĐ</span>
            </div>
            <div class="divider"></div>
            <div class="info-row">
              <span class="info-label">Tiền cọc cần thanh toán:</span>
              <span class="deposit-amount">${formatPrice(depositAmount)} VNĐ</span>
            </div>
          </div>

          <div class="instructions">
            <h4>HƯỚNG DẪN THANH TOÁN</h4>
            <p><strong>1.</strong> Đến văn phòng công ty trong giờ làm việc</p>
            <p><strong>2.</strong> Cung cấp mã đặt phòng: <strong>${bookingId}</strong></p>
            <p><strong>3.</strong> Thanh toán tiền cọc: <strong>${formatPrice(depositAmount)} VNĐ</strong></p>
            <p><strong>4.</strong> Nhận xác nhận và thông tin liên hệ</p>
            <p style="color: #ff4d4f; font-weight: bold;">⚠️ Lưu ý: Phải thanh toán trong vòng 24 giờ kể từ khi đặt phòng!</p>
          </div>

          <div class="footer">
            <p>Ngày tạo: ${createdAt ? formatDateTime(createdAt) : formatDateTime(new Date().toISOString())}</p>
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    // Tạo content HTML để download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn đặt phòng - ${bookingId}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1890ff; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1890ff; margin-bottom: 5px; }
          .company-info { font-size: 14px; color: #666; }
          .bill-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-align: center; color: #333; }
          .booking-code { background: #f0f9ff; padding: 15px; border: 2px dashed #1890ff; text-align: center; margin: 20px 0; }
          .booking-code .code { font-size: 18px; font-weight: bold; color: #1890ff; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .info-label { font-weight: bold; color: #333; }
          .info-value { color: #666; }
          .payment-section { background: #fff7e6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .total-amount { font-size: 18px; font-weight: bold; color: #fa8c16; text-align: right; }
          .deposit-amount { font-size: 16px; font-weight: bold; color: #52c41a; text-align: right; }
          .instructions { background: #f6ffed; padding: 15px; border-left: 4px solid #52c41a; margin: 20px 0; }
          .instructions h4 { color: #389e0d; margin-top: 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
          .divider { border-top: 1px solid #ddd; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">HOTEL BOOKING COMPANY</div>
          <div class="company-info">
            Địa chỉ: Số 25 - Ngõ 38 Phố Yên Lãng – Quận Đống Đa – Hà Nội<br>
            Hotline: 0922222016 | Email: elitebooking.tour@gmail.com
          </div>
        </div>

        <div class="bill-title">HÓA ĐƠN ĐẶT PHÒNG KHÁCH SẠN</div>

        <div class="booking-code">
          <div>MÃ ĐẶT PHÒNG</div>
          <div class="code">${bookingId}</div>
          <div style="font-size: 12px; color: #666; margin-top: 5px;">
            (Vui lòng mang theo mã này khi đến thanh toán)
          </div>
        </div>

        <div class="info-section">
          <h4>THÔNG TIN KHÁCH HÀNG</h4>
          <div class="info-row">
            <span class="info-label">Họ tên:</span>
            <span class="info-value">${customerName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Điện thoại:</span>
            <span class="info-value">${customerPhone}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="info-section">
          <h4>THÔNG TIN BOOKING</h4>
          <div class="info-row">
            <span class="info-label">Khách sạn:</span>
            <span class="info-value">${hotelName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày nhận phòng:</span>
            <span class="info-value">${formatDate(checkInDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ngày trả phòng:</span>
            <span class="info-value">${formatDate(checkOutDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Số đêm:</span>
            <span class="info-value">${numberOfNights} đêm</span>
          </div>
          <div class="info-row">
            <span class="info-label">Giá phòng/đêm:</span>
            <span class="info-value">${formatPrice(pricePerNight)} VNĐ</span>
          </div>
        </div>

        <div class="payment-section">
          <div class="info-row">
            <span class="info-label">Tổng tiền:</span>
            <span class="total-amount">${formatPrice(totalAmount)} VNĐ</span>
          </div>
          <div class="divider"></div>
          <div class="info-row">
            <span class="info-label">Tiền cọc cần thanh toán:</span>
            <span class="deposit-amount">${formatPrice(depositAmount)} VNĐ</span>
          </div>
        </div>

        <div class="instructions">
          <h4>HƯỚNG DẪN THANH TOÁN</h4>
          <p><strong>1.</strong> Đến văn phòng công ty trong giờ làm việc</p>
          <p><strong>2.</strong> Cung cấp mã đặt phòng: <strong>${bookingId}</strong></p>
          <p><strong>3.</strong> Thanh toán tiền cọc: <strong>${formatPrice(depositAmount)} VNĐ</strong></p>
          <p><strong>4.</strong> Nhận xác nhận và thông tin liên hệ</p>
          <p style="color: #ff4d4f; font-weight: bold;">⚠️ Lưu ý: Phải thanh toán trong vòng 24 giờ kể từ khi đặt phòng!</p>
        </div>

        <div class="footer">
          <p>Ngày tạo: ${createdAt ? formatDateTime(createdAt) : formatDateTime(new Date().toISOString())}</p>
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HoaDon_${bookingId}_${moment().format('YYYYMMDD')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            📄 HÓA ĐƠN ĐẶT PHÒNG
          </Title>
        </div>
      }
      style={{ maxWidth: 600, margin: '0 auto' }}
      actions={[
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ marginRight: 8 }}
        >
          In hóa đơn
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Tải về
        </Button>
      ]}
    >
      {/* Mã đặt phòng nổi bật */}
      <Card 
        size="small" 
        style={{ 
          backgroundColor: '#f0f9ff', 
          border: '2px dashed #1890ff',
          textAlign: 'center',
          marginBottom: 20
        }}
      >
        <Text style={{ fontSize: 14, color: '#666' }}>MÃ ĐẶT PHÒNG</Text>
        <br />
        <Title level={3} style={{ margin: '5px 0', color: '#1890ff' }}>
          {bookingId}
        </Title>
        <Text style={{ fontSize: 12, color: '#999' }}>
          (Vui lòng mang theo mã này khi đến thanh toán)
        </Text>
      </Card>

      {/* Thông tin khách hàng */}
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#1890ff' }}>
            <UserOutlined /> Thông tin khách hàng
          </Title>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text strong>Họ tên:</Text></Col>
            <Col><Text>{customerName}</Text></Col>
          </Row>
          <Row justify="space-between">
            <Col><Text strong>Điện thoại:</Text></Col>
            <Col><Text>{customerPhone}</Text></Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Thông tin booking */}
        <div>
          <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#1890ff' }}>
            <HomeOutlined /> Thông tin đặt phòng
          </Title>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text strong>Khách sạn:</Text></Col>
            <Col><Text>{hotelName}</Text></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text strong>Nhận phòng:</Text></Col>
            <Col><Text>{formatDate(checkInDate)}</Text></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text strong>Trả phòng:</Text></Col>
            <Col><Text>{formatDate(checkOutDate)}</Text></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><Text strong>Số đêm:</Text></Col>
            <Col><Text>{numberOfNights} đêm</Text></Col>
          </Row>
          <Row justify="space-between">
            <Col><Text strong>Giá/đêm:</Text></Col>
            <Col><Text>{formatPrice(pricePerNight)} VNĐ</Text></Col>
          </Row>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Thông tin thanh toán */}
        <Card size="small" style={{ backgroundColor: '#fff7e6' }}>
          <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#fa8c16' }}>
            <CreditCardOutlined /> Chi tiết thanh toán
          </Title>
          <Row justify="space-between" style={{ marginBottom: 8 }}>
            <Col><Text strong>Tổng tiền:</Text></Col>
            <Col><Text strong style={{ color: '#fa8c16', fontSize: 16 }}>{formatPrice(totalAmount)} VNĐ</Text></Col>
          </Row>
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Col><Text strong style={{ color: '#52c41a' }}>Tiền cọc cần thanh toán:</Text></Col>
            <Col><Text strong style={{ color: '#52c41a', fontSize: 18 }}>{formatPrice(depositAmount)} VNĐ</Text></Col>
          </Row>
        </Card>

        {/* Lưu ý quan trọng */}
        <Card size="small" style={{ backgroundColor: '#fff2e8', border: '1px solid #ffd591' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
            <Text strong style={{ color: '#fa8c16' }}>Lưu ý quan trọng:</Text>
          </div>
          <Text style={{ fontSize: 12, color: '#d46b08' }}>
            • Phải thanh toán trong vòng <strong>24 giờ</strong> kể từ khi đặt phòng
            <br />
            • Mang theo <strong>mã đặt phòng</strong> khi đến thanh toán
            <br />
            • Nếu quá thời hạn, đặt phòng sẽ <strong>tự động bị hủy</strong>
          </Text>
        </Card>
      </Space>
    </Card>
  );
};

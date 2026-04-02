import React, { useState } from 'react';
import { Button, Card, Space } from 'antd';
import { CashDepositModal } from './CashDepositModal';

// Component test cho CashDepositModal
const TestCashDepositModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirmCash = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setVisible(false);
      console.log('Cash payment confirmed');
    }, 2000);
  };

  const handleChooseVNPay = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setVisible(false);
      console.log('VNPay payment selected');
    }, 2000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title="🧪 Test Cash Deposit Modal">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            onClick={() => setVisible(true)}
            size="large"
          >
            Mở Modal Thanh Toán Cọc Tiền Mặt
          </Button>
          
          <div style={{ 
            padding: '16px', 
            background: '#f0f2f5', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong>Hướng dẫn test:</strong>
            <br />
            1. Click nút trên để mở modal
            <br />
            2. Xem thông tin chi tiết về thanh toán cọc
            <br />
            3. Test cả 2 options: VNPay và Tiền mặt
            <br />
            4. Kiểm tra responsive design
          </div>
        </Space>
        
        <CashDepositModal
          visible={visible}
          onCancel={() => setVisible(false)}
          onConfirmCash={handleConfirmCash}
          onChooseVNPay={handleChooseVNPay}
          loading={loading}
          depositAmount={1800000} // 1.8M VND (30% of 6M)
          hotelName="Khách sạn ABC 5 sao"
          totalAmount={6000000} // 6M VND total
          numberOfNights={3} // 3 nights
          pricePerNight={2000000} // 2M per night
          bookingId="HOTEL-20241215-001"
          checkInDate="2024-12-20"
          checkOutDate="2024-12-23"
          customerName="Nguyễn Văn Minh"
          customerPhone="0901234567"
        />
      </Card>
    </div>
  );
};

export default TestCashDepositModal;

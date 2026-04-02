import React from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

interface BookingSuccessModalProps {
  visible: boolean;
  onOk: () => void;
  bookingData?: {
    bookingId: string;
    totalAmount: number;
    paymentDeadline: string;
    tourName?: string;
    hotelName?: string;
    customerName?: string;
    address?: string;
    schedule?: string;
  };
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  visible,
  onOk,
  bookingData
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal
      open={visible}
      onOk={onOk}
      onCancel={onOk}
      footer={[
        <Button key="ok" type="primary" onClick={onOk} size="large">
          OK
        </Button>
      ]}
      width={500}
      centered
      closable={false}
      maskClosable={false}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {/* Icon thành công */}
        <div style={{ marginBottom: '20px' }}>
          <CheckCircleOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#52c41a',
              backgroundColor: '#f6ffed',
              borderRadius: '50%',
              padding: '10px'
            }} 
          />
        </div>

        {/* Tiêu đề */}
        <h2 style={{ 
          color: '#52c41a', 
          fontSize: '24px', 
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          Đặt phòng thành công!
        </h2>

        {/* Thông báo */}
        <p style={{ 
          color: '#666', 
          fontSize: '16px',
          margin: '0 0 20px 0'
        }}>
          Bạn đã chọn thanh toán tiền mặt tại văn phòng.
        </p>

        {/* Thông tin thanh toán */}
        <div style={{ 
          textAlign: 'left',
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3 style={{ 
            color: '#333', 
            fontSize: '18px',
            margin: '0 0 15px 0'
          }}>
            Thông tin thanh toán:
          </h3>
          
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li>
              <strong>• Mã đặt phòng:</strong> {bookingData?.bookingId || 'N/A'}
            </li>
            <li>
              <strong>• Tổng cần thanh toán:</strong> {bookingData?.totalAmount ? `${formatPrice(bookingData.totalAmount)} VNĐ` : 'N/A'}
            </li>
            <li style={{ color: '#ff4d4f' }}>
              <strong>• Hạn thanh toán:</strong> {bookingData?.paymentDeadline ? formatDate(bookingData.paymentDeadline) : 'N/A'}
            </li>
            {bookingData?.hotelName && (
              <li>
                <strong>• Khách sạn:</strong> {bookingData.hotelName}
              </li>
            )}
            {bookingData?.address && (
              <li>
                <strong>• Địa chỉ:</strong> {bookingData.address}
              </li>
            )}
            {bookingData?.schedule && (
              <li>
                <strong>• Thời gian:</strong> {bookingData.schedule}
              </li>
            )}
          </ul>
        </div>

        {/* Lưu ý quan trọng */}
        <div style={{
          backgroundColor: '#fff2e8',
          border: '1px solid #ffd591',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'left'
        }}>
          <div style={{ 
            color: '#fa8c16', 
            fontWeight: 'bold',
            marginBottom: '10px',
            fontSize: '16px'
          }}>
            ⚠️ LƯU Ý QUAN TRỌNG:
          </div>
          <div style={{ 
            color: '#d46b08', 
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div style={{ marginBottom: '5px' }}>
              • Bạn có 48 giờ để thanh toán tiền cọc kể từ thời điểm đặt phòng
            </div>
            <div style={{ marginBottom: '5px' }}>
              • Đặt phòng sẽ tự động bị hủy nếu quá thời hạn thanh toán
            </div>
            <div>
              • Vui lòng đến văn phòng để hoàn tất thanh toán
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingSuccessModal;
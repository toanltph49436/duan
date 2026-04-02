import React from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { generateTourCode, formatTourCode } from '../utils/tourUtils';

const { Title, Text } = Typography;

// Demo component để test mã tour
const TourCodeDemo: React.FC = () => {
  const sampleTourIds = [
    '68a9c52626f2bbda664c206f',
    '675a1b2c3d4e5f6789012345',
    '60f3b4d5e6a7b8c9d0e1f234',
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="🔍 Demo Mã Tour - Trước và Sau Khi Sửa">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          
          {/* Vấn đề cũ */}
          <div>
            <Title level={4} style={{ color: '#ff4d4f' }}>❌ Vấn đề cũ:</Title>
            <Text>Mã tour hiển thị không nhất quán giữa các trang:</Text>
            <ul style={{ marginLeft: 20, marginTop: 10 }}>
              <li><Text>Trang danh sách: Không hiển thị mã tour</Text></li>
              <li><Text>Trang chi tiết: Hiển thị <code>tour._id.slice(0, 6)</code></Text></li>
              <li><Text>Các trang khác: Hiển thị theo cách khác nhau</Text></li>
            </ul>
          </div>

          <Divider />

          {/* Solution mới */}
          <div>
            <Title level={4} style={{ color: '#52c41a' }}>✅ Giải pháp mới:</Title>
            <Text>Sử dụng utility function <code>generateTourCode()</code> đồng nhất:</Text>
            
            <div style={{ marginTop: 16 }}>
              {sampleTourIds.map((tourId, index) => (
                <Card key={index} size="small" style={{ marginBottom: 12, backgroundColor: '#f6ffed' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Tour ID gốc:</Text>
                      <br />
                      <Text code style={{ fontSize: 12 }}>{tourId}</Text>
                    </div>
                    <div>
                      <Text strong>Mã tour hiển thị:</Text>
                      <br />
                      <Text style={{ color: '#1890ff', fontWeight: 600, fontSize: 16 }}>
                        {generateTourCode(tourId)}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Mã tour với prefix:</Text>
                      <br />
                      <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                        {formatTourCode(tourId)}
                      </Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </div>
          </div>

          <Divider />

          {/* Các file đã cập nhật */}
          <div>
            <Title level={4} style={{ color: '#1890ff' }}>🔧 Files đã cập nhật:</Title>
            <ul style={{ marginLeft: 20 }}>
              <li><Text><code>utils/tourUtils.ts</code> - Utility functions</Text></li>
              <li><Text><code>components/TourItem.tsx</code> - Thêm hiển thị mã tour</Text></li>
              <li><Text><code>pages/Tour/Right/RightTourDetail.tsx</code> - Sử dụng utility</Text></li>
              <li><Text><code>pages/Booking/Checkout.tsx</code> - Chuẩn hóa format</Text></li>
              <li><Text><code>pages/Booking/CheckOutTour.tsx</code> - Chuẩn hóa format</Text></li>
              <li><Text><code>pages/Booking/RefundInfo.tsx</code> - Chuẩn hóa format</Text></li>
            </ul>
          </div>

          <Divider />

          {/* Kết quả */}
          <div>
            <Title level={4} style={{ color: '#722ed1' }}>🎯 Kết quả:</Title>
            <ul style={{ marginLeft: 20 }}>
              <li><Text>✅ Mã tour hiển thị <strong>nhất quán</strong> ở tất cả các trang</Text></li>
              <li><Text>✅ Format <strong>6 ký tự đầu, viết hoa</strong></Text></li>
              <li><Text>✅ <strong>Dễ maintain</strong> với utility functions</Text></li>
              <li><Text>✅ <strong>Có thể customize</strong> format dễ dàng</Text></li>
            </ul>
          </div>

        </Space>
      </Card>
    </div>
  );
};

export default TourCodeDemo;

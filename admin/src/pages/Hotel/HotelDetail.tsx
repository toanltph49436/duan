import React from 'react';
import { Card, Descriptions, Tag, Image, Button, Space, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';

interface Hotel {
  _id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rating: number;
  description: string;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const HotelDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch hotel data
  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const response = await fetch(`/api/hotels/${id}`);
      if (!response.ok) throw new Error('Failed to fetch hotel');
      return response.json();
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy khách sạn</h2>
            <p className="text-gray-600 mb-4">Khách sạn bạn đang tìm kiếm không tồn tại.</p>
            <Button type="primary" onClick={() => navigate('/admin/hotels')}>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/hotels')}
              className="mr-4"
            >
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{hotel.name}</h1>
              <p className="text-gray-600 mt-1">Chi tiết thông tin khách sạn</p>
            </div>
          </div>
          <Link to={`/admin/hotels/edit/${hotel._id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Chỉnh sửa
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotel Images */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Hình ảnh</h3>
            {hotel.images && hotel.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {hotel.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${hotel.name} - ${index + 1}`}
                    className="rounded-lg"
                    style={{ height: '120px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Chưa có hình ảnh
              </div>
            )}
          </div>

          {/* Hotel Information */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Thông tin chi tiết</h3>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên khách sạn">
                <span className="font-medium">{hotel.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {hotel.address}
              </Descriptions.Item>
              <Descriptions.Item label="Thành phố">
                {hotel.city}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <a href={`tel:${hotel.phone}`} className="text-blue-600 hover:text-blue-800">
                  {hotel.phone}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <a href={`mailto:${hotel.email}`} className="text-blue-600 hover:text-blue-800">
                  {hotel.email}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-medium">{hotel.rating}/5</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={hotel.status === 'active' ? 'green' : 'red'}>
                  {hotel.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(hotel.updatedAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
          <Card className="bg-gray-50">
            <p className="text-gray-700 leading-relaxed">
              {hotel.description || 'Chưa có mô tả'}
            </p>
          </Card>
        </div>

        {/* Amenities */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Tiện ích</h3>
          {hotel.amenities && hotel.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, index) => (
                <Tag key={index} color="blue" className="mb-2">
                  {amenity}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thông tin về tiện ích</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HotelDetail;
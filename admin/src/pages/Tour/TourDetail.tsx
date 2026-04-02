import React from 'react';
import { Card, Descriptions, Tag, Image, Button, Space, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import instance from '../../configs/axios';

interface Tour {
  _id: string;
  nameTour: string;
  destination: {
    locationName: string;
    country: string;
  };
  departure_location: string;
  duration: string;
  departure_time?: string;
  return_time?: string;
  price: number;
  discountPercent?: number;
  finalPrice?: number;
  discountExpiryDate?: string;
  imageTour: string[];
  maxPeople: number;
  tourType: string;
  status: boolean;
  descriptionTour?: string;
  featured: boolean;
  priceChildren: number;
  priceLittleBaby: number;
  pricebaby: number;
  singleRoom?: boolean;
  priceSingleRoom: number;
  assignedEmployee?: {
    firstName: string;
    lastName: string;
    full_name: string;
    email: string;
    employee_id: string;
    position: string;
  };
  itemTransport: Array<{
    TransportId: {
      transportName: string;
      transportNumber: string;
      transportType: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

const TourDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch tour data
  const { data, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: async () => {
      const response = await instance.get(`/tour/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const tour = data?.tour;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy tour</h2>
            <p className="text-gray-600 mb-4">Tour bạn đang tìm kiếm không tồn tại.</p>
            <Button type="primary" onClick={() => navigate('/admin/list-tour')}>
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
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{tour.nameTour}</h1>
            <p className="text-gray-600 mt-1">Chi tiết thông tin tour du lịch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tour Images */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Hình ảnh tour</h3>
            {tour.imageTour && tour.imageTour.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {tour.imageTour.map((image: string, index: number) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${tour.nameTour} - ${index + 1}`}
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

          {/* Tour Information */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Thông tin chi tiết</h3>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên tour">
                <span className="font-medium">{tour.nameTour}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Điểm đến">
                {tour.destination?.locationName} - {tour.destination?.country}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm khởi hành">
                {tour.departure_location}
              </Descriptions.Item>
              <Descriptions.Item label="Thời lượng">
                <Tag color="blue">{tour.duration}</Tag>
              </Descriptions.Item>
              {tour.departure_time && (
                <Descriptions.Item label="Giờ khởi hành">
                  <Tag color="green">{tour.departure_time}</Tag>
                </Descriptions.Item>
              )}
              {tour.return_time && (
                <Descriptions.Item label="Giờ kết thúc">
                  <Tag color="orange">{tour.return_time}</Tag>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Loại tour">
                <Tag color={tour.tourType === 'noidia' ? 'blue' : 'purple'}>
                  {tour.tourType === 'noidia' ? 'Nội địa' : 'Quốc tế'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Số người tối đa">
                <span className="font-medium text-blue-600">{tour.maxPeople} người</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giá tour (Người lớn)">
                <div className="flex items-center gap-2">
                  {tour.discountPercent && tour.finalPrice ? (
                    <>
                      <span className="text-red-500 line-through">
                        {tour.price.toLocaleString()} VNĐ
                      </span>
                      <span className="text-green-600 font-bold">
                        {tour.finalPrice.toLocaleString()} VNĐ
                      </span>
                      <Tag color="red">-{tour.discountPercent}%</Tag>
                    </>
                  ) : (
                    <span className="text-green-600 font-bold">
                      {tour.price.toLocaleString()} VNĐ
                    </span>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Giá trẻ em">
                <span className="text-blue-600">{tour.priceChildren.toLocaleString()} VNĐ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giá trẻ nhỏ">
                <span className="text-blue-600">{tour.priceLittleBaby.toLocaleString()} VNĐ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giá em bé">
                <span className="text-blue-600">{tour.pricebaby.toLocaleString()} VNĐ</span>
              </Descriptions.Item>
              {tour.singleRoom && (
                <Descriptions.Item label="Phụ thu phòng đơn">
                  <span className="text-orange-600">{tour.priceSingleRoom.toLocaleString()} VNĐ</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái">
                <Tag color={tour.status ? 'green' : 'red'}>
                  {tour.status ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tour nổi bật">
                <Tag color={tour.featured ? 'gold' : 'default'}>
                  {tour.featured ? 'Có' : 'Không'}
                </Tag>
              </Descriptions.Item>
              {tour.assignedEmployee && (
                <Descriptions.Item label="HDV phụ trách">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-medium">
                        {tour.assignedEmployee.firstName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {tour.assignedEmployee.full_name || 
                         `${tour.assignedEmployee.firstName} ${tour.assignedEmployee.lastName}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tour.assignedEmployee.email} ({tour.assignedEmployee.employee_id})
                      </div>
                    </div>
                  </div>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày tạo">
                {new Date(tour.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {new Date(tour.updatedAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Mô tả tour</h3>
          <Card className="bg-gray-50">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: tour.descriptionTour || 'Chưa có mô tả'
              }}
            />
          </Card>
        </div>

        {/* Transport */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Phương tiện di chuyển</h3>
          {tour.itemTransport && tour.itemTransport.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tour.itemTransport.map((transport: any, index: number) => (
                <Card key={index} size="small" className="bg-blue-50">
                  <div className="text-center">
                    <div className="text-lg font-medium text-blue-700">
                      {transport.TransportId?.transportName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transport.TransportId?.transportType || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Số hiệu: {transport.TransportId?.transportNumber || 'N/A'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có thông tin về phương tiện</p>
          )}
        </div>

        {/* Discount Info */}
        {tour.discountPercent && tour.discountExpiryDate && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin khuyến mãi</h3>
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-red-700 font-medium">
                    Giảm giá {tour.discountPercent}%
                  </div>
                  <div className="text-sm text-red-600">
                    Áp dụng đến: {new Date(tour.discountExpiryDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <Tag color="red" className="text-base px-3 py-1">
                  -{tour.discountPercent}%
                </Tag>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TourDetail;

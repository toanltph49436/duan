/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { instanceAdmin } from '../../configs/axios';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Hotel {
  _id: string;
  hotelName: string;
  location: {
    locationName: string;
    country: string;
  };
  roomTypes: RoomType[];
}

interface RoomType {
  _id: string;
  typeName: string;
  basePrice: number;
  finalPrice: number;
  maxOccupancy: number;
  bedType: string;
  totalRooms: number;
  discountPercent?: number;
  amenities: string[];
  images: string[];
}

interface RoomAvailability {
  date: string;
  roomTypeIndex: number;
  availableRooms: number;
  bookedRooms: number;
}

const RoomManagement: React.FC = () => {
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch hotels
  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await instanceAdmin.get('/admin/hotels');
      console.log("Hotels API:", response.data); 
      return response.data.hotels || response.data.data || [];
    }
  });

  // Fetch room availability
  const { data: roomAvailability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['room-availability', selectedHotel, selectedDateRange],
    queryFn: async () => {
      if (!selectedHotel || !selectedDateRange) return [];
      const [startDate, endDate] = selectedDateRange;
      const response = await instanceAdmin.get(
        `/admin/hotels/${selectedHotel}/rooms/availability?startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`
      );
      console.log("API response:", response.data);
      return response.data.availability || [];
    },
    enabled: Boolean(selectedHotel && selectedDateRange?.length === 2),
  });


  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: async (data: { hotelId: string; roomTypeId: string; roomData: Partial<RoomType> }) => {
      const response = await instanceAdmin.put(
        `/admin/hotels/${data.hotelId}/rooms/${data.roomTypeId}`,
        data.roomData
      );
      return response.data;
    },
    onSuccess: () => {
      message.success('Cập nhật phòng thành công!');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setIsModalVisible(false);
      setEditingRoom(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phòng');
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: async (data: { hotelId: string; roomData: Omit<RoomType, '_id'> }) => {
      const response = await instanceAdmin.post(
        `/admin/hotels/${data.hotelId}/rooms`,
        data.roomData
      );
      return response.data;
    },
    onSuccess: () => {
      message.success('Thêm phòng thành công!');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm phòng');
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: async (data: { hotelId: string; roomTypeId: string }) => {
      const response = await instanceAdmin.delete(
        `/admin/hotels/${data.hotelId}/rooms/${data.roomTypeId}`
      );
      return response.data;
    },
    onSuccess: () => {
      message.success('Xóa phòng thành công!');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng');
    }
  });

  const selectedHotelData = hotels?.find((hotel: Hotel) => hotel._id === selectedHotel);

  const columns: ColumnsType<RoomType> = [
    {
      title: 'Loại phòng',
      dataIndex: 'typeName',
      key: 'typeName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Giá gốc',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => (
        <Text>{price?.toLocaleString('vi-VN')} VNĐ</Text>
      )
    },
    {
      title: 'Giá cuối',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      render: (price: number, record: RoomType) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff' }}>
            {price?.toLocaleString('vi-VN')} VNĐ
          </Text>
          {record.discountPercent && record.discountPercent > 0 && (
            <Tag color="red">-{record.discountPercent}%</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Sức chứa',
      dataIndex: 'maxOccupancy',
      key: 'maxOccupancy',
      render: (capacity: number) => (
        <Tag color="blue">{capacity} người</Tag>
      )
    },
    {
      title: 'Loại giường',
      dataIndex: 'bedType',
      key: 'bedType'
    },
    {
      title: 'Tổng số phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
      render: (total: number) => (
        <Tag color="green">{total} phòng</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record: RoomType) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRoom(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa loại phòng này?"
            onConfirm={() => handleDeleteRoom(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleEditRoom = (room: RoomType) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsModalVisible(true);
  };

  const handleDeleteRoom = (roomTypeId: string) => {
    if (!selectedHotel) return;
    deleteRoomMutation.mutate({ hotelId: selectedHotel, roomTypeId });
  };

  const handleSubmit = (values: any) => {
    if (!selectedHotel) return;

    const roomData = {
      ...values,
      amenities: values.amenities || [],
      images: values.images || []
    };

    if (editingRoom) {
      updateRoomMutation.mutate({
        hotelId: selectedHotel,
        roomTypeId: editingRoom._id,
        roomData
      });
    } else {
      addRoomMutation.mutate({
        hotelId: selectedHotel,
        roomData
      });
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const roomTypeOptions = [
    'Phòng Tiêu Chuẩn',
    'Phòng Cao Cấp',
    'Phòng Deluxe',
    'Phòng Suite',
    'Phòng Executive',
    'Phòng Presidential'
  ];

  const bedTypeOptions = [
    'Single',
    'Double',
    'Twin',
    'Queen',
    'King',
    'Sofa Bed'
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <HomeOutlined className="mr-2" />
          Quản lý phòng khách sạn
        </Title>
        <Text type="secondary">
          Quản lý các loại phòng và tình trạng phòng trống của khách sạn
        </Text>
      </div>

      {/* Hotel Selection */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <div>
              <Text strong>Chọn khách sạn:</Text>
              <Select
                className="w-full mt-2"
                placeholder="Chọn khách sạn để quản lý"
                value={selectedHotel}
                onChange={setSelectedHotel}
                loading={hotelsLoading}
                size="large"
              >
                {hotels?.map((hotel: Hotel) => (
                  <Option key={hotel._id} value={hotel._id}>
                    {hotel.hotelName} - {hotel.location.locationName}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={12}>
            {selectedHotelData && (
              <div>
                <Statistic
                  title="Tổng số loại phòng"
                  value={selectedHotelData.roomTypes?.length || 0}
                  prefix={<HomeOutlined />}
                />
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {selectedHotel && (
        <>
          {/* Room Types Management */}
          <Card
            title="Quản lý loại phòng"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={() => setAvailabilityModalVisible(true)}
                >
                  Xem tình trạng phòng
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Thêm loại phòng
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={selectedHotelData?.roomTypes || []}
              rowKey="_id"
              pagination={false}
              loading={hotelsLoading}
            />
          </Card>

          {/* Add/Edit Room Modal */}
          <Modal
            title={editingRoom ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            width={800}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên loại phòng"
                    name="typeName"
                    rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
                  >
                    <Select placeholder="Chọn loại phòng">
                      {roomTypeOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Loại giường"
                    name="bedType"
                    rules={[{ required: true, message: 'Vui lòng chọn loại giường!' }]}
                  >
                    <Select placeholder="Chọn loại giường">
                      {bedTypeOptions.map(option => (
                        <Option key={option} value={option}>{option}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Giá gốc (VNĐ)"
                    name="basePrice"
                    rules={[{ required: true, message: 'Vui lòng nhập giá phòng!' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Giá phòng"
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Giảm giá (%)"
                    name="discountPercent"
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      placeholder="Phần trăm giảm giá"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Sức chứa tối đa"
                    name="maxOccupancy"
                    rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
                  >
                    <InputNumber
                      min={1}
                      placeholder="Số người"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Tổng số phòng"
                name="totalRooms"
                rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="Số phòng"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Tiện ích phòng"
                name="amenities"
              >
                <Select
                  mode="tags"
                  placeholder="Nhập các tiện ích phòng"
                  style={{ width: '100%' }}
                >
                  <Option value="WiFi miễn phí">WiFi miễn phí</Option>
                  <Option value="Điều hòa">Điều hòa</Option>
                  <Option value="TV màn hình phẳng">TV màn hình phẳng</Option>
                  <Option value="Minibar">Minibar</Option>
                  <Option value="Két an toàn">Két an toàn</Option>
                  <Option value="Phòng tắm riêng">Phòng tắm riêng</Option>
                </Select>
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={handleModalCancel}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editingRoom ? updateRoomMutation.isPending : addRoomMutation.isPending}
                >
                  {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Room Availability Modal */}
          <Modal
            title="Tình trạng phòng trống"
            open={availabilityModalVisible}
            onCancel={() => setAvailabilityModalVisible(false)}
            footer={null}
            width={1000}
          >
            <div className="mb-4">
              <Text strong>Chọn khoảng thời gian:</Text>
              <RangePicker
                className="w-full mt-2"
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                format="DD/MM/YYYY"
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              />
            </div>

            {selectedDateRange && roomAvailability && (
              <div>
                <Divider>Tình trạng phòng từ {selectedDateRange[0].format('DD/MM/YYYY')} đến {selectedDateRange[1].format('DD/MM/YYYY')}</Divider>
                {selectedHotelData?.roomTypes.map((roomType, index) => {
                  const availability = roomAvailability.filter(
                    (item: RoomAvailability) => item.roomTypeIndex === index
                  );
                  
                  return (
                    <Card key={roomType._id} className="mb-4" size="small">
                      <Title level={5}>{roomType.typeName}</Title>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Statistic
                            title="Tổng số phòng"
                            value={roomType.totalRooms}
                            prefix={<HomeOutlined />}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Phòng trống trung bình"
                            value={availability.length > 0 ? 
                              Math.round(availability.reduce((sum: number, item: RoomAvailability) => sum + item.availableRooms, 0) / availability.length) : 
                              roomType.totalRooms
                            }
                            valueStyle={{ color: '#3f8600' }}
                          />
                        </Col>
                        <Col span={8}>
                          <Statistic
                            title="Phòng đã đặt trung bình"
                            value={availability.length > 0 ? 
                              Math.round(availability.reduce((sum: number, item: RoomAvailability) => sum + item.bookedRooms, 0) / availability.length) : 
                              0
                            }
                            valueStyle={{ color: '#cf1322' }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default RoomManagement;
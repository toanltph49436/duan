import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

interface RoomType {
  _id: string;
  typeName: string;
  basePrice: number;
  discountPrice?: number;
  maxOccupancy: number;
  bedType: string;
  totalRooms: number;
  amenities: string[];
  description?: string;
}

interface Hotel {
  _id: string;
  name: string;
  roomTypes: RoomType[];
}

interface RoomAvailability {
  roomTypeId: string;
  typeName: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
}

const RoomManagement: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [form] = Form.useForm();

  const bedTypes = [
    'Giường đơn',
    'Giường đôi',
    'Giường Queen',
    'Giường King',
    '2 Giường đơn',
    '2 Giường đôi'
  ];

  const amenitiesList = [
    'WiFi miễn phí',
    'Điều hòa',
    'Tivi',
    'Tủ lạnh',
    'Máy sấy tóc',
    'Két an toàn',
    'Ban công',
    'Bồn tắm',
    'Vòi sen',
    'Dịch vụ phòng'
  ];

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/admin/hotels');
      if (response.data.success) {
        setHotels(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      message.error('Không thể tải danh sách khách sạn');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAvailability = async (hotelId: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/hotels/${hotelId}/rooms/availability`);
      if (response.data.success) {
        setRoomAvailability(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching room availability:', error);
      message.error('Không thể tải thông tin tình trạng phòng');
    }
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    fetchRoomAvailability(hotel._id);
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRoom = (room: RoomType) => {
    setEditingRoom(room);
    form.setFieldsValue({
      ...room,
      finalPrice: room.discountPrice || room.basePrice
    });
    setModalVisible(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!selectedHotel) return;
    
    try {
      const response = await axios.delete(`http://localhost:8080/api/admin/hotels/${selectedHotel._id}/rooms/${roomId}`);
      if (response.data.success) {
        message.success('Xóa loại phòng thành công');
        fetchHotels();
        // Cập nhật selectedHotel
        const updatedHotel = hotels.find(h => h._id === selectedHotel._id);
        if (updatedHotel) {
          setSelectedHotel(updatedHotel);
        }
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Không thể xóa loại phòng');
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedHotel) return;

    try {
      const roomData = {
        typeName: values.typeName,
        basePrice: values.basePrice,
        discountPrice: values.finalPrice !== values.basePrice ? values.finalPrice : undefined,
        maxOccupancy: values.maxOccupancy,
        bedType: values.bedType,
        totalRooms: values.totalRooms,
        amenities: values.amenities || [],
        description: values.description
      };

      let response;
      if (editingRoom) {
        response = await axios.put(
          `http://localhost:8080/api/admin/hotels/${selectedHotel._id}/rooms/${editingRoom._id}`,
          roomData
        );
      } else {
        response = await axios.post(
          `http://localhost:8080/api/admin/hotels/${selectedHotel._id}/rooms`,
          roomData
        );
      }

      if (response.data.success) {
        message.success(editingRoom ? 'Cập nhật loại phòng thành công' : 'Thêm loại phòng thành công');
        setModalVisible(false);
        fetchHotels();
        // Cập nhật selectedHotel
        const updatedHotel = hotels.find(h => h._id === selectedHotel._id);
        if (updatedHotel) {
          setSelectedHotel(updatedHotel);
          fetchRoomAvailability(updatedHotel._id);
        }
      }
    } catch (error) {
      console.error('Error saving room:', error);
      message.error('Không thể lưu thông tin loại phòng');
    }
  };

  const roomColumns = [
    {
      title: 'Tên loại phòng',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: 'Giá gốc',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Giá hiện tại',
      key: 'finalPrice',
      render: (record: RoomType) => {
        const finalPrice = record.discountPrice || record.basePrice;
        return `${finalPrice.toLocaleString()} VNĐ`;
      },
    },
    {
      title: 'Sức chứa',
      dataIndex: 'maxOccupancy',
      key: 'maxOccupancy',
      render: (occupancy: number) => `${occupancy} người`,
    },
    {
      title: 'Loại giường',
      dataIndex: 'bedType',
      key: 'bedType',
    },
    {
      title: 'Tổng số phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: RoomType) => (
        <div>
          <Button
            type="link"
            icon={<EditOutlined />}
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
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const availabilityColumns = [
    {
      title: 'Loại phòng',
      dataIndex: 'typeName',
      key: 'typeName',
    },
    {
      title: 'Tổng số phòng',
      dataIndex: 'totalRooms',
      key: 'totalRooms',
    },
    {
      title: 'Phòng đã đặt',
      dataIndex: 'bookedRooms',
      key: 'bookedRooms',
    },
    {
      title: 'Phòng còn trống',
      dataIndex: 'availableRooms',
      key: 'availableRooms',
      render: (available: number, record: RoomAvailability) => (
        <span style={{ color: available > 0 ? 'green' : 'red' }}>
          {available}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Quản lý Phòng Khách sạn</h1>
      
      {/* Danh sách khách sạn */}
      <Card title="Chọn khách sạn" style={{ marginBottom: '24px' }}>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn khách sạn để quản lý phòng"
          onChange={(value) => {
            const hotel = hotels.find(h => h._id === value);
            if (hotel) handleHotelSelect(hotel);
          }}
          value={selectedHotel?._id}
        >
          {hotels.map(hotel => (
            <Select.Option key={hotel._id} value={hotel._id}>
              {hotel.name}
            </Select.Option>
          ))}
        </Select>
      </Card>

      {selectedHotel && (
        <>
          {/* Thống kê tình trạng phòng */}
          <Card title="Tình trạng phòng" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Tổng loại phòng"
                  value={selectedHotel.roomTypes.length}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Tổng số phòng"
                  value={selectedHotel.roomTypes.reduce((sum, room) => sum + room.totalRooms, 0)}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Phòng đã đặt"
                  value={roomAvailability.reduce((sum, room) => sum + room.bookedRooms, 0)}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Phòng còn trống"
                  value={roomAvailability.reduce((sum, room) => sum + room.availableRooms, 0)}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
            </Row>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => setAvailabilityModalVisible(true)}
              style={{ marginTop: '16px' }}
            >
              Xem chi tiết tình trạng phòng
            </Button>
          </Card>

          {/* Danh sách loại phòng */}
          <Card
            title={`Danh sách loại phòng - ${selectedHotel.name}`}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRoom}
              >
                Thêm loại phòng
              </Button>
            }
          >
            <Table
              columns={roomColumns}
              dataSource={selectedHotel.roomTypes}
              rowKey="_id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </>
      )}

      {/* Modal thêm/sửa loại phòng */}
      <Modal
        title={editingRoom ? 'Sửa loại phòng' : 'Thêm loại phòng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="typeName"
            label="Tên loại phòng"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại phòng' }]}
          >
            <Input placeholder="VD: Phòng Standard" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="basePrice"
                label="Giá gốc (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="finalPrice"
                label="Giá hiện tại (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá hiện tại' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxOccupancy"
                label="Sức chứa tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalRooms"
                label="Tổng số phòng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng phòng' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bedType"
            label="Loại giường"
            rules={[{ required: true, message: 'Vui lòng chọn loại giường' }]}
          >
            <Select placeholder="Chọn loại giường">
              {bedTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amenities"
            label="Tiện nghi"
          >
            <Select
              mode="multiple"
              placeholder="Chọn tiện nghi"
              style={{ width: '100%' }}
            >
              {amenitiesList.map(amenity => (
                <Select.Option key={amenity} value={amenity}>
                  {amenity}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về loại phòng" />
          </Form.Item>

          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem tình trạng phòng */}
      <Modal
        title="Chi tiết tình trạng phòng"
        open={availabilityModalVisible}
        onCancel={() => setAvailabilityModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAvailabilityModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        <Table
          columns={availabilityColumns}
          dataSource={roomAvailability}
          rowKey="roomTypeId"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default RoomManagement;
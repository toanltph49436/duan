import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Input, Card, Tag, Drawer, Form, Select, Switch, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const { TextArea } = Input;

interface Amenity {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;

const AmenityManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const amenityCategories = [
    'Tiện ích trong phòng (cá nhân)',
    'Tiện ích chung (dùng chung)',
    'Tiện ích phòng & an toàn cho trẻ em'
  ];

  const iconOptions = [
    // Tiện ích trong phòng
    { value: 'bed', label: 'Giường ngủ thoải mái', icon: '🛏' },
    { value: 'ac', label: 'Điều hòa/Quạt máy', icon: '❄️' },
    { value: 'tv', label: 'TV màn hình phẳng', icon: '📺' },
    { value: 'wifi', label: 'WiFi miễn phí', icon: '📶' },
    { value: 'bathroom', label: 'Phòng tắm riêng', icon: '🚿' },
    { value: 'toiletries', label: 'Đồ dùng vệ sinh', icon: '🧴' },
    { value: 'towels', label: 'Khăn tắm, khăn mặt', icon: '🧖' },
    { value: 'coffee', label: 'Ấm đun nước/Trà cà phê', icon: '☕' },
    { value: 'minibar', label: 'Tủ lạnh mini', icon: '🧊' },
    { value: 'phone', label: 'Điện thoại bàn', icon: '📞' },
    { value: 'safebox', label: 'Tủ khóa an toàn', icon: '🔒' },
    
    // Tiện ích chung
    { value: 'parking', label: 'Bãi đậu xe', icon: '🅿️' },
    { value: 'reception', label: 'Lễ tân 24/7', icon: '🛎' },
    { value: 'restaurant', label: 'Nhà hàng/Quầy bar', icon: '🍳' },
    { value: 'gym', label: 'Phòng gym', icon: '🏋️' },
    { value: 'pool', label: 'Hồ bơi', icon: '🏊' },
    { value: 'laundry', label: 'Dịch vụ giặt ủi', icon: '🧺' },
    { value: 'shuttle', label: 'Đưa đón sân bay', icon: '🚖' },
    { value: 'luggage', label: 'Khu giữ hành lý', icon: '📦' },
    { value: 'business', label: 'Khu làm việc', icon: '👨‍💻' },
    { value: 'convenience', label: 'Cửa hàng tiện ích', icon: '🛒' },
    
    // Tiện ích phòng & an toàn cho trẻ em
    { value: 'crib', label: 'Cũi trẻ em/Giường nôi', icon: '🛏' },
    { value: 'extra-bed', label: 'Giường phụ cho bé', icon: '🛌' },
    { value: 'toys', label: 'Đồ chơi nhỏ trong phòng', icon: '🧸' },
    { value: 'soundproof', label: 'Phòng cách âm', icon: '🔇' },
    { value: 'safe-outlet', label: 'Ổ cắm điện có nắp an toàn', icon: '🔒' },
    { value: 'safety-gate', label: 'Cầu thang/Lan can có chắn an toàn', icon: '🪜' },
    { value: 'babysitting', label: 'Dịch vụ giữ trẻ', icon: '🚼' },
    { value: 'first-aid', label: 'Bộ sơ cứu trong phòng', icon: '🩹' },
    { value: 'childcare', label: 'Dịch vụ trông trẻ theo giờ', icon: '👶' },
    { value: 'stroller', label: 'Xe đẩy (stroller) cho bé', icon: '🚼' },
    { value: 'baby-toiletries', label: 'Sữa tắm/Dầu gội trẻ em', icon: '🧴' },
    { value: 'baby-supplies', label: 'Dịch vụ cung cấp sữa bột/Bỉm', icon: '🍼' }
  ];

  // Fetch amenities
  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      // Lấy token từ Clerk
      const token = await getToken();
      
      const response = await fetch('http://localhost:8080/api/admin/amenities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch amenities');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create amenity mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Lấy token từ Clerk
      const token = await getToken();
      
      const response = await fetch('http://localhost:8080/api/admin/amenities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create amenity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      message.success('Thêm tiện ích thành công!');
      setIsDrawerOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi thêm tiện ích!');
    }
  });

  // Update amenity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Lấy token từ Clerk
      const token = await getToken();
      
      const response = await fetch(`http://localhost:8080/api/admin/amenities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update amenity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      message.success('Cập nhật tiện ích thành công!');
      setIsDrawerOpen(false);
      setEditingAmenity(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật tiện ích!');
    }
  });

  // Delete amenity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Lấy token từ Clerk
      const token = await getToken();
      
      const response = await fetch(`http://localhost:8080/api/admin/amenities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete amenity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      message.success('Xóa tiện ích thành công!');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa tiện ích!');
    }
  });

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa tiện ích "${name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id)
    });
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      icon: values.icon || 'setting'
    };

    if (editingAmenity) {
      updateMutation.mutate({ id: editingAmenity._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    form.setFieldsValue({
      name: amenity.name,
      icon: amenity.icon,
      description: amenity.description,
      category: amenity.category,
      isActive: amenity.isActive
    });
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingAmenity(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingAmenity(null);
    form.resetFields();
  };

  const filteredAmenities = amenities.filter((amenity: Amenity) =>
    amenity.name.toLowerCase().includes(searchText.toLowerCase()) ||
    amenity.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên tiện ích',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Amenity) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{record.icon ? iconOptions.find(opt => opt.value === record.icon)?.icon || '⚙️' : '⚙️'}</span>
          <span className="font-medium">{text}</span>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <Tag color={text.includes('phòng') ? 'green' : 'blue'} className="font-medium">
          {text}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span className="text-gray-600">
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : 'Không có mô tả'}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Amenity) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa tiện ích "${record.name}"?`}
            onConfirm={() => handleDelete(record._id, record.name)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Tiện ích Khách sạn</h1>
        <p className="text-gray-600">Quản lý danh sách các tiện ích có sẵn tại khách sạn</p>
      </div>

      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm tiện ích..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-80"
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm Tiện ích Mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAmenities}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tiện ích`
          }}
        />
      </Card>

      <Drawer
        title={editingAmenity ? 'Chỉnh sửa Tiện ích' : 'Thêm Tiện ích Mới'}
        width={600}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCloseDrawer}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingAmenity ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            category: 'Tiện ích trong phòng (cá nhân)'
          }}
        >
          <Form.Item
            label="Tên tiện ích"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên tiện ích!' }]}
          >
            <Input placeholder="Nhập tên tiện ích" />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {amenityCategories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Icon"
            name="icon"
            help="Chọn icon để hiển thị cho tiện ích"
          >
            <Select placeholder="Chọn icon">
              {iconOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả về tiện ích"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="isActive"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Tạm dừng"
              size="default"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AmenityManagement;

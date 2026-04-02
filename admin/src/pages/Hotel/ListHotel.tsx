import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Input, Card, Tag, Drawer, Form, Select, InputNumber, Upload, Rate, Divider, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, StarFilled } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;

interface Hotel {
  _id: string;
  hotelName: string;
  address: string;
  location: {
    _id: string;
    locationName: string;
    country: string;
  };
  description: string;
  starRating: number;
  hotelImages: string[];
  hotelAmenities: { name: string; icon?: string }[];
  contactInfo: {
    phone: string;
    email: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellationPolicy?: string;
    petPolicy?: boolean;
    smokingPolicy?: boolean;
  };
  roomTypes: {
    typeName: string;
    basePrice: number;
    maxOccupancy: number;
    bedType: string;
    totalRooms: number;
    floorNumber?: number;
  }[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

const { Option } = Select;

const ListHotel: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  const cities = [
    { value: '', label: 'Tất cả thành phố' },
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Hạ Long', label: 'Hạ Long' },
    { value: 'Nha Trang', label: 'Nha Trang' },
    { value: 'Phú Quốc', label: 'Phú Quốc' },
    { value: 'Hội An', label: 'Hội An' },
    { value: 'Huế', label: 'Huế' },
    { value: 'Vũng Tàu', label: 'Vũng Tàu' },
    { value: 'Đà Lạt', label: 'Đà Lạt' },
    { value: 'Cần Thơ', label: 'Cần Thơ' }
  ];

  // Fetch hotels
  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/admin/hotels');
      if (!response.ok) throw new Error('Failed to fetch hotels');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create hotel mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('http://localhost:8080/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create hotel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      message.success('Thêm khách sạn thành công!');
      setIsDrawerOpen(false);
      form.resetFields();
      setFileList([]);
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi thêm khách sạn!');
    }
  });

  // Delete hotel mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:8080/api/admin/hotels/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete hotel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      message.success('Xóa khách sạn thành công!');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa khách sạn!');
    }
  });

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa khách sạn "${name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => deleteMutation.mutate(id)
    });
  };

  const handleAddHotel = (values: any) => {
    // Transform amenities to proper format
    const hotelAmenities = values.hotelAmenities?.map((amenity: any) => {
      if (typeof amenity === 'string') {
        return { name: amenity };
      }
      return { name: amenity.value || amenity.label || amenity };
    }) || [];

    const formData = {
      ...values,
      hotelAmenities,
      hotelImages: fileList.map(file => file.url || file.response?.url || '')
    };
    createMutation.mutate(formData);
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    const formData = new FormData();
    formData.append('images', file);
    
    try {
      const response = await fetch('http://localhost:8080/api/admin/upload/hotel-images', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.images.length > 0) {
          onSuccess({
            url: result.data.images[0]
          }, file);
        } else {
          onError(new Error('Upload failed'));
        }
      } else {
        onError(new Error('Upload failed'));
      }
    } catch (error) {
      onError(error);
    }
  };

  // Fetch amenities for hotel form
  const { data: amenitiesOptions = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8080/api/admin/amenities/active');
      if (!response.ok) throw new Error('Failed to fetch amenities');
      const result = await response.json();
      return result.data || [];
    }
  });

  const filteredHotels = hotels.filter((hotel: Hotel) =>
    hotel.hotelName.toLowerCase().includes(searchText.toLowerCase()) ||
    hotel.address.toLowerCase().includes(searchText.toLowerCase()) ||
    hotel.location?.locationName?.toLowerCase().includes(searchText.toLowerCase()) ||
    hotel.location?.country?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên khách sạn',
      dataIndex: 'hotelName',
      key: 'hotelName',
      render: (text: string, record: Hotel) => (
        <div className="flex items-center space-x-3">
          {record.hotelImages && record.hotelImages[0] && (
            <img 
              src={record.hotelImages[0]} 
              alt={text}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.location?.locationName} - {record.location?.country}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (record: Hotel) => (
        <div>
          <div className="text-sm">{record.contactInfo?.phone}</div>
          <div className="text-sm text-gray-500">{record.contactInfo?.email}</div>
        </div>
      )
    },
    {
      title: 'Xếp hạng',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (rating: number) => (
        <div className="flex items-center">
          <Rate disabled defaultValue={rating} className="text-sm" />
          <span className="ml-2 text-gray-600">({rating})</span>
        </div>
      )
    },
    {
      title: 'Tiện ích',
      dataIndex: 'hotelAmenities',
      key: 'hotelAmenities',
      render: (amenities: any[]) => (
        <div className="flex flex-wrap gap-1">
          {amenities && amenities.length > 0 ? (
            amenities.slice(0, 3).map((amenity: any, index: number) => (
              <Tag key={index} color="blue" size="small">
                {amenity.name}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Không có</span>
          )}
          {amenities && amenities.length > 3 && (
            <Tag color="default" size="small">
              +{amenities.length - 3} nữa
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: Hotel) => (
        <Space size="middle">
          <Link to={`/admin/hotels/edit/${record._id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Sửa
            </Button>
          </Link>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record._id, record.hotelName)}
            loading={deleteMutation.isPending}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý khách sạn</h1>
            <p className="text-gray-600 mt-1">Danh sách tất cả khách sạn trong hệ thống</p>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => setIsDrawerOpen(true)}
          >
            Thêm khách sạn mới
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo tên khách sạn, thành phố hoặc địa chỉ..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredHotels}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách sạn`
          }}
          className="shadow-sm"
        />
      </Card>

      <Drawer
        title="Thêm khách sạn mới"
        width={800}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        extra={
          <Space>
            <Button onClick={() => {
              setIsDrawerOpen(false);
              form.resetFields();
              setFileList([]);
            }}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()}
              loading={createMutation.isPending}
            >
              Thêm khách sạn
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddHotel}
          initialValues={{
            status: true,
            starRating: 5,
            policies: {
              checkIn: '14:00',
              checkOut: '12:00',
              petPolicy: false,
              smokingPolicy: false
            },
            contactInfo: {
              phone: '',
              email: ''
            },
            roomTypes: [],
            hotelAmenities: []
          }}
        >
          <div className="space-y-4">
            <Form.Item
              label="Tên khách sạn"
              name="hotelName"
              rules={[
                { required: true, message: 'Vui lòng nhập tên khách sạn!' },
                { min: 3, message: 'Tên khách sạn phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên khách sạn" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Nhập địa chỉ khách sạn" />
              </Form.Item>

              <Form.Item
                label="Địa điểm"
                name="location"
                rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
              >
                <Select placeholder="Chọn thành phố">
                  {cities.filter(city => city.value !== '').map(city => (
                    <Option key={city.value} value={city.value}>
                      {city.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Số điện thoại"
                name={['contactInfo', 'phone']}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="Email"
                name={['contactInfo', 'email']}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Xếp hạng sao"
                name="starRating"
                rules={[{ required: true, message: 'Vui lòng chọn xếp hạng!' }]}
              >
                <Rate
                  allowHalf
                  character={<StarFilled />}
                />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm dừng</Option>
                </Select>
              </Form.Item>
            </div>



            <Form.Item
              label="Tiện ích khách sạn"
              name="hotelAmenities"
            >
              <Select
                mode="multiple"
                placeholder="Chọn các tiện ích"
                labelInValue
                options={amenitiesOptions.map((amenity: any) => ({
                  label: amenity.name,
                  value: amenity.name
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả về khách sạn"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Divider orientation="left">Thông tin giá và phòng</Divider>
            
            <Divider orientation="left">Loại phòng</Divider>
            <p className="text-gray-600 mb-4">Thêm các loại phòng có sẵn tại khách sạn</p>

            <Form.List name="roomTypes">
              {(fields, { add, remove }) => (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Quản lý các loại phòng của khách sạn</span>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                      Thêm loại phòng
                    </Button>
                  </div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} className="mb-4" size="small">
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                           {...restField}
                           name={[name, 'typeName']}
                           label="Tên loại phòng"
                           rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
                         >
                           <Select placeholder="Chọn loại phòng">
                              <Option value="Phòng Tiêu Chuẩn">Phòng Tiêu Chuẩn</Option>
                              <Option value="Phòng Cao Cấp">Phòng Cao Cấp</Option>
                              <Option value="Phòng Deluxe">Phòng Deluxe</Option>
                              <Option value="Phòng Hạng Thương Gia">Phòng Hạng Thương Gia</Option>
                              <Option value="View Biển">View Biển</Option>
                              <Option value="View Thành Phố">View Thành Phố</Option>
                              <Option value="Phòng Tổng Thống">Phòng Tổng Thống</Option>
                              <Option value="Phòng Đôi Giường Đơn">Phòng Đôi Giường Đơn</Option>
                              <Option value="Phòng Đơn">Phòng Đơn</Option>
                              <Option value="Phòng Đôi">Phòng Đôi</Option>
                            </Select>
                         </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'basePrice']}
                          label="Giá cơ bản (VNĐ)"
                          rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                        >
                          <InputNumber
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Nhập giá phòng"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'maxOccupancy']}
                          label="Sức chứa tối đa"
                          rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
                        >
                          <InputNumber min={1} placeholder="Số người" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'bedType']}
                          label="Loại giường"
                          rules={[{ required: true, message: 'Vui lòng chọn loại giường!' }]}
                        >
                          <Select placeholder="Chọn loại giường">
                            <Option value="Single">Single</Option>
                            <Option value="Double">Double</Option>
                            <Option value="Twin">Twin</Option>
                            <Option value="King">King</Option>
                            <Option value="Queen">Queen</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'totalRooms']}
                          label="Số phòng"
                          rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
                        >
                          <InputNumber min={1} placeholder="Số phòng" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'floorNumber']}
                          label="Số tầng"
                          rules={[{ required: true, message: 'Vui lòng nhập số tầng!' }]}
                        >
                          <InputNumber min={1} placeholder="Tầng" style={{ width: '100%' }} />
                        </Form.Item>
                        <div className="flex justify-end">
                          <Button type="link" danger onClick={() => remove(name)}>
                            Xóa loại phòng
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </Form.List>

            <Divider orientation="left">Chính sách khách sạn</Divider>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Thời gian nhận phòng"
                name={['policies', 'checkIn']}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian nhận phòng!' }]}
              >
                <Select placeholder="Chọn thời gian">
                  <Option value="12:00">12:00</Option>
                  <Option value="13:00">13:00</Option>
                  <Option value="14:00">14:00</Option>
                  <Option value="15:00">15:00</Option>
                  <Option value="16:00">16:00</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Thời gian trả phòng"
                name={['policies', 'checkOut']}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian trả phòng!' }]}
              >
                <Select placeholder="Chọn thời gian">
                  <Option value="10:00">10:00</Option>
                  <Option value="11:00">11:00</Option>
                  <Option value="12:00">12:00</Option>
                  <Option value="13:00">13:00</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="Chính sách hủy phòng"
              name={['policies', 'cancellationPolicy']}
            >
              <TextArea
                rows={3}
                placeholder="Nhập chính sách hủy phòng"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
               <Form.Item
                 label="Chính sách thú cưng"
                 name={['policies', 'petPolicy']}
                 valuePropName="checked"
               >
                 <Switch 
                   checkedChildren="Cho phép" 
                   unCheckedChildren="Không cho phép"
                   size="default"
                 />
               </Form.Item>
 
               <Form.Item
                 label="Chính sách hút thuốc"
                 name={['policies', 'smokingPolicy']}
                 valuePropName="checked"
               >
                 <Switch 
                   checkedChildren="Cho phép" 
                   unCheckedChildren="Không cho phép"
                   size="default"
                 />
               </Form.Item>
             </div>

            <Form.Item
              label="Hình ảnh khách sạn"
              name="hotelImages"
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                customRequest={customRequest}
                multiple
              >
                {fileList.length >= 8 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ListHotel;
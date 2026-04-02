import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, Upload, Space, Rate, Divider, Switch } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, StarFilled } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;

interface HotelFormData {
  hotelName: string;
  address: string;
  location: string;
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
    floorNumber: number;
  }[];
  status: boolean;
}

const AddHotel: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);



  const createMutation = useMutation({
    mutationFn: async (data: HotelFormData) => {
      const response = await fetch('http://localhost:8080/api/admin/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to create hotel');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      message.success('Thêm khách sạn thành công!');
      navigate('/admin/hotels');
    },
    onError: (error: any) => {
      console.error('Create hotel error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm khách sạn!');
    }
  });

  const onFinish = (values: any) => {
    // Transform amenities to proper format
    const hotelAmenities = values.hotelAmenities?.map((amenity: any) => {
      if (typeof amenity === 'string') {
        return { name: amenity };
      }
      return { name: amenity.value || amenity.label || amenity };
    }) || [];

    // Filter out empty image URLs
    const validImages = fileList
      .map(file => {
        if (file.url) return file.url;
        if (file.response?.url) return file.response.url;
        return '';
      })
      .filter(url => url.trim() !== '');
    
    if (validImages.length === 0) {
      message.warning('Khuyến nghị: Nên upload ít nhất một hình ảnh khách sạn để thu hút khách hàng!');
    }

    const formData: HotelFormData = {
      ...values,
      hotelAmenities,
      hotelImages: validImages,

    };
    
    console.log('Form data being sent:', JSON.stringify(formData, null, 2));
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

  const amenitiesOptions = [
    'WiFi miễn phí',
    'Bể bơi',
    'Phòng gym',
    'Spa',
    'Nhà hàng',
    'Bar',
    'Dịch vụ phòng 24/7',
    'Bãi đậu xe',
    'Trung tâm hội nghị',
    'Dịch vụ giặt ủi',
    'Sân tennis',
    'Sân golf',
    'Khu vui chơi trẻ em',
    'Dịch vụ đưa đón sân bay'
  ];

  // Đảm bảo luôn có ít nhất một loại phòng
  useEffect(() => {
    const roomTypes = form.getFieldValue('roomTypes') || [];
    if (roomTypes.length === 0) {
      form.setFieldsValue({
        roomTypes: [{
          typeName: '',
          basePrice: 0,
          maxOccupancy: 2,
          bedType: 'Double',
          totalRooms: 1
        }]
      });
    }
  }, [form]);

  return (
    <div className="p-6">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/hotels')}
            className="mr-4"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thêm khách sạn mới</h1>
            <p className="text-gray-600 mt-1">Điền thông tin để thêm khách sạn mới vào hệ thống</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
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
            roomTypes: [{
              typeName: '',
              basePrice: 0,
              maxOccupancy: 2,
              bedType: 'Double',
              totalRooms: 1,
              floorNumber: 1
            }],
            hotelAmenities: []
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Form.Item
                label="Tên khách sạn"
                name="hotelName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khách sạn!' },
                  { min: 3, message: 'Tên khách sạn phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên khách sạn" size="large" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Nhập địa chỉ khách sạn" size="large" />
              </Form.Item>

              <Form.Item
                label="Địa điểm"
                name="location"
                rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
              >
                <Select placeholder="Chọn thành phố" size="large">
                  {cities.filter(city => city.value !== '').map(city => (
                    <Option key={city.value} value={city.value}>
                      {city.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name={['contactInfo', 'phone']}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name={['contactInfo', 'email']}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
            </div>

            <div className="space-y-4">
              <Form.Item
                label="Xếp hạng sao"
                name="starRating"
                rules={[{ required: true, message: 'Vui lòng chọn xếp hạng!' }]}
              >
                <Rate
                  allowHalf
                  character={<StarFilled />}
                  className="text-2xl"
                />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái" size="large">
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Tạm dừng</Option>
                </Select>
              </Form.Item>

              <Form.List name="roomTypes">
                {(fields, { add, remove }) => (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Loại phòng</h3>
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
                             <Option value="Phòng Suite">Phòng Suite</Option>
                             <Option value="Phòng Junior Suite">Phòng Junior Suite</Option>
                             <Option value="Phòng Tổng Thống">Phòng Tổng Thống</Option>
                             <Option value="Phòng Gia Đình">Phòng Gia Đình</Option>
                             <Option value="Phòng Đôi Giường Đơn">Phòng Đôi Giường Đơn</Option>
                             <Option value="Phòng Đơn">Phòng Đơn</Option>
                             <Option value="Phòng Đôi">Phòng Đôi</Option>
                             <Option value="Phòng Ba Người">Phòng Ba Người</Option>
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

              <Form.Item
                label="Tiện ích khách sạn"
                name="hotelAmenities"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các tiện ích"
                  size="large"
                  labelInValue
                  options={amenitiesOptions.map(amenity => ({
                    label: amenity,
                    value: amenity
                  }))}
                />
              </Form.Item>



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
          </div>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả về khách sạn"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Divider orientation="left">Thông tin thời gian và chính sách</Divider>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Form.Item
                label="Thời gian nhận phòng"
                name={['policies', 'checkIn']}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian nhận phòng!' }]}
              >
                <Select placeholder="Chọn thời gian" size="large">
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
                <Select placeholder="Chọn thời gian" size="large">
                  <Option value="10:00">10:00</Option>
                  <Option value="11:00">11:00</Option>
                  <Option value="12:00">12:00</Option>
                  <Option value="13:00">13:00</Option>
                </Select>
              </Form.Item>

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
            </div>
            
            <div className="space-y-4">
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
          </div>



          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button 
                size="large" 
                onClick={() => navigate('/admin/hotels')}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={createMutation.isPending}
              >
                Thêm khách sạn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddHotel;
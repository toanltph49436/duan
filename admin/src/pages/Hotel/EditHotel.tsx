import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message, Select, InputNumber, Upload, Space, Spin, Switch } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;

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

const EditHotel: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

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

  // Fetch hotel data
  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8080/api/admin/hotels/${id}`);
      if (!response.ok) throw new Error('Failed to fetch hotel');
      const result = await response.json();
      return result.data;
    },
    enabled: !!id
  });

  // Update hotel mutation
  const updateMutation = useMutation({
    mutationFn: async (data: HotelFormData) => {
      const response = await fetch(`http://localhost:8080/api/admin/hotels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update hotel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', id] });
      message.success('Cập nhật khách sạn thành công!');
      navigate('/admin/hotels');
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi cập nhật khách sạn!');
    }
  });

  // Set form values when hotel data is loaded
  useEffect(() => {
    if (hotel) {
      form.setFieldsValue({
        hotelName: hotel.hotelName,
        address: hotel.address,
        location: hotel.location?.locationName,
        description: hotel.description,
        starRating: hotel.starRating,

        contactInfo: {
          phone: hotel.contactInfo?.phone,
          email: hotel.contactInfo?.email
        },
        policies: {
          checkIn: hotel.policies?.checkIn,
          checkOut: hotel.policies?.checkOut,
          cancellationPolicy: hotel.policies?.cancellationPolicy,
          petPolicy: hotel.policies?.petPolicy,
          smokingPolicy: hotel.policies?.smokingPolicy
        },

        hotelAmenities: hotel.hotelAmenities?.map(amenity => amenity.name) || [],
        roomTypes: hotel.roomTypes || [],
        status: hotel.status
      });

      // Set file list for images
      const imageFiles: UploadFile[] = hotel.hotelImages?.map((url, index) => ({
        uid: `image-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url
      }));
      setFileList(imageFiles);
    }
  }, [hotel, form]);

  const onFinish = (values: any) => {
    const formData: HotelFormData = {
      hotelName: values.hotelName,
      address: values.address,
      location: hotel?.location?._id || '',
      description: values.description,
      starRating: values.starRating,

      hotelImages: fileList.map(file => {
        if (file.url) return file.url;
        if (file.response?.url) return file.response.url;
        return '';
      }).filter(url => url !== ''),
      hotelAmenities: values.hotelAmenities?.map((name: string) => ({ name })) || [],
      contactInfo: {
        phone: values.contactInfo?.phone || '',
        email: values.contactInfo?.email || ''
      },
      policies: {
        checkIn: values.policies?.checkIn || hotel?.policies?.checkIn || '',
        checkOut: values.policies?.checkOut || hotel?.policies?.checkOut || '',
        cancellationPolicy: values.policies?.cancellationPolicy || hotel?.policies?.cancellationPolicy || '',
        petPolicy: values.policies?.petPolicy !== undefined ? values.policies?.petPolicy : hotel?.policies?.petPolicy,
        smokingPolicy: values.policies?.smokingPolicy !== undefined ? values.policies?.smokingPolicy : hotel?.policies?.smokingPolicy
      },

      roomTypes: values.roomTypes || hotel?.roomTypes || [],
      status: values.status
    };
    updateMutation.mutate(formData);
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
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/hotels')}
            className="mr-4"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa khách sạn</h1>
            <p className="text-gray-600 mt-1">Cập nhật thông tin khách sạn: {hotel.hotelName}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
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
                name={["contactInfo", "phone"]}
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name={["contactInfo", "email"]}
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
                label="Đánh giá"
                name="starRating"
                rules={[{ required: true, message: 'Vui lòng chọn đánh giá!' }]}
              >
                <InputNumber
                  min={1}
                  max={5}
                  step={0.1}
                  placeholder="Đánh giá (1-5 sao)"
                  size="large"
                  className="w-full"
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

              <Form.Item
                label="Tiện ích"
                name="hotelAmenities"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các tiện ích"
                  size="large"
                  options={amenitiesOptions.map(amenity => ({
                    label: amenity,
                    value: amenity
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Hình ảnh"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              label="Giờ nhận phòng"
              name={["policies", "checkIn"]}
              rules={[{ required: true, message: 'Vui lòng nhập giờ nhận phòng!' }]}
            >
              <Input placeholder="VD: 14:00" size="large" />
            </Form.Item>

            <Form.Item
              label="Giờ trả phòng"
              name={["policies", "checkOut"]}
              rules={[{ required: true, message: 'Vui lòng nhập giờ trả phòng!' }]}
            >
              <Input placeholder="VD: 12:00" size="large" />
            </Form.Item>

            <Form.Item
              label="Chính sách hủy"
              name={["policies", "cancellationPolicy"]}
            >
              <Input placeholder="Chính sách hủy phòng" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
             <Form.Item
               label="Chính sách thú cưng"
               name={["policies", "petPolicy"]}
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
               name={["policies", "smokingPolicy"]}
               valuePropName="checked"
             >
               <Switch 
                 checkedChildren="Cho phép" 
                 unCheckedChildren="Không cho phép"
                 size="default"
               />
             </Form.Item>
           </div>



          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Loại phòng và giá</h3>
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
                loading={updateMutation.isPending}
              >
                Cập nhật khách sạn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditHotel;
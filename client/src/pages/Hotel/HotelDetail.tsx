import React, { useState, useEffect } from 'react';
import './HotelDetail.css';
import {
  Row,
  Col,
  Card,
  Button,
  Rate,
  Tag,
  Image,
  Divider,
  DatePicker,
  InputNumber,
  Select,
  message,
  Modal,
  Form,
  Input,
  Spin,
  Carousel,
  Typography,
  Space,
} from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

interface Hotel {
  _id: string;
  hotelName: string;
  description: string;
  location: {
    locationName: string;
    country: string;
  };
  starRating: number;
  hotelImages: string[];
  roomTypes: Array<{
    _id: string;
    typeName: string;
    basePrice: number;
    finalPrice: number;
    maxOccupancy: number;
    amenities: string[];
    images: string[];
    totalRooms: number;
    discountPercentage: number;
  }>;
  hotelAmenities: Array<{
    name: string;
  }>;
  policies: {
    checkIn: string;
    checkOut: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  averageRating: number;
  totalReviews: number;
}

interface RoomAvailability {
  roomTypeIndex: number;
  roomType: any;
  availableRooms: number;
}

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Get initial values from URL params
  const initialCheckIn = searchParams.get('checkIn') || moment().add(1, 'day').format('YYYY-MM-DD');
  const initialCheckOut = searchParams.get('checkOut') || moment().add(2, 'days').format('YYYY-MM-DD');
  const initialGuests = Number(searchParams.get('guests')) || 2;
  
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [datePickerValue, setDatePickerValue] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchHotelDetail();
    }
  }, [id]);

  // Đồng bộ datePickerValue với checkInDate và checkOutDate
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setDatePickerValue([moment(checkInDate), moment(checkOutDate)]);
    } else {
      setDatePickerValue(null);
    }
  }, [checkInDate, checkOutDate]);

  const fetchHotelDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hotels/${id}`);
      if (response.data.success) {
        setHotel(response.data.data);
        // Kiểm tra availability sau khi load hotel
        if (checkInDate && checkOutDate) {
          checkAvailability(response.data.data);
        }
      } else {
        message.error('Không tìm thấy khách sạn');
        navigate('/hotels');
      }
    } catch (error) {
      message.error('Không thể tải thông tin khách sạn');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (hotelData?: Hotel) => {
    const currentHotel = hotelData || hotel;
    if (!currentHotel || !checkInDate || !checkOutDate) return;
    
    setCheckingAvailability(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/hotels/${currentHotel._id}/availability?checkIn=${checkInDate}&checkOut=${checkOutDate}`
      );
      
      if (response.data.success) {
        setAvailability(response.data.data.availableRoomTypes || []);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleDateChange = (dates: any) => {
    setDatePickerValue(dates);
    
    if (!dates || dates.length === 0) {
      setCheckInDate('');
      setCheckOutDate('');
      setAvailability([]);
      return;
    }
    
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      const checkIn = moment(dates[0]);
      const checkOut = moment(dates[1]);
      
      const daysDiff = checkOut.diff(checkIn, 'days');
      if (daysDiff < 1) {
        message.error('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày');
        return;
      }
      
      if (daysDiff > 30) {
        message.error('Thời gian lưu trú không được quá 30 ngày');
        return;
      }
      
      const newCheckIn = checkIn.format('YYYY-MM-DD');
      const newCheckOut = checkOut.format('YYYY-MM-DD');
      
      setCheckInDate(newCheckIn);
      setCheckOutDate(newCheckOut);
      
      if (hotel) {
        checkAvailability();
      }
    }
  };

  const handleBookRoom = (roomType: any, availableRooms: number, price: number) => {
    setSelectedRoomType({ ...roomType, availableRooms, price });
    setBookingModalVisible(true);
    
    // Auto-fill guest 1 name when modal opens
    setTimeout(() => {
      const fullName = form.getFieldValue('fullName');
      if (fullName) {
        form.setFieldsValue({
          guests: [{
            fullName: fullName,
            gender: undefined,
            birthDate: undefined
          }]
        });
      }
    }, 100);
  };

  const [depositModalVisible, setDepositModalVisible] = useState(false);

  const handleBookingSubmit = async (values: any) => {
    // Kiểm tra nếu là thanh toán cọc và phương thức thanh toán không phải là bank_transfer
    if (values.paymentType === 'deposit' && values.paymentMethod !== 'bank_transfer') {
      // Hiển thị modal thông báo
      setDepositModalVisible(true);
      return;
    }

    // Thực hiện đặt phòng
    await processBooking(values);
  };

  const processBooking = async (values: any) => {
    setBookingLoading(true);
    try {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        message.error('Vui lòng đăng nhập để đặt phòng');
        setBookingLoading(false);
        return;
      }
      const bookingData = {
        userId: storedUserId,
        hotelId: hotel?._id,
        checkInDate,
        checkOutDate,
        numberOfNights: moment(checkOutDate).diff(moment(checkInDate), 'days'),
        totalGuests: guests,
        fullNameUser: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address || '',
        roomBookings: [{
          roomTypeIndex: hotel?.roomTypes.findIndex(rt => rt._id === selectedRoomType._id),
          roomTypeName: selectedRoomType.typeName,
          numberOfRooms: values.numberOfRooms,
          pricePerNight: selectedRoomType.price,
          totalPrice: selectedRoomType.price * values.numberOfRooms * moment(checkOutDate).diff(moment(checkInDate), 'days'),
          guests: values.guests ? values.guests.map((guest: any) => ({
            fullName: guest.fullName,
            gender: guest.gender,
            birthDate: guest.birthDate ? moment(guest.birthDate).format('YYYY-MM-DD') : new Date('1990-01-01')
          })) : Array.from({ length: guests }, (_, i) => ({
            fullName: i === 0 ? values.fullName : `Guest ${i + 1}`,
            gender: 'male', // Default gender
            birthDate: new Date('1990-01-01') // Default birth date
          }))
        }],
        payment_method: values.paymentMethod,
        paymentType: values.paymentType,
        note: values.note || '',
        specialRequests: values.specialRequests || ''
      };

      const response = await axios.post('http://localhost:8080/api/hotel-booking', bookingData);
      
      if (response.data.success) {
        message.success('Đặt phòng thành công!');
        setBookingModalVisible(false);
        form.resetFields();
        
        // Handle payment redirection
        if (values.paymentMethod === 'bank_transfer' && response.data.vnpayUrl) {
          // Redirect to VNPay
          window.location.href = response.data.vnpayUrl;
        } else if (values.paymentMethod === 'bank_transfer') {
          // Navigate to checkout hotel page for VNPay payment options
          navigate(`/checkout-hotel/${response.data.bookingId}`);
        } else {
          // Navigate to hotel payment page
          navigate(`/payment/hotel-booking/${response.data.bookingId}`);
        }
        // Note: Cash payment is now handled separately in handleCashPayment function
        
        checkAvailability();
      } else {
        message.error(response.data.message || 'Đặt phòng thất bại');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDepositConfirm = () => {
    if (bookingLoading) return;
    
    setDepositModalVisible(false);
    
    // Lấy tất cả giá trị form hiện tại
    const formValues = form.getFieldsValue();
    
    // Cập nhật phương thức thanh toán thành VNPay
    formValues.paymentMethod = "bank_transfer";
    
    // Gọi API với phương thức thanh toán đã cập nhật
    processBooking(formValues);
  };

  const handleCashPayment = async () => {
    if (bookingLoading) return;
    
    setDepositModalVisible(false);
    setBookingLoading(true);
    
    try {
      // Lấy tất cả giá trị form hiện tại
      const formValues = form.getFieldsValue();
      
      // Đảm bảo phương thức thanh toán là tiền mặt
      formValues.paymentMethod = "cash";
      
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        message.error('Vui lòng đăng nhập để đặt phòng');
        setBookingLoading(false);
        return;
      }
      const bookingData = {
        userId: storedUserId,
        hotelId: hotel?._id,
        checkInDate,
        checkOutDate,
        fullNameUser: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        address: formValues.address || '',
        roomBookings: [{
          roomTypeIndex: hotel?.roomTypes.findIndex(rt => rt._id === selectedRoomType._id),
          numberOfRooms: formValues.numberOfRooms,
          guests: Array.from({ length: guests }, (_, i) => ({
            fullName: i === 0 ? formValues.fullName : `Guest ${i + 1}`,
            gender: 'Nam', // Default gender, can be customized later
            birthDate: new Date('1990-01-01') // Default birth date, can be customized later
          }))
        }],
        payment_method: formValues.paymentMethod,
        paymentType: formValues.paymentType,
        note: formValues.note || '',
        specialRequests: formValues.specialRequests || ''
      };

      const response = await axios.post('http://localhost:8080/api/hotel-booking', bookingData);
      
      if (response.data.success) {
        setBookingModalVisible(false);
        form.resetFields();
        
        // Tính toán deadline thanh toán (24 giờ)
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);
        const deadlineStr = deadline.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Hiển thị modal thông báo thành công
        Modal.success({
          title: "Đặt phòng thành công!",
          content: (
            <div>
              <p>Bạn đã chọn thanh toán tiền mặt tại văn phòng.</p>
              <p className="font-semibold mt-2">Thông tin thanh toán:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Mã đặt phòng: {response.data.bookingId}</li>
                <li>Số tiền cần thanh toán: {selectedRoomType ? Math.round(selectedRoomType.finalPrice * 0.5).toLocaleString() : '0'} ₫</li>
                <li className="text-red-600 font-semibold">Hạn thanh toán: {deadlineStr}</li>
                <li>Địa chỉ: Số 81A ngõ 295 - Phố Bằng Liệt - Phường Lĩnh Nam - Quận Hoàng Mai - Hà Nội</li>
                <li>Thời gian: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                <p className="text-red-600 font-semibold">⚠️ LƯU Ý QUAN TRỌNG:</p>
                <ul className="text-red-600 text-sm mt-1">
                  <li>• Bạn có 24 giờ để thanh toán đặt cọc kể từ thời điểm đặt phòng</li>
                  <li>• Đặt phòng sẽ tự động bị hủy nếu quá thời hạn thanh toán</li>
                  <li>• Vui lòng đến văn phòng trước thời hạn để hoàn tất thanh toán</li>
                </ul>
              </div>
            </div>
          ),
          onOk: () => {
            navigate(`/hotel-booking-confirmation/${response.data.bookingId}`);
          },
        });
        
        checkAvailability();
      } else {
        message.error(response.data.message || 'Đặt phòng thất bại');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt phòng');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Không tìm thấy khách sạn</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '80px auto 0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/hotels')}
          style={{ marginBottom: '16px' }}
        >
          Quay lại
        </Button>
        
        <Title level={2}>{hotel.hotelName}</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <Rate disabled defaultValue={hotel.starRating} />
          <Text><EnvironmentOutlined /> {hotel.location.locationName}, {hotel.location.country}</Text>
          <Text>({hotel.totalReviews} đánh giá)</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Hotel Info */}
        <Col xs={24} lg={16}>
          {/* Images */}
          {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
            <Card style={{ marginBottom: '24px' }}>
              <Carousel autoplay>
                {hotel.hotelImages.map((image, index) => (
                  <div key={index}>
                    <Image
                      src={image}
                      alt={`${hotel.hotelName} - ${index + 1}`}
                      style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>
          ) : (
            <Card style={{ marginBottom: '24px' }}>
              <div style={{
                width: '100%',
                height: '400px',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏨</div>
                <Text>Không có hình ảnh khách sạn</Text>
              </div>
            </Card>
          )}

          {/* Hotel Description */}
          <Card title="Mô tả khách sạn" style={{ marginBottom: '24px' }}>
            <Paragraph>{hotel.description}</Paragraph>
          </Card>

          {/* Amenities */}
          {hotel.hotelAmenities && hotel.hotelAmenities.length > 0 && (
            <Card title="Tiện ích" style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                {hotel.hotelAmenities.map((amenity, index) => (
                  <Col key={index} xs={12} sm={8} md={6}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <span>{typeof amenity === 'string' ? amenity : (typeof amenity.name === 'string' ? amenity.name : (amenity.name?.name || amenity || 'Tiện ích'))}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Policies */}
          <Card title="Chính sách khách sạn" style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Giờ nhận phòng:</Text> {hotel.policies.checkIn}
              </Col>
              <Col span={12}>
                <Text strong>Giờ trả phòng:</Text> {hotel.policies.checkOut}
              </Col>
              <Col span={24}>
                <Text strong>Chính sách thú cưng:</Text> {hotel.policies.petPolicy === 'true' || hotel.policies.petPolicy === true ? 'Được phép' : 'Không được phép'}
              </Col>
              <Col span={24}>
                <Text strong>Chính sách hút thuốc:</Text> {hotel.policies.smokingPolicy === 'true' || hotel.policies.smokingPolicy === true ? 'Được phép' : 'Không được phép'}
              </Col>
            </Row>
          </Card>

          {/* Contact Info */}
          <Card title="Thông tin liên hệ">
            <Space direction="vertical">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                <Text>{hotel.contactInfo.phone}</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text>{hotel.contactInfo.email}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column - Booking */}
        <Col xs={24} lg={8}>
          <Card title="Đặt phòng" style={{ position: 'sticky', top: '24px' }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Chọn ngày:</Text>
              <RangePicker
                style={{ width: '100%', marginTop: 8 }}
                value={datePickerValue}
                onChange={handleDateChange}
                disabledDate={(current) => current && current < moment().startOf('day')}
                placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
                format="DD/MM/YYYY"
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Số khách:</Text>
              <InputNumber
                min={1}
                max={10}
                value={guests}
                onChange={(value) => setGuests(value || 1)}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Loại phòng có sẵn:</Text>
              {checkingAvailability && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin spinning={true} tip="Đang kiểm tra phòng trống...">
                    <div style={{ minHeight: '50px' }}></div>
                  </Spin>
                </div>
              )}
            </div>
            
            {!checkInDate || !checkOutDate ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <Text>Vui lòng chọn ngày nhận và trả phòng để xem phòng trống</Text>
              </div>
            ) : !checkingAvailability && availability.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#fff2e8', borderRadius: '8px' }}>
                <Text>Không có phòng trống trong thời gian này</Text>
              </div>
            ) : null}
            
            {!checkingAvailability && availability.map((room, index) => {
              const roomType = room.roomType;
              if (!roomType) return null;
              
              return (
                <Card key={index} size="small" style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>{roomType.typeName || 'Không có tên'}</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Sức chứa: {roomType.maxOccupancy || 0} khách
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    {roomType.amenities && roomType.amenities.slice(0, 3).map((amenity: string, i: number) => (
                      <Tag key={i} size="small">{typeof amenity === 'string' ? amenity : (typeof amenity.name === 'string' ? amenity.name : (amenity.name?.name || amenity || 'Tiện ích'))}</Tag>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1890ff' }}>
                        {roomType.finalPrice ? roomType.finalPrice.toLocaleString('vi-VN') : '0'} VNĐ
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>/ đêm</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Còn {room.availableRooms} phòng
                      </div>
                    </div>
                    
                    <Button
                      type="primary"
                      size="small"
                      disabled={room.availableRooms === 0}
                      onClick={() => handleBookRoom(roomType, room.availableRooms, roomType.finalPrice || 0)}
                    >
                      Đặt phòng
                    </Button>
                  </div>
                </Card>
              );
            })}
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal
        title="Đặt phòng khách sạn"
        open={bookingModalVisible}
        onCancel={() => {
          setBookingModalVisible(false);
          setSelectedRoomType(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRoomType && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleBookingSubmit}
          >
            <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Title level={4}>Thông tin đặt phòng</Title>
              <p><strong>Khách sạn:</strong> {hotel.hotelName}</p>
              <p><strong>Loại phòng:</strong> {selectedRoomType?.typeName || 'Không có tên'}</p>
              <p><strong>Ngày nhận phòng:</strong> {moment(checkInDate).format('DD/MM/YYYY')}</p>
              <p><strong>Ngày trả phòng:</strong> {moment(checkOutDate).format('DD/MM/YYYY')}</p>
              <p><strong>Số đêm:</strong> {moment(checkOutDate).diff(moment(checkInDate), 'days')} đêm</p>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Số lượng phòng"
                  name="numberOfRooms"
                  rules={[{ required: true, message: 'Vui lòng chọn số lượng phòng!' }]}
                  initialValue={1}
                >
                  <InputNumber
                    min={1}
                    max={selectedRoomType.availableRooms}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phương thức thanh toán"
                  name="paymentMethod"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                >
                  <Select placeholder="Chọn phương thức thanh toán">
                    <Option value="cash">Tiền mặt</Option>
                    <Option value="bank_transfer">Chuyển khoản</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Loại thanh toán"
                  name="paymentType"
                  rules={[{ required: true, message: 'Vui lòng chọn loại thanh toán!' }]}
                  initialValue="deposit"
                >
                  <Select placeholder="Chọn loại thanh toán">
                    <Option value="deposit">Đặt cọc (50%)</Option>
                    <Option value="full">Thanh toán toàn bộ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Guest Information Section */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16, color: '#1890ff' }}>
                Thông tin khách lưu trú
              </Title>
              
              {/* Guest 1 (Main Guest) */}
              <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f8ff' }}>
                <Title level={5} style={{ marginBottom: 12, color: '#1890ff' }}>
                  Khách 1 (Người đặt)
                </Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Họ và tên"
                      name={['guests', 0, 'fullName']}
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên khách 1!' }]}
                      initialValue={form.getFieldValue('fullName')}
                    >
                      <Input placeholder="Nhập họ và tên khách 1" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Giới tính"
                      name={['guests', 0, 'gender']}
                      rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    >
                      <Select placeholder="Chọn giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Ngày sinh"
                      name={['guests', 0, 'birthDate']}
                      rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        placeholder="Chọn ngày sinh"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Guest 2 (if guests > 1) */}
              {guests > 1 && (
                <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
                  <Title level={5} style={{ marginBottom: 12, color: '#52c41a' }}>
                    Khách 2
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Họ và tên"
                        name={['guests', 1, 'fullName']}
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên khách 2!' }]}
                      >
                        <Input placeholder="Nhập họ và tên khách 2" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Giới tính"
                        name={['guests', 1, 'gender']}
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                      >
                        <Select placeholder="Chọn giới tính">
                          <Option value="male">Nam</Option>
                          <Option value="female">Nữ</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Ngày sinh"
                        name={['guests', 1, 'birthDate']}
                        rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          placeholder="Chọn ngày sinh"
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Additional Guests (if guests > 2) */}
              {guests > 2 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5} style={{ marginBottom: 12, color: '#fa8c16' }}>
                    Khách bổ sung (Khách 3 - {guests})
                  </Title>
                  {Array.from({ length: guests - 2 }, (_, index) => (
                    <Card key={index} size="small" style={{ marginBottom: 12, backgroundColor: '#fff7e6' }}>
                      <Title level={5} style={{ marginBottom: 12, color: '#fa8c16' }}>
                        Khách {index + 3}
                      </Title>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Họ và tên"
                            name={['guests', index + 2, 'fullName']}
                            rules={[{ required: true, message: `Vui lòng nhập họ và tên khách ${index + 3}!` }]}
                          >
                            <Input placeholder={`Nhập họ và tên khách ${index + 3}`} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            label="Giới tính"
                            name={['guests', index + 2, 'gender']}
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                          >
                            <Select placeholder="Chọn giới tính">
                              <Option value="male">Nam</Option>
                              <Option value="female">Nữ</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            label="Ngày sinh"
                            name={['guests', index + 2, 'birthDate']}
                            rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                          >
                            <DatePicker 
                              style={{ width: '100%' }} 
                              placeholder="Chọn ngày sinh"
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Form.Item
              label="Yêu cầu đặc biệt"
              name="specialRequests"
            >
              <Input.TextArea rows={3} placeholder="Nhập yêu cầu đặc biệt (tùy chọn)" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={bookingLoading}>
                  Xác nhận đặt phòng
                </Button>
                <Button onClick={() => {
                  setBookingModalVisible(false);
                  setSelectedRoomType(null);
                  form.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal thông báo khi chọn thanh toán cọc nhưng không chọn VNPay */}
      <Modal
        title={<div className="text-xl font-bold text-blue-700">Lựa chọn phương thức đặt cọc</div>}
        open={depositModalVisible}
        onCancel={bookingLoading ? undefined : () => setDepositModalVisible(false)}
        closable={!bookingLoading}
        maskClosable={!bookingLoading}
        footer={null}
        width={600}
        centered
      >
        <div className="py-4">
          <div className="flex items-center mb-4 text-yellow-500">
            <span className="text-3xl mr-3">ℹ️</span>
            <span className="text-lg font-semibold">Lựa chọn phương thức thanh toán đặt cọc</span>
          </div>
          
          <p className="mb-4 text-gray-700">
            Bạn có thể chọn một trong các phương thức thanh toán đặt cọc sau:
          </p>
          
          <div className="space-y-4">
            {/* Tùy chọn thanh toán VNPay */}
            <div 
              className={`bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 ${!bookingLoading ? 'hover:bg-blue-100' : 'opacity-50'}`}
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">💳</span>
                <h3 className="font-semibold text-blue-700">Thanh toán qua VNPay (Khuyến nghị)</h3>
              </div>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Số tiền cần thanh toán: <span className="font-semibold text-red-600">{selectedRoomType ? Math.round(selectedRoomType.finalPrice * 0.5).toLocaleString() : '0'} ₫</span></li>
                <li>Thanh toán ngay trực tuyến qua thẻ</li>
                <li>Xác nhận đặt phòng ngay lập tức</li>
                <li>Đảm bảo giữ chỗ cho phòng</li>
              </ul>
              <div className="mt-3 text-right">
                <Button 
                  type="primary" 
                  onClick={handleDepositConfirm}
                  className="bg-blue-600"
                  loading={bookingLoading}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Đang xử lý..." : "Tiếp tục với VNPay"}
                </Button>
              </div>
            </div>
            
            {/* Tùy chọn thanh toán tiền mặt */}
            <div 
              className={`bg-green-50 p-4 rounded-lg border border-green-200 ${!bookingLoading ? 'hover:bg-green-100' : 'opacity-50'}`}
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">💵</span>
                <h3 className="font-semibold text-green-700">Thanh toán tiền mặt tại văn phòng</h3>
              </div>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Số tiền cần đặt cọc: <span className="font-semibold text-red-600">{selectedRoomType ? Math.round(selectedRoomType.finalPrice * 0.5).toLocaleString() : '0'} ₫</span></li>
                <li>Địa chỉ: Số 81A ngõ 295 - Phố Bằng Liệt - Phường Lĩnh Nam - Quận Hoàng Mai - Hà Nội</li>
                <li>Thời gian: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7</li>
                <li><span className="text-red-500 font-medium">Lưu ý:</span> Đặt phòng chỉ được xác nhận sau khi đã thanh toán đặt cọc trong vòng 24 giờ</li>
              </ul>
              <div className="mt-3 text-right">
                <Button 
                  type="default" 
                  onClick={handleCashPayment}
                  className="bg-green-600 text-white hover:bg-green-700"
                  loading={bookingLoading}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Đang xử lý..." : "Thanh toán tiền mặt"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              onClick={() => setDepositModalVisible(false)}
              disabled={bookingLoading}
            >
              Quay lại chỉnh sửa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HotelDetail;
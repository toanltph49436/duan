import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Rate,
  Tag,
  Image,
  Divider,
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
  UserOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

// Import our new components
import { EnhancedDatePicker } from '../../components/DateSelection/EnhancedDatePicker';
import { AvailabilityChecker } from '../../components/DateSelection/AvailabilityChecker';
import { CashDepositModal } from '../../components/Payment/CashDepositModal';
import Login from '../../components/Login';

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
    floorNumber?: number;
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

const HotelDetailRefactored: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Date and guest states - simplified with our new hook
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [availability, setAvailability] = useState<any>(null);

  // Get initial values from URL params
  const initialCheckIn = searchParams.get('checkIn') || moment().add(1, 'day').format('YYYY-MM-DD');
  const initialCheckOut = searchParams.get('checkOut') || moment().add(2, 'days').format('YYYY-MM-DD');
  const initialGuests = Number(searchParams.get('guests')) || 2;

  useEffect(() => {
    if (id) {
      fetchHotelDetail();
    }
  }, [id]);

  useEffect(() => {
    setCheckInDate(initialCheckIn);
    setCheckOutDate(initialCheckOut);
    setGuests(initialGuests);
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  const fetchHotelDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hotels/${id}`);
      if (response.data.success) {
        setHotel(response.data.data);
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

  // Handle date changes from our enhanced date picker
  const handleDateChange = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  // Handle availability changes
  const handleAvailabilityChange = (availabilityData: any) => {
    setAvailability(availabilityData);
  };

  // Handle room selection
  const handleRoomSelect = (roomType: RoomAvailability, price: number) => {
    // Kiểm tra đăng nhập trước khi cho phép chọn phòng
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.error("Vui lòng đăng nhập để đặt phòng!");
      setShowLoginModal(true);
      return;
    }

    // Save booking data to localStorage
    const bookingData = {
      roomId: roomType.roomTypeIndex.toString(),
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: guests,
      children: 0, // Default to 0 for now
      hotelId: hotel?._id,
      roomType: hotel?.roomTypes[roomType.roomTypeIndex]?.typeName,
      price: price
    };
    
    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    
    // Navigate to guest info page
    navigate(`/hotel-guest-info/${hotel?._id}`);
  };

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [cashDepositModalVisible, setCashDepositModalVisible] = useState(false);

  // Calculate number of nights
  const calculateNumberOfNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return moment(checkOutDate).diff(moment(checkInDate), 'days');
  };

  // Calculate total price for the booking
  const calculateTotalPrice = () => {
    if (!selectedRoomType) return 0;
    const nights = calculateNumberOfNights();
    return selectedRoomType.price * nights;
  };

  // Calculate deposit amount (50% of total price)
  const calculateDepositAmount = () => {
    const totalPrice = calculateTotalPrice();
    return Math.floor(totalPrice * 0.5);
  };

  const handleBookingSubmit = async (values: any) => {
    // Kiểm tra nếu là thanh toán cọc và phương thức thanh toán là cash
    if (values.paymentType === 'deposit' && values.paymentMethod === 'cash') {
      // Hiển thị modal thông báo chi tiết cho thanh toán cọc tiền mặt
      setCashDepositModalVisible(true);
      return;
    }

    // Kiểm tra nếu là thanh toán cọc và phương thức thanh toán không phải là bank_transfer
    if (values.paymentType === 'deposit' && values.paymentMethod !== 'bank_transfer') {
      // Hiển thị modal thông báo cũ
      setDepositModalVisible(true);
      return;
    }

    // Thực hiện đặt phòng
    await processBooking(values);
  };

  const processBooking = async (values: any) => {
    if (!checkInDate || !checkOutDate) {
      message.error('Vui lòng chọn ngày nhận phòng và trả phòng');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        userId: (() => {
          const uid = localStorage.getItem('userId');
          if (!uid) {
            message.error('Vui lòng đăng nhập để đặt phòng');
            throw new Error('Missing userId');
          }
          return uid;
        })(),
        hotelId: hotel?._id,
        checkInDate,
        checkOutDate,
        fullNameUser: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address || '',
        roomBookings: [{
          roomTypeIndex: hotel?.roomTypes.findIndex(rt => rt._id === selectedRoomType.roomType._id),
          numberOfRooms: values.numberOfRooms,
          guests: Array.from({ length: guests }, (_, i) => ({
            fullName: i === 0 ? values.fullName : `Guest ${i + 1}`,
            gender: 'Nam', // Default gender, can be customized later
            birthDate: new Date('1990-01-01') // Default birth date, can be customized later
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
      
      // Cập nhật phương thức thanh toán thành tiền mặt
      formValues.paymentMethod = "cash";
      
      // Gọi API với phương thức thanh toán đã cập nhật
      await processBooking(formValues);
      
    } catch (error) {
      console.error("Lỗi xử lý thanh toán tiền mặt:", error);
      message.error("Có lỗi xảy ra khi xử lý thanh toán tiền mặt");
    } finally {
      setBookingLoading(false);
    }
  };

  // Handlers for new cash deposit modal
  const handleCashDepositConfirm = async () => {
    if (bookingLoading) return;
    
    setCashDepositModalVisible(false);
    setBookingLoading(true);
    
    try {
      // Lấy tất cả giá trị form hiện tại
      const formValues = form.getFieldsValue();
      
      // Đảm bảo là thanh toán cọc bằng tiền mặt
      formValues.paymentMethod = "cash";
      formValues.paymentType = "deposit";
      
      // Gọi API với phương thức thanh toán đã cập nhật
      const response = await processBooking(formValues);
      
      // Sau khi booking thành công, có thể lấy bookingId từ response để hiển thị
      console.log('Booking response:', response);
      
    } catch (error) {
      console.error("Lỗi xử lý thanh toán cọc tiền mặt:", error);
      message.error("Có lỗi xảy ra khi xử lý thanh toán cọc tiền mặt");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCashDepositChooseVNPay = () => {
    setCashDepositModalVisible(false);
    
    // Cập nhật form để chọn VNPay
    form.setFieldsValue({
      paymentMethod: 'bank_transfer'
    });
    
    // Thực hiện đặt phòng với VNPay
    const formValues = form.getFieldsValue();
    processBooking(formValues);
  };

  // Handle login modal
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Sau khi đăng nhập thành công, có thể thực hiện thêm logic nếu cần
    message.success("Đăng nhập thành công! Bây giờ bạn có thể đặt phòng.");
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
        <Text>Không tìm thấy thông tin khách sạn</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0px auto 0 auto' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
            <Card style={{ marginBottom: '24px', padding: 0 }}>
              <Carousel autoplay>
                {hotel.hotelImages.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      width: '100%',
                      height: '500px', // chiều cao cố định cho slide
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${hotel.hotelName} - ${index + 1}`}
                      preview={true}
                      style={{
                        width: '900px',
                        height: '500px',
                        objectFit: 'cover', // ảnh cover toàn slide, giữ tỉ lệ
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            </Card>
          ) : (
            <Card style={{ marginBottom: '24px' }}>
              <div
                style={{
                  width: '100%',
                  height: '500px', // bằng với slide carousel
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
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
          <div style={{ position: 'sticky', top: '24px' }}>
            {/* Enhanced Date Picker */}
            <div style={{ marginBottom: '20px' }}>
              <EnhancedDatePicker
                initialCheckIn={initialCheckIn}
                initialCheckOut={initialCheckOut}
                onDateChange={handleDateChange}
                showQuickSelections={true}
                showPriceHints={true}
                minStay={1}
                maxStay={30}
              />
            </div>

            {/* Guest Selection */}
            <Card size="small" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <Text strong>Số khách:</Text>
                <InputNumber
                  min={1}
                  max={10}
                  value={guests}
                  onChange={(value) => setGuests(value || 1)}
                  style={{ flex: 1 }}
                />
              </div>
            </Card>

            {/* Availability Checker */}
            {hotel._id && (
              <AvailabilityChecker
                hotelId={hotel._id}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={guests}
                onAvailabilityChange={handleAvailabilityChange}
                onRoomSelect={handleRoomSelect}
              />
            )}
          </div>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal
        title="Thông tin đặt phòng"
        open={bookingModalVisible}
        onCancel={() => setBookingModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRoomType && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleBookingSubmit}
          >
            {/* Room Info Display */}
            <Card size="small" style={{ marginBottom: 20, backgroundColor: '#f9f9f9' }}>
              <Title level={5}>{selectedRoomType.roomType.typeName}</Title>
              <Text>Giá: {new Intl.NumberFormat('vi-VN').format(selectedRoomType.price)} VNĐ/đêm</Text>
              <br />
              <Text>Còn lại: {selectedRoomType.availableRooms} phòng</Text>
            </Card>

            <Form.Item
              name="numberOfRooms"
              label="Số phòng"
              rules={[{ required: true, message: 'Vui lòng chọn số phòng' }]}
              initialValue={1}
            >
              <Select>
                {Array.from({ length: Math.min(selectedRoomType.availableRooms, 5) }, (_, i) => (
                  <Option key={i + 1} value={i + 1}>
                    {i + 1} phòng
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="Loại thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn loại thanh toán' }]}
              initialValue="full"
            >
              <Select>
                <Option value="full">Thanh toán toàn bộ</Option>
                <Option value="deposit">Đặt cọc (50%)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              initialValue="bank_transfer"
            >
              <Select>
                <Option value="bank_transfer">VNPay</Option>
                <Option value="cash">Tiền mặt</Option>
              </Select>
            </Form.Item>

            <Form.Item name="specialRequests" label="Yêu cầu đặc biệt">
              <Input.TextArea placeholder="Nhập yêu cầu đặc biệt (nếu có)" rows={3} />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea placeholder="Ghi chú thêm" rows={2} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={bookingLoading} block>
                Đặt phòng ngay
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Deposit Modal */}
      <Modal
        title="Thông báo thanh toán cọc"
        open={depositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text>
            Để thanh toán cọc, bạn cần sử dụng VNPay hoặc tiền mặt.
            <br />
            Vui lòng chọn phương thức thanh toán:
          </Text>
          
          <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button 
              type="primary" 
              onClick={handleDepositConfirm}
              loading={bookingLoading}
            >
              VNPay
            </Button>
            <Button 
              onClick={handleCashPayment}
              loading={bookingLoading}
            >
              Tiền mặt
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Cash Deposit Modal */}
      <CashDepositModal
        visible={cashDepositModalVisible}
        onCancel={() => setCashDepositModalVisible(false)}
        onConfirmCash={handleCashDepositConfirm}
        onChooseVNPay={handleCashDepositChooseVNPay}
        loading={bookingLoading}
        depositAmount={calculateDepositAmount()}
        hotelName={hotel?.hotelName}
        totalAmount={calculateTotalPrice()}
        numberOfNights={calculateNumberOfNights()}
        pricePerNight={selectedRoomType?.price}
        bookingId={`HOTEL-${Date.now()}`} // Temporary ID, sẽ được thay thế bằng real ID từ API
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        customerName={form.getFieldValue('fullName') || 'Khách hàng'}
        customerPhone={form.getFieldValue('phone') || ''}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <Login 
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          openRegister={() => {
            // Có thể thêm logic để mở modal đăng ký nếu cần
            setShowLoginModal(false);
          }}
        />
      )}
    </div>
  );
};

export default HotelDetailRefactored;

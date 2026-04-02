/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import type { AxiosError } from "axios";
import { Form, Input, message, DatePicker, Select, Card, Button, Typography, Row, Col, Divider } from "antd";
import { UserOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { CashDepositModal } from '../../components/Payment/CashDepositModal';
import BookingSuccessModal from '../../components/Modal/BookingSuccessModal';

const { Option } = Select;
const { Title, Text } = Typography;

// Định nghĩa kiểu dữ liệu cho BookingData
interface BookingData {
  roomId: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  hotelId?: string;
  roomType?: string;
  price?: number;
}

const HotelGuestInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cashDepositModalVisible, setCashDepositModalVisible] = useState(false);
  const [bookingSuccessModalVisible, setBookingSuccessModalVisible] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);
  const [successBookingData, setSuccessBookingData] = useState<any>(null);

  // Hàm tính tuổi
  const calculateAge = (birthDate: any) => {
    return dayjs().diff(dayjs(birthDate), "year");
  };

  // Rule validate ngày sinh
  const birthDateRule = (index: number, adults: number) => ({
    validator(_: any, value: any) {
      if (!value) return Promise.resolve();

      const age = calculateAge(value);

      // Nếu chỉ có 1 khách -> khách 1 phải >= 18 tuổi
      if (adults === 1 && index === 0 && age < 18) {
        return Promise.reject(new Error("Khách đi 1 mình phải từ 18 tuổi trở lên!"));
      }

      // Nếu có >= 2 khách -> mọi khách đều phải >= 16 tuổi
      if (adults > 1 && age < 16) {
        return Promise.reject(new Error(`Khách ${index + 1} phải từ 16 tuổi trở lên!`));
      }

      return Promise.resolve();
    },
  });


  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      message.error("Không tìm thấy thông tin đặt phòng. Vui lòng chọn phòng lại.");
      navigate("/hotels");
    }
  }, [navigate]);

  const { mutate } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await fetch('http://localhost:8080/api/hotel-booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        return await response.json();
      } catch (error) {
        throw new Error('Đã có lỗi xảy ra khi đặt phòng');
      }
    },

    onSuccess: async (data) => {

      const bookingId = data?.bookingId || data?.newBooking?._id;
      const paymentMethod = data?.newBooking?.payment_method;
      const paymentType = data?.newBooking?.paymentType;

      console.log("Booking ID:", bookingId);
      console.log("Payment method:", paymentMethod);
      console.log("Payment type:", paymentType);
      console.log("Data:", data);

      if (paymentMethod === "bank_transfer") {
        if (data?.vnpayUrl) {
          window.location.href = data.vnpayUrl; 
        } else {
          message.error("Không tìm thấy link thanh toán VNPay");
        }
      } else if (paymentMethod === "cash") {
        // Xử lý thanh toán tiền mặt - hiển thị modal thông báo
        const bookingInfo = {
          bookingId: data?.data?._id || 'N/A',
          totalAmount: calculateTotalPrice(),
          paymentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 giờ từ bây giờ
          hotelName: bookingData?.roomType || 'Khách sạn',
          customerName: pendingFormValues?.userName || 'N/A',
          address: 'Số 25 - Ngõ 38 Phố Yên Lãng – Quận Đống Đa – Hà Nội',
          schedule: '9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7',
          roomType: bookingData?.roomType || 'N/A',
          checkInDate: bookingData?.check_in_date,
          checkOutDate: bookingData?.check_out_date,
          numberOfNights: numberOfNights,
          adults: bookingData?.adults || 1,
          children: bookingData?.children || 0
        };

        setSuccessBookingData(bookingInfo);
        setBookingSuccessModalVisible(true);
      } else {
        // Fallback
        message.success("Đặt phòng thành công!");
        navigate("/booking-success");
      }
    },

    onError: (error: any) => {
      message.error(error.message || "Có lỗi xảy ra khi đặt phòng");
    }
  });

  const onFinish = (values: any) => {
    if (!bookingData?.roomId) {
      message.error("Vui lòng chọn phòng trước khi đặt.");
      return;
    }

    // Kiểm tra nếu chọn thanh toán tiền mặt, hiển thị modal thông báo
    if (values.payment_method === 'cash') {
      setPendingFormValues(values);
      setCashDepositModalVisible(true);
      return;
    }

    // Xử lý đặt phòng bình thường cho VNPay
    processBooking(values);
  };

  const processBooking = (values: any) => {
    setLoading(true);

    const payload = {
      userId: localStorage.getItem("userId"),
      hotelId: bookingData?.hotelId,
      checkInDate: bookingData?.check_in_date,
      checkOutDate: bookingData?.check_out_date,
      fullNameUser: values.userName,
      email: values.emailName,
      phone: values.phoneName,
      address: values.address,
      roomBookings: [{
        roomTypeIndex: parseInt(bookingData?.roomId || '0'),
        numberOfRooms: 1,
        guests: values.guests ? values.guests.map((guest: any) => ({
          fullName: guest.fullName,
          gender: guest.gender,
          birthDate: guest.birthDate ? dayjs(guest.birthDate).format('YYYY-MM-DD') : new Date('1990-01-01')
        })) : [],
        specialRequests: values.specialRequests || ''
      }],
      payment_method: values.payment_method,
      paymentType: values.paymentType,
      note: values.note || '',
      specialRequests: values.specialRequests || ''
    };

    console.log("Payload gửi đi:", payload);
    mutate(payload);
  };

  const checkInDate = bookingData?.check_in_date ? new Date(bookingData.check_in_date) : null;
  const checkOutDate = bookingData?.check_out_date ? new Date(bookingData.check_out_date) : null;

  let numberOfNights = 0;
  if (checkInDate && checkOutDate) {
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  const formattedCheckIn = dayjs(bookingData?.check_in_date ?? "")
    .add(7, 'hour')
    .format("DD/MM/YYYY [lúc] HH:mm");
  const formattedCheckOut = dayjs(bookingData?.check_out_date ?? "")
    .add(7, 'hour')
    .format("DD/MM/YYYY [lúc] HH:mm");

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-6xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Title level={2} className="text-gray-800">
            Thông tin khách lưu trú
          </Title>
          <Text className="text-lg text-gray-600">
            Vui lòng điền đầy đủ thông tin cho tất cả khách lưu trú
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-2 font-medium text-green-600">Chọn phòng</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                2
              </div>
              <span className="ml-2 font-medium text-blue-600">Thông tin khách</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-300 rounded-full">
                3
              </div>
              <span className="ml-2 text-gray-400">Hoàn tất</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Guest Information Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <Form onFinish={onFinish} form={form} layout="vertical" size="large">
                {/* Contact Information */}
                <div className="mb-8">
                  <Title level={4} className="flex items-center mb-4">
                    <UserOutlined className="mr-2 text-blue-500" />
                    Thông tin liên hệ
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="userName"
                        rules={[
                          { required: true, message: "Vui lòng nhập họ và tên" },
                          { min: 3, message: "Họ và tên phải có ít nhất 3 ký tự" },
                          { max: 30, message: "Họ và tên không được vượt quá 30 ký tự" },
                          {
                            pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                            message: "Họ và tên chỉ được chứa chữ cái và khoảng trắng"
                          }
                        ]}
                      >
                        <Input placeholder="Nhập họ và tên" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phoneName"
                        rules={[
                          { required: true, message: "Vui lòng nhập số điện thoại" },
                          { pattern: /^0\d{9}$/, message: "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số" }
                        ]}
                      >
                        <Input placeholder="Nhập số điện thoại" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Email"
                        name="emailName"
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: 'email', message: "Email không hợp lệ" }
                        ]}
                      >
                        <Input placeholder="Nhập email" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Địa chỉ"
                        name="address"
                      >
                        <Input placeholder="Nhập địa chỉ (tùy chọn)" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Guest Information */}
                <div className="mb-8">
                  <Title level={4} className="flex items-center mb-6">
                    <UserOutlined className="mr-2 text-green-500" />
                    Thông tin khách lưu trú ({bookingData?.adults} người)
                  </Title>

                  {/* Guest 1 (Main Guest) */}
                  <Card size="small" className="mb-4 border-blue-200 bg-blue-50">
                    <Title level={5} className="flex items-center mb-4 text-blue-800">
                      <UserOutlined className="mr-2" />
                      Khách 1 (Người đặt)
                    </Title>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Họ và tên"
                          name={['guests', 0, 'fullName']}
                          rules={[{ required: true, message: 'Vui lòng nhập họ và tên khách 1!' }]}
                        >
                          <Input placeholder="Nhập họ và tên khách 1" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
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
                      <Col span={8}>
                        <Form.Item
                          label="Ngày sinh"
                          name={['guests', 0, 'birthDate']}
                          rules={[
                            { required: true, message: 'Vui lòng nhập ngày sinh!' },
                            birthDateRule(0, bookingData?.adults || 1),
                          ]}
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

                  {/* Guest 2 (if adults > 1) */}
                  {bookingData?.adults && bookingData.adults > 1 && (
                    <Card size="small" className="mb-4 border-green-200 bg-green-50">
                      <Title level={5} className="flex items-center mb-4 text-green-800">
                        <UserOutlined className="mr-2" />
                        Khách 2
                      </Title>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            label="Họ và tên"
                            name={['guests', 1, 'fullName']}
                            rules={[
                              { required: true, message: 'Vui lòng nhập họ và tên khách 2!' },
                              { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
                              { max: 30, message: 'Họ và tên không được vượt quá 30 ký tự' },
                              {
                                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
                              }
                            ]}
                          >
                            <Input placeholder="Nhập họ và tên khách 2" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
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
                        <Col span={8}>
                          <Form.Item
                            label="Ngày sinh"
                            name={['guests', 1, 'birthDate']}
                            rules={[
                              { required: true, message: 'Vui lòng nhập ngày sinh!' },
                              birthDateRule(1, bookingData?.adults || 1),
                            ]}
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


                  {/* Additional Guests (if adults > 2) */}
                  {bookingData?.adults && bookingData.adults > 2 && (
                    <div className="mb-4">
                      {Array.from({ length: bookingData.adults - 2 }, (_, index) => (
                        <Card key={index} size="small" className="mb-4 border-orange-200 bg-orange-50">
                          <Title level={5} className="mb-4 text-orange-800">
                            Khách {index + 3}
                          </Title>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                label="Họ và tên"
                                name={['guests', index + 2, 'fullName']}
                                rules={[{ required: true, message: `Vui lòng nhập họ và tên khách ${index + 3}!` }]}
                              >
                                <Input placeholder={`Nhập họ và tên khách ${index + 3}`} />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
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
                            <Col span={8}>
                              <Form.Item
                                label="Ngày sinh"
                                name={['guests', index + 2, 'birthDate']}
                                rules={[
                                  { required: true, message: `Vui lòng nhập ngày sinh khách ${index + 3}!` },
                                  birthDateRule(index + 2, bookingData?.adults || 1),
                                ]}
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

                <Divider />

                {/* Payment Information */}
                <div className="mb-8">
                  <Title level={4} className="flex items-center mb-4">
                    <PhoneOutlined className="mr-2 text-purple-500" />
                    Thông tin thanh toán
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Loại thanh toán"
                        name="paymentType"
                        rules={[{ required: true, message: "Vui lòng chọn loại thanh toán" }]}
                        initialValue="full"
                      >
                        <Select placeholder="Chọn loại thanh toán">
                          <Option value="full">Thanh toán toàn bộ</Option>
                          <Option value="deposit">Thanh toán cọc (50%)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Phương thức thanh toán"
                        name="payment_method"
                        rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
                        initialValue="bank_transfer"
                      >
                        <Select placeholder="Chọn phương thức thanh toán">
                          <Option value="bank_transfer">VNPay</Option>
                          <Option value="cash">Tiền mặt</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Special Requests & Notes */}
                <div className="mb-8">
                  <Title level={4} className="flex items-center mb-4">
                    <PhoneOutlined className="mr-2 text-orange-500" />
                    Yêu cầu đặc biệt & Ghi chú
                  </Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Yêu cầu đặc biệt"
                        name="specialRequests"
                      >
                        <Input.TextArea
                          placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                          rows={3}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Ghi chú"
                        name="note"
                      >
                        <Input.TextArea
                          placeholder="Ghi chú thêm"
                          rows={3}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider />

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="h-auto px-12 py-3 text-lg font-semibold"
                  >
                    Hoàn tất đặt phòng
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <Card title="Tóm tắt đặt phòng" className="sticky shadow-lg top-4">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <CalendarOutlined className="mr-2" />
                  <div>
                    <div className="font-medium">Ngày nhận phòng</div>
                    <div>{formattedCheckIn}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <CalendarOutlined className="mr-2" />
                  <div>
                    <div className="font-medium">Ngày trả phòng</div>
                    <div>{formattedCheckOut}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <UserOutlined className="mr-2" />
                  <div>
                    <div className="font-medium">Số khách</div>
                    <div>{bookingData?.adults} người</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <HomeOutlined className="mr-2" />
                  <div>
                    <div className="font-medium">Thời gian lưu trú</div>
                    <div>{numberOfNights} đêm</div>
                  </div>
                </div>

                <Divider />

                {/* Payment Summary */}
                <div className="p-4 mb-4 rounded-lg bg-gray-50">
                  <div className="mb-2 text-sm font-medium text-gray-700">Tóm tắt thanh toán:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Giá phòng/đêm:</span>
                      <span className="font-medium">
                        {bookingData?.price ? new Intl.NumberFormat('vi-VN').format(bookingData.price) : '0'} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số đêm:</span>
                      <span className="font-medium">{numberOfNights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng tiền:</span>
                      <span className="text-lg font-medium text-blue-600">
                        {bookingData?.price ? new Intl.NumberFormat('vi-VN').format(bookingData.price * numberOfNights) : '0'} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Phí cọc (50%):</span>
                      <span>
                        {bookingData?.price ? new Intl.NumberFormat('vi-VN').format(Math.floor(bookingData.price * numberOfNights * 0.5)) : '0'} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="mb-2 text-sm text-blue-600">Thông tin quan trọng:</div>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>• Vui lòng điền đầy đủ thông tin cho tất cả khách</li>
                    <li>• Thông tin sẽ được sử dụng để check-in</li>
                    <li>• Có thể hủy miễn phí trước 24h</li>
                    <li>• Thanh toán cọc: 50% tổng tiền</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cash Deposit Modal */}
      <CashDepositModal
        visible={cashDepositModalVisible}
        onCancel={() => setCashDepositModalVisible(false)}
        onConfirmCash={handleCashDepositConfirm}
        onChooseVNPay={handleCashDepositChooseVNPay}
        loading={loading}
        depositAmount={calculateDepositAmount()}
        hotelName={bookingData?.roomType || 'Khách sạn'}
        totalAmount={calculateTotalPrice()}
        numberOfNights={numberOfNights}
        bookingId={successBookingData?.bookingCode || successBookingData?._id || `HOTEL-${Date.now()}`}
        pricePerNight={bookingData?.price || 0}
        checkInDate={bookingData?.check_in_date}
        checkOutDate={bookingData?.check_out_date}
        customerName={pendingFormValues?.fullName || form.getFieldValue('fullName') || 'Khách hàng'}
        customerPhone={pendingFormValues?.phoneName || form.getFieldValue('phoneName') || ''}
      />

      {/* Booking Success Modal */}
      <BookingSuccessModal
        visible={bookingSuccessModalVisible}
        onOk={handleBookingSuccessModalOk}
        bookingData={successBookingData}
      />
    </div>
  );

  // Tính toán số tiền cọc (50%)
  function calculateDepositAmount() {
    if (!bookingData?.price) return 0;
    return Math.floor(bookingData.price * numberOfNights * 0.5);
  }

  // Tính toán tổng tiền
  function calculateTotalPrice() {
    if (!bookingData?.price) return 0;
    return bookingData.price * numberOfNights;
  }

  // Xử lý xác nhận thanh toán tiền mặt
  function handleCashDepositConfirm() {
    if (!pendingFormValues) return;
    setCashDepositModalVisible(false);
    processBooking(pendingFormValues);
  }

  // Xử lý chuyển sang VNPay
  function handleCashDepositChooseVNPay() {
    if (!pendingFormValues) return;
    setCashDepositModalVisible(false);

    // Cập nhật phương thức thanh toán thành VNPay
    const updatedValues = {
      ...pendingFormValues,
      payment_method: 'bank_transfer'
    };

    // Cập nhật form
    form.setFieldsValue({ payment_method: 'bank_transfer' });

    // Xử lý đặt phòng với VNPay
    processBooking(updatedValues);
  }

  // Xử lý khi nhấn OK trong modal thông báo thành công
  function handleBookingSuccessModalOk() {
    setBookingSuccessModalVisible(false);

    // Lưu thông tin booking vào localStorage để sử dụng trong trang booking-success
    if (successBookingData) {
      localStorage.setItem('bookingData', JSON.stringify({
        ...successBookingData,
        customerPhone: pendingFormValues?.phoneName || 'N/A',
        customerEmail: pendingFormValues?.emailName || 'N/A',
        tourName: bookingData?.roomType || 'Khách sạn',
        departureDate: bookingData?.check_in_date || new Date().toISOString(),
        departureLocation: 'Hà Nội',
        schedule: `${formattedCheckIn} - ${formattedCheckOut}`,
        adults: bookingData?.adults || 1,
        children: bookingData?.children || 0,
        depositAmount: calculateDepositAmount(),
        paymentStatus: 'pending'
      }));
    }

    // Chuyển đến trang booking-success
    navigate('/booking-success');
  }
};

export default HotelGuestInfo;

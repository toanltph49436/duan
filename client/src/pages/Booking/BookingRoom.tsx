/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import instanceClient from "../../../configs/instance";
import { useEffect, useState } from "react";
import  dayjs from 'dayjs';
import type { AxiosError } from "axios";
import { Form, Input, message, DatePicker, Select } from "antd";

const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho BookingData
interface BookingData {
  roomId: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
}

const BookingRoom = () => {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ['room', id],
    queryFn: () => instanceClient.get(`/room/${id}`)
  })
  const room = data?.data?.rooms
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      setBookingData(JSON.parse(data));
    }
  }, []);
  const checkInDate = bookingData?.check_in_date ? new Date(bookingData.check_in_date) : null;
  const checkOutDate = bookingData?.check_out_date ? new Date(bookingData.check_out_date) : null;
  


  let numberOfNights = 0;

  if (checkInDate && checkOutDate) {
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  } else {
    console.warn('Ngày nhận/trả phòng không hợp lệ');
  }
  const formattedCheckIn = dayjs(bookingData?.check_in_date ?? "")
    .add(7, 'hour')
    .format("DD/MM/YYYY [lúc] HH:mm");
  const formattedCheckOut = dayjs(bookingData?.check_out_date ?? "")
    .add(7, 'hour')
    .format("DD/MM/YYYY [lúc] HH:mm");
  const [form] = Form.useForm();
  const { mutate } = useMutation({
    mutationFn: async (data) => {
      try {
        return await instanceClient.post('/booking-room', data)
      } catch (error) {
        const err = error as AxiosError<{ messages: string[] }>;
        const errorMessages = err?.response?.data?.messages;
        throw new Error(errorMessages?.[0] || 'Đã có lỗi xảy ra');
      }
    },

    onSuccess: async (data) => {
      const paymentMethod = data?.data?.booking?.payment_method;
      console.log("databongking", data?.data?.booking?._id);
      // Nếu phương thức là chuyển khoản, gọi đến VNPay
      if (paymentMethod === "bank_transfer") {
        try {
          const res = await instanceClient.post(`/vnpay/${data?.data?.booking?._id}`);
          console.log("VNPay response:", res?.data);

          if (res.data?.success && res.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            message.error("Không thể lấy liên kết thanh toán từ VNPay");
          }
        } catch (error) {
          message.error("Đã xảy ra lỗi khi kết nối VNPay");
        }
      }
    }
  })
  const onFinish = (values: any) => {
    if (!bookingData?.roomId) {
      message.error("Vui lòng chọn phòng trước khi đặt.");
      return;
    }

    const payload = {
      userId: localStorage.getItem("userId"),
      itemRoom: [{ roomId: bookingData?.roomId }],
      check_in_date: bookingData?.check_in_date,
      check_out_date: bookingData?.check_out_date,
      adults: bookingData?.adults,
      children: bookingData?.children,
      guests: values.guests ? values.guests.map((guest: any) => ({
        fullName: guest.fullName,
        gender: guest.gender,
        birthDate: guest.birthDate ? dayjs(guest.birthDate).format('YYYY-MM-DD') : new Date('1990-01-01')
      })) : [],
      ...values,  // username, email, phone_number
    };

    console.log("Payload gửi đi:", payload);
    mutate(payload);
  };
  return (
    <div className="max-w-screen-xl p-4 mx-auto font-sans">
      {/* Progress Bar */}
      <div className="flex items-center mt-25 mb-10 w-full ">
        {/* Step 1 */}
        <div className="flex items-center flex-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-base border-2 border-blue-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="ml-2 font-medium text-black text-[15px]">
            Bạn chọn
          </span>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
        </div>
        {/* Step 2 */}
        <div className="flex items-center flex-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-base border-2 border-blue-600">
            2
          </div>
          <span className="ml-2 font-medium text-blue-600 text-[15px]">
            Chi tiết về bạn
          </span>
          <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
        </div>
        {/* Step 3 */}
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-white text-gray-400 flex items-center justify-center font-semibold text-base border-2 border-gray-300">
            3
          </div>
          <span className="ml-2 font-medium text-gray-400 text-[15px]">
            Hoàn tất đặt phòng
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6 p-6">
        {/* Left: Hotel Info */}
        <div className="w-3/12 bg-white rounded-xl p-3 shadow-md flex flex-col gap-2">
          <img
            src={room?.imageRoom[0]}
            alt="La Vela Saigon Hotel"
            className="w-full rounded-lg mb-2 h-36 object-cover"
          />
          <div className="text-xs text-gray-500 flex items-center gap-1">
            Khách sạn
            <span className="text-yellow-500 ml-1">★★★★★</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 text-yellow-500"
            >
              <path d="M2.09 15a1 1 0 0 0 1-1V8a1 1 0 1 0-2 0v6a1 1 0 0 0 1 1ZM5.765 13H4.09V8c.663 0 1.218-.466 1.556-1.037a4.02 4.02 0 0 1 1.358-1.377c.478-.292.907-.706.989-1.26V4.32a9.03 9.03 0 0 0 0-2.642c-.028-.194.048-.394.224-.479A2 2 0 0 1 11.09 3c0 .812-.08 1.605-.235 2.371a.521.521 0 0 0 .502.629h1.733c1.104 0 2.01.898 1.901 1.997a19.831 19.831 0 0 1-1.081 4.788c-.27.747-.998 1.215-1.793 1.215H9.414c-.215 0-.428-.035-.632-.103l-2.384-.794A2.002 2.002 0 0 0 5.765 13Z" />
            </svg>
          </div>
          <div className="font-bold text-base mb-1">{room?.nameRoom}</div>
          <div className="text-xs text-gray-700 mb-1">
            {room?.locationId
            }
          </div>
          <div className="text-green-700 text-xs font-medium mb-1">
            Vị trí tuyệt vời – <span className="font-bold">8.8</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded font-semibold">
              8.9
            </span>
            <span className="text-xs text-gray-700">
              Tuyệt vời · 9.321 đánh giá
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-700 mb-2">
            {room?.amenitiesRoom}
          </div>
          {/* Chi tiết đặt phòng */}
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 mb-1">
            {bookingData && (
              <>
                <div className="font-semibold text-sm text-blue-700 flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Chi tiết đặt phòng của bạn
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex-1">
                    <div className="text-gray-500">Nhận phòng</div>
                    <div className="font-bold text-blue-700">
                      {formattedCheckIn}
                    </div>
                  </div>
                  <div className="flex-1 border-l border-gray-200 pl-3">
                    <div className="text-gray-500">Trả phòng</div>
                    <div className="font-bold text-blue-700">
                      {formattedCheckOut}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Tổng thời gian lưu trú:{" "}
                  <span className="font-bold text-black">{numberOfNights} đêm</span>
                </div>
              </>

            )}

          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="w-9/12 bg-white rounded-lg p-8 shadow-lg mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Nhập thông tin chi tiết của bạn
            </h2>
          </div>

          <Form onFinish={onFinish} form={form}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Phần thông tin chính chiếm 2/3 */}
              <div className="md:col-span-2 grid grid-cols-1">
                {/* Họ */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <Form.Item
                    validateTrigger="onBlur"
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
                    <Input
                      size="large"
                      type="text"
                      placeholder="ví dụ: Nguyễn Văn A"
                    />
                  </Form.Item>

                </div>

                {/* Địa chỉ email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Địa chỉ email <span className="text-red-500">*</span>
                  </label>
                  <Form.Item
                    name="emailName"
                    validateTrigger="onBlur"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const allowedDomains = [
                            "gmail.com",
                            "yahoo.com",
                            "outlook.com",
                            "hotmail.com",
                            "icloud.com"
                          ];
                          const domain = value.split("@")[1]?.toLowerCase();
                          if (!domain || !allowedDomains.includes(domain)) {
                            return Promise.reject(new Error("Sai Địa Chỉ Email"));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Nhập email"
                    />
                  </Form.Item>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Form.Item
                    validateTrigger="onBlur"
                    name="phoneName"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();

                          const phoneRegex = /^0\d{9}$/;

                          if (!phoneRegex.test(value)) {
                            return Promise.reject(
                              new Error("Số điện thoại phải bắt đầu bằng 0 và gồm đúng 10 chữ số")
                            );
                          }

                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input
                      size="large"
                      type="tel"
                      placeholder="Số điện thoại"
                    />
                  </Form.Item>

                  <p className="mt-2 text-xs text-gray-500">
                    Cần thiết để chỗ nghỉ xác nhận đặt phòng của bạn
                  </p>
                </div>
              </div>


              {/* Phần phương thức thanh toán - nhỏ gọn ở bên phải */}
              <div className="bg-gray-100 border border-gray-300 rounded-md shadow-sm p-4 flex flex-col items-start">
                <h4 className="text-gray-900 text-lg font-semibold mb-4">
                  Phương thức thanh toán
                </h4>

                <Form.Item name="payment_method" rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}>
                  <div className="text-gray-900 text-sm w-full flex flex-col gap-2">
                    {[
                      { id: "cash", label: "Tiền mặt" },
                      { id: "credit_card", label: "Thẻ tín dụng" },
                      { id: "bank_transfer", label: "Chuyển khoản ngân hàng" },
                    ].map(({ id, label }) => (
                      <label key={id} htmlFor={id} className="inline-flex items-center cursor-pointer gap-2">
                        <input
                          type="radio"
                          id={id}
                          value={id}
                          name="payment_method"
                          className="h-4 w-4 rounded-full accent-blue-600 border"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </Form.Item>


                <div className="flex items-center">
                  <img
                    src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/amexLogo.svg"
                    alt="amexLogo"
                    className="h-6"
                  />
                  <img
                    src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/visaLogoColored.svg"
                    alt="visaLogoColored"
                    className="h-6"
                  />
                  <img
                    src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/masterCardLogo.svg"
                    alt="masterCardLogo"
                    className="h-6"
                  />
                </div>
              </div>
            </div>

            {/* Guest Information Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Thông tin khách lưu trú
              </h3>
              
              {/* Guest 1 (Main Guest) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Khách 1 (Người đặt)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name={['guests', 0, 'fullName']}
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên khách 1!' },
                        { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
                        { max: 30, message: 'Họ và tên không được vượt quá 30 ký tự' },
                        {
                          pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                          message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
                        }
                      ]}
                      initialValue={form.getFieldValue('userName')}
                    >
                      <Input placeholder="Nhập họ và tên khách 1" />
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name={['guests', 0, 'gender']}
                      rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    >
                      <Select placeholder="Chọn giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh <span className="text-red-500">*</span>
                    </label>
                    <Form.Item
                      name={['guests', 0, 'birthDate']}
                      rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        placeholder="Chọn ngày sinh"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Guest 2 (if adults > 1) */}
              {bookingData?.adults && bookingData.adults > 1 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Khách 2
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <Form.Item
                        name={['guests', 1, 'fullName']}
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên khách 2!' }]}
                      >
                        <Input placeholder="Nhập họ và tên khách 2" />
                      </Form.Item>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính <span className="text-red-500">*</span>
                      </label>
                      <Form.Item
                        name={['guests', 1, 'gender']}
                        rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                      >
                        <Select placeholder="Chọn giới tính">
                          <Option value="male">Nam</Option>
                          <Option value="female">Nữ</Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <Form.Item
                        name={['guests', 1, 'birthDate']}
                        rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          placeholder="Chọn ngày sinh"
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Guests (if adults > 2) */}
              {bookingData?.adults && bookingData.adults > 2 && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Khách bổ sung (Khách 3 - {bookingData.adults})
                  </h4>
                  {Array.from({ length: bookingData.adults - 2 }, (_, index) => (
                    <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
                      <h5 className="text-lg font-semibold text-orange-800 mb-4">
                        Khách {index + 3}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <Form.Item
                            name={['guests', index + 2, 'fullName']}
                            rules={[
                              { required: true, message: `Vui lòng nhập họ và tên khách ${index + 3}!` },
                              { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
                              { max: 30, message: 'Họ và tên không được vượt quá 30 ký tự' },
                              {
                                pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                                message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'
                              }
                            ]}
                          >
                            <Input placeholder={`Nhập họ và tên khách ${index + 3}`} />
                          </Form.Item>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính <span className="text-red-500">*</span>
                          </label>
                          <Form.Item
                            name={['guests', index + 2, 'gender']}
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                          >
                            <Select placeholder="Chọn giới tính">
                              <Option value="male">Nam</Option>
                              <Option value="female">Nữ</Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày sinh <span className="text-red-500">*</span>
                          </label>
                          <Form.Item
                            name={['guests', index + 2, 'birthDate']}
                            rules={[{ required: true, message: 'Vui lòng nhập ngày sinh!' }]}
                          >
                            <DatePicker 
                              style={{ width: '100%' }} 
                              placeholder="Chọn ngày sinh"
                              format="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8 p-6 border border-green-600 rounded-md bg-green-50 shadow-inner">
              <h3 className="text-green-700 font-semibold text-lg mb-2">
                Phòng Deluxe Giường Đôi Nhìn Ra Thành Phố
              </h3>
              <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
                <li>✔ Hủy miễn phí trước 19 tháng 6, 2025</li>
                <li>👤 Khách: {bookingData?.adults} người lớn</li>
                <li>👤 Khách: {bookingData?.children} trẻ con</li>
                <li>⭐ Đánh giá: 9.4</li>
                <li>🚭 Không hút thuốc</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-md transition"
            >
              Hoàn tất đặt phòng
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default BookingRoom;

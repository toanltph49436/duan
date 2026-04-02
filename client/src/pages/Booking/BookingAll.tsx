/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";

import { useParams, useLocation } from "react-router-dom";
import instanceClient from "../../../configs/instance";
import { Form, Input, message, type FormProps } from "antd";
import type { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { CashDepositModal } from '../../components/Payment/CashDepositModal';

const BookingTour = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const location = useLocation();
  
  // Xử lý tham số URL khi quay lại từ VNPay
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const status = searchParams.get('status');
    const errorMessage = searchParams.get('message');
    
    if (success === 'true') {
      if (status === 'completed') {
        message.success('Thanh toán đầy đủ thành công!');
      } else if (status === 'deposit_paid') {
        message.success('Đặt cọc thành công!');
      } else {
        message.success('Thanh toán thành công!');
      }
    } else if (success === 'false') {
      if (errorMessage === 'payment_failed') {
        message.error('Thanh toán thất bại. Vui lòng thử lại sau.');
      } else {
        message.error(errorMessage || 'Đã xảy ra lỗi trong quá trình thanh toán.');
      }
    }
  }, [location.search]);
  
  const { data, refetch } = useQuery({
    queryKey: ['bookingTour', id],
    queryFn: () => instanceClient.get(`bookingTour/${id}`)
  });
  
  // Tự động tải lại dữ liệu khi quay lại từ VNPay
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('success')) {
      refetch();
    }
  }, [location.search, refetch]);
  
  const bookingTour = data?.data?.booking;
  console.log(bookingTour);
  
  const formatDateVN = (dateString:any) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  };
  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await instanceClient.post(`/checkOutBookingTour/${bookingTour._id}`, data)
        return response.data
      } catch (error) {
        const err = error as AxiosError<{ messages: string[] }>;
        const errorMessages = err?.response?.data?.messages;
        throw new Error(errorMessages?.[0] || 'Đã có lỗi xảy ra');
      }
    },
    onSuccess: async (data) => {
      console.log('Dữ liệu trả về:', data);
      const bookingId = data.payment._id;
      const paymentMethod = data?.payment?.payment_method;
      console.log('paymentMethod:', paymentMethod);


      // Nếu thanh toán qua VNPay và có paymentUrl
      if (data.paymentUrl) {
        try {
          // Chuyển hướng trực tiếp đến URL thanh toán VNPay
          console.log("Chuyển trang tới VNPAY:", data.paymentUrl);
          window.location.href = data.paymentUrl;
          return;
        } catch (error) {
          console.error("Lỗi khi chuyển hướng đến VNPay:", error);
          message.error("Đã xảy ra lỗi khi chuyển hướng đến VNPay");
          // Chuyển về trang chủ nếu có lỗi
          window.location.href = '/';
          return;
        }
      }

      // Nếu thanh toán qua VNPay nhưng không có paymentUrl sẵn
      if (paymentMethod === "bank_transfer") {
        try {
          const res = await instanceClient.post(`/vnpay/${bookingId}`, null, {
            params: {
              bookingType: 'tour',
            },
          });
          console.log("VNPay response:", res?.data);

          if (res.data?.success && res.data?.paymentUrl) {
            console.log("Chuyển trang tới VNPAY:", res.data.paymentUrl);
            window.location.href = res.data.paymentUrl;
          } else {
            console.log("Không có paymentUrl hoặc success false");
            message.error("Không thể lấy liên kết thanh toán từ VNPay");

            // Chuyển về trang chủ
            window.location.href = '/';
          }
        } catch (error) {
          console.error("Lỗi khi kết nối VNPay:", error);
          message.error("Đã xảy ra lỗi khi kết nối VNPay");

          // Chuyển về trang chủ nếu có lỗi
          window.location.href = '/';
        }
      } else {
        // Với các phương thức thanh toán khác
        message.success(data.message || "Thanh toán thành công");
        
        // Chuyển hướng đến trang chủ
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    },
    
    onError: (error: any) => {

      message.error(error.message || 'Đặt tour thất bại');
    },
  })

  // Hiển thị modal chọn phương thức thanh toán
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cashDepositModalVisible, setCashDepositModalVisible] = useState(false);
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<string>('');

  const handlePayRemainingAmount = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handlePaymentMethodSelect = (method: string) => {
    if (method === 'cash') {
      setPendingPaymentMethod(method);
      setIsModalVisible(false);
      setCashDepositModalVisible(true);
      return;
    }
    
    onFinish({ payment_method: method });
    setIsModalVisible(false);
  };

  // Hàm tính toán số tiền cọc (50% tổng tiền)
  const calculateDepositAmount = () => {
    return Math.round((bookingTour?.totalPriceBooking || 0) * 0.5);
  };

  // Xử lý khi khách hàng xác nhận thanh toán tiền mặt
  const handleCashDepositConfirm = () => {
    setCashDepositModalVisible(false);
    onFinish({ payment_method: pendingPaymentMethod });
  };

  // Xử lý khi khách hàng chọn VNPay từ modal
  const handleCashDepositChooseVNPay = () => {
    setCashDepositModalVisible(false);
    onFinish({ payment_method: 'bank_transfer' });
  };

  const onFinish: FormProps<any>["onFinish"] = (values) => {
    const newValues = {
      ...values,
      BookingTourId: bookingTour._id,

      isFullPayment: true, // Thanh toán phần còn lại
    };
    mutate(newValues);
  };

  // Thêm hiển thị thông tin đặt cọc và số tiền còn lại
  const renderPaymentStatus = () => {
    if (!bookingTour) return null;
    
    if (bookingTour.isFullyPaid) {
      return (
        <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
          <p className="font-semibold">Đã thanh toán đầy đủ</p>
          <p>Số tiền: {bookingTour.totalPriceTour?.toLocaleString()} VNĐ</p>
        </div>
      );
    }
    
    if (bookingTour.isDeposit) {
      const remainingAmount = bookingTour.totalPriceTour - bookingTour.depositAmount;
      return (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">
          <p className="font-semibold">Đã đặt cọc</p>
          <p>Số tiền đã đặt cọc: {bookingTour.depositAmount?.toLocaleString()} VNĐ</p>
          <p>Số tiền còn lại: {remainingAmount?.toLocaleString()} VNĐ</p>
          {bookingTour.payment_status !== 'completed' && (
            <button 
              onClick={handlePayRemainingAmount}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Thanh toán phần còn lại'}
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
        <p className="font-semibold">Chưa thanh toán</p>
        <p>Vui lòng thanh toán để xác nhận đặt tour</p>
      </div>
    );
  };
  return (
    <div className="max-w-screen-xl p-2 md:p-4 mx-auto font-sans">
      {/* Progress Bar */}
      <div className="hidden md:flex flex-col md:flex-row items-center mt-4 mb-6 w-full gap-2 md:gap-0">
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
            Hoàn tất đặt dịch vụ
          </span>
        </div>
      </div>


      {/* Hiển thị trạng thái thanh toán */}
      {renderPaymentStatus()}

      {/* Modal chọn phương thức thanh toán */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handlePaymentMethodSelect('cash')}
                className="w-full py-3 px-4 border border-gray-300 rounded-md flex items-center justify-between hover:bg-gray-100"
                disabled={isLoading}
              >
                <span>Tiền mặt</span>
                <span className="text-gray-500">→</span>
              </button>
              <button 
                onClick={() => handlePaymentMethodSelect('bank_transfer')}
                className="w-full py-3 px-4 border border-gray-300 rounded-md flex items-center justify-between hover:bg-gray-100"
                disabled={isLoading}
              >
                <span>Thanh toán qua VNPay</span>
                <span className="text-gray-500">→</span>
              </button>
            </div>
            <button 
              onClick={handleModalCancel}
              className="mt-4 w-full py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              disabled={isLoading}
            >
              Hủy
            </button>
            
            {isLoading && (
              <div className="mt-3 text-center text-blue-600">
                <p>Đang xử lý thanh toán, vui lòng đợi...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dịch vụ - chuyển table thành card ở mobile */}
      <div className="mb-4 mt-20">
        <div className="bg-white rounded-xl shadow-md flex flex-col md:table w-full">
          <div className="hidden md:table-header-group bg-blue-50 text-blue-700">
            <div className="table-row ">
              <div className="table-cell py-3 px-4 rounded-tl-xl">Dịch vụ</div>
              <div className="table-cell py-3 px-4">Thông tin</div>
              <div className="table-cell py-3 px-4 rounded-tr-xl">Tóm tắt giá</div>
            </div>
          </div>
          <div className="flex flex-col md:table-row-group">
            <div className="flex flex-col md:table-row border-b">
              <div className="md:table-cell py-3 px-4 align-top flex justify-center">
                <img
                  src={bookingTour?.tourId?.imageTour[0]}
                  alt="La Vela Saigon Hotel"
                  className="w-full max-w-[180px] rounded mb-2 mx-auto"
                />
              </div>
              <div className="md:table-cell py-3 px-4 align-top">
                <div className="font-bold mb-1">{bookingTour?.tourId?.nameTour}</div>


                <div className="text-green-700 text-xs font-medium mb-1">
                  Vị trí tuyệt vời – <span className="font-bold">8.8</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Ngày đi: <b>{formatDateVN(bookingTour?.bookingDate)}</b> <br />
                  Ngày về: <b>{formatDateVN(bookingTour?.endTime)}</b> <br />
                  {bookingTour?.tourId?.duration} - {bookingTour?.adultsTour} người lớn - {bookingTour?.childrenTour} trẻ em
                </div>
              </div>
              <div className="md:table-cell py-6 px-4 align-top">
                <div className="font-semibold text-blue-700 mb-1">Tổng cộng</div>
                <div className="text-rose-600 font-bold text-2xl mb-1">
                  {bookingTour?.totalPriceBooking.toLocaleString()} đ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-lg p-2 md:p-6 shadow-md">
        <div className="flex items-center mb-6">
          <div className="font-semibold text-3xl mr-4">
            Nhập thông tin chi tiết của bạn
          </div>
        </div>
        <Form form={form} onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6">
            {/* Phần thông tin chính chiếm 2/3 */}
            <div className="md:col-span-2 grid grid-cols-1">
              {/* Họ */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  validateTrigger="onBlur"
                  name="fullName"
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
                  name="emailUser"
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
                  name="phoneUser"
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
                    { id: "bank_transfer", label: "Thanh Toán qua Vnpay" },
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

          <div className="mb-8 p-6 border border-green-600 rounded-md bg-green-50 shadow-inner">
            <h3 className="text-green-700 font-semibold text-lg mb-2">
              Phòng Deluxe Giường Đôi Nhìn Ra Thành Phố
            </h3>
            <ul className="text-green-700 text-sm space-y-1 list-disc list-inside">
              <li>✔ Hủy miễn phí trước 19 tháng 6, 2025</li>
              {/* <li>👤 Khách: {bookingData?.adults} người lớn</li>
              <li>👤 Khách: {bookingData?.children} trẻ con</li> */}
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

      {/* Cash Deposit Modal */}
      <CashDepositModal
        visible={cashDepositModalVisible}
        onCancel={() => setCashDepositModalVisible(false)}
        onConfirmCash={handleCashDepositConfirm}
        onChooseVNPay={handleCashDepositChooseVNPay}
        bookingId={bookingTour?.bookingCode || ''}
        totalAmount={bookingTour?.totalPriceBooking || 0}
        depositAmount={calculateDepositAmount()}
      />
    </div>
  );
};

export default BookingTour;

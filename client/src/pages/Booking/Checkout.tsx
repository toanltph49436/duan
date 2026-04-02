/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import instanceClient from "../../../configs/instance";
import { useState, useEffect } from "react";
import { Col, Form, Input, Row, Select, DatePicker, Button, message, Modal } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { AxiosError } from "axios";
import type moment from "moment";
import { CashDepositModal } from '../../components/Payment/CashDepositModal';

// Khởi tạo plugin
dayjs.extend(utc);
dayjs.extend(timezone);
const { TextArea } = Input;




const Checkout = () => {
  const [form] = Form.useForm();
  const [singleRoom, setSingleRoom] = useState([false]);
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [kidCount, setKidCount] = useState(0);
  const [babyCount, setBabyCount] = useState(0);
  const [cashDepositModalVisible, setCashDepositModalVisible] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);
  const navigate = useNavigate();

  // Lấy id từ params và kiểm tra
  const { id } = useParams();

  //Hàm tính tuổi
  const calculateAge = (birtdate: moment.Moment) => {
    if (!birtdate) return 0;
    const today = new Date();
    const birth = birtdate.toDate();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Kiểm tra id hợp lệ
  useEffect(() => {
    if (!id || id === 'undefined') {
      message.error('Không tìm thấy thông tin slot tour, vui lòng chọn lại tour!');
      // Chuyển về trang danh sách tour sau 2 giây
      setTimeout(() => {
        navigate('/destinations');
      }, 2000);
    }
  }, [id, navigate]);

  // Set trạng thái mặc định cho radio button khi component mount
  useEffect(() => {
    // Set mặc định cho phương thức thanh toán (Tiền mặt)
    const cashRadio = document.querySelector('input[value="cash"]') as HTMLInputElement;
    if (cashRadio) {
      cashRadio.checked = true;
      const card = cashRadio.closest('label')?.querySelector('[data-payment-method]');
      const indicator = cashRadio.closest('label')?.querySelector('[data-radio-indicator]');
      const checkIcon = cashRadio.closest('label')?.querySelector('[data-check-icon]');
      
      if (card) {
        card.classList.remove('border-gray-200');
        card.classList.add('border-green-500', 'shadow-lg', 'shadow-green-100');
      }
      if (indicator) {
        indicator.classList.remove('border-gray-300');
        indicator.classList.add('border-green-500', 'bg-green-500');
      }
      if (checkIcon) {
        checkIcon.classList.remove('opacity-0');
        checkIcon.classList.add('opacity-100');
      }
    }

    // Set mặc định cho tùy chọn thanh toán (Đặt cọc 50%)
    const depositRadio = document.querySelector('input[value="false"]') as HTMLInputElement;
    if (depositRadio) {
      depositRadio.checked = true;
      const card = depositRadio.closest('label')?.querySelector('[data-payment-option]');
      const indicator = depositRadio.closest('label')?.querySelector('[data-payment-radio-indicator]');
      const checkIcon = depositRadio.closest('label')?.querySelector('[data-payment-check-icon]');
      
      if (card) {
        card.classList.remove('border-gray-200', 'bg-gradient-to-br', 'from-orange-50', 'to-red-50');
        card.classList.add('border-orange-500', 'bg-gradient-to-br', 'from-orange-100', 'to-red-100');
      }
      if (indicator) {
        indicator.classList.remove('border-gray-300');
        indicator.classList.add('border-orange-500', 'bg-orange-500');
      }
      if (checkIcon) {
        checkIcon.classList.remove('opacity-0');
        checkIcon.classList.add('opacity-100');
      }
    }
  }, []);

  const handleAdultCountChange = (newCount: any) => {
    setAdultCount(newCount);
    setSingleRoom((prev) => {
      const newArray = [...prev];
      if (newCount > prev.length) {
        for (let i = prev.length; i < newCount; i++) newArray.push(false);
      } else if (newCount < prev.length) {
        newArray.length = newCount;
      }
      return newArray;
    });
  };

  const handleToggleSingleRoom = (index: number) => {
    setSingleRoom((prev) => {
      const newSingleRoom = [...prev];
      newSingleRoom[index] = !newSingleRoom[index];

      // Cập nhật vào form
      const currentAdults = form.getFieldValue("adultPassengers") || [];
      currentAdults[index] = {
        ...currentAdults[index],
        singleRoom: newSingleRoom[index],
      };
      form.setFieldsValue({ adultPassengers: currentAdults });

      return newSingleRoom;
    });
  };

  // Cập nhật form fields khi số lượng thay đổi
  useEffect(() => {
    const currentValues = form.getFieldsValue();

    const syncList = (fieldName: string, count: number) => {
      const currentList = currentValues[fieldName] || [];

      if (count > currentList.length) {
        const newList = [...currentList];
        for (let i = currentList.length; i < count; i++) {
          newList.push({ fullName: '', gender: 'Nam', birthDate: null, singleRoom: singleRoom[i] || false, });
        }
        form.setFieldsValue({ [fieldName]: newList });
      } else if (count < currentList.length) {
        // Giữ lại phần đã nhập, chỉ cắt bớt nếu cần
        const newList = currentList.slice(0, count);
        form.setFieldsValue({ [fieldName]: newList });
      }
    };

    syncList('adultPassengers', adultCount);
    syncList('childPassengers', kidCount);
    syncList('toddlerPassengers', childCount);
    syncList('infantPassengers', babyCount);
  }, [adultCount, kidCount, childCount, babyCount, form]);


  const { data } = useQuery({
    queryKey: ['/date/slot', id],
    queryFn: () => instanceClient.get(`/date/slot/${id}`)
  });

  const tours = data?.data?.data;
  console.log(tours);

  const totalSingleRoomPrice = singleRoom.reduce(
    (sum, val) => (val ? sum + (tours?.tour?.priceSingleRoom || 0) : sum),
    0
  );

  const requiredLabel = (text: string) => (
    <>
      {text} <span className="text-red-500">*</span>
    </>
  );

  const { mutate, isLoading } = useMutation({
    mutationFn: async (data: any) => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Bạn cần đăng nhập trước khi đặt tour.");
        if (!id) throw new Error("Slot ID không hợp lệ.");

        const { userId: any, slotId: __, ...restData } = data;

        // Xử lý dữ liệu trước khi gửi
        const payload = {
          userId,
          slotId: id,
          tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour vào payload
          ...restData,
        };

        console.log("Sending payload:", payload);
        const res = await instanceClient.post(`/bookingTour`, payload);
        return res.data;
      } catch (error) {
        console.error("Error in booking:", error);
        const err = error as AxiosError<any>;

        // Xử lý các loại lỗi khác nhau
        if (err.response) {
          // Lỗi từ server với response
          const errorData = err.response.data;
          console.error("Server error response:", errorData);

          if (errorData.message) {
            throw new Error(errorData.message);
          } else if (errorData.error) {
            throw new Error(errorData.error);
          } else if (Array.isArray(errorData.messages) && errorData.messages.length > 0) {
            throw new Error(errorData.messages[0]);
          }
        }

        // Lỗi khác
        throw new Error((error as Error).message || 'Đã có lỗi xảy ra khi đặt tour');
      }
    },
    onSuccess: async (data) => {
      console.log('Dữ liệu trả về:', data);
      const bookingId = data.booking._id;

      // Nếu có URL thanh toán VNPay, chuyển hướng trực tiếp
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // Nếu phương thức là chuyển khoản nhưng không có paymentUrl, gọi API để lấy URL
      const paymentMethod = data.booking.payment_method;
      if (paymentMethod === "bank_transfer") {
        try {
          const res = await instanceClient.post(`/vnpay/${bookingId}`);
          console.log("VNPay response:", res?.data);

          if (res.data?.success && res.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            message.error("Không thể lấy liên kết thanh toán từ VNPay");
            navigate(`/booking/${bookingId}`);
          }
        } catch (error) {
          console.error("Lỗi khi kết nối VNPay:", error);
          message.error("Đã xảy ra lỗi khi kết nối VNPay");
          navigate(`/booking/${bookingId}`);
        }
      } else if (paymentMethod === "cash") {
        // Xử lý khi thanh toán tiền mặt
        const deadline = data.booking?.cashPaymentDeadline ? new Date(data.booking.cashPaymentDeadline) : new Date(Date.now() + 48 * 60 * 60 * 1000);
        const deadlineStr = deadline.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });

        Modal.success({
          title: "Đặt tour thành công!",
          content: (
            <div>
              <p>Bạn đã chọn thanh toán tiền mặt tại văn phòng.</p>
              <p className="mt-2 font-semibold">Thông tin thanh toán:</p>
              <ul className="pl-5 mt-1 list-disc">
                <li>Mã đặt tour: {bookingId}</li>
                <li>Số tiền cần thanh toán: {data.depositAmount?.toLocaleString() || Math.round(data.totalAmount * 0.5).toLocaleString()} VNĐ</li>
                <li className="font-semibold text-red-600">Hạn thanh toán: {deadlineStr}</li>
                <li>Địa chỉ: Số 81A ngõ 295 - Phố Bằng Liệt - Phường Lĩnh Nam - Quận Hoàng Mai - Hà Nội</li>
                <li>Thời gian: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7</li>
              </ul>
              <div className="p-3 mt-3 border border-red-200 rounded bg-red-50">
                <p className="font-semibold text-red-600">⚠️ LƯU Ý QUAN TRỌNG:</p>
                <ul className="mt-1 text-sm text-red-600">
                  <li>• Bạn có 48 giờ để thanh toán tiền cọc kể từ thời điểm đặt tour</li>
                  <li>• Tour sẽ tự động bị hủy nếu quá thời hạn thanh toán</li>
                  <li>• Vui lòng đến văn phòng trước thời hạn để hoàn tất thanh toán</li>
                </ul>
              </div>
            </div>
          ),
          onOk: () => {
            navigate(`/booking/${bookingId}`);
          },
        });
      } else {
        // Nếu không phải thanh toán qua VNPay, chuyển về trang chi tiết booking
        message.success(data.message || "Đặt tour thành công");
        setTimeout(() => {
          navigate(`/booking/${bookingId}`);
        }, 1500);
      }
    },
    onError(error: Error) {
      message.error(error.message || "Đặt tour thất bại!");
    },
  });

  const onFinish = (values: any) => {
    // Chuyển đổi isFullPayment từ chuỗi sang boolean
    const isFullPayment = values.isFullPayment === "true";

    // Kiểm tra nếu chọn thanh toán tiền mặt, hiển thị CashDepositModal
    if (values.payment_method === 'cash') {
      setPendingFormValues(values);
      setCashDepositModalVisible(true);
      return;
    }

    // Kiểm tra nếu là thanh toán cọc và phương thức thanh toán không phải là bank_transfer
    if (!isFullPayment && values.payment_method !== "bank_transfer") {
      // Hiển thị modal thông báo
      setCashDepositModalVisible(true);
      return;
    }

    // Xử lý các trường ngày tháng
    const processPassengers = (passengers: any[]) => {
      if (!passengers) return [];

      return passengers.map(p => ({
        ...p,
        // Chuyển đổi đối tượng dayjs thành chuỗi ISO nếu cần
        birthDate: p.birthDate ? p.birthDate.toISOString() : null
      }));
    };

    // Bổ sung adultsTour và isFullPayment vào payload
    mutate({
      ...values,
      tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour
      isFullPayment,
      adultsTour: adultCount,
      childrenTour: kidCount,
      toddlerTour: childCount,
      infantTour: babyCount,
      adultPassengers: processPassengers(values.adultPassengers),
      childPassengers: processPassengers(values.childPassengers),
      toddlerPassengers: processPassengers(values.toddlerPassengers),
      infantPassengers: processPassengers(values.infantPassengers)
    });
  };


  // Hàm lấy giá tour (không bao gồm vé máy bay)
  const getTourPrice = (tour: any) => {
    if (!tour) return 0;
    return tour.finalPrice || tour.price || 0;
  };

  // Hàm lấy giá vé máy bay
  const getFlightPrice = (tour: any, ageGroup: 'adult' | 'child' | 'toddler' | 'infant') => {
    if (!tour || !tour.includesFlight) return 0;
    switch (ageGroup) {
      case 'adult': return tour.flightPrice || 0;
      case 'child': return tour.flightPriceChildren || 0;
      case 'toddler': return tour.flightPriceLittleBaby || 0;
      case 'infant': return tour.flightPriceBaby || 0;
      default: return 0;
    }
  };

  // Hàm lấy tổng giá cho mỗi loại khách (tour + vé máy bay)
  const getTotalPriceByAge = (tour: any, ageGroup: 'adult' | 'child' | 'toddler' | 'infant') => {
    const tourPrice = ageGroup === 'adult' ? getTourPrice(tour) : 
                     ageGroup === 'child' ? (tour?.priceChildren || 0) :
                     ageGroup === 'toddler' ? (tour?.priceLittleBaby || 0) :
                     (tour?.pricebaby || 0);
    const flightPrice = getFlightPrice(tour, ageGroup);
    return tourPrice + flightPrice;
  };

  const totalPrice = (adultCount * getTotalPriceByAge(tours?.tour, 'adult') +
    totalSingleRoomPrice +
    kidCount * getTotalPriceByAge(tours?.tour, 'child') +
    childCount * getTotalPriceByAge(tours?.tour, 'toddler'));
  const onGenderChange = (index: number, newGender: string) => {
    const currentValues = form.getFieldValue('adultPassengers') || [];
    const updated = [...currentValues];

    // Giữ nguyên các trường khác
    updated[index] = {
      ...updated[index],
      gender: newGender,
    };

    form.setFieldsValue({ adultPassengers: updated });
  };

  // Modal thông báo khi chọn thanh toán cọc nhưng không chọn VNPay

  const handleDepositConfirm = () => {
    // Ngăn chặn multiple clicks
    if (isLoading) return;

    setCashDepositModalVisible(false);

    // Lấy tất cả giá trị form hiện tại
    const formValues = form.getFieldsValue();

    // Cập nhật phương thức thanh toán thành VNPay
    formValues.payment_method = "bank_transfer";

    // Xử lý các trường ngày tháng
    const processPassengers = (passengers: any[]) => {
      if (!passengers) return [];

      return passengers.map(p => ({
        ...p,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null
      }));
    };

    // Gọi API với phương thức thanh toán đã cập nhật
    mutate({
      ...formValues,
      tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour
      isFullPayment: formValues.isFullPayment,
      adultsTour: adultCount,
      childrenTour: kidCount,
      toddlerTour: childCount,
      infantTour: babyCount,
      adultPassengers: processPassengers(formValues.adultPassengers),
      childPassengers: processPassengers(formValues.childPassengers),
      toddlerPassengers: processPassengers(formValues.toddlerPassengers),
      infantPassengers: processPassengers(formValues.infantPassengers)
    });
  };

  const handleCashPayment = () => {
    // Ngăn chặn multiple clicks
    if (isLoading) return;

    setCashDepositModalVisible(false);

    // Lấy tất cả giá trị form hiện tại
    const formValues = form.getFieldsValue();

    // Đảm bảo phương thức thanh toán là tiền mặt
    formValues.payment_method = "cash";

    // Xử lý các trường ngày tháng
    const processPassengers = (passengers: any[]) => {
      if (!passengers) return [];

      return passengers.map(p => ({
        ...p,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null
      }));
    };

    // Gọi API với phương thức thanh toán tiền mặt
    mutate({
      ...formValues,
      tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour
      isFullPayment: formValues.isFullPayment,
      adultsTour: adultCount,
      childrenTour: kidCount,
      toddlerTour: childCount,
      infantTour: babyCount,
      adultPassengers: processPassengers(formValues.adultPassengers),
      childPassengers: processPassengers(formValues.childPassengers),
      toddlerPassengers: processPassengers(formValues.toddlerPassengers),
      infantPassengers: processPassengers(formValues.infantPassengers)
    });
  };

  // Hàm tính toán số tiền cọc (50% tổng tiền cho tour)
  const calculateDepositAmount = () => {
    return Math.round(totalPrice * 0.5);
  };

  // Xử lý khi khách hàng xác nhận thanh toán tiền mặt
  const handleCashDepositConfirm = () => {
    if (!pendingFormValues) return;
    setCashDepositModalVisible(false);
    
    // Xử lý các trường ngày tháng
    const processPassengers = (passengers: any[]) => {
      if (!passengers) return [];
      return passengers.map(p => ({
        ...p,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null
      }));
    };

    const isFullPayment = pendingFormValues.isFullPayment === "true";
    
    mutate({
      ...pendingFormValues,
      tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour
      isFullPayment,
      adultsTour: adultCount,
      childrenTour: kidCount,
      toddlerTour: childCount,
      infantTour: babyCount,
      adultPassengers: processPassengers(pendingFormValues.adultPassengers),
      childPassengers: processPassengers(pendingFormValues.childPassengers),
      toddlerPassengers: processPassengers(pendingFormValues.toddlerPassengers),
      infantPassengers: processPassengers(pendingFormValues.infantPassengers)
    });
  };

  // Xử lý khi khách hàng chọn VNPay từ modal
  const handleCashDepositChooseVNPay = () => {
    if (!pendingFormValues) return;
    setCashDepositModalVisible(false);
    
    // Cập nhật phương thức thanh toán thành VNPay
    const updatedValues = {
      ...pendingFormValues,
      payment_method: 'bank_transfer'
    };
    
    // Xử lý các trường ngày tháng
    const processPassengers = (passengers: any[]) => {
      if (!passengers) return [];
      return passengers.map(p => ({
        ...p,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null
      }));
    };

    const isFullPayment = updatedValues.isFullPayment === "true";
    
    mutate({
      ...updatedValues,
      tourPrice: getTotalPriceByAge(tours?.tour, 'adult'), // Thêm giá tour
      isFullPayment,
      adultsTour: adultCount,
      childrenTour: kidCount,
      toddlerTour: childCount,
      infantTour: babyCount,
      adultPassengers: processPassengers(updatedValues.adultPassengers),
      childPassengers: processPassengers(updatedValues.childPassengers),
      toddlerPassengers: processPassengers(updatedValues.toddlerPassengers),
      infantPassengers: processPassengers(updatedValues.infantPassengers)
    });
  };

  return (
    <div className="min-h-screen px-2 py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Đặt Tour Du Lịch</h1>
          <p className="text-lg text-gray-600">Điền thông tin để hoàn tất đặt tour của bạn</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            adultPassengers: [{ fullName: '', gender: '', birthDate: null }],
            childPassengers: [{ fullName: '', gender: '', birthDate: null }],
            toddlerPassengers: [{ fullName: '', gender: '', birthDate: null }],
            infantPassengers: [{ fullName: '', gender: '', birthDate: null }]
          }}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Form */}
            <div className="space-y-8 lg:col-span-2">

              {/* Thông tin liên lạc */}
              <div className="p-8 transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 text-white rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                      Thông tin liên lạc
                    </h2>
                    <p className="text-sm text-gray-500">Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ với bạn</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Form.Item
                      label={
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          <span className="font-medium text-gray-700">Họ tên <span className="text-red-500">*</span></span>
                        </div>
                      }
                      name="fullNameUser"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên của bạn" }]}
                    >
                      <Input
                        placeholder="Nguyễn Văn A"
                        size="large"
                        className="transition-colors duration-200 border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 rounded-xl"
                        prefix={<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-2">
                    <Form.Item
                      label={
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <span className="font-medium text-gray-700">Điện thoại <span className="text-red-500">*</span></span>
                        </div>
                      }
                      name="phone"
                      rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại phải có 10-11 chữ số" }
                      ]}
                    >
                      <Input
                        placeholder="0922222016"
                        size="large"
                        className="transition-colors duration-200 border-2 border-gray-200 hover:border-green-400 focus:border-green-500 rounded-xl"
                        prefix={<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-2">
                    <Form.Item
                      label={
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          <span className="font-medium text-gray-700">Email <span className="text-red-500">*</span></span>
                        </div>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input
                        placeholder="example@gmail.com"
                        size="large"
                        className="transition-colors duration-200 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 rounded-xl"
                        prefix={<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-2">
                    <Form.Item
                      label={
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-700">Địa chỉ</span>
                        </div>
                      }
                      name="address"
                    >
                      <Input
                        placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                        size="large"
                        className="transition-colors duration-200 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 rounded-xl"
                        prefix={<svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Hành khách */}
              <div className="p-8 transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 text-white rounded-full shadow-lg bg-gradient-to-r from-green-500 to-teal-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text">
                      Số lượng hành khách
                    </h2>
                    <p className="text-sm text-gray-500">Chọn số lượng hành khách cho chuyến đi</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Người lớn */}
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${adultCount > 0
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 text-white bg-blue-500 rounded-full shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Người lớn</h3>
                        <p className="text-sm text-gray-600">Từ 12 tuổi trở lên</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-gray-700 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300"
                        onClick={() => handleAdultCountChange(Math.max(1, adultCount - 1))}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-blue-600 min-w-[40px] text-center">{adultCount}</span>
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-white transition-colors duration-200 bg-blue-500 rounded-full hover:bg-blue-600"
                        onClick={() => handleAdultCountChange(adultCount + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {/* Trẻ nhỏ */}
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${childCount > 0
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 text-white bg-purple-500 rounded-full shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L3 7v11c0 1.1.9 2 2 2h4v-6h2v6h4c1.1 0 2-.9 2-2V7l-7-5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Trẻ nhỏ</h3>
                        <p className="text-sm text-gray-600">Từ 2 - 4 tuổi</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-gray-700 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300"
                        onClick={() => setChildCount(Math.max(0, childCount - 1))}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-purple-600 min-w-[40px] text-center">{childCount}</span>
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-white transition-colors duration-200 bg-purple-500 rounded-full hover:bg-purple-600"
                        onClick={() => setChildCount(childCount + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Trẻ em */}
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${kidCount > 0
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 text-white bg-green-500 rounded-full shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Trẻ em</h3>
                        <p className="text-sm text-gray-600">Từ 5 - 11 tuổi</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-gray-700 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300"
                        onClick={() => setKidCount(Math.max(0, kidCount - 1))}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-green-600 min-w-[40px] text-center">{kidCount}</span>
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-white transition-colors duration-200 bg-green-500 rounded-full hover:bg-green-600"
                        onClick={() => setKidCount(kidCount + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Em bé */}
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${babyCount > 0
                    ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 text-white bg-pink-500 rounded-full shadow-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Em bé</h3>
                        <p className="text-sm text-gray-600">Dưới 2 tuổi</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-gray-700 transition-colors duration-200 bg-gray-200 rounded-full hover:bg-gray-300"
                        onClick={() => setBabyCount(Math.max(0, babyCount - 1))}
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-pink-600 min-w-[40px] text-center">{babyCount}</span>
                      <button
                        type="button"
                        className="flex items-center justify-center w-10 h-10 font-bold text-white transition-colors duration-200 bg-pink-500 rounded-full hover:bg-pink-600"
                        onClick={() => setBabyCount(babyCount + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin hành khách - Người lớn */}

              {/* Thông tin hành khách - Trẻ nhỏ */}

              {/* Thông tin hành khách - Trẻ em */}
              
              {/* Thông tin hành khách - Em bé */}
              

              {/* Ghi chú */}
              <div>
                <div className="mb-2 text-lg font-bold">GHI CHÚ</div>
                <Form.Item name="note">
                  <TextArea
                    rows={4}
                    placeholder="Vui lòng nhập nội dung lời nhắn bằng tiếng Anh hoặc tiếng Việt"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Right: Tóm tắt chuyến đi */}
            <div className="p-6 space-y-6 bg-white shadow rounded-xl">
              <div className="mb-2 text-lg font-bold">TÓM TẮT CHUYẾN ĐI</div>
              <div className="flex items-center space-x-4">
                <img src={tours?.tour?.imageTour[0]} alt="tour" className="object-cover w-24 h-20 border rounded-lg" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{tours?.tour?.nameTour}</div>
                  <div className="mt-1 text-xs text-gray-500">Mã tour: {tours?.tour?._id?.slice(0, 6).toUpperCase()}</div>
                </div>
              </div>
              {/* Thông tin chuyến bay */}
              <div className="p-3 text-sm rounded bg-gray-50">
                <div className="mb-1 font-semibold">THÔNG TIN DI CHUYỂN</div>
                <div className="flex justify-between mb-1">
                  <span>Ngày đi - {dayjs(tours?.dateTour).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</span>
                </div>
              
              <div className="flex justify-between mb-1">
  <span>
    Ngày về:{" "}
    {tours?.tour?.duration
      ? dayjs(tours?.dateTour)
          .add(
            Number(tours?.tour?.duration.split(" ")[0]), // lấy số ngày ở đầu chuỗi
            "day"
          )
          .tz("Asia/Ho_Chi_Minh")
          .format("DD/MM/YYYY")
      : "--"}
  </span>
</div>
</div>
              {/* Giá */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Giá Combo </span>
                <span className="text-lg font-bold text-red-600">{getTotalPriceByAge(tours?.tour, 'adult').toLocaleString()} ₫</span>
              </div>
              
              {/* Chi tiết giá tour và vé máy bay */}
              {tours?.tour?.includesFlight && (
                <div className="p-3 text-sm rounded-lg bg-blue-50">
                  <div className="mb-2 font-semibold text-blue-800">Chi tiết giá bao gồm vé máy bay:</div>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex justify-between">
                      <span>• Giá tour người lớn:</span>
                      <span>{getTourPrice(tours?.tour).toLocaleString()} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Vé máy bay người lớn:</span>
                      <span>{getFlightPrice(tours?.tour, 'adult').toLocaleString()} ₫</span>
                    </div>
                    {kidCount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>• Giá tour trẻ em:</span>
                          <span>{(tours?.tour?.priceChildren || 0).toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Vé máy bay trẻ em:</span>
                          <span>{getFlightPrice(tours?.tour, 'child').toLocaleString()} ₫</span>
                        </div>
                      </>
                    )}
                    {childCount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>• Giá tour trẻ nhỏ:</span>
                          <span>{(tours?.tour?.priceLittleBaby || 0).toLocaleString()} ₫</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Vé máy bay trẻ nhỏ:</span>
                          <span>{getFlightPrice(tours?.tour, 'toddler').toLocaleString()} ₫</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Người lớn</span>
                <span>{adultCount} x {getTotalPriceByAge(tours?.tour, 'adult').toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trẻ em</span>
                <span>{kidCount} x {getTotalPriceByAge(tours?.tour, 'child').toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trẻ nhỏ</span>
                <span>{childCount} x {getTotalPriceByAge(tours?.tour, 'toddler').toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Em bé</span>
                <span>{babyCount} x 0₫</span>
              </div>
              <div className="flex justify-between text-sm">
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">Tổng tiền</span>
                <span className="text-2xl font-bold text-red-600">
                  {totalPrice.toLocaleString()} ₫
                </span>
              </div>
              <div className="p-8 transition-all duration-300 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 text-white rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
                      Phương thức thanh toán
                    </h2>
                    <p className="text-sm text-gray-500">Chọn cách thức thanh toán phù hợp với bạn</p>
                  </div>
                </div>

                <Form.Item name="payment_method" rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}>
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    <label className="relative cursor-pointer group">
                      <input
                        type="radio"
                        value="cash"
                        name="payment_method"
                        className="sr-only peer"
                        onChange={(e) => {
                          // Remove checked class from all payment method cards
                          document.querySelectorAll('[data-payment-method]').forEach(card => {
                            card.classList.remove('border-green-500', 'border-blue-500', 'shadow-lg', 'shadow-green-100', 'shadow-blue-100');
                            card.classList.add('border-gray-200');
                          });
                          // Remove checked class from all radio indicators
                          document.querySelectorAll('[data-radio-indicator]').forEach(indicator => {
                            indicator.classList.remove('border-green-500', 'border-blue-500', 'bg-green-500', 'bg-blue-500');
                            indicator.classList.add('border-gray-300');
                          });
                          // Remove checked class from all check icons
                          document.querySelectorAll('[data-check-icon]').forEach(icon => {
                            icon.classList.remove('opacity-100');
                            icon.classList.add('opacity-0');
                          });
                          
                          // Add checked class to selected card
                          const card = e.target.closest('label').querySelector('[data-payment-method]');
                          card.classList.remove('border-gray-200');
                          card.classList.add('border-green-500', 'shadow-lg', 'shadow-green-100');
                          
                          // Add checked class to selected radio indicator
                          const indicator = e.target.closest('label').querySelector('[data-radio-indicator]');
                          indicator.classList.remove('border-gray-300');
                          indicator.classList.add('border-green-500', 'bg-green-500');
                          
                          // Add checked class to selected check icon
                          const checkIcon = e.target.closest('label').querySelector('[data-check-icon]');
                          checkIcon.classList.remove('opacity-0');
                          checkIcon.classList.add('opacity-100');
                        }}
                      />
                      <div data-payment-method className="p-8 transition-all duration-300 bg-white border-2 border-gray-200 rounded-3xl hover:shadow-xl hover:border-green-300 group-hover:-translate-y-1">
                        <div className="space-y-4 text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-br from-green-400 to-emerald-500">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v2H6V8zm8 0v4h-2v-2a2 2 0 012-2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">Tiền mặt</h3>
                            <p className="text-sm leading-relaxed text-gray-600">Thanh toán trực tiếp tại văn phòng công ty</p>
                          </div>
                        </div>
                        <div data-radio-indicator className="absolute flex items-center justify-center w-6 h-6 transition-all duration-200 border-2 border-gray-300 rounded-full top-6 right-6">
                          <svg data-check-icon className="w-3 h-3 text-white opacity-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </label>

                    <label className="relative cursor-pointer group">
                      <input
                        type="radio"
                        value="bank_transfer"
                        name="payment_method"
                        className="sr-only peer"
                        onChange={(e) => {
                          // Remove checked class from all payment method cards
                          document.querySelectorAll('[data-payment-method]').forEach(card => {
                            card.classList.remove('border-green-500', 'border-blue-500', 'shadow-lg', 'shadow-green-100', 'shadow-blue-100');
                            card.classList.add('border-gray-200');
                          });
                          // Remove checked class from all radio indicators
                          document.querySelectorAll('[data-radio-indicator]').forEach(indicator => {
                            indicator.classList.remove('border-green-500', 'border-blue-500', 'bg-green-500', 'bg-blue-500');
                            indicator.classList.add('border-gray-300');
                          });
                          // Remove checked class from all check icons
                          document.querySelectorAll('[data-check-icon]').forEach(icon => {
                            icon.classList.remove('opacity-100');
                            icon.classList.add('opacity-0');
                          });
                          
                          // Add checked class to selected card
                          const card = e.target.closest('label').querySelector('[data-payment-method]');
                          card.classList.remove('border-gray-200');
                          card.classList.add('border-blue-500', 'shadow-lg', 'shadow-blue-100');
                          
                          // Add checked class to selected radio indicator
                          const indicator = e.target.closest('label').querySelector('[data-radio-indicator]');
                          indicator.classList.remove('border-gray-300');
                          indicator.classList.add('border-blue-500', 'bg-blue-500');
                          
                          // Add checked class to selected check icon
                          const checkIcon = e.target.closest('label').querySelector('[data-check-icon]');
                          checkIcon.classList.remove('opacity-0');
                          checkIcon.classList.add('opacity-100');
                        }}
                      />
                      <div data-payment-method className="p-8 transition-all duration-300 bg-white border-2 border-gray-200 rounded-3xl hover:shadow-xl hover:border-blue-300 group-hover:-translate-y-1">
                        <div className="space-y-4 text-center">
                          <div className="flex items-center justify-center w-16 h-16 mx-auto transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">VNPay</h3>
                            <p className="text-sm leading-relaxed text-gray-600">Thanh toán trực tuyến an toàn & nhanh chóng</p>
                          </div>
                        </div>
                        <div data-radio-indicator className="absolute flex items-center justify-center w-6 h-6 transition-all duration-200 border-2 border-gray-300 rounded-full top-6 right-6">
                          <svg data-check-icon className="w-3 h-3 text-white opacity-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>
                </Form.Item>

                <div className="pt-6 mt-6 border-t border-gray-200">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    Tùy chọn thanh toán
                  </h3>

                  <Form.Item name="isFullPayment" initialValue={false}>
                    <div className="space-y-4">
                      <label className="relative block cursor-pointer group">
                        <input
                          type="radio"
                          value="false"
                          name="isFullPayment"
                          defaultChecked
                          className="sr-only peer"
                          onChange={(e) => {
                            // Remove checked class from all payment option cards
                            document.querySelectorAll('[data-payment-option]').forEach(card => {
                              card.classList.remove('border-orange-500', 'border-emerald-500', 'bg-gradient-to-br', 'from-orange-100', 'to-red-100', 'from-emerald-100', 'to-green-100');
                              card.classList.add('border-gray-200', 'bg-gradient-to-br', 'from-orange-50', 'to-red-50');
                            });
                            // Remove checked class from all radio indicators
                            document.querySelectorAll('[data-payment-radio-indicator]').forEach(indicator => {
                              indicator.classList.remove('border-orange-500', 'border-emerald-500', 'bg-orange-500', 'bg-emerald-500');
                              indicator.classList.add('border-gray-300');
                            });
                            // Remove checked class from all check icons
                            document.querySelectorAll('[data-payment-check-icon]').forEach(icon => {
                              icon.classList.remove('opacity-100');
                              icon.classList.add('opacity-0');
                            });
                            
                            // Add checked class to selected card
                            const card = e.target.closest('label').querySelector('[data-payment-option]');
                            card.classList.remove('border-gray-200', 'bg-gradient-to-br', 'from-orange-50', 'to-red-50');
                            card.classList.add('border-orange-500', 'bg-gradient-to-br', 'from-orange-100', 'to-red-100');
                            
                            // Add checked class to selected radio indicator
                            const indicator = e.target.closest('label').querySelector('[data-payment-radio-indicator]');
                            indicator.classList.remove('border-gray-300');
                            indicator.classList.add('border-orange-500', 'bg-orange-500');
                            
                            // Add checked class to selected check icon
                            const checkIcon = e.target.closest('label').querySelector('[data-payment-check-icon]');
                            checkIcon.classList.remove('opacity-0');
                            checkIcon.classList.add('opacity-100');
                          }}
                        />
                        <div data-payment-option className="p-6 transition-all duration-300 border-2 border-gray-200 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:shadow-lg group-hover:border-orange-300">
                          <div className="flex items-start gap-4">
                            <div className="p-2 mt-1 text-white bg-orange-500 rounded-full shadow-sm">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v2H6V8zm8 0v4h-2v-2a2 2 0 012-2z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">Đặt cọc 50%</h4>
                              <p className="mb-1 text-2xl font-bold text-orange-600">{Math.round(totalPrice * 0.5).toLocaleString()} ₫</p>
                              <p className="text-sm text-gray-600">Thanh toán phần còn lại trước khi khởi hành tour</p>
                            </div>
                            <div data-payment-radio-indicator className="flex items-center justify-center w-6 h-6 transition-all duration-200 border-2 border-gray-300 rounded-full">
                              <svg data-payment-check-icon className="w-3 h-3 text-white opacity-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </label>

                      <label className="relative block cursor-pointer group">
                        <input
                          type="radio"
                          value="true"
                          name="isFullPayment"
                          className="sr-only peer"
                          onChange={(e) => {
                            // Remove checked class from all payment option cards
                            document.querySelectorAll('[data-payment-option]').forEach(card => {
                              card.classList.remove('border-orange-500', 'border-emerald-500', 'bg-gradient-to-br', 'from-orange-100', 'to-red-100', 'from-emerald-100', 'to-green-100');
                              card.classList.add('border-gray-200', 'bg-gradient-to-br', 'from-orange-50', 'to-red-50');
                            });
                            // Remove checked class from all radio indicators
                            document.querySelectorAll('[data-payment-radio-indicator]').forEach(indicator => {
                              indicator.classList.remove('border-orange-500', 'border-emerald-500', 'bg-orange-500', 'bg-emerald-500');
                              indicator.classList.add('border-gray-300');
                            });
                            // Remove checked class from all check icons
                            document.querySelectorAll('[data-payment-check-icon]').forEach(icon => {
                              icon.classList.remove('opacity-100');
                              icon.classList.add('opacity-0');
                            });
                            
                            // Add checked class to selected card
                            const card = e.target.closest('label').querySelector('[data-payment-option]');
                            card.classList.remove('border-gray-200', 'bg-gradient-to-br', 'from-orange-50', 'to-red-50');
                            card.classList.add('border-emerald-500', 'bg-gradient-to-br', 'from-emerald-100', 'to-green-100');
                            
                            // Add checked class to selected radio indicator
                            const indicator = e.target.closest('label').querySelector('[data-payment-radio-indicator]');
                            indicator.classList.remove('border-gray-300');
                            indicator.classList.add('border-emerald-500', 'bg-emerald-500');
                            
                            // Add checked class to selected check icon
                            const checkIcon = e.target.closest('label').querySelector('[data-payment-check-icon]');
                            checkIcon.classList.remove('opacity-0');
                            checkIcon.classList.add('opacity-100');
                          }}
                        />
                        <div data-payment-option className="p-6 transition-all duration-300 border-2 border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl hover:shadow-lg group-hover:border-emerald-300">
                          <div className="flex items-start gap-4">
                            <div className="p-2 mt-1 text-white rounded-full shadow-sm bg-emerald-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900">Thanh toán đầy đủ</h4>
                              <p className="mb-1 text-2xl font-bold text-emerald-600">{totalPrice.toLocaleString()} ₫</p>
                              <p className="text-sm text-gray-600">Thanh toán toàn bộ chi phí ngay bây giờ</p>
                            </div>
                            <div data-payment-radio-indicator className="flex items-center justify-center w-6 h-6 transition-all duration-200 border-2 border-gray-300 rounded-full">
                              <svg data-payment-check-icon className="w-3 h-3 text-white opacity-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </Form.Item>

                  <div className="flex items-center justify-center gap-4 pt-4 mt-6 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Chấp nhận thanh toán qua:</span>
                    <div className="flex items-center gap-2">
                      <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/visaLogoColored.svg" alt="Visa" className="h-6 transition-opacity opacity-70 hover:opacity-100" />
                      <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/masterCardLogo.svg" alt="MasterCard" className="h-6 transition-opacity opacity-70 hover:opacity-100" />
                      <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/paymentCard/amexLogo.svg" alt="American Express" className="h-6 transition-opacity opacity-70 hover:opacity-100" />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl border-0"
                loading={isLoading}
                disabled={isLoading}
                size="large"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Hoàn tất đặt tour</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </Form>
      </div>

      {/* Modal thông báo khi chọn thanh toán cọc nhưng không chọn VNPay */}
      <Modal
        title={<div className="text-xl font-bold text-blue-700">Lựa chọn phương thức đặt cọc</div>}
        open={cashDepositModalVisible}
        onCancel={isLoading ? undefined : () => setCashDepositModalVisible(false)}
        closable={!isLoading}
        maskClosable={!isLoading}
        footer={null}
        width={600}
        centered
      >
        <div className="py-4">
          <div className="flex items-center mb-4 text-yellow-500">
            <span className="mr-3 text-3xl">ℹ️</span>
            <span className="text-lg font-semibold">Lựa chọn phương thức thanh toán đặt cọc</span>
          </div>

          <p className="mb-4 text-gray-700">
            Bạn có thể chọn một trong các phương thức thanh toán đặt cọc sau:
          </p>

          <div className="space-y-4">
            {/* Tùy chọn thanh toán VNPay */}
            <div
              className={`bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 ${!isLoading ? 'hover:bg-blue-100' : 'opacity-50'}`}
            >
              <div className="flex items-center mb-2">
                <span className="mr-2 text-xl">💳</span>
                <h3 className="font-semibold text-blue-700">Thanh toán qua VNPay (Khuyến nghị)</h3>
              </div>
              <ul className="pl-5 text-gray-700 list-disc">
                <li>Số tiền cần thanh toán: <span className="font-semibold text-red-600">{Math.round(totalPrice * 0.5).toLocaleString()} ₫</span></li>
                <li>Thanh toán ngay trực tuyến qua thẻ</li>
                <li>Xác nhận đặt tour ngay lập tức</li>
                <li>Đảm bảo giữ chỗ cho tour</li>
              </ul>
              <div className="mt-3 text-right">
                <Button
                  type="primary"
                  onClick={handleDepositConfirm}
                  className="bg-blue-600"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Tiếp tục với VNPay"}
                </Button>
              </div>
            </div>

            {/* Tùy chọn thanh toán tiền mặt */}
            <div
              className={`bg-green-50 p-4 rounded-lg border border-green-200 ${!isLoading ? 'hover:bg-green-100' : 'opacity-50'}`}
            >
              <div className="flex items-center mb-2">
                <span className="mr-2 text-xl">💵</span>
                <h3 className="font-semibold text-green-700">Thanh toán tiền mặt tại văn phòng</h3>
              </div>
              <ul className="pl-5 text-gray-700 list-disc">
                <li>Số tiền cần đặt cọc: <span className="font-semibold text-red-600">{Math.round(totalPrice * 0.5).toLocaleString()} ₫</span></li>
                <li>Địa chỉ: Số 81A ngõ 295 - Phố Bằng Liệt - Phường Lĩnh Nam - Quận Hoàng Mai - Hà Nội</li>
                <li>Thời gian: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7</li>
                <li><span className="font-medium text-red-500">Lưu ý:</span> Tour chỉ được xác nhận sau khi đã thanh toán đặt cọc</li>
              </ul>
              <div className="mt-3 text-right">
                <Button
                  type="default"
                  onClick={handleCashPayment}
                  className="text-white bg-green-600 hover:bg-green-700"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Thanh toán tiền mặt"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={() => setCashDepositModalVisible(false)}
              disabled={isLoading}
            >
              Quay lại chỉnh sửa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cash Deposit Modal */}
      <CashDepositModal
        visible={cashDepositModalVisible}
        onClose={() => setCashDepositModalVisible(false)}
        onConfirmCash={handleCashDepositConfirm}
        onChooseVNPay={handleCashDepositChooseVNPay}
        bookingCode={tours?.tour?.nameTour || ''}
        totalAmount={totalPrice}
        depositAmount={calculateDepositAmount()}
      />

    </div>
  );
};

export default Checkout;
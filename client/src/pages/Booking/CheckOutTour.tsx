/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import instanceClient from "../../../configs/instance";
import dayjs from "dayjs";

const CheckOutTour = () => {
  const [showGuestList, setShowGuestList] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const { data } = useQuery({
    queryKey: ['bookingTour', id],
    queryFn: () => instanceClient.get(`bookingTour/${id}`)
  });
  console.log(data?.data?.booking);
  console.log('Booking object structure:', JSON.stringify(data?.data?.booking, null, 2));
  const booking = data?.data?.booking;
  const paymentInfo = data?.data?.paymentInfo;

  // Lay thong tin tu state duoc truyen tu InfoUser
  const bookingData = location.state?.bookingData;
  const isCompletePayment = location.state?.isCompletePayment;
  const remainingAmount = location.state?.remainingAmount;

  // Xu ly thanh toan VNPay
  const handleVNPayPayment = async (amount: number, paymentType: 'deposit' | 'full' | 'remaining') => {
    try {
      setIsProcessingPayment(true);

      // Kiểm tra và lấy userId
      let userId = null;

      // Thử lấy từ booking object trước
      if (booking?.userId?._id) {
        userId = booking.userId._id;
      } else if (booking?.userId && booking.userId !== null) {
        userId = booking.userId;
      } else if (bookingData?.userId) {
        userId = bookingData.userId;
      } else {
        // Thử lấy từ localStorage với error handling
        try {
          const userFromStorage = localStorage.getItem('user');
          if (userFromStorage) {
            const user = JSON.parse(userFromStorage);
            userId = user._id || user.id;
          }
        } catch (parseError) {
          console.error('Lỗi parse user từ localStorage:', parseError);
        }

        // Thử lấy từ sessionStorage
        if (!userId) {
          try {
            const userFromSession = sessionStorage.getItem('user');
            if (userFromSession) {
              const user = JSON.parse(userFromSession);
              userId = user._id || user.id;
            }
          } catch (parseError) {
            console.error('Lỗi parse user từ sessionStorage:', parseError);
          }
        }

        // Thử lấy từ Clerk localStorage
        if (!userId) {
          const clerkUserId = localStorage.getItem('userId');
          if (clerkUserId) {
            userId = clerkUserId;
          }
        }

        // Thử lấy từ URL params
        if (!userId) {
          const urlParams = new URLSearchParams(window.location.search);
          userId = urlParams.get('userId');
        }

        // Thử lấy từ auth token
        if (!userId) {
          try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
              // Decode JWT token để lấy userId (nếu có)
              const payload = JSON.parse(atob(token.split('.')[1]));
              userId = payload.userId || payload.id;
            }
          } catch (error) {
            console.error('Lỗi decode token:', error);
          }
        }
      }

      if (!userId) {
        throw new Error('Không tìm thấy userId. Vui lòng đăng nhập lại.');
      }

      console.log('UserId được sử dụng:', userId);

      // Sử dụng booking hiện tại thay vì tạo mới
      const existingBookingData = {
        bookingId: booking?._id, // ID của booking hiện tại
        userId: userId,
        slotId: booking?.slotId?._id || booking?.slotId,
        fullNameUser: booking?.fullNameUser,
        phone: booking?.phone,
        email: booking?.email,
        adultPassengers: booking?.adultPassengers || [],
        payment_method: 'bank_transfer',
        isFullPayment: paymentType === 'full',
        adultsTour: booking?.adultsTour || 0,
        childrenTour: booking?.childrenTour || 0,
        toddlerTour: booking?.toddlerTour || 0,
        infantTour: booking?.infantTour || 0,
        childPassengers: booking?.childPassengers || [],
        toddlerPassengers: booking?.toddlerPassengers || [],
        infantPassengers: booking?.infantPassengers || [],
        totalPriceTour: amount, // Sử dụng amount được truyền vào
        paymentType: paymentType // Thêm loại thanh toán
      };

      console.log('Gửi dữ liệu thanh toán cho booking hiện tại:', existingBookingData);

      const response = await instanceClient.post('/vnpay/process-payment', existingBookingData);

      if (response.data.paymentUrl) {
        console.log('Chuyển hướng đến VNPay:', response.data.paymentUrl);
        // Chuyen huong den VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      console.error('Loi khi tao thanh toan VNPay:', error);
      alert('Co loi xay ra khi tao thanh toan. Vui long thu lai.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Xu ly thanh toan dat coc
  const handleDepositPayment = () => {
    const depositAmount = booking?.depositAmount || (booking?.totalPriceTour * 0.5); // 50% dat coc
    handleVNPayPayment(depositAmount, 'deposit');
  };

  // Xu ly thanh toan toan bo
  const handleFullPayment = () => {
    handleVNPayPayment(booking?.totalPriceTour, 'full');
  };

  // Xu ly hoan tat thanh toan (so tien con lai)
  const handleCompletePaymentAction = () => {
    const remaining = remainingAmount || (booking?.totalPriceTour - (booking?.depositAmount || 0));
    handleVNPayPayment(remaining, 'remaining');
  };

  // Xu ly hoan tien
  const handleRefund = async (refundType: 'customer_cancellation' | 'company_cancellation' | 'technical_error', refundReason: string) => {
    try {
      setIsProcessingPayment(true);

      const refundData = {
        bookingId: booking?._id,
        refundType,
        refundReason,
        refundAmount: null // Để backend tính toán theo chính sách
      };

      console.log('Gửi yêu cầu hoàn tiền:', refundData);

      const response = await instanceClient.post('/vnpay/process-refund', refundData);

      if (response.data.refundUrl) {
        console.log('Chuyển hướng đến VNPay hoàn tiền:', response.data.refundUrl);
        window.location.href = response.data.refundUrl;
      } else {
        throw new Error('Không nhận được URL hoàn tiền');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý hoàn tiền:', error);
      alert('Có lỗi xảy ra khi xử lý hoàn tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Cho thanh toan';
      case 'confirmed':
        return 'Da xac nhan';
      case 'completed':
        return 'Da thanh toan';
      case 'cancelled':
        return 'Da huy';
      default:
        return 'Khong ro';
    }
  };

  return (
    <div className="bg-gradient-to-br min-h-screen py-8 px-2 md:px-8 mt-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Thong tin lien lac & Chi tiet booking */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Thong tin lien lac */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 transition hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white text-lg font-bold shadow">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.7 0 8 1.34 8 4v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2c0-2.66 5.3-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" /></svg>
              </div>
              <div className="font-bold text-blue-700 text-base bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded">THONG TIN LIEN LAC</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">Ho ten</div>
                <div className="text-gray-900">{booking?.fullNameUser}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Email</div>
                <div className="text-gray-900">{booking?.email}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Dien thoai</div>
                <div className="text-gray-900">{booking?.phone}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Dia chi</div>
                <div className="text-gray-900">{booking?.address}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Ghi chu</div>
                <div className="text-gray-900">{booking?.note}</div>
              </div>
            </div>
          </div>

          {/* Chi tiet booking */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 transition hover:shadow-2xl">
            <div className="font-bold text-blue-700 text-base mb-4 bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded">CHI TIET BOOKING</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-2">
                <div>Ngay tao: <span className="font-medium text-gray-900">{dayjs(booking?.createdAt).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</span></div>
                <div>Tri gia booking: <span className="font-medium text-gray-900">{booking?.totalPriceTour.toLocaleString()} d</span></div>
                <div>Tinh trang: <span className="font-medium text-yellow-600">{getPaymentStatusLabel(booking?.payment_status)}</span></div>
                <div>Phuong thuc thanh toan: <span className="font-medium text-gray-900">{booking?.payment_method === 'cash' ? 'Tien mat' : 'Chuyen khoan'}</span></div>
              </div>
            </div>

            {/* Thong tin deadline thanh toan tien mat */}
            {booking?.payment_method === 'cash' && paymentInfo && (
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-orange-700">THONG TIN THANH TOAN TIEN MAT</span>
                </div>

                {paymentInfo.isExpired ? (
                  <div className="text-red-600">
                    <p className="font-semibold">CANH BAO: DA QUA HAN THANH TOAN</p>
                    <p className="text-sm">Han thanh toan: {new Date(paymentInfo.deadline).toLocaleString('vi-VN')}</p>
                    <p className="text-sm mt-1">Tour nay se duoc tu dong huy do qua han thanh toan tien coc.</p>
                  </div>
                ) : (
                  <div className="text-orange-700">
                    <p className="font-semibold">Thoi gian con lai: {paymentInfo.timeRemainingText}</p>
                    <p className="text-sm">Han thanh toan: {new Date(paymentInfo.deadline).toLocaleString('vi-VN')}</p>
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Dia chi thanh toan:</p>
                      <p>So 81A ngo 295 - Pho Bang Liet - Phuong Linh Nam - Quan Hoang Mai - Ha Noi</p>
                      <p className="font-medium mt-1">Thoi gian lam viec:</p>
                      <p>9h00 - 17h30 (Thu 2 - Thu 6) | 9h00 - 12h00 (Thu 7)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danh sach hanh khach (accordion) */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 transition hover:shadow-2xl">
            <button
              className="w-full flex items-center justify-between font-bold text-blue-700 text-base mb-4 bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded focus:outline-none select-none"
              onClick={() => setShowGuestList((v) => !v)}
              aria-expanded={showGuestList}
              aria-controls="guest-list-table"
              type="button"
            >
              <span>DANH SACH HANH KHACH</span>
              <span className={`transition-transform duration-300 ${showGuestList ? '' : 'rotate-180'}`}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15l6-6 6 6" /></svg>
              </span>
            </button>
            <div
              id="guest-list-table"
              className={`overflow-hidden transition-all duration-500 ${showGuestList ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
              <table className="min-w-full text-sm border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border px-3 py-2 font-semibold text-gray-700">Ho ten</th>
                    <th className="border px-3 py-2 font-semibold text-gray-700">Ngay sinh</th>
                    <th className="border px-3 py-2 font-semibold text-gray-700">Gioi tinh</th>
                    <th className="border px-3 py-2 font-semibold text-gray-700">Do tuoi</th>
                    <th className="border px-3 py-2 font-semibold text-gray-700">Phong don</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...(booking?.adultPassengers ?? []).map((p: any) => ({ ...p, group: 'Nguoi lon' })),
                    ...(booking?.childPassengers ?? []).map((p: any) => ({ ...p, group: 'Tre em' })),
                    ...(booking?.toddlerPassengers ?? []).map((p: any) => ({ ...p, group: 'Tre nho' })),
                    ...(booking?.infantPassengers ?? []).map((p: any) => ({ ...p, group: 'Em be' })),
                  ].map((passenger, index) => {
                    const birthDate = new Date(passenger.birthDate);
                    const age = new Date().getFullYear() - birthDate.getFullYear();
                    return (
                      <tr key={index} className="hover:bg-blue-50 transition">
                        <td className="border px-3 py-2">{passenger.fullName}</td>
                        <td className="border px-3 py-2">
                          {birthDate.toLocaleDateString('vi-VN')}
                        </td>
                        <td className="border px-3 py-2">{passenger.gender}</td>
                        <td className="border px-3 py-2">
                          {passenger.group} ({age} tuoi)
                        </td>
                        <td className="border px-3 py-2">
                          {passenger.singleRoom ? 'Co' : 'Khong'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="border px-3 py-2 text-right font-semibold" colSpan={4}>Tong cong:</td>
                    <td className="border px-3 py-2 text-red-600 font-bold">{booking?.totalPriceTour.toLocaleString()} d</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Phieu xac nhan booking */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-3 transition hover:shadow-2xl">
            <div className="font-bold text-blue-700 text-base mb-2 bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded">PHIEU XAC NHAN BOOKING</div>
            <div className="flex gap-3 items-center">
              <img src={booking?.slotId?.tour?.imageTour[0]} alt="hotel" className="w-24 h-20 object-cover rounded-xl border border-blue-200 shadow" />
              <div className="text-lg font-medium text-gray-700">
                {booking?.slotId?.tour?.nameTour}
              </div>
            </div>
            <div className="text-sm">Mã tour: <span className="font-medium text-gray-700">{booking?.slotId?.tour?._id?.slice(0, 6).toUpperCase()}</span></div>
            <div className="font-semibold text-xs mt-3 text-blue-700">THONG TIN DI CHUYEN</div>

            {/* Chuyen di */}
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="text-gray-700">Ngay di - {dayjs(booking?.slotId?.dateTour).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1-3.29-2.5-4.03v8.06c1.5-.74 2.5-2.26 2.5-4.03z" /></svg>
              <span>Thong bao!</span>
            </div>

            {/* Phan thanh toan */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="font-bold text-blue-700 text-base mb-4 bg-gradient-to-r from-blue-100 to-transparent px-2 py-1 rounded">THANH TOAN</div>

              {/* Hien thi nut thanh toan dua tren trang thai */}
              {booking?.payment_status === 'pending' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    Chon hinh thuc thanh toan:
                  </div>

                  {/* Nut thanh toan dat coc */}
                  <button
                    onClick={handleDepositPayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                        Dat coc {((booking?.depositAmount || booking?.totalPriceTour * 0.5) || 0).toLocaleString()} d
                      </>
                    )}
                  </button>

                  {/* Nut thanh toan toan bo */}
                  <button
                    onClick={handleFullPayment}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                        Thanh toan toan bo {(booking?.totalPriceTour || 0).toLocaleString()} d
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Nut hoan tat thanh toan cho truong hop da dat coc */}
              {(booking?.payment_status === 'confirmed' || isCompletePayment) && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    Hoan tat thanh toan so tien con lai:
                  </div>

                  <button
                    onClick={handleCompletePaymentAction}
                    disabled={isProcessingPayment}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Hoan tat thanh toan {((remainingAmount || (booking?.totalPriceTour - (booking?.depositAmount || 0))) || 0).toLocaleString()} d
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Thong bao da thanh toan day du */}
              {booking?.payment_status === 'completed' && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Da thanh toan day du
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p>Tour đã được thanh toán hoàn tất.</p>
                    <p>Nếu cần hủy tour, vui lòng liên hệ admin.</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 text-center">
                Thanh toan an toan qua VNPay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutTour;
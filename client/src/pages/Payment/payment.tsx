
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instanceClient from "../../../configs/instance";

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    instanceClient.get(`/bookingTour/${bookingId}`)
      .then(res => {
        setBooking(res.data.booking);
        setLoading(false);
      })
      .catch(() => {
        setError("Không tìm thấy thông tin booking.");
        setLoading(false);
      });
  }, [bookingId]);

  const handleConfirmPayment = async () => {
    if (!bookingId) return;
    setConfirming(true);
    try {
      await instanceClient.put(`/bookingTour/confirm-payment/${bookingId}`);
      navigate("/");
    } catch (err) {
      setError("Có lỗi khi xác nhận thanh toán.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!booking) return null;

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen">
      <main className="max-w-4xl px-4 py-10 mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Thanh toán đơn tour</h1>
                <p className="text-blue-100 mt-1">Quét mã QR hoặc chuyển khoản để hoàn tất thanh toán</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Về trang chủ
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* QR Payment Section */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5.01M4 20h4.01" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Quét mã QR để thanh toán</h2>
              </div>
              
              <div className="grid items-center grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-3 text-center">
                  <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                    <img src="https://img.vietqr.io/image/970422-226485769-compact2.png" alt="QR Code" className="h-40 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Quét mã để thanh toán</p>
                </div>
                
                <div className="space-y-3 text-sm lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-gray-600">Tên tour:</p>
                      <p className="font-semibold text-gray-800">{booking.slotId?.tour?.nameTour || "N/A"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-gray-600">Mã booking:</p>
                      <p className="font-semibold text-gray-800 font-mono">{booking._id}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-gray-600">Chủ tài khoản:</p>
                      <p className="font-semibold text-gray-800">Công Ty TNHH Du Lịch Và Dịch Vụ Mùi Vị Vivu</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-gray-600">Ngân hàng:</p>
                      <p className="font-semibold text-gray-800">MB Bank</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <p className="text-gray-600 mb-1">Số tiền cần thanh toán:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(booking.isDeposit && !booking.isFullyPaid ? booking.depositAmount : booking.totalPriceTour)?.toLocaleString()} VND
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-600">Nội dung chuyển khoản:</p>
                    <p className="font-semibold text-gray-800 font-mono">{booking._id}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Test Payment Confirmation Section */}
            <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-dashed border-orange-300">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Chức năng Test - Dự án thử nghiệm</h2>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-3 mb-4">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Lưu ý:</strong> Đây là dự án thử nghiệm, chức năng thanh toán QR chưa thể sử dụng thực tế. Sử dụng các nút bên dưới để test.
                    </p>
                    <p className="text-xs text-gray-500">
                      Trong môi trường thực tế, khách hàng sẽ quét mã QR để thanh toán trước khi xác nhận.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    className="flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleConfirmPayment}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xác nhận...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Xác nhận thanh toán thành công
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Quay về trang chủ
                  </button>
                </div>
              </div>
            </section>

            {/* Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Tổng tiền:</span>
                <span className="text-2xl font-bold text-green-600">{booking.totalPriceTour?.toLocaleString()} VND</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

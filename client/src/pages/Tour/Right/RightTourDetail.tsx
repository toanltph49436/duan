/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { generateTourCode } from "../../../utils/tourUtils";
import { useState } from "react";
import Login from "../../../components/Login";

interface Slot {
    dateTour: string; // định dạng 'DD-MM-YYYY'
    availableSeats: number;
    _id: string;
    dateTourId: string;
    assignedEmployee?: {
        firstName?: string;
        lastName?: string;
        full_name?: string;
        email?: string;
        employee_id?: string;
        position?: string;
    };
}

interface RightTourDetailProps {
    selectedRoom?: {
        _id: string;
        nameRoom: string;
        priceRoom: string;
        typeRoom?: string;
        capacityRoom: number;
    }[] | null;
    onChooseDate: () => void;
    selectedDate: Date | null;
    tour: {
        price?: number;
        _id?: string;
        code?: string;
        departure_location?: string;
        duration?: string;
        assignedEmployee?: {
            firstName?: string;
            lastName?: string;
            full_name?: string;
            email?: string;
            employee_id?: string;
            position?: string;
        };
    };
    slots?: Slot[];
}

const RightTourDetail = ({
    onChooseDate,
    selectedDate,
    tour,
    slots = []
}: RightTourDetailProps) => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const userId = localStorage.getItem("userId");
    const selectedDateFormatted = selectedDate
        ? dayjs(selectedDate).format("DD-MM-YYYY")
        : null;

    const selectedSlot = slots?.find(slot =>
        dayjs(slot.dateTour).isSame(selectedDate, "day")
    );
    const navigate = useNavigate();
    
    const handleBooking = () => {
        // Kiểm tra xem người dùng đã chọn ngày chưa
        if (!selectedDate) {
            toast.error("Vui lòng chọn ngày khởi hành!");
            return;
        }

        // Kiểm tra xem có slot nào cho ngày đã chọn không
        if (!selectedSlot) {
            toast.error("Không tìm thấy thông tin ngày khởi hành, vui lòng chọn ngày khác!");
            return;
        }
        
        if (!userId) {
            toast.error("Vui lòng đăng nhập để đặt tour!");
            setShowLoginModal(true);
            return;
        }

        // Kiểm tra số chỗ còn trống
        if (selectedSlot.availableSeats === 0) {
            toast.error("Ngày này đã hết chỗ, không thể đặt tour! Vui lòng chọn ngày khác");
            return;
        }

        // Kiểm tra ID của slot
        if (!selectedSlot._id) {
            toast.error("Lỗi thông tin ngày khởi hành, vui lòng chọn ngày khác!");
            console.error("Selected slot has no ID:", selectedSlot);
            return;
        }

        // Nếu mọi thứ đều hợp lệ, chuyển hướng đến trang đặt tour
        console.log("Navigating to booking page with slot ID:", selectedSlot._id);
        navigate(`/date/slot/${selectedSlot._id}`);
    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        // Sau khi đăng nhập thành công, tự động thực hiện đặt tour
        setTimeout(() => {
            handleBooking();
        }, 100);
    };
    console.log(selectedSlot);
    console.log(tour);
    const getTourPrice = (tour: any) => {
        return tour?.finalPrice ?? tour?.price ?? 0;
    };

    const getFlightPrice = (tour: any) => {
        return tour?.includesFlight ? (tour?.flightPrice ?? 0) : 0;
    };

    const getTotalPrice = (tour: any) => {
        return getTourPrice(tour) + getFlightPrice(tour);
    };

    return (
        <>
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header với gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">💰 Thông tin giá</h3>
                        {selectedSlot?.availableSeats && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-sm font-medium">
                                    Còn {selectedSlot.availableSeats} chỗ
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {!selectedDate || !tour ? (
                        <>
                            {/* Price Display */}
                            <div className="text-center mb-6">
                                <div className="text-gray-600 text-sm mb-2">Giá khởi điểm từ</div>
                                
                                {/* Giá tour */}
                                <div className="mb-2">
                                    <div className="text-sm text-gray-600 mb-1">Giá tour</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {getTourPrice(tour).toLocaleString("vi-VN")} đ
                                    </div>
                                </div>
                                
                                {/* Giá vé máy bay (nếu có) */}
                                {tour?.includesFlight && getFlightPrice(tour) > 0 && (
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-600 mb-1">Vé máy bay</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {getFlightPrice(tour).toLocaleString("vi-VN")} đ
                                        </div>
                                    </div>
                                )}
                                
                                {/* Tổng giá */}
                                <div className="border-t pt-2 mt-2">
                                    <div className="text-sm text-gray-600 mb-1">Tổng cộng</div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                        {getTotalPrice(tour).toLocaleString("vi-VN")}
                                        <span className="text-2xl">đ</span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">/ người</div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Miễn phí hủy tour (theo điều kiện)
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Hướng dẫn viên chuyên nghiệp
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Bảo hiểm du lịch toàn diện
                                </div>
                            </div>

                            <button
                                onClick={onChooseDate}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                🗓️ Chọn ngày khởi hành
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Selected Date Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
                                <div className="text-center">
                                    <div className="text-gray-600 text-sm mb-1">Ngày đã chọn</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {selectedDateFormatted}
                                    </div>
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="text-center mb-6">
                                {/* Giá tour */}
                                <div className="mb-2">
                                    <div className="text-sm text-gray-600 mb-1">Giá tour</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {getTourPrice(tour).toLocaleString("vi-VN")} đ
                                    </div>
                                </div>
                                
                                {/* Giá vé máy bay (nếu có) */}
                                {tour?.includesFlight && getFlightPrice(tour) > 0 && (
                                    <div className="mb-2">
                                        <div className="text-sm text-gray-600 mb-1">Vé máy bay</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {getFlightPrice(tour).toLocaleString("vi-VN")} đ
                                        </div>
                                    </div>
                                )}
                                
                                {/* Tổng giá */}
                                <div className="border-t pt-2 mt-2">
                                    <div className="text-sm text-gray-600 mb-1">Tổng cộng</div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                        {getTotalPrice(tour).toLocaleString("vi-VN")}
                                        <span className="text-2xl">đ</span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">/ người</div>
                                </div>
                            </div>

                            {/* Tour Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">🎫 Mã tour:</span>
                                    <span className="text-blue-600 font-bold">
                                        {generateTourCode(tour?._id || '')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">🚀 Khởi hành:</span>
                                    <span className="font-semibold">
                                        {tour?.departure_location || "..."}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">⏰ Thời gian:</span>
                                    <span className="font-semibold">{tour?.duration || "..."}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">👨‍🏫 HDV phụ trách:</span>
                                    <span className="font-semibold text-blue-600">
                                        {/* Ưu tiên lấy từ selectedSlot, nếu không có thì lấy từ tour */}
                                        {selectedSlot?.assignedEmployee?.full_name || 
                                         (selectedSlot?.assignedEmployee?.firstName && selectedSlot?.assignedEmployee?.lastName 
                                          ? `${selectedSlot.assignedEmployee.firstName} ${selectedSlot.assignedEmployee.lastName}` 
                                          : tour?.assignedEmployee?.full_name ||
                                            (tour?.assignedEmployee?.firstName && tour?.assignedEmployee?.lastName 
                                             ? `${tour.assignedEmployee.firstName} ${tour.assignedEmployee.lastName}` 
                                             : "Chưa phân công"))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 font-medium">👥 Chỗ còn:</span>
                                    <span className="text-green-600 font-bold">
                                        {selectedSlot?.availableSeats ?? "..."}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    onClick={handleBooking}
                                >
                                    🎯 Đặt tour ngay
                                </button>
                                <button
                                    onClick={onChooseDate}
                                    className="w-full py-3 rounded-xl border-2 border-blue-500 text-blue-500 font-semibold hover:bg-blue-50 transition-all duration-300"
                                >
                                    📅 Chọn ngày khác
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="text-center text-sm text-gray-500 mb-3">
                                    ✅ Đặt tour an toàn & tin cậy
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <div className="text-xs text-gray-400">🔒 Bảo mật</div>
                                    <div className="text-xs text-gray-400">⚡ Xác nhận nhanh</div>
                                    <div className="text-xs text-gray-400">💯 Uy tín</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

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
        </>
    );
};

export default RightTourDetail;
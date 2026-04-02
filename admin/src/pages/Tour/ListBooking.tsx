
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { instanceAdmin } from '../../configs/axios';
import Toast from '../../components/Toast';

interface Booking {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
    };
    slotId: {
        _id: string;
        dateTour: string;
        availableSeats: number;
        tour: {
            _id: string;
            nameTour: string;
            destination: string;
            departure_location: string;
            duration: string;
            finalPrice: number;
            imageTour: string[];
            tourType: string;
        };
    };
    fullNameUser: string;
    email: string;
    phone: string;
    totalPriceTour: number;
    adultsTour: number;
    childrenTour: number;
    toddlerTour: number;
    infantTour: number;
    payment_method: string;
    payment_status: string;
    cancelReason?: string;
    cancelRequestedAt?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    createdAt: string;
    updatedAt: string;

    // Thêm các trường cho thanh toán
    isDeposit?: boolean;
    isFullyPaid?: boolean;
    depositAmount?: number;
    depositPaidAt?: string;
    depositPaymentConfirmedBy?: string;
    depositPaymentNote?: string;
    paymentImage?: string;
    fullPaidAt?: string;
    fullPaymentConfirmedBy?: string;
    fullPaymentNote?: string;
    fullPaymentImage?: string;
    address?: string;
    note?: string;
    // Thông tin hành khách chi tiết
    adultPassengers?: Array<{
        fullName: string;
        gender: string;
        birthDate?: string;
        singleRoom?: boolean;
    }>;
    childPassengers?: Array<{
        fullName: string;
        gender: string;
        birthDate?: string;
    }>;
    toddlerPassengers?: Array<{
        fullName: string;
        gender: string;
        birthDate?: string;
    }>;
    infantPassengers?: Array<{
        fullName: string;
        gender: string;
        birthDate?: string;
    }>;
}

const ListBooking = () => {
    const { user } = useUser();
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState<string>('');

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentNote, setPaymentNote] = useState<string>('');
    const [showFullPaymentModal, setShowFullPaymentModal] = useState(false);
    const [fullPaymentNote, setFullPaymentNote] = useState<string>('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPaymentImages, setShowPaymentImages] = useState(false);
    const [paymentImage, setPaymentImage] = useState<File | null>(null);
    const [fullPaymentImage, setFullPaymentImage] = useState<File | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    });
    const queryClient = useQueryClient();


    // Lấy slotId từ URL nếu có
    const [slotId, setSlotId] = useState<string | null>(null);

    // Kiểm tra URL có chứa slotId không
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const slotIdParam = urlParams.get('slotId');
        if (slotIdParam) {
            setSlotId(slotIdParam);
        }
    }, []);

    // Fetch bookings
    const { data: bookingsData, isLoading } = useQuery({
        queryKey: ['admin-bookings', selectedStatus, searchTerm, currentPage, slotId],
        queryFn: () => instanceAdmin.get('/admin/bookings', {
            params: {
                status: selectedStatus,
                search: searchTerm,
                page: currentPage,

                limit: 10,
                slotId: slotId
            }
        })
    });

    // Lấy thông tin tour nếu có slotId
    const { data: tourData } = useQuery({
        queryKey: ['tour-slot', slotId],
        queryFn: () => instanceAdmin.get(`/date/slot/${slotId}`),
        enabled: !!slotId
    });

    const bookings = bookingsData?.data?.bookings || [];
    const pagination = bookingsData?.data?.pagination;

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId: string) =>
            instanceAdmin.put(`/admin/bookings/cancel/${bookingId}`, {
                adminId: localStorage.getItem('adminId'),
                reason: cancelReason
            }),
        onSuccess: () => {
            // Invalidate cả booking list và booking stats để cập nhật thông báo
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
            setShowCancelModal(false);
            setSelectedBooking(null);
            setCancelReason('');

            // Hiển thị thông báo thành công
            setToast({
                message: '✅ Xác nhận hủy đặt chỗ thành công! Thông báo đã được cập nhật.',
                type: 'success',
                isVisible: true
            });
        },
        onError: (error) => {
            console.error('Error canceling booking:', error);
            setToast({
                message: '❌ Có lỗi xảy ra khi xác nhận hủy đặt chỗ. Vui lòng thử lại.',
                type: 'error',
                isVisible: true
            });
        }
    });


    // Confirm cash payment mutation
    const confirmPaymentMutation = useMutation({
        mutationFn: ({ bookingId, note, image }: { bookingId: string; note?: string; image?: File }) => {
            const formData = new FormData();
            const adminId = user?.id || '';

            console.log('Creating FormData with:', { bookingId, note, image, adminId, user });

            formData.append('adminId', adminId);
            if (note) formData.append('note', note);
            if (image) formData.append('paymentImage', image);

            // Debug FormData contents
            for (let [key, value] of formData.entries()) {
                console.log('FormData entry:', key, value);
            }

            return instanceAdmin.put(`/admin/bookings/confirm-payment/${bookingId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
            setShowPaymentModal(false);
            setSelectedBooking(null);
            setPaymentNote('');

            setToast({
                message: '✅ Xác nhận thanh toán cọc thành công!',
                type: 'success',
                isVisible: true
            });
        },
        onError: (error) => {
            console.error('Error confirming payment:', error);
            setToast({
                message: '❌ Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.',
                type: 'error',
                isVisible: true
            });
        }
    });

    // Confirm full payment mutation
    const confirmFullPaymentMutation = useMutation({
        mutationFn: ({ bookingId, note, image }: { bookingId: string; note?: string; image?: File }) => {
            const formData = new FormData();
            const adminId = user?.id || '';

            formData.append('adminId', adminId);
            if (note) formData.append('note', note);
            if (image) formData.append('paymentImage', image);

            return instanceAdmin.put(`/admin/bookings/confirm-full-payment/${bookingId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['booking-stats'] });
            setShowFullPaymentModal(false);
            setSelectedBooking(null);
            setFullPaymentNote('');

            setToast({
                message: '✅ Xác nhận thanh toán toàn bộ thành công!',
                type: 'success',
                isVisible: true
            });
        },
        onError: (error) => {
            console.error('Error confirming full payment:', error);
            setToast({
                message: '❌ Có lỗi xảy ra khi xác nhận thanh toán toàn bộ. Vui lòng thử lại.',
                type: 'error',
                isVisible: true
            });
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'deposit_paid':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pending_cancel':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'refund_pending':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'refund_processing':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'refund_completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Thanh toán toàn bộ';
            case 'deposit_paid':
                return 'Đã thanh toán cọc';
            case 'pending':
                return 'Chờ thanh toán';
            case 'pending_cancel':
                return 'Chờ xác nhận hủy';
            case 'cancelled':
                return 'Đã hủy';
            case 'refund_pending':
                return 'Chờ hoàn tiền';
            case 'refund_processing':
                return 'Đang xử lý hoàn tiền';
            case 'refund_completed':
                return 'Hoàn tiền thành công';
            default:
                return 'Không xác định';
        }
    };

    const handleCancelBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
    };

    const confirmCancelBooking = () => {
        if (selectedBooking) {
            cancelBookingMutation.mutate(selectedBooking._id);
        }
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason('');
    };


    const handleConfirmPayment = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        if (!paymentImage) {
            setToast({
                message: '❌ Vui lòng chọn hình ảnh xác nhận thanh toán!',
                type: 'error',
                isVisible: true
            });
            return;
        }

        if (selectedBooking) {
            const adminId = user?.id || '';
            console.log('AdminId from Clerk user:', adminId);
            console.log('Selected booking:', selectedBooking);
            console.log('Payment note:', paymentNote);
            console.log('Payment image:', paymentImage);

            confirmPaymentMutation.mutate({
                bookingId: selectedBooking._id,
                note: paymentNote,
                image: paymentImage
            });
        } else {
            setToast({
                message: '❌ Vui lòng chọn booking để xác nhận thanh toán!',
                type: 'error',
                isVisible: true
            });
        }
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedBooking(null);
        setPaymentNote('');
        setPaymentImage(null);
    };

    const handleConfirmFullPayment = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowFullPaymentModal(true);
    };

    const confirmFullPayment = () => {
        if (!fullPaymentImage) {
            setToast({
                message: '❌ Vui lòng chọn hình ảnh xác nhận thanh toán!',
                type: 'error',
                isVisible: true
            });
            return;
        }

        if (selectedBooking) {
            const adminId = user?.id || '';
            console.log('AdminId from Clerk user for full payment:', adminId);

            confirmFullPaymentMutation.mutate({
                bookingId: selectedBooking._id,
                note: fullPaymentNote,
                image: fullPaymentImage
            });
        } else {
            setToast({
                message: '❌ Vui lòng chọn booking để xác nhận thanh toán!',
                type: 'error',
                isVisible: true
            });
        }
    };

    const closeFullPaymentModal = () => {
        setShowFullPaymentModal(false);
        setSelectedBooking(null);
        setFullPaymentNote('');
        setFullPaymentImage(null);
    };

    const handleShowDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
        setShowPaymentImages(false); // Reset state khi mở modal mới
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
        setShowPaymentImages(false); // Reset state khi đóng modal
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">

                    {slotId && tourData?.data?.data ? (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Danh sách đặt chỗ cho tour: {tourData.data.data.tour.nameTour}
                            </h1>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Ngày khởi hành:</span> {dayjs(tourData.data.data.dateTour).format('DD/MM/YYYY')}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Điểm đến:</span> {tourData.data.data.tour.destination}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Số chỗ còn trống:</span> {tourData.data.data.availableSeats}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt chỗ Tour</h1>
                            <p className="text-gray-600 mt-2">Quản lý và xử lý các đặt chỗ tour du lịch</p>
                        </>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                placeholder="Tìm theo tên khách hàng hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="pending">Chờ thanh toán</option>

                                <option value="deposit_paid">Đã thanh toán cọc</option>
                                <option value="completed">Thanh toán toàn bộ</option>
                                <option value="pending_cancel">Chờ xác nhận hủy</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Danh sách đặt chỗ ({bookings.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tour
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày khởi hành
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số hành khách
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking: Booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking.fullNameUser}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.email}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booking?.slotId?.tour?.nameTour}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booking?.slotId?.tour?.departure_location}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(booking?.slotId?.dateTour).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.adultsTour + booking.childrenTour + booking.toddlerTour + booking.infantTour} người
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {booking.totalPriceTour.toLocaleString()}₫
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.payment_status)}`}>
                                                {getStatusText(booking.payment_status)}
                                            </span>
                                            {booking.payment_status === 'pending_cancel' && booking.cancelReason && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Lý do: {booking.cancelReason}
                                                </div>
                                            )}


                                            {/* Detail Modal */}
                                            {showDetailModal && selectedBooking && (
                                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                                    <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
                                                        {/* Modal Header */}
                                                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
                                                            <div>
                                                                <h2 className="text-2xl font-bold">
                                                                    Chi tiết đặt chỗ #{selectedBooking._id.slice(-8)}
                                                                </h2>
                                                                <p className="text-blue-100 mt-1">
                                                                    {selectedBooking?.slotId?.tour?.nameTour}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={closeDetailModal}
                                                                className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                                                            >
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        {/* Modal Content */}
                                                        <div className="p-6">
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                {/* Thông tin khách hàng */}
                                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                                                    <div className="flex items-center mb-4">
                                                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                            </svg>
                                                                        </div>
                                                                        <h3 className="text-lg font-semibold text-gray-900 ml-3">Thông tin khách hàng</h3>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                                                                            <p className="text-gray-900 font-semibold break-words whitespace-normal">{selectedBooking.fullNameUser}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                                                            <p className="text-gray-900">{selectedBooking.email}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                                                                            <p className="text-gray-900">{selectedBooking.phone}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                                                                            <p className="text-gray-900 font-semibold break-words whitespace-normal">{selectedBooking.address || 'Chưa cung cấp'}</p>
                                                                        </div>
                                                                        {selectedBooking.note && (
                                                                            <div>
                                                                                <label className="text-sm font-medium text-gray-600">Ghi chú</label>
                                                                                <p className="text-gray-900 bg-white p-3 rounded-lg border">{selectedBooking.note}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Thông tin tour */}
                                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                                                    <div className="flex items-center mb-4">
                                                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            </svg>
                                                                        </div>
                                                                        <h3 className="text-lg font-semibold text-gray-900 ml-3">Thông tin tour</h3>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Tên tour</label>
                                                                            <p className="text-gray-900 font-semibold break-words whitespace-normal">{selectedBooking?.slotId?.tour?.nameTour}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Điểm khởi hành</label>
                                                                            <p className="text-gray-900">{selectedBooking?.slotId?.tour?.departure_location}</p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Ngày khởi hành</label>
                                                                            <p className="text-gray-900 font-semibold">
                                                                                {new Date(selectedBooking?.slotId?.dateTour).toLocaleDateString('vi-VN', {
                                                                                    weekday: 'long',
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Thời gian</label>
                                                                            <p className="text-gray-900">{selectedBooking?.slotId?.tour?.duration}</p>
                                                                        </div>
                                                                        <div className="bg-white p-4 rounded-lg border">
                                                                            <label className="text-sm font-medium text-gray-600">Số lượng hành khách</label>
                                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                                <div className="text-center">
                                                                                    <p className="text-2xl font-bold text-blue-600">{selectedBooking.adultsTour}</p>
                                                                                    <p className="text-xs text-gray-500">Người lớn</p>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <p className="text-2xl font-bold text-green-600">{selectedBooking.childrenTour}</p>
                                                                                    <p className="text-xs text-gray-500">Trẻ em</p>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <p className="text-2xl font-bold text-orange-600">{selectedBooking.toddlerTour}</p>
                                                                                    <p className="text-xs text-gray-500">Trẻ nhỏ</p>
                                                                                </div>
                                                                                <div className="text-center">
                                                                                    <p className="text-2xl font-bold text-purple-600">{selectedBooking.infantTour}</p>
                                                                                    <p className="text-xs text-gray-500">Em bé</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Thông tin thanh toán */}
                                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                                                    <div className="flex items-center mb-4">
                                                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                            </svg>
                                                                        </div>
                                                                        <h3 className="text-lg font-semibold text-gray-900 ml-3">Thông tin thanh toán</h3>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="bg-white p-4 rounded-lg border">
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <span className="text-gray-600">Tổng tiền tour:</span>
                                                                                <span className="text-2xl font-bold text-red-600">
                                                                                    {selectedBooking.totalPriceTour.toLocaleString()}₫
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-gray-600">Phương thức:</span>
                                                                                <span className="font-medium">
                                                                                    {selectedBooking.payment_method === 'cash' ? 'Tiền mặt' : 'VNPay'}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-sm font-medium text-gray-600">Trạng thái thanh toán</label>
                                                                            <div className="mt-2">
                                                                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.payment_status)}`}>
                                                                                    {getStatusText(selectedBooking.payment_status)}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Timeline thanh toán */}
                                                                        <div className="bg-white p-4 rounded-lg border">
                                                                            <h4 className="font-medium text-gray-900 mb-3">Lịch sử thanh toán</h4>
                                                                            <div className="space-y-3">
                                                                                {/* Đặt chỗ */}
                                                                                <div className="flex items-start space-x-3">
                                                                                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                                                                                    <div className="flex-1">
                                                                                        <div className="font-medium text-gray-900">Đặt chỗ</div>
                                                                                        <div className="text-sm text-gray-600">
                                                                                            {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Thanh toán cọc */}
                                                                                {(selectedBooking.payment_status === 'deposit_paid' || selectedBooking.payment_status === 'completed') && selectedBooking.depositPaidAt && (
                                                                                    <div className="flex items-start space-x-3">
                                                                                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                                                                                        <div className="flex-1">
                                                                                            <div className="font-medium text-gray-900">Thanh toán cọc</div>
                                                                                            <div className="text-sm text-gray-600">
                                                                                                {new Date(selectedBooking.depositPaidAt).toLocaleString('vi-VN')}
                                                                                            </div>
                                                                                            {selectedBooking.depositPaymentNote && (
                                                                                                <div className="text-sm text-gray-500 mt-1">
                                                                                                    Ghi chú: {selectedBooking.depositPaymentNote}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Thanh toán toàn bộ */}
                                                                                {selectedBooking.payment_status === 'completed' && selectedBooking.fullPaidAt && (
                                                                                    <div className="flex items-start space-x-3">
                                                                                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                                                                                        <div className="flex-1">
                                                                                            <div className="font-medium text-gray-900">Thanh toán toàn bộ</div>
                                                                                            <div className="text-sm text-gray-600">
                                                                                                {new Date(selectedBooking.fullPaidAt).toLocaleString('vi-VN')}
                                                                                            </div>
                                                                                            {selectedBooking.fullPaymentNote && (
                                                                                                <div className="text-sm text-gray-500 mt-1">
                                                                                                    Ghi chú: {selectedBooking.fullPaymentNote}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>


                                                                        {/* Nút xem hình ảnh xác nhận thanh toán - Tạm thời luôn hiển thị để test */}
                                                                        {true && (
                                                                            <div className="bg-white p-4 rounded-lg border">
                                                                                <div className="mb-4">
                                                                                    <h4 className="font-medium text-gray-900 flex items-center mb-3">
                                                                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                        </svg>
                                                                                        Hình ảnh xác nhận thanh toán
                                                                                    </h4>

                                                                                    {/* Thông tin tóm tắt */}
                                                                                    <div className="text-sm text-gray-600 mb-4">
                                                                                        Có {[selectedBooking.paymentImage, selectedBooking.fullPaymentImage].filter(Boolean).length} hình ảnh xác nhận thanh toán
                                                                                    </div>

                                                                                    {/* Nút xem hình ảnh */}
                                                                                    <button
                                                                                        onClick={() => setShowPaymentImages(!showPaymentImages)}
                                                                                        className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md hover:shadow-lg w-full"
                                                                                    >
                                                                                        {showPaymentImages ? (
                                                                                            <>
                                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-4.243-4.243m7.071 7.071L15.536 15.536m0 0l1.414 1.414M15.536 15.536a3 3 0 01-4.243 4.243" />
                                                                                                </svg>
                                                                                                Ẩn hình ảnh
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                                </svg>
                                                                                                Xem hình ảnh
                                                                                            </>
                                                                                        )}
                                                                                    </button>
                                                                                </div>

                                                                                {/* Hiển thị hình ảnh khi được toggle */}
                                                                                {showPaymentImages && (
                                                                                    <div className="space-y-6 mt-6 animate-in slide-in-from-top-2 duration-300">
                                                                                        {/* Hình ảnh thanh toán cọc */}
                                                                                        {selectedBooking.paymentImage && (
                                                                                            <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                                                                                                <div className="text-sm font-medium text-green-800 mb-4 flex items-center">
                                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                                                                    Xác nhận thanh toán cọc
                                                                                                </div>
                                                                                                <div className="relative group mb-4">
                                                                                                    <img
                                                                                                        src={`http://localhost:8080/uploads/payment-confirmations/${selectedBooking.paymentImage}`}
                                                                                                        alt="Hình ảnh xác nhận thanh toán cọc"
                                                                                                        className="w-full h-64 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-95 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                                                                                                        onClick={() => {
                                                                                                            setSelectedImageUrl(`http://localhost:8080/uploads/payment-confirmations/${selectedBooking.paymentImage}`);
                                                                                                            setShowImageModal(true);
                                                                                                        }}
                                                                                                    />
                                                                                                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                                                                                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                                                        </svg>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <p className="text-sm text-green-700 text-center font-medium mb-2">Nhấn để xem ảnh gốc</p>
                                                                                                {selectedBooking.depositPaidAt && (
                                                                                                    <p className="text-xs text-gray-500 text-center">
                                                                                                        {new Date(selectedBooking.depositPaidAt).toLocaleString('vi-VN')}
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Hình ảnh thanh toán toàn bộ */}
                                                                                        {selectedBooking.fullPaymentImage && (
                                                                                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                                                                                <div className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                                                                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                                                                                    Xác nhận thanh toán toàn bộ
                                                                                                </div>
                                                                                                <div className="relative group">
                                                                                                    <img
                                                                                                        src={`http://localhost:8080/uploads/payment-confirmations/${selectedBooking.fullPaymentImage}`}
                                                                                                        alt="Hình ảnh xác nhận thanh toán toàn bộ"
                                                                                                        className="w-full h-88 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-95 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                                                                                        onClick={() => {
                                                                                                            setSelectedImageUrl(`http://localhost:8080/uploads/payment-confirmations/${selectedBooking.fullPaymentImage}`);
                                                                                                            setShowImageModal(true);
                                                                                                        }}
                                                                                                    />
                                                                                                    <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                                                        </svg>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <p className="text-xs text-purple-600 mt-2 text-center font-medium">Nhấn để xem ảnh gốc</p>
                                                                                                {selectedBooking.fullPaidAt && (
                                                                                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                                                                                        {new Date(selectedBooking.fullPaidAt).toLocaleString('vi-VN')}
                                                                                                    </p>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Thông tin hành khách chi tiết */}
                                                            {(selectedBooking.adultPassengers?.length > 0 || selectedBooking.childPassengers?.length > 0 ||
                                                                selectedBooking.toddlerPassengers?.length > 0 || selectedBooking.infantPassengers?.length > 0) && (
                                                                    <div className="mt-6">
                                                                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                                </svg>
                                                                                Danh sách hành khách
                                                                            </h3>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                                {/* Người lớn */}
                                                                                {selectedBooking.adultPassengers?.map((passenger, index) => (
                                                                                    <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
                                                                                        <div className="text-xs font-medium text-blue-600 mb-2">NGƯỜI LỚN #{index + 1}</div>
                                                                                        <div className="text-gray-900 font-semibold break-words whitespace-normal">{passenger.fullName}</div>
                                                                                        <div className="text-sm text-gray-600">{passenger.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                                                        <div className="text-sm text-gray-600">
                                                                                            {passenger.birthDate ? new Date(passenger.birthDate).toLocaleDateString('vi-VN') : 'Chưa cung cấp'}
                                                                                        </div>
                                                                                        {passenger.singleRoom && (
                                                                                            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded mt-2">
                                                                                                Phòng đơn
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}

                                                                                {/* Trẻ em */}
                                                                                {selectedBooking.childPassengers?.map((passenger, index) => (
                                                                                    <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                                                                                        <div className="text-xs font-medium text-green-600 mb-2">TRẺ EM #{index + 1}</div>
                                                                                        <div className="font-semibold text-gray-900">{passenger.fullName}</div>
                                                                                        <div className="text-sm text-gray-600">{passenger.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                                                        <div className="text-sm text-gray-600">
                                                                                            {passenger.birthDate ? new Date(passenger.birthDate).toLocaleDateString('vi-VN') : 'Chưa cung cấp'}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}

                                                                                {/* Trẻ nhỏ */}
                                                                                {selectedBooking.toddlerPassengers?.map((passenger, index) => (
                                                                                    <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                                                                                        <div className="text-xs font-medium text-orange-600 mb-2">TRẺ NHỎ #{index + 1}</div>
                                                                                        <div className="font-semibold text-gray-900">{passenger.fullName}</div>
                                                                                        <div className="text-sm text-gray-600">{passenger.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                                                        <div className="text-sm text-gray-600">
                                                                                            {passenger.birthDate ? new Date(passenger.birthDate).toLocaleDateString('vi-VN') : 'Chưa cung cấp'}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}

                                                                                {/* Em bé */}
                                                                                {selectedBooking.infantPassengers?.map((passenger, index) => (
                                                                                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
                                                                                        <div className="text-xs font-medium text-purple-600 mb-2">EM BÉ #{index + 1}</div>
                                                                                        <div className="font-semibold text-gray-900">{passenger.fullName}</div>
                                                                                        <div className="text-sm text-gray-600">{passenger.gender === 'male' ? 'Nam' : 'Nữ'}</div>
                                                                                        <div className="text-sm text-gray-600">
                                                                                            {passenger.birthDate ? new Date(passenger.birthDate).toLocaleDateString('vi-VN') : 'Chưa cung cấp'}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>

                                                        {/* Modal Footer */}
                                                        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                                                            <div className="text-sm text-gray-500">
                                                                Mã đặt chỗ: <span className="font-mono font-medium">{selectedBooking._id}</span>
                                                            </div>
                                                            <div className="flex space-x-3">
                                                                {selectedBooking.payment_status === 'pending' && selectedBooking.payment_method === 'cash' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            closeDetailModal();
                                                                            handleConfirmPayment(selectedBooking);
                                                                        }}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span>Xác nhận cọc</span>
                                                                    </button>
                                                                )}
                                                                {selectedBooking.payment_status === 'deposit_paid' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            closeDetailModal();
                                                                            handleConfirmFullPayment(selectedBooking);
                                                                        }}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                        </svg>
                                                                        <span>Xác nhận toàn bộ</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={closeDetailModal}
                                                                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                                                >
                                                                    Đóng
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button

                                                    onClick={() => handleShowDetail(booking)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Chi tiết
                                                </button>

                                                {booking.payment_status === 'pending' && booking.payment_method === 'cash' && (
                                                    <button
                                                        onClick={() => handleConfirmPayment(booking)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Xác nhận cọc
                                                    </button>
                                                )}
                                                {booking.payment_status === 'deposit_paid' && (
                                                    <button
                                                        onClick={() => handleConfirmFullPayment(booking)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Xác nhận toàn bộ
                                                    </button>
                                                )}
                                                {booking.payment_status === 'pending_cancel' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Xác nhận hủy
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} đặt chỗ
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Trước
                                    </button>
                                    <span className="px-3 py-2 text-sm font-medium text-gray-700">
                                        {currentPage} / {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === pagination.pages}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Xác nhận hủy đặt chỗ
                            </h2>
                            <button
                                onClick={closeCancelModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Xác nhận hủy đặt chỗ này?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Tour: <span className="font-medium">{selectedBooking.slotId.tour.nameTour}</span>
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Khách hàng:</span>
                                            <span className="font-medium">{selectedBooking.fullNameUser}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ngày khởi hành:</span>
                                            <span className="font-medium">
                                                {new Date(selectedBooking.slotId.dateTour).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tổng tiền:</span>
                                            <span className="font-medium text-red-600">
                                                {selectedBooking.totalPriceTour.toLocaleString()}₫
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Lý do hủy:</span>
                                            <span className="font-medium">
                                                {selectedBooking.cancelReason || 'Không có'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lý do xác nhận hủy (tùy chọn)
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Nhập lý do xác nhận hủy..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Lưu ý: Việc xác nhận hủy sẽ hoàn trả số ghế về slot và cập nhật trạng thái đặt chỗ.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeCancelModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                disabled={cancelBookingMutation.isPending}
                            >
                                Không, giữ lại
                            </button>
                            <button
                                onClick={confirmCancelBooking}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={cancelBookingMutation.isPending}
                            >
                                {cancelBookingMutation.isPending ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    'Xác nhận hủy'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Payment Confirmation Modal */}
            {showPaymentModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 my-8 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Xác nhận thanh toán cọc
                            </h2>
                            <button
                                onClick={closePaymentModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Xác nhận đã nhận thanh toán cọc?
                                </h3>
                                <div className="text-center mb-6">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        {selectedBooking.slotId.tour.nameTour}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {selectedBooking.slotId.tour.departure_location} → {selectedBooking.slotId.tour.destination?.locationName || selectedBooking.slotId.tour.destination}
                                    </p>
                                </div>
                                {/* Thông tin đặt tour */}
                                <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                                    <div className="flex items-center mb-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-green-800 font-semibold">Thông tin đặt tour</h4>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Tour:</span>
                                            <span className="font-medium">{selectedBooking.slotId.tour.nameTour}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tuyến đường:</span>
                                            <span className="font-medium">
                                                {selectedBooking.slotId.tour.departure_location || 'N/A'} → {selectedBooking.slotId.tour.destination?.locationName || selectedBooking.slotId.tour.destination || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ngày khởi hành:</span>
                                            <span className="font-medium">
                                                {new Date(selectedBooking.slotId.dateTour).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Khách hàng:</span>
                                            <span className="font-medium">{selectedBooking.fullNameUser}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Email:</span>
                                            <span className="font-medium">{selectedBooking.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Điện thoại:</span>
                                            <span className="font-medium">{selectedBooking.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tổng tiền tour:</span>
                                            <span className="font-medium">{selectedBooking.totalPriceTour.toLocaleString()} VND</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2 bg-green-100 px-2 py-2 rounded">
                                            <span className="text-green-700 font-semibold">Tiền cọc cần thu:</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                {Math.floor(selectedBooking.totalPriceTour * 0.5).toLocaleString()} VND
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lưu ý quan trọng */}
                                <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                                    <div className="flex items-start">
                                        <div className="w-5 h-5 text-yellow-600 mr-2 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Bắt buộc phải có hình ảnh chứng minh đã nhận tiền cọc</li>
                                                <li>Hình ảnh có thể là biên lai, ảnh chụp tiền mặt, ảnh chuyển khoản</li>
                                                <li>Chỉ upload 1 hình ảnh rõ nét, không quá 10MB</li>
                                                <li>Thông tin này sẽ được lưu trữ làm bằng chứng pháp lý</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh xác nhận thanh toán <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPaymentImage(e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    {paymentImage && (
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-green-600 font-medium">
                                            Đã chọn: {paymentImage.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú xác nhận (tùy chọn)
                                    </label>
                                    <textarea
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder="Nhập ghi chú về việc xác nhận thanh toán..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows={3}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Lưu ý: Việc xác nhận sẽ chuyển trạng thái đặt chỗ thành "Đã thanh toán".
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closePaymentModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                disabled={confirmPaymentMutation.isPending}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmPayment}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={confirmPaymentMutation.isPending || !paymentImage}
                            >
                                {confirmPaymentMutation.isPending ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    'Xác nhận thanh toán'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Payment Confirmation Modal */}
            {showFullPaymentModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Xác nhận thanh toán toàn bộ
                            </h2>
                            <button
                                onClick={closeFullPaymentModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Xác nhận đã nhận thanh toán toàn bộ?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Tour: <span className="font-medium">{selectedBooking.slotId.tour.nameTour}</span>
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Khách hàng:</span>
                                            <span className="font-medium">{selectedBooking.fullNameUser}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Email:</span>
                                            <span className="font-medium">{selectedBooking.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Số điện thoại:</span>
                                            <span className="font-medium">{selectedBooking.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ngày khởi hành:</span>
                                            <span className="font-medium">
                                                {new Date(selectedBooking.slotId.dateTour).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tổng tiền:</span>
                                            <span className="font-medium text-blue-600">
                                                {selectedBooking.totalPriceTour.toLocaleString()}₫
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Trạng thái hiện tại:</span>
                                            <span className="font-medium text-blue-600">Đã thanh toán cọc</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hình ảnh xác nhận thanh toán <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFullPaymentImage(e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {fullPaymentImage && (
                                        <div className="mt-2 text-sm text-blue-600">
                                            Đã chọn: {fullPaymentImage.name}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú xác nhận (tùy chọn)
                                    </label>
                                    <textarea
                                        value={fullPaymentNote}
                                        onChange={(e) => setFullPaymentNote(e.target.value)}
                                        placeholder="Nhập ghi chú về việc xác nhận thanh toán toàn bộ..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mb-6">
                                    Lưu ý: Việc xác nhận sẽ chuyển trạng thái đặt chỗ thành "Thanh toán toàn bộ".
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeFullPaymentModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                disabled={confirmFullPaymentMutation.isPending}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmFullPayment}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={confirmFullPaymentMutation.isPending || !fullPaymentImage}
                            >
                                {confirmFullPaymentMutation.isPending ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    'Xác nhận thanh toán toàn bộ'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowImageModal(false)}
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Image */}
                        <img
                            src={selectedImageUrl}
                            alt="Hình ảnh xác nhận thanh toán"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Download button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = selectedImageUrl;
                                link.download = 'payment-confirmation.jpg';
                                link.click();
                            }}
                            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Tải xuống</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
};





export default ListBooking


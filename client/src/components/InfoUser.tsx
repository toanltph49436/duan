import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import instanceClient from "../../configs/instance"
import { useState } from "react"
import { Link } from "react-router-dom";
import { Pagination } from "antd";

// Define bill type interface
interface Bill {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
    } | string;

    // Tour booking fields
    slotId?: {
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
            description?: string;
        };
    };
    fullNameUser?: string;
    email?: string;
    phone?: string;
    address?: string;
    totalPriceTour?: number;
    adultsTour?: number;
    childrenTour?: number;
    toddlerTour?: number;
    infantTour?: number;
    adultPassengers?: Array<{
        fullName: string;
        gender: string;
        birthDate: string;
        singleRoom: boolean;
    }>;
    childPassengers?: any[];
    toddlerPassengers?: any[];
    infantPassengers?: any[];

    // Hotel booking fields
    BookingTourId?: any;

    // Common fields
    depositAmount?: number;
    isDeposit?: boolean;
    isFullyPaid?: boolean;
    payment_method: string;
    paymentType?: string; // Added missing field
    payment_status: string;
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    cancelReason?: string;
    cancelRequestedAt?: string;
    note?: string;
    depositPaidAt?: string;  // Thời gian admin xác nhận đặt cọc
}

const InfoUser = () => {
    // const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userId = localStorage.getItem("userId");
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    // Tab state
    const [activeTab, setActiveTab] = useState<'personal' | 'tour-history' | 'hotel-history'>('personal');
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        phone_number: '',
        address: '',
        birthDate: ''
    });

    const getDurationDays = (duration: string) => {
        if (!duration) return 0;
        const match = duration.match(/(\d+)\s*ngày/);
        return match ? Number(match[1]) : 0;
        };

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showHotelDetailModal, setShowHotelDetailModal] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [showHotelCancelModal, setShowHotelCancelModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Bill | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [bookingToRefund, setBookingToRefund] = useState<Bill | null>(null);
    const [refundFormData, setRefundFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        refundReason: '',
        phoneNumber: '',
        email: ''
    });

    // Fetch user data
    const { data: user } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => instanceClient.get(`user/${userId}`)
    })
    console.log('user', user?.data?.user);
    const users = user?.data?.user || [];

    // Fetch bills data
    const { data: bill } = useQuery({
        queryKey: ['checkOutBookingTour', userId],
        queryFn: () => instanceClient.get(`checkOutBookingTour/${userId}`)
    })
    const { data: hotelsResponse} = useQuery({
        queryKey: ['checkOutBookingHotel', userId],
        queryFn: () => instanceClient.get(`/hotel-bookings/user/${userId}`)
    });

    const hotels = hotelsResponse?.data?.data || [];

    console.log('bill', hotels);

        const bills: Bill[] = bill?.data?.data || [];
    // Request cancel mutation
    const requestCancelMutation = useMutation({
        mutationFn: async ({ billId, reason }: { billId: string; reason: string }) => {
            const response = await instanceClient.put(`/bookingTour/request-cancel/${billId}`, {
                userId: userId,
                reason: reason
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Cancel request success:', data);
            queryClient.invalidateQueries({ queryKey: ['checkOutBookingTour', userId] });
            setShowCancelModal(false);
            setBookingToCancel(null);
            setCancelReason('');
            // Show success message
            alert(data.message || 'Yêu cầu hủy đặt chỗ đã được gửi thành công!');
        },
        onError: (error: any) => {
            console.error('Error requesting cancellation:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hủy. Vui lòng thử lại!';
            alert(errorMessage);
        }
    });

    // Complete payment mutation
    const completePaymentMutation = useMutation({
        mutationFn: async (billId: string) => {
            const response = await instanceClient.post(`/bills/${billId}/complete-payment`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
        },
        onError: (error) => {
            console.error('Error completing payment:', error);
        }
    });

    // Submit refund request mutation
    const submitRefundMutation = useMutation({
        mutationFn: async ({ bookingId, refundData, shouldCancelBooking }: { bookingId: string; refundData: any; shouldCancelBooking?: boolean }) => {
            const response = await instanceClient.post('/refund/request', {
                bookingId,
                bankInfo: {
                    bankName: refundData.bankName,
                    accountNumber: refundData.accountNumber,
                    accountHolderName: refundData.accountHolderName,
                },
                contactInfo: {
                    phoneNumber: refundData.phoneNumber,
                    email: refundData.email,
                },
                refundReason: refundData.refundReason,
                userId: userId,
                shouldCancelBooking: shouldCancelBooking || false
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log('Refund request success:', data);
            queryClient.invalidateQueries({ queryKey: ['checkOutBookingTour', userId] });
            setShowRefundModal(false);
            setBookingToRefund(null);
            setRefundFormData({
                bankName: '',
                accountNumber: '',
                accountHolderName: '',
                refundReason: '',
                phoneNumber: '',
                email: ''
            });
            alert(data.message || 'Yêu cầu hoàn tiền đã được gửi thành công!');
        },
        onError: (error: any) => {
            console.error('Error submitting refund request:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền. Vui lòng thử lại!';
            alert(errorMessage);
        }
    });

    // Helper functions
    const openDetailModal = (bill: Bill) => {
        setSelectedBill(bill);
        setShowDetailModal(true);
    };

    const openHotelDetailModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setShowHotelDetailModal(true);
    };

    const openHotelCancelModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setShowHotelCancelModal(true);
    };

    // Edit functions
    const handleEditClick = () => {
        setIsEditing(true);
        setEditFormData({
            username: users?.username || '',
            email: users?.email || '',
            phone_number: users?.phone_number || '',
            address: users?.address || '',
            birthDate: users?.birthDate ? new Date(users.birthDate).toISOString().split('T')[0] : ''
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({
            username: '',
            email: '',
            phone_number: '',
            address: '',
            birthDate: ''
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveEdit = async () => {
        try {
            // Make API call to update user data
            const updateData = {
                username: editFormData.username,
                email: editFormData.email,
                phone_number: editFormData.phone_number,
                address: editFormData.address,
                birthDate: editFormData.birthDate ? new Date(editFormData.birthDate).toISOString() : users.birthDate
            };
            
            const response = await instanceClient.put(`user/${userId}`, updateData);
            
            if (response.data.success) {
                // Update the query cache with new data from server
                queryClient.setQueryData(['user', userId], {
                    data: {
                        user: response.data.user
                    }
                });
                
                alert('Thông tin đã được cập nhật thành công!');
                setIsEditing(false);
            } else {
                alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!');
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedBill(null);
    };

    const closeHotelDetailModal = () => {
        setShowHotelDetailModal(false);
        setSelectedHotel(null);
    };

    const closeHotelCancelModal = () => {
        setShowHotelCancelModal(false);
        setSelectedHotel(null);
    };

    const openCancelModal = (bill: Bill) => {
        setBookingToCancel(bill);
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setBookingToCancel(null);
        setCancelReason('');
    };

    // const openRefundModal = (bill: Bill) => {
    //     setBookingToRefund(bill);
    //     setShowRefundModal(true);
    //     // Pre-fill user data if available
    //     setRefundFormData(prev => ({
    //         ...prev,
    //         email: users?.email || '',
    //         phoneNumber: users?.phone_number || ''
    //     }));
    // };

    const closeRefundModal = () => {
        setShowRefundModal(false);
        setBookingToRefund(null);
        setRefundFormData({
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            refundReason: '',
            phoneNumber: '',
            email: ''
        });
    };

    const handleRefundFormChange = (field: string, value: string) => {
        setRefundFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const confirmRefundRequest = () => {
        if (bookingToRefund && 
            refundFormData.bankName.trim() && 
            refundFormData.accountNumber.trim() && 
            refundFormData.accountHolderName.trim() &&
            refundFormData.phoneNumber.trim() &&
            refundFormData.email.trim() &&
            refundFormData.refundReason.trim()) {
            
            // Gửi yêu cầu hủy tour và hoàn tiền cùng lúc
            submitRefundMutation.mutate({
                bookingId: bookingToRefund._id,
                refundData: refundFormData,
                shouldCancelBooking: true // Flag để backend biết cần hủy booking trước
            });
        } else {
            alert('Vui lòng điền đầy đủ thông tin!');
        }
    };

    // Calculate refund amount based on policy
    const calculateRefundAmount = (bill: Bill) => {
        if (!bill.slotId?.dateTour || !bill.totalPriceTour) return 0;
        
        const tourDate = new Date(bill.slotId.dateTour);
        const currentDate = new Date();
        const daysDifference = Math.ceil((tourDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let refundPercentage = 0;
        if (daysDifference > 30) {
            refundPercentage = 100;
        } else if (daysDifference >= 15) {
            refundPercentage = 70;
        } else if (daysDifference >= 7) {
            refundPercentage = 50;
        } else if (daysDifference >= 4) {
            refundPercentage = 30;
        } else {
            refundPercentage = 0;
        }
        
        return Math.round((bill.totalPriceTour || 0) * refundPercentage / 100);
    };

    const confirmCancelBooking = () => {
        if (bookingToCancel && cancelReason.trim()) {
            // Đóng modal hủy và mở modal hoàn tiền
            setShowCancelModal(false);
            setBookingToRefund(bookingToCancel);
            setShowRefundModal(true);
            // Pre-fill user data if available
            setRefundFormData(prev => ({
                ...prev,
                email: users?.email || '',
                phoneNumber: users?.phone_number || '',
                refundReason: cancelReason.trim() // Sử dụng lý do hủy làm lý do hoàn tiền
            }));
            // Reset cancel form
            setCancelReason('');
            setBookingToCancel(null);
        }
    };

    const handleCompletePayment = (bill: Bill) => {
        completePaymentMutation.mutate(bill._id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'deposit_paid':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refund_pending':
                return 'bg-orange-100 text-orange-800';
            case 'refund_processing':
                return 'bg-purple-100 text-purple-800';
            case 'refund_completed':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'Đã thanh toán';
            case 'deposit_paid':
                return 'Đã đặt cọc';
            case 'pending':
                return 'Chờ thanh toán';
            case 'cancelled':
                return 'Đã hủy';
            case 'completed':
                return 'Hoàn thành';
            case 'refund_pending':
                return 'Chờ xử lý hoàn tiền';
            case 'refund_processing':
                return 'Đang hoàn tiền';
            case 'refund_completed':
                return 'Đã hoàn tiền';
            default:
                return status;
        }
    };

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentBills = bills.slice(startIndex, endIndex);

    // Calculate stats for tours
    const totalBookings = bills.length;
    const paidBookings = bills.filter(bill => bill.payment_status === 'paid' || bill.isFullyPaid).length;
    const depositBookings = bills.filter(bill => bill.payment_status === 'deposit_paid' || (bill.isDeposit && !bill.isFullyPaid)).length;
    const cancelledBookings = bills.filter(bill => bill.payment_status === 'cancelled').length;
    const refundPendingBookings = bills.filter(bill => bill.payment_status === 'refund_pending').length;
    const refundProcessingBookings = bills.filter(bill => bill.payment_status === 'refund_processing').length;
    const refundCompletedBookings = bills.filter(bill => bill.payment_status === 'refund_completed').length;

    // Calculate stats for hotels
    const totalHotelBookings = hotels.length;
    const paidHotelBookings = hotels.filter(hotel => hotel.payment_status === 'paid' || hotel.isFullyPaid).length;
    const depositHotelBookings = hotels.filter(hotel => hotel.payment_status === 'deposit_paid' || (hotel.isDeposit && !hotel.isFullyPaid)).length;
    const cancelledHotelBookings = hotels.filter(hotel => hotel.payment_status === 'cancelled').length;
    const refundPendingHotelBookings = hotels.filter(hotel => hotel.payment_status === 'refund_pending').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="px-6 py-8 mx-auto max-w-7xl sm:px-8 lg:px-12">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900">
                        Tài khoản của tôi
                    </h1>
                    <p className="text-lg text-gray-600">
                        Quản lý thông tin cá nhân và lịch sử đặt chỗ
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="p-8 mb-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
                    <div className="flex space-x-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors ${
                                activeTab === 'personal'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">Thông tin cá nhân</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tour-history')}
                            className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors ${
                                activeTab === 'tour-history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Lịch sử đặt tour ({bills.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('hotel-history')}
                            className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors ${
                                activeTab === 'hotel-history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">Lịch sử đặt khách sạn ({hotels.length})</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-8 mx-2 bg-white shadow-xl rounded-2xl">
                    {activeTab === 'personal' && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
                                {!isEditing ? (
                                    <button 
                                        onClick={handleEditClick}
                                        className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Chỉnh sửa</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={handleSaveEdit}
                                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Lưu</span>
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            <span>Hủy</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            


                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Tên đầy đủ</label>
                                        <input
                                            type="text"
                                            value={isEditing ? editFormData.username : (users?.username || '')}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={isEditing ? editFormData.email : (users?.email || '')}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            value={isEditing ? editFormData.phone_number : (users?.phone_number || '')}
                                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>
                                
                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Địa chỉ</label>
                                        <textarea
                                            value={isEditing ? editFormData.address : (users?.address || '')}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={4}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">Ngày sinh</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={editFormData.birthDate}
                                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={users?.birthDate ? new Date(users.birthDate).toLocaleDateString('vi-VN') : ''}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                                readOnly
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tour-history' && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Lịch sử đặt tour</h2>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-sm font-medium">{bills.length} đặt chỗ</span>
                                </div>
                            </div>

                            {/* Tour Stats Section */}
                            <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
                                {/* Tổng đặt tour */}
                                <div className="p-4 transition-all duration-300 transform border border-blue-200 shadow-md group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-blue-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-blue-700">Tổng tour</p>
                                        <p className="text-xl font-bold text-blue-900 transition-colors group-hover:text-blue-800">{totalBookings}</p>
                                    </div>
                                </div>

                                {/* Đã thanh toán tour */}
                                <div className="p-4 transition-all duration-300 transform border border-green-200 shadow-md group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-green-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-green-700">Đã thanh toán</p>
                                        <p className="text-xl font-bold text-green-900 transition-colors group-hover:text-green-800">{paidBookings}</p>
                                    </div>
                                </div>

                                {/* Đã đặt cọc tour */}
                                <div className="p-4 transition-all duration-300 transform border border-yellow-200 shadow-md group bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-yellow-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-yellow-700">Đã đặt cọc</p>
                                        <p className="text-xl font-bold text-yellow-900 transition-colors group-hover:text-yellow-800">{depositBookings}</p>
                                    </div>
                                </div>

                                {/* Chờ xử lý hoàn tiền tour */}
                                <div className="p-4 transition-all duration-300 transform border border-orange-200 shadow-md group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-orange-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-orange-700">Chờ hoàn tiền</p>
                                        <p className="text-xl font-bold text-orange-900 transition-colors group-hover:text-orange-800">{refundPendingBookings}</p>
                                    </div>
                                </div>

                                {/* Đã hủy tour */}
                                <div className="p-4 transition-all duration-300 transform border border-red-200 shadow-md group bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-red-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-red-700">Đã hủy</p>
                                        <p className="text-xl font-bold text-red-900 transition-colors group-hover:text-red-800">{cancelledBookings}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mx-2 space-y-6">
                                {currentBills.length > 0 ? (
                                    currentBills.map((bill) => (
                                        <div key={bill._id} className="overflow-hidden transition-all duration-300 transform bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl hover:-translate-y-1">
                                            <div className="p-8">
                                                <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                                    {/* Tour Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={bill.slotId?.tour?.imageTour?.[0] || '/default-tour.jpg'}
                                                                    alt={bill.slotId?.tour?.nameTour || 'Tour'}
                                                                    className="object-cover w-20 h-20 border-2 border-gray-200 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="mb-2 text-xl font-bold text-gray-900 truncate">
                                                                    {bill.slotId?.tour?.nameTour
                                                                        ? bill.slotId.tour.nameTour.split(" ").length > 8
                                                                            ? bill.slotId.tour.nameTour.split(" ").slice(0, 8).join(" ") + "..."
                                                                            : bill.slotId.tour.nameTour
                                                                        : "Tour không xác định"}
                                                                </h3>
                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span>
                                                                            Ngày khởi hành: {bill?.slotId?.dateTour ? new Date(bill.slotId.dateTour).toLocaleDateString('vi-VN') : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                        </svg>
                                                                        <span>Tổng tiền: {bill.totalPriceTour?.toLocaleString('vi-VN')} VND</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status and Actions */}
                                                    <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.payment_status)}`}>
                                                            {getStatusText(bill.payment_status)}
                                                        </span>

                                                        <div className="flex flex-wrap gap-2 space-x-2">
                                                            <button
                                                                onClick={() => openDetailModal(bill)}
                                                                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                                                            >
                                                                Chi tiết
                                                            </button>

                                                            {/* Cho phép hủy khi: chờ thanh toán tiền cọc, đã được admin xác nhận đặt cọc, hoặc đã thanh toán đủ */}
                                                            {(bill.payment_status === 'pending' || 
                                                              (bill.payment_status === 'deposit_paid' && bill.depositPaidAt) || 
                                                              (bill.payment_status === 'confirmed' || bill.payment_status === 'completed')) && (
                                                                <button
                                                                    onClick={() => openCancelModal(bill)}
                                                                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-red-500 rounded-lg hover:bg-red-600"
                                                                >
                                                                    Hủy đặt chỗ
                                                                </button>
                                                            )}

                                                            {/* Hiển thị trạng thái chờ thanh toán và chờ xác nhận đặt cọc */}
                                                            {bill.payment_status === 'pending' && (
                                                                <span className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg">
                                                                    Chờ thanh toán
                                                                </span>
                                                            )}
                                                            
                                                            {(bill.payment_status === 'deposit_paid' && !bill.depositPaidAt) && (
                                                                <span className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-lg">
                                                                    Chờ admin xác nhận
                                                                </span>
                                                            )}

                                                            {bill.payment_status === 'refund_pending' && (
                                                                <span className="px-4 py-2 text-sm font-medium text-orange-800 bg-orange-100 rounded-lg">
                                                                    Chờ xử lý hoàn tiền
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có đặt chỗ nào</h3>
                                        <p className="mb-6 text-gray-600">Bạn chưa có lịch sử đặt tour nào. Hãy khám phá các tour du lịch hấp dẫn!</p>
                                        <Link
                                            to="/tours"
                                            className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Khám phá tour
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {bills.length > pageSize && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        current={currentPage}
                                        total={bills.length}
                                        pageSize={pageSize}
                                        onChange={(page) => setCurrentPage(page)}
                                        showSizeChanger={false}
                                        showQuickJumper={false}
                                        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đặt chỗ`}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'hotel-history' && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Lịch sử đặt khách sạn</h2>
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="text-sm font-medium">{hotels.length} đặt phòng</span>
                                </div>
                            </div>

                            {/* Hotel Stats Section */}
                            <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-5">
                                {/* Tổng đặt khách sạn */}
                                <div className="p-4 transition-all duration-300 transform border border-purple-200 shadow-md group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-purple-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-purple-700">Tổng khách sạn</p>
                                        <p className="text-xl font-bold text-purple-900 transition-colors group-hover:text-purple-800">{totalHotelBookings}</p>
                                    </div>
                                </div>

                                {/* Đã thanh toán khách sạn */}
                                <div className="p-4 transition-all duration-300 transform border shadow-md group bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl hover:shadow-lg border-emerald-200 hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 rounded-lg shadow-md bg-emerald-500 group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-emerald-700">Đã thanh toán</p>
                                        <p className="text-xl font-bold transition-colors text-emerald-900 group-hover:text-emerald-800">{paidHotelBookings}</p>
                                    </div>
                                </div>

                                {/* Đã đặt cọc khách sạn */}
                                <div className="p-4 transition-all duration-300 transform border shadow-md group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl hover:shadow-lg border-amber-200 hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 rounded-lg shadow-md bg-amber-500 group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-amber-700">Đã đặt cọc</p>
                                        <p className="text-xl font-bold transition-colors text-amber-900 group-hover:text-amber-800">{depositHotelBookings}</p>
                                    </div>
                                </div>

                                {/* Chờ xử lý hoàn tiền khách sạn */}
                                <div className="p-4 transition-all duration-300 transform border shadow-md group bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl hover:shadow-lg border-rose-200 hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 rounded-lg shadow-md bg-rose-500 group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-rose-700">Chờ hoàn tiền</p>
                                        <p className="text-xl font-bold transition-colors text-rose-900 group-hover:text-rose-800">{refundPendingHotelBookings}</p>
                                    </div>
                                </div>

                                {/* Đã hủy khách sạn */}
                                <div className="p-4 transition-all duration-300 transform border border-gray-200 shadow-md group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="p-2 mb-2 text-white transition-transform duration-300 bg-gray-500 rounded-lg shadow-md group-hover:scale-110">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <p className="mb-1 text-xs font-semibold text-gray-700">Đã hủy</p>
                                        <p className="text-xl font-bold text-gray-900 transition-colors group-hover:text-gray-800">{cancelledHotelBookings}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mx-2 space-y-6">
                                {hotels.length > 0 ? (
                                    hotels.map((hb: any) => (
                                        <div key={hb._id} className="overflow-hidden transition-all duration-300 transform bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl hover:-translate-y-1">
                                            <div className="p-8">
                                                <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                                    {/* Hotel Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <img
                                                                    src={hb.hotelId?.hotelImages?.[0] || '/default-hotel.jpg'}
                                                                    alt={hb.hotelId?.hotelName || 'Hotel'}
                                                                    className="object-cover w-20 h-20 border-2 border-gray-200 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="mb-2 text-xl font-bold text-gray-900 truncate">
                                                                    {hb.hotelId?.hotelName || 'Khách sạn'}
                                                                </h3>
                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span>
                                                                            Nhận: {hb.checkInDate ? new Date(hb.checkInDate).toLocaleDateString('vi-VN') : 'N/A'} - Trả: {hb.checkOutDate ? new Date(hb.checkOutDate).toLocaleDateString('vi-VN') : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                        </svg>
                                                                        <span>Tổng tiền: {hb.totalPrice?.toLocaleString('vi-VN')} VND</span>
                                                                    </div>
                                                                    <div className="flex items-start space-x-2 sm:col-span-2">
                                                                        <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                                        </svg>
                                                                        <span className="truncate">{hb.hotelId?.address || ''}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status and Actions */}
                                                    <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hb.payment_status)}`}>
                                                            {getStatusText(hb.payment_status)}
                                                        </span>

                                                        <div className="flex flex-wrap gap-2 space-x-2">
                                                            <button
                                                                onClick={() => openHotelDetailModal(hb)}
                                                                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
                                                            >
                                                                Chi tiết
                                                            </button>

                                                            {/* Cho phép hủy khi: chờ thanh toán, đã thanh toán, hoặc đã đặt cọc */}
                                                            {(hb.payment_status === 'pending' || 
                                                              hb.payment_status === 'paid' || 
                                                              hb.payment_status === 'deposit_paid') && (
                                                                <button
                                                                    onClick={() => openHotelCancelModal(hb)}
                                                                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-red-500 rounded-lg hover:bg-red-600"
                                                                >
                                                                    Hủy đặt phòng
                                                                </button>
                                                            )}

                                                            {/* Hiển thị trạng thái chờ thanh toán */}
                                                            {hb.payment_status === 'pending' && (
                                                                <span className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg">
                                                                    Chờ thanh toán
                                                                </span>
                                                            )}

                                                            {hb.payment_status === 'refund_pending' && (
                                                                <span className="px-4 py-2 text-sm font-medium text-orange-800 bg-orange-100 rounded-lg">
                                                                    Chờ xử lý hoàn tiền
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có đặt phòng nào</h3>
                                        <p className="mb-6 text-gray-600">Bạn chưa có lịch sử đặt khách sạn nào. Hãy khám phá và đặt phòng ngay!</p>
                                        <Link
                                            to="/hotels"
                                            className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            Khám phá khách sạn
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>







            {/* Detail Modal */}
            {showDetailModal && selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl max-h-screen overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-2xl">
                        {/* Modal Header */}
                        <div className="relative p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white text-opacity-80">Chi tiết đặt tour</h3>
                                        <p className="text-sm text-white text-opacity-80">Thông tin chi tiết về chuyến đi của bạn</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeDetailModal}
                                    className="flex items-center justify-center w-8 h-8 transition-all duration-200 bg-red-500 rounded-full shadow-lg hover:bg-red-600"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Tour Information */}
                            <div className="p-5 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                <div className="flex items-start space-x-4">
                                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div>
                                            <h3 className="mb-3 text-2xl font-bold text-gray-900">
                                                {selectedBill?.slotId?.tour?.nameTour || 'Tour không xác định'}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Điểm đến:</span>
                                                    <span className="text-sm font-semibold text-gray-900">{selectedBill?.slotId?.tour?.destination || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Điểm khởi hành:</span>
                                                    <span className="text-sm font-semibold text-gray-900">{selectedBill?.slotId?.tour?.departure_location || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Thời gian:</span>
                                                    <span className="text-sm font-semibold text-gray-900">{selectedBill?.slotId?.tour?.duration || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Ngày đặt:</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {selectedBill?.createdAt ? new Date(selectedBill.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </span>
                                                </div>
                                                
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Số người:</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {(selectedBill?.adultsTour || 0) + (selectedBill?.childrenTour || 0) + (selectedBill?.toddlerTour || 0) + (selectedBill?.infantTour || 0)} người
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                                                    <span className="text-lg font-bold text-red-600">{selectedBill?.totalPriceTour?.toLocaleString('vi-VN')} VND</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Ngày khởi hành:</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {selectedBill?.slotId?.dateTour ? new Date(selectedBill.slotId.dateTour).toLocaleDateString('vi-VN') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm text-gray-600">Ngày về:</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {selectedBill?.slotId?.dateTour && selectedBill?.slotId?.tour?.duration
                                                        ? new Date(
                                                            new Date(selectedBill.slotId.dateTour).setDate(
                                                                new Date(selectedBill.slotId.dateTour).getDate() +
                                                                getDurationDays(selectedBill.slotId.tour.duration)
                                                            )
                                                            ).toLocaleDateString("vi-VN")
                                                        : "N/A"}
                                                    </span>
                                                </div>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="p-5 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <h4 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Chi tiết đặt chỗ
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Trạng thái thanh toán:</span>
                                            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getStatusColor(selectedBill?.payment_status || '')}`}>
                                                {getStatusText(selectedBill?.payment_status || '')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {selectedBill?.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                                                    selectedBill?.payment_method === 'cash' ? 'Tiền mặt' :
                                                        selectedBill?.payment_method === 'vnpay' ? 'VNPay' : selectedBill?.payment_method}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Loại thanh toán:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {selectedBill?.paymentType === 'full' ? 'Thanh toán toàn bộ' :
                                                    selectedBill?.paymentType === 'deposit' ? 'Đặt cọc' :
                                                        selectedBill?.paymentType === 'remaining' ? 'Thanh toán còn lại' : selectedBill?.paymentType}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Đã đặt cọc:</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {selectedBill?.isDeposit ? 'Có' : 'Không'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Người lớn:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedBill?.adultsTour || 0} người</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Trẻ em:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedBill?.childrenTour || 0} người</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Trẻ nhỏ:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedBill?.toddlerTour || 0} người</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Em bé:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedBill?.infantTour || 0} người</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Information */}
                            {(selectedBill?.adultPassengers && selectedBill.adultPassengers.length > 0) ||
                                (selectedBill?.childPassengers && selectedBill.childPassengers.length > 0) ||
                                (selectedBill?.toddlerPassengers && selectedBill.toddlerPassengers.length > 0) ||
                                (selectedBill?.infantPassengers && selectedBill.infantPassengers.length > 0) ? (
                                <div className="p-5 border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                    <h4 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Thông tin hành khách
                                    </h4>

                                    {/* Adult Passengers */}
                                    {selectedBill?.adultPassengers && selectedBill.adultPassengers.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="mb-3 text-sm font-semibold text-gray-800">Người lớn ({selectedBill.adultPassengers.length})</h5>
                                            <div className="space-y-3">
                                                {selectedBill.adultPassengers.map((passenger, index) => (
                                                    <div key={index} className="p-4 bg-white border border-purple-200 rounded-lg shadow-sm">
                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Họ và tên:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.fullName}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Giới tính:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.gender}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Ngày sinh:</span>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {new Date(passenger.birthDate).toLocaleDateString('vi-VN')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="text-xs text-gray-500">Phòng đơn:</span>
                                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${passenger.singleRoom ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {passenger.singleRoom ? 'Có' : 'Không'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Child Passengers */}
                                    {selectedBill?.childPassengers && selectedBill.childPassengers.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="mb-3 text-sm font-semibold text-gray-800">Trẻ em ({selectedBill.childPassengers.length})</h5>
                                            <div className="space-y-3">
                                                {selectedBill.childPassengers.map((passenger, index) => (
                                                    <div key={index} className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Họ và tên:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.fullName || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Giới tính:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.gender || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Toddler Passengers */}
                                    {selectedBill?.toddlerPassengers && selectedBill.toddlerPassengers.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="mb-3 text-sm font-semibold text-gray-800">Trẻ nhỏ ({selectedBill.toddlerPassengers.length})</h5>
                                            <div className="space-y-3">
                                                {selectedBill.toddlerPassengers.map((passenger, index) => (
                                                    <div key={index} className="p-4 bg-white border border-green-200 rounded-lg shadow-sm">
                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Họ và tên:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.fullName || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Giới tính:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.gender || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Infant Passengers */}
                                    {selectedBill?.infantPassengers && selectedBill.infantPassengers.length > 0 && (
                                        <div>
                                            <h5 className="mb-3 text-sm font-semibold text-gray-800">Em bé ({selectedBill.infantPassengers.length})</h5>
                                            <div className="space-y-3">
                                                {selectedBill.infantPassengers.map((passenger, index) => (
                                                    <div key={index} className="p-4 bg-white border border-pink-200 rounded-lg shadow-sm">
                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <span className="text-xs text-gray-500">Họ và tên:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.fullName || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-500">Giới tính:</span>
                                                                <p className="text-sm font-semibold text-gray-900">{passenger.gender || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Tour Images */}
                            {selectedBill?.slotId?.tour?.imageTour && selectedBill.slotId.tour.imageTour.length > 0 && (
                                <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
                                    <h4 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Hình ảnh tour
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {selectedBill.slotId.tour.imageTour.slice(0, 6).map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`Tour image ${index + 1}`}
                                                className="object-cover w-full h-32 transition-transform duration-200 border border-gray-200 rounded-lg hover:scale-105"
                                            />
                                        ))}
                                        {selectedBill.slotId.tour.imageTour.length > 6 && (
                                            <div className="flex items-center justify-center w-full h-32 bg-gray-200 border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-600">
                                                    +{selectedBill.slotId.tour.imageTour.length - 6} ảnh khác
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Customer Information */}
                            <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
                                <h4 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Thông tin khách hàng
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Họ và tên:</label>
                                        <p className="text-sm font-semibold text-gray-900">{selectedBill?.fullNameUser || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Email:</label>
                                        <p className="text-sm font-semibold text-gray-900">{selectedBill?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Số điện thoại:</label>
                                        <p className="text-sm font-semibold text-gray-900">{selectedBill?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Địa chỉ:</label>
                                        <p className="text-sm font-semibold text-gray-900">{selectedBill?.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                                                 {/* Modal Footer */}
                         <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200">
                             <button
                                 onClick={closeDetailModal}
                                 className="px-4 py-2 text-white transition-colors duration-200 bg-gray-500 rounded-lg hover:bg-gray-600"
                             >
                                 Đóng
                             </button>
                         </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && bookingToCancel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg max-h-screen overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-2xl">
                        {/* Header */}
                        <div className="relative p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white text-opacity-80">Hủy đặt chỗ</h3>
                                        <p className="text-sm text-white text-opacity-80">Hủy tour và yêu cầu hoàn tiền</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeCancelModal}
                                    className="flex items-center justify-center w-8 h-8 transition-all duration-200 bg-red-500 rounded-full shadow-lg hover:bg-red-600"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Tour Info */}
                            <div className="p-5 mb-6 border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                                <div className="flex items-start space-x-4">
                                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-3 text-xl font-bold text-gray-900">
                                            {bookingToCancel?.slotId?.tour?.nameTour || 'Tour không xác định'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Ngày khởi hành:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {bookingToCancel?.slotId?.dateTour ? new Date(bookingToCancel.slotId.dateTour).toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Tổng tiền:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {bookingToCancel?.totalPriceTour?.toLocaleString('vi-VN')} VND
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <h4 className="mb-3 font-semibold text-yellow-800">Chính sách hoàn tiền tour trong nước</h4>
                                        <div className="space-y-2 text-sm text-yellow-700">
                                            <div className="grid grid-cols-2 gap-4 pb-2 font-medium border-b border-yellow-300">
                                                <span>Thời gian hủy</span>
                                                <span>Mức hoàn tiền</span>
                                    </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <span>Trước 30 ngày</span>
                                                <span className="font-medium text-green-700">Hoàn 100% tiền đặt cọc</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <span>Từ 15-29 ngày</span>
                                                <span className="font-medium text-blue-700">Hoàn 70% tiền đặt cọc</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <span>Từ 7-14 ngày</span>
                                                <span className="font-medium text-yellow-700">Hoàn 50% tiền đặt cọc</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <span>Từ 4-6 ngày</span>
                                                <span className="font-medium text-orange-700">Hoàn 30% tiền đặt cọc</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <span>Dưới 3 ngày</span>
                                                <span className="font-medium text-red-700">Không hoàn tiền</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 mt-3 border-t border-yellow-300">
                                            <p className="text-xs italic text-yellow-600">
                                                * Mọi yêu cầu hủy tour cần được gửi bằng văn bản và được xác nhận bởi công ty du lịch.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Flight Ticket Policy Warning */}
                            <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <h4 className="mb-3 font-semibold text-red-800">⚠️ Thông báo quan trọng về vé máy bay</h4>
                                        <div className="space-y-2 text-sm text-red-700">
                                            <p className="font-medium">Nếu tour này bao gồm vé máy bay, vui lòng lưu ý:</p>
                                            <ul className="ml-2 space-y-1 list-disc list-inside">
                                                <li><strong>Trong vòng 24 giờ đầu:</strong> Được phép hủy và hoàn tiền 100% vé máy bay</li>
                                                <li><strong>Sau 24 giờ:</strong> Vé máy bay không thể hủy trên website</li>
                                                <li><strong>Liên hệ hỗ trợ:</strong> Gọi <span className="font-semibold">0922222016</span> để được tư vấn xử lý vé theo quy định hãng bay</li>
                                            </ul>
                                            <div className="p-2 mt-3 bg-red-100 border border-red-300 rounded">
                                                <p className="text-xs font-medium text-red-800">
                                                    💡 <strong>Lời khuyên:</strong> Nếu bạn đã đặt vé máy bay, hãy liên hệ ngay với chúng tôi để được hỗ trợ tốt nhất!
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <div className="mb-6">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Lý do hủy đặt chỗ *
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Vui lòng cho biết lý do hủy đặt chỗ..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200">
                            <button
                                onClick={closeCancelModal}
                                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmCancelBooking}
                                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                disabled={requestCancelMutation.isPending || !cancelReason.trim()}
                            >
                                {requestCancelMutation.isPending ? (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi yêu cầu...
                                    </div>
                                ) : (
                                    'Hủy tour và yêu cầu hoàn tiền'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && bookingToRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-2xl">
                        {/* Header */}
                        <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Yêu cầu hoàn tiền</h3>
                                        <p className="text-sm text-white text-opacity-80">Điền thông tin tài khoản để nhận hoàn tiền</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeRefundModal}
                                    className="flex items-center justify-center w-8 h-8 transition-all duration-200 bg-white rounded-full bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Tour Info */}
                            <div className="p-5 mb-6 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <div className="flex items-start space-x-4">
                                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-3 text-xl font-bold text-gray-900">
                                            {bookingToRefund?.slotId?.tour?.nameTour || 'Tour không xác định'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Ngày khởi hành:</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {bookingToRefund?.slotId?.dateTour ? new Date(bookingToRefund.slotId.dateTour).toLocaleDateString('vi-VN') : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                <span className="text-sm text-gray-600">Số tiền hoàn:</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {calculateRefundAmount(bookingToRefund).toLocaleString('vi-VN')} VND
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Information Form */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Thông tin tài khoản ngân hàng
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Tên ngân hàng *
                                            </label>
                                            <select
                                                value={refundFormData.bankName}
                                                onChange={(e) => handleRefundFormChange('bankName', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Chọn ngân hàng</option>
                                                <option value="Vietcombank">Vietcombank</option>
                                                <option value="VietinBank">VietinBank</option>
                                                <option value="BIDV">BIDV</option>
                                                <option value="Agribank">Agribank</option>
                                                <option value="Techcombank">Techcombank</option>
                                                <option value="MBBank">MBBank</option>
                                                <option value="ACB">ACB</option>
                                                <option value="TPBank">TPBank</option>
                                                <option value="Sacombank">Sacombank</option>
                                                <option value="VPBank">VPBank</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Số tài khoản *
                                            </label>
                                            <input
                                                type="text"
                                                value={refundFormData.accountNumber}
                                                onChange={(e) => handleRefundFormChange('accountNumber', e.target.value)}
                                                placeholder="Nhập số tài khoản"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2">
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Tên chủ tài khoản *
                                            </label>
                                            <input
                                                type="text"
                                                value={refundFormData.accountHolderName}
                                                onChange={(e) => handleRefundFormChange('accountHolderName', e.target.value)}
                                                placeholder="Nhập tên chủ tài khoản (đúng như trên thẻ)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Thông tin liên hệ
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Số điện thoại *
                                            </label>
                                            <input
                                                type="tel"
                                                value={refundFormData.phoneNumber}
                                                onChange={(e) => handleRefundFormChange('phoneNumber', e.target.value)}
                                                placeholder="Nhập số điện thoại"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={refundFormData.email}
                                                onChange={(e) => handleRefundFormChange('email', e.target.value)}
                                                placeholder="Nhập địa chỉ email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Lý do yêu cầu hoàn tiền *
                                    </label>
                                    <textarea
                                        value={refundFormData.refundReason}
                                        onChange={(e) => handleRefundFormChange('refundReason', e.target.value)}
                                        placeholder="Vui lòng cho biết lý do yêu cầu hoàn tiền..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows={4}
                                        required
                                    />
                                </div>

                                {/* Policy Notice */}
                                <div className="p-4 border-l-4 border-blue-400 rounded-lg bg-blue-50">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                <strong>Lưu ý:</strong> Yêu cầu hoàn tiền sẽ được xử lý trong vòng 3-5 ngày làm việc. 
                                                Vui lòng đảm bảo thông tin tài khoản chính xác để tránh chậm trễ trong việc hoàn tiền.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200">
                            <button
                                onClick={closeRefundModal}
                                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmRefundRequest}
                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                disabled={submitRefundMutation.isPending}
                            >
                                {submitRefundMutation.isPending ? (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi yêu cầu...
                                    </div>
                                ) : (
                                    'Gửi yêu cầu hoàn tiền'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hotel Detail Modal */}
            {showHotelDetailModal && selectedHotel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                        {/* Header with gradient */}
                        <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="mb-2 text-2xl font-bold">Chi tiết đặt phòng khách sạn</h3>
                                    <p className="text-blue-100">Mã đặt phòng: #{selectedHotel._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={closeHotelDetailModal}
                                    className="p-2 text-white transition-colors rounded-full hover:text-gray-200 hover:bg-white hover:bg-opacity-20"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Hotel Overview Card */}
                            <div className="p-6 mb-6 border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={selectedHotel.hotelId?.hotelImages?.[0] || '/default-hotel.jpg'}
                                            alt={selectedHotel.hotelId?.hotelName || 'Hotel'}
                                            className="object-cover w-20 h-20 border-2 border-white shadow-md rounded-xl"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-2 text-xl font-bold text-gray-900">{selectedHotel.hotelId?.hotelName || 'Khách sạn'}</h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span>{selectedHotel.hotelId?.address || 'N/A'}</span>
                                            </div>
                                            {selectedHotel.hotelId?.starRating && (
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                    <span>{selectedHotel.hotelId.starRating} sao</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedHotel.payment_status)}`}>
                                            {getStatusText(selectedHotel.payment_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {/* Booking Dates & Guests */}
                                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                    <h5 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Thông tin đặt phòng
                                    </h5>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700">Nhận phòng</span>
                                            </div>
                                            <span className="font-semibold text-green-800">
                                                {selectedHotel.checkInDate ? new Date(selectedHotel.checkInDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700">Trả phòng</span>
                                            </div>
                                            <span className="font-semibold text-red-800">
                                                {selectedHotel.checkOutDate ? new Date(selectedHotel.checkOutDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700">Số đêm</span>
                                            </div>
                                            <span className="font-semibold text-blue-800">{selectedHotel.numberOfNights || 'N/A'} đêm</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <span className="text-sm font-medium text-gray-700">Số khách</span>
                                            </div>
                                            <span className="font-semibold text-purple-800">{selectedHotel.totalGuests || selectedHotel.numberOfGuests || 'N/A'} khách</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Room Details */}
                                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                    <h5 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Chi tiết phòng
                                    </h5>
                                    
                                    {selectedHotel.roomBookings && selectedHotel.roomBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {selectedHotel.roomBookings.map((room: any, index: number) => (
                                                <div key={index} className="p-4 rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h6 className="font-semibold text-gray-900">{room.roomTypeName || 'Loại phòng'}</h6>
                                                            {room.floorNumber && (
                                                                <span className="inline-block px-2 py-1 mt-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                                                                    Tầng {room.floorNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{room.numberOfRooms || 1} phòng</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Giá/đêm:</span>
                                                            <span className="ml-1 font-medium">{room.pricePerNight?.toLocaleString('vi-VN')} VND</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Tổng:</span>
                                                            <span className="ml-1 font-medium">{room.totalPrice?.toLocaleString('vi-VN')} VND</span>
                                                        </div>
                                                    </div>
                                                    {room.guests && room.guests.length > 0 && (
                                                        <div className="pt-3 mt-3 border-t border-gray-200">
                                                            <p className="mb-2 text-sm font-medium text-gray-700">Danh sách khách:</p>
                                                            <div className="space-y-1">
                                                                {room.guests.map((guest: any, guestIndex: number) => (
                                                                    <div key={guestIndex} className="text-sm text-gray-600">
                                                                        • {guest.fullName} ({guest.gender === 'male' ? 'Nam' : 'Nữ'})
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center text-gray-500">
                                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <p>Không có thông tin phòng</p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment & Contact Info */}
                                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                                    <h5 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Thông tin thanh toán
                                    </h5>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Tổng tiền</span>
                                                <span className="text-xl font-bold text-green-800">
                                                    {selectedHotel.totalPrice?.toLocaleString('vi-VN')} VND
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {selectedHotel.depositAmount && (
                                            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700">Tiền cọc</span>
                                                    <span className="text-lg font-semibold text-blue-800">
                                                        {selectedHotel.depositAmount.toLocaleString('vi-VN')} VND
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="p-4 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Phương thức</span>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {selectedHotel.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Loại thanh toán</span>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {selectedHotel.paymentType === 'full' ? 'Thanh toán đủ' : 
                                                     selectedHotel.paymentType === 'deposit' ? 'Đặt cọc' : 'Còn lại'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {selectedHotel.fullNameUser && (
                                            <div className="p-4 rounded-lg bg-gray-50">
                                                <div className="flex items-center mb-2 space-x-2">
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700">Người đặt</span>
                                                </div>
                                                <p className="text-sm text-gray-800">{selectedHotel.fullNameUser}</p>
                                                {selectedHotel.email && <p className="text-sm text-gray-600">{selectedHotel.email}</p>}
                                                {selectedHotel.phone && <p className="text-sm text-gray-600">{selectedHotel.phone}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Special Requests */}
                            {(selectedHotel.specialRequests || selectedHotel.note) && (
                                <div className="p-6 mt-6 border border-yellow-200 bg-yellow-50 rounded-2xl">
                                    <h5 className="flex items-center mb-3 text-lg font-semibold text-gray-900">
                                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Yêu cầu đặc biệt
                                    </h5>
                                    <p className="text-gray-700">{selectedHotel.specialRequests || selectedHotel.note}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                            <button
                                onClick={closeHotelDetailModal}
                                className="px-8 py-3 font-semibold text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 hover:shadow-xl hover:scale-105"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hotel Cancel Modal */}
            {showHotelCancelModal && selectedHotel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md mx-4 bg-white shadow-2xl rounded-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Hủy đặt phòng</h3>
                            <button
                                onClick={closeHotelCancelModal}
                                className="text-gray-400 transition-colors hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="mb-2 text-gray-700">
                                    Bạn có chắc chắn muốn hủy đặt phòng tại <strong>{selectedHotel.hotelId?.hotelName}</strong>?
                                </p>
                                <p className="text-sm text-gray-500">
                                    Thao tác này không thể hoàn tác. Nếu đã thanh toán, bạn sẽ được hoàn tiền theo chính sách của khách sạn.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-200">
                            <button
                                onClick={closeHotelCancelModal}
                                className="px-6 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    // Here you would implement the cancel hotel booking logic
                                    alert('Chức năng hủy đặt phòng khách sạn sẽ được triển khai!');
                                    closeHotelCancelModal();
                                }}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-200 font-semibold"
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}

export default InfoUser
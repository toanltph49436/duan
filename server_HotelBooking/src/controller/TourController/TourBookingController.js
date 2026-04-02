const TourBookingSchema = require("../../models/Tour/TourBooking.js");
const DateTourModel = require("../../models/Tour/DateTour.js");
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { sendMailBookingCashSuccess } = require("../../controller/mail/sendMail.js");

// Lấy thông tin booking theo ID
const getByIdBookingTour = async (req, res) => {
    try {
        const booking = await TourBookingSchema.findById(req.params.id)
            .populate('userId', 'username email')
            .populate({
                path: 'slotId',
                select: 'dateTour availableSeats tour',
                populate: {
                    path: 'tour',  
                    select: 'nameTour destination departure_location duration finalPrice imageTour tourType', 
                }
            });

        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }


        // Thêm thông tin về deadline thanh toán tiền mặt
        let paymentInfo = {};
        if (booking.payment_method === 'cash' && booking.cashPaymentDeadline) {
            const now = new Date();
            const deadline = new Date(booking.cashPaymentDeadline);
            const timeRemaining = deadline - now;
            const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
            const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
            
            paymentInfo = {
                deadline: booking.cashPaymentDeadline,
                isExpired: timeRemaining <= 0,
                hoursRemaining,
                minutesRemaining,
                timeRemainingText: timeRemaining <= 0 ? 'Đã hết hạn' : `${hoursRemaining}h ${minutesRemaining}m`
            };
        }

        res.status(200).json({
            success: true,
            booking: booking,
            paymentInfo
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Admin: Lấy tất cả booking để quản lý
const getAllBookingsForAdmin = async (req, res) => {
    try {

        const { status, page = 1, limit = 10, search, slotId } = req.query;
        
        let query = {};
        
        // Filter theo trạng thái
        if (status && status !== 'all') {
            query.payment_status = status;
        }
        

        // Filter theo slotId (cho trang danh sách người tham gia tour)
        if (slotId) {
            query.slotId = slotId;
        }
        
        // Search theo tên tour hoặc tên khách hàng
        if (search) {
            query.$or = [
                { fullNameUser: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        
        const bookings = await TourBookingSchema.find(query)
            .populate('userId', 'username email')
            .populate({
                path: 'slotId',
                select: 'dateTour availableSeats tour',
                populate: {
                    path: 'tour',
                    select: 'nameTour destination departure_location duration finalPrice imageTour tourType',
                    populate: {
                        path: 'destination',
                        select: 'locationName country'
                    }
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await TourBookingSchema.countDocuments(query);
        
        res.status(200).json({
            success: true,
            bookings: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Admin: Xác nhận hủy booking
const adminConfirmCancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const { adminId, reason, refund_amount, refund_policy } = req.body;
        
        // Tìm booking cần hủy
        const booking = await TourBookingSchema.findById(id)
            .populate('slotId');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đặt chỗ cần hủy" 
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status === 'cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: "Đặt chỗ đã được hủy trước đó" 
            });
        }


        // Tính số tiền hoàn trả dựa trên chính sách
        let calculatedRefundAmount = 0;
        
        if (booking.payment_status === 'completed' || booking.payment_status === 'deposit_paid') {
            if (refund_policy === 'full') {
                // Hoàn trả toàn bộ số tiền đã thanh toán
                calculatedRefundAmount = booking.payment_status === 'completed' ? 
                    booking.totalPriceTour : booking.depositAmount || (booking.totalPriceTour * 0.5);
            } else if (refund_policy === 'partial') {
                // Hoàn trả một phần tiền (mặc định 50%)
                calculatedRefundAmount = booking.payment_status === 'completed' ? 
                    booking.totalPriceTour * 0.5 : (booking.depositAmount || (booking.totalPriceTour * 0.5)) * 0.5;
            } else if (refund_policy === 'custom' && refund_amount) {
                // Số tiền hoàn trả tùy chỉnh
                calculatedRefundAmount = refund_amount;
            }
        }

        // Cập nhật trạng thái thành cancelled
        booking.payment_status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancelledBy = adminId;
        booking.cancelReason = reason || 'Admin xác nhận hủy';

        
        // Nếu có hoàn tiền, cập nhật thông tin hoàn tiền
        if (calculatedRefundAmount > 0) {
            booking.refund_amount = calculatedRefundAmount;
            booking.refund_status = 'pending';
            booking.refund_policy = refund_policy;
        }
        
        await booking.save();

        // Hoàn trả số ghế về slot
        const totalPassengers = booking.adultsTour + (booking.childrenTour || 0) + (booking.toddlerTour || 0) + (booking.infantTour || 0);
        booking.slotId.availableSeats += totalPassengers;
        await booking.slotId.save();

        res.status(200).json({
            success: true,
            message: "Admin đã xác nhận hủy đặt chỗ thành công",
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                cancelledAt: booking.cancelledAt,
                cancelledBy: booking.cancelledBy,
                cancelReason: booking.cancelReason,

                refundInfo: calculatedRefundAmount > 0 ? {
                    amount: calculatedRefundAmount,
                    policy: refund_policy,
                    status: booking.refund_status
                } : null
            }
        });

    } catch (error) {
        console.error("Lỗi admin hủy booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi admin hủy đặt chỗ", 
            error: error.message 
        });
    }
};

// Admin: Lấy thống kê booking
const getBookingStats = async (req, res) => {
    try {
        const stats = await TourBookingSchema.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'pending'] }, 1, 0]
                        }
                    },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'completed'] }, 1, 0]
                        }
                    },
                    cancelled: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'cancelled'] }, 1, 0]
                        }
                    },
                    pendingCancel: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'pending_cancel'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            total: 0,
            pending: 0,
            completed: 0,
            cancelled: 0,
            pendingCancel: 0
        };

        res.status(200).json({
            success: true,
            stats: result
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy thống kê booking", 
            error: error.message 
        });
    }
};

// User: Yêu cầu hủy đặt chỗ (chuyển sang trạng thái pending_cancel)
const requestCancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body.userId || req.query.userId;
        const { reason } = req.body;
        
        // Tìm booking cần hủy
        const booking = await TourBookingSchema.findById(id)
            .populate('slotId');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đặt chỗ cần hủy" 
            });
        }

        // Kiểm tra quyền hủy (chỉ chủ đặt chỗ mới được yêu cầu hủy)
        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền yêu cầu hủy đặt chỗ này" 
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status === 'cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: "Đặt chỗ đã được hủy trước đó" 
            });
        }

        if (booking.payment_status === 'pending_cancel') {
            return res.status(400).json({ 
                success: false, 
                message: "Đã có yêu cầu hủy đang chờ xử lý" 
            });
        }

        // Kiểm tra thời gian hủy
        const tourDate = new Date(booking.slotId.dateTour);
        const currentDate = new Date();
        const daysDifference = Math.ceil((tourDate - currentDate) / (1000 * 60 * 60 * 24));

        // Không cho phép hủy nếu đã đến ngày khởi hành
        if (daysDifference <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không thể yêu cầu hủy đặt chỗ khi tour đã khởi hành" 
            });
        }

        // Cập nhật trạng thái thành pending_cancel
        booking.payment_status = 'pending_cancel';
        booking.cancelRequestedAt = new Date();
        booking.cancelReason = reason || 'Khách hàng yêu cầu hủy';
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Yêu cầu hủy đặt chỗ đã được gửi và đang chờ admin xác nhận",
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                cancelRequestedAt: booking.cancelRequestedAt,
                cancelReason: booking.cancelReason
            }
        });

    } catch (error) {
        console.error("Lỗi yêu cầu hủy booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi yêu cầu hủy đặt chỗ", 
            error: error.message 
        });
    }
};

// Hủy đặt chỗ tour (giữ lại function cũ để tương thích)
const cancelBookingTour = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.body.userId || req.query.userId; // Lấy userId từ body hoặc query
        
        // Tìm booking cần hủy
        const booking = await TourBookingSchema.findById(id)
            .populate('slotId');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đặt chỗ cần hủy" 
            });
        }

        // Kiểm tra quyền hủy (chỉ chủ đặt chỗ mới được hủy)
        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền hủy đặt chỗ này" 
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status === 'cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: "Đặt chỗ đã được hủy trước đó" 
            });
        }

        // Kiểm tra thời gian hủy
        const tourDate = new Date(booking.slotId.dateTour);
        const currentDate = new Date();
        const daysDifference = Math.ceil((tourDate - currentDate) / (1000 * 60 * 60 * 24));

        // Không cho phép hủy nếu đã đến ngày khởi hành
        if (daysDifference <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Không thể hủy đặt chỗ khi tour đã khởi hành" 
            });
        }

        // Kiểm tra nếu đã thanh toán và muốn hoàn tiền
        let refundMessage = "";
        if (booking.payment_status === 'completed') {
            // Logic hoàn tiền có thể được thêm ở đây
            refundMessage = " Đặt chỗ đã thanh toán sẽ được xử lý hoàn tiền theo chính sách.";
        }

        // Cập nhật trạng thái thành cancelled
        booking.payment_status = 'cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        // Hoàn trả số ghế về slot
        const totalPassengers = booking.adultsTour + (booking.childrenTour || 0) + (booking.toddlerTour || 0) + (booking.infantTour || 0);
        booking.slotId.availableSeats += totalPassengers;
        await booking.slotId.save();

        res.status(200).json({
            success: true,
            message: "Hủy đặt chỗ thành công" + refundMessage,
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                cancelledAt: booking.cancelledAt,
                refundInfo: booking.payment_status === 'completed' ? {
                    amount: booking.totalPriceTour,
                    policy: "Hoàn tiền theo chính sách của công ty"
                } : null
            }
        });

    } catch (error) {
        console.error("Lỗi hủy booking:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi hủy đặt chỗ", 
            error: error.message 
        });
    }
};

// Tạo booking tour mới
const BookingTour = async (req, res) => {
    console.log("👉 Vào được BookingTour");
    console.log("📦 Body nhận được:", req.body);
    try {
        const {
            userId,
            slotId,
            fullNameUser,
            email,
            phone,
            address,
            adultsTour,
            childrenTour,
            toddlerTour,
            infantTour,
            adultPassengers,
            childPassengers,
            toddlerPassengers,
            infantPassengers,
            payment_method,
            note,
            isFullPayment,
        } = req.body;

        // Kiểm tra duplicate booking trong 5 phút
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existingBooking = await TourBookingSchema.findOne({
            userId,
            slotId,
            createdAt: { $gte: fiveMinutesAgo }
        });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: "Đơn booking đã tồn tại trong 5 phút gần đây" });
        }

        // Lấy slot và tour
        const slot = await DateTourModel.findById(slotId).populate("tour");
        if (!slot) return res.status(404).json({ success: false, message: "Không tìm thấy slot" });
        if (slot.availableSeats <= 0) return res.status(400).json({ success: false, message: "Slot đã hết chỗ" });

        const tour = slot.tour;
        if (!tour) return res.status(404).json({ success: false, message: "Không tìm thấy tour" });

        // Giá tour (không bao gồm vé máy bay)
        const tourPriceAdult = tour.finalPrice || tour.price || 0;
        const tourPriceChild = tour.priceChildren || 0;
        const tourPriceToddler = tour.priceLittleBaby || 0;
        const tourPriceInfant = tour.pricebaby || 0;
        const priceSingleRoom = tour.priceSingleRoom || 0;

        // Giá vé máy bay (nếu tour bao gồm vé máy bay)
        const flightPriceAdult = tour.includesFlight ? (tour.flightPrice || 0) : 0;
        const flightPriceChild = tour.includesFlight ? (tour.flightPriceChildren || 0) : 0;
        const flightPriceToddler = tour.includesFlight ? (tour.flightPriceLittleBaby || 0) : 0;
        const flightPriceInfant = tour.includesFlight ? (tour.flightPriceBaby || 0) : 0;

        // Tổng giá cho mỗi loại khách (tour + vé máy bay)
        const totalPriceAdult = tourPriceAdult + flightPriceAdult;
        const totalPriceChild = tourPriceChild + flightPriceChild;
        const totalPriceToddler = tourPriceToddler + flightPriceToddler;
        const totalPriceInfant = tourPriceInfant + flightPriceInfant;

        // Số phòng đơn
        const singleRoomCount = (adultPassengers || []).filter(p => p.singleRoom === true).length;

        // Tổng tiền (bao gồm cả vé máy bay nếu có)
        const totalFinalPriceTour =
            Number(adultsTour) * totalPriceAdult +
            Number(childrenTour || 0) * totalPriceChild +
            Number(toddlerTour || 0) * totalPriceToddler +
            Number(infantTour || 0) * totalPriceInfant +
            singleRoomCount * priceSingleRoom;

        // Đặt cọc
        const depositAmount = Math.round(totalFinalPriceTour * 0.5);

        // Trạng thái thanh toán
        const paymentStatus = "pending";
        const isDeposit = !isFullPayment;
        const depositAmountValue = !isFullPayment ? depositAmount : 0;
        const isFullyPaid = !!isFullPayment;

        // Hạn thanh toán tiền mặt
        let cashPaymentDeadline = null;
        if (payment_method === "cash") {
            cashPaymentDeadline = new Date();
            cashPaymentDeadline.setHours(cashPaymentDeadline.getHours() + 48);
        }

        // Tạo booking
        const booking = new TourBookingSchema({
            userId,
            tourId: tour._id,
            slotId: slot._id,
            fullNameUser,
            email,
            phone,
            address,
            totalPriceTour: totalFinalPriceTour,
            adultsTour,
            childrenTour,
            toddlerTour,
            infantTour,
            adultPassengers,
            childPassengers,
            toddlerPassengers,
            infantPassengers,
            payment_method,
            payment_status: paymentStatus,
            note,
            isDeposit,
            depositAmount: depositAmountValue,
            isFullyPaid,
            cashPaymentDeadline
        });

        await booking.save();

        // Cập nhật số ghế còn lại
        slot.availableSeats -= Number(adultsTour) + Number(childrenTour || 0) + Number(toddlerTour || 0) + Number(infantTour || 0);
        if (slot.availableSeats < 0) slot.availableSeats = 0;
        await slot.save();

        // Nếu thanh toán VNPay
        if (payment_method === "bank_transfer") {
            const vnpay = new VNPay({
                tmnCode: 'LH54Z11C',
                secureSecret: 'PO0WDG07TJOGP1P8SO6Z9PHVPIBUWBGQ',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true,
                hashAlgorithm: 'SHA512',
                loggerFn: ignoreLogger,
            });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const paymentAmount = isFullPayment ? totalFinalPriceTour : depositAmount;

            const paymentUrl = await vnpay.buildPaymentUrl({
                vnp_Amount: paymentAmount,
                vnp_IpAddr: req.ip || '127.0.0.1',
                vnp_TxnRef: `${booking._id}-${Date.now()}`,
                vnp_OrderInfo: `Thanh toán ${isFullPayment ? 'đầy đủ' : 'đặt cọc'} đơn #${booking._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:8080/api/vnpay/payment-callback`,
                vnp_Locale: VnpLocale.VN,
                vnp_CreateDate: dateFormat(new Date()),
                vnp_ExpireDate: dateFormat(tomorrow),
            });

            console.log('Generated VNPay URL:', paymentUrl);

            return res.status(201).json({
                success: true,
                message: "Đặt tour thành công - chuyển đến VNPay",
                booking,
                paymentUrl,
                depositAmount: isFullPayment ? null : depositAmount,
                totalAmount: totalFinalPriceTour
            });
        }

        // Nếu thanh toán tiền mặt, gửi mail xác nhận
        if (payment_method === "cash") {
            await sendMailBookingCashSuccess(
                booking,
                tour,
                totalFinalPriceTour,
                depositAmount,
                isFullPayment
            );
        }

        // Trả về response bình thường
        res.status(201).json({
            success: true,
            message: "Đặt tour thành công",
            booking,
            depositAmount: isFullPayment ? null : depositAmount,
            totalAmount: totalFinalPriceTour
        });

    } catch (error) {
        console.error("Lỗi tạo booking:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo booking",
            error: error.message,
        });
    }
};


const getBookingToursByUser = async (req, res) => {
    try {
        const bookings = await TourBookingSchema.find({ userId: req.params.userId })
            .populate('userId', 'username email')
            .populate({
                path: 'slotId',
                select: 'dateTour availableSeats tour',
                populate: {
                    path: 'tour',
                    select: 'nameTour destination departure_location duration finalPrice imageTour tourType',
                }
            });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy booking nào cho người dùng này" });
        }

        res.status(200).json({
            success: true,
            bookings: bookings,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Hàm tính hoàn tiền dựa trên chính sách
function calculateRefund(tourType, isFlight, daysBefore, totalPrice) {
    let refund = 0;
    let note = '';
    if (isFlight) {
        if (daysBefore >= 15) {
            refund = totalPrice; note = 'Trừ vé máy bay nếu không hoàn được';
        } else if (daysBefore >= 7) {
            refund = totalPrice * 0.6; note = 'Vé máy bay thu theo điều kiện';
        } else {
            refund = 0; note = 'Không hoàn hoặc hoàn rất ít, vé máy bay đã chốt';
        }
    } else {
        if (daysBefore >= 7) {
            refund = totalPrice; note = 'Trừ phí đặt cọc nhỏ';
        } else if (daysBefore >= 3) {
            refund = totalPrice * 0.6; note = 'Có thể đã đặt trước dịch vụ';
        } else {
            refund = totalPrice * 0.1; note = 'Gần ngày tour, tổ chức khó thay đổi';
        }
    }
    return { refund, note };
}

// API: User gửi yêu cầu hủy booking
exports.requestCancel = async (req, res) => {
    try {
        const { userId, reason } = req.body;
        const booking = await TourBookingSchema.findById(req.params.id).populate({
            path: 'slotId',
            populate: { path: 'tour' }
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== userId) return res.status(403).json({ message: 'Forbidden' });
        const now = new Date();
        const tourDate = new Date(booking.slotId.dateTour);
        const daysBefore = Math.ceil((tourDate - now) / (1000 * 60 * 60 * 24));
        const isFlight = booking.slotId.tour.tourType === 'maybay';
        const { refund, note } = calculateRefund(booking.slotId.tour.tourType, isFlight, daysBefore, booking.totalPriceTour);
        booking.cancel_requested = true;
        booking.cancel_reason = reason;
        booking.cancel_status = 'pending';
        booking.refund_amount = refund;
        booking.cancel_policy_note = note;
        await booking.save();
        res.json({ message: 'Yêu cầu hủy đã gửi', refund, note });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API: Admin duyệt yêu cầu hủy
exports.approveCancel = async (req, res) => {
    try {
        const { approve } = req.body;
        const booking = await TourBookingSchema.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (approve) {
            booking.cancel_status = 'approved';
            booking.payment_status = 'cancelled';
        } else {
            booking.cancel_status = 'rejected';
        }
        await booking.save();
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// Admin: Xác nhận thanh toán cọc tiền mặt
const confirmCashPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, note } = req.body;
        const paymentImage = req.file; // File được upload từ middleware
        
        console.log('🔍 Debug confirmCashPayment:');
        console.log('- adminId:', adminId);
        console.log('- note:', note);
        console.log('- paymentImage:', paymentImage ? paymentImage.filename : 'No file uploaded');
        
        // Tìm booking cần xác nhận thanh toán
        const booking = await TourBookingSchema.findById(id)
            .populate('slotId')
            .populate('userId', 'username email');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đặt chỗ cần xác nhận thanh toán" 
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Không thể xác nhận thanh toán cho đặt chỗ có trạng thái: ${booking.payment_status}` 
            });
        }

        // Kiểm tra phương thức thanh toán
        if (booking.payment_method !== 'cash') {
            return res.status(400).json({ 
                success: false, 
                message: "Chỉ có thể xác nhận thanh toán cho đặt chỗ thanh toán tiền mặt" 
            });
        }

        // Kiểm tra deadline thanh toán tiền mặt
        if (booking.cashPaymentDeadline && new Date() > new Date(booking.cashPaymentDeadline)) {
            return res.status(400).json({ 
                success: false, 
                message: "Đã quá hạn thanh toán tiền mặt (48 giờ)" 
            });
        }

        // Cập nhật trạng thái thanh toán cọc
        booking.payment_status = 'deposit_paid';
        booking.isDeposit = true;
        // Tính và set depositAmount nếu chưa có
        if (!booking.depositAmount || booking.depositAmount === 0) {
            booking.depositAmount = Math.floor(booking.totalPriceTour * 0.5); // 50% của tổng tiền
        }
        booking.depositPaidAt = new Date(); // Thời gian thanh toán cọc
        booking.paymentConfirmedBy = adminId;
        if (note) {
            booking.paymentNote = note;
        }
        if (paymentImage) {
            booking.paymentImage = paymentImage.filename; // Lưu tên file ảnh
        }
        
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Xác nhận thanh toán cọc thành công",
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                depositAmount: booking.depositAmount,
                depositPaidAt: booking.depositPaidAt,
                paymentConfirmedBy: booking.paymentConfirmedBy,
                paymentNote: booking.paymentNote,
                paymentImage: booking.paymentImage,
                customerInfo: {
                    name: booking.fullNameUser,
                    email: booking.email,
                    phone: booking.phone
                },
                tourInfo: {
                    name: booking.slotId?.tour?.nameTour,
                    date: booking.slotId?.dateTour,
                    totalAmount: booking.totalPriceTour,
                    depositAmount: booking.depositAmount
                }
            }
        });

    } catch (error) {
        console.error("Lỗi xác nhận thanh toán cọc:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi xác nhận thanh toán cọc", 
            error: error.message 
        });
    }
};

// Admin: Xác nhận thanh toán toàn bộ
const confirmFullPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, note } = req.body;
        const paymentImage = req.file; // File được upload từ middleware
        
        // Tìm booking cần xác nhận thanh toán toàn bộ
        const booking = await TourBookingSchema.findById(id)
            .populate('slotId')
            .populate('userId', 'username email');
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đặt chỗ cần xác nhận thanh toán" 
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status !== 'deposit_paid') {
            return res.status(400).json({ 
                success: false, 
                message: `Chỉ có thể xác nhận thanh toán toàn bộ cho đặt chỗ đã thanh toán cọc. Trạng thái hiện tại: ${booking.payment_status}` 
            });
        }

        // Cập nhật trạng thái thanh toán toàn bộ
        booking.payment_status = 'completed';
        booking.isFullyPaid = true;
        booking.fullPaidAt = new Date(); // Thời gian thanh toán toàn bộ
        booking.fullPaymentConfirmedBy = adminId;
        if (note) {
            booking.fullPaymentNote = note;
        }
        if (paymentImage) {
            booking.fullPaymentImage = paymentImage.filename; // Lưu tên file ảnh thanh toán toàn bộ
        }
        
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Xác nhận thanh toán toàn bộ thành công",
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                isFullyPaid: booking.isFullyPaid,
                fullPaidAt: booking.fullPaidAt,
                fullPaymentConfirmedBy: booking.fullPaymentConfirmedBy,
                fullPaymentNote: booking.fullPaymentNote,
                fullPaymentImage: booking.fullPaymentImage,
                customerInfo: {
                    name: booking.fullNameUser,
                    email: booking.email,
                    phone: booking.phone
                },
                tourInfo: {
                    name: booking.slotId?.tour?.nameTour,
                    date: booking.slotId?.dateTour,
                    totalAmount: booking.totalPriceTour
                }
            }
        });

    } catch (error) {
        console.error("Lỗi xác nhận thanh toán toàn bộ:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi xác nhận thanh toán toàn bộ", 
            error: error.message 
        });
    }
};

// Tính doanh thu chính xác (chỉ tính booking completed và trừ refund)
const getAccurateRevenue = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'month' } = req.query;
        
        let matchCondition = {
            payment_status: 'completed'
        };
        
        // Nếu có filter theo thời gian
        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) {
                matchCondition.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                matchCondition.createdAt.$lte = new Date(endDate);
            }
        }
        
        // Tính tổng doanh thu từ booking completed
        const completedBookings = await TourBookingSchema.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPriceTour' },
                    totalBookings: { $sum: 1 }
                }
            }
        ]);
        
        // Tính tổng số tiền hoàn lại từ booking cancelled
        const refundAmount = await TourBookingSchema.aggregate([
            {
                $match: {
                    payment_status: 'cancelled',
                    refund_amount: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRefund: { $sum: '$refund_amount' },
                    totalCancelledBookings: { $sum: 1 }
                }
            }
        ]);
        
        const revenue = completedBookings[0] || { totalRevenue: 0, totalBookings: 0 };
        const refund = refundAmount[0] || { totalRefund: 0, totalCancelledBookings: 0 };
        
        // Doanh thu thực tế = Doanh thu từ booking completed - Số tiền hoàn lại
        const actualRevenue = revenue.totalRevenue - refund.totalRefund;
        
        // Nếu cần group theo tháng/tuần/ngày
        let revenueByPeriod = [];
        if (groupBy) {
            let groupFormat;
            switch (groupBy) {
                case 'day':
                    groupFormat = {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    };
                    break;
                case 'week':
                    groupFormat = {
                        year: { $year: '$createdAt' },
                        week: { $week: '$createdAt' }
                    };
                    break;
                case 'month':
                default:
                    groupFormat = {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    };
                    break;
            }
            
            revenueByPeriod = await TourBookingSchema.aggregate([
                { $match: matchCondition },
                {
                    $group: {
                        _id: groupFormat,
                        revenue: { $sum: '$totalPriceTour' },
                        bookings: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
            ]);
        }
        
        res.status(200).json({
            success: true,
            data: {
                actualRevenue,
                grossRevenue: revenue.totalRevenue,
                totalRefund: refund.totalRefund,
                completedBookings: revenue.totalBookings,
                cancelledBookings: refund.totalCancelledBookings,
                revenueByPeriod
            }
        });
    } catch (error) {
        console.error('Lỗi tính doanh thu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tính doanh thu',
            error: error.message
        });
    }
};

// API lấy danh sách các booking cần hoàn tiền
const getRefundList = async (req, res) => {
    try {
        const { status } = req.query;
        
        // Tạo query - tìm kiếm tất cả booking có yêu cầu hoàn tiền
        let query = {
            $or: [
                { refund_amount: { $gt: 0 } },
                { payment_status: { $in: ['refund_pending', 'refund_processing', 'refund_completed'] } },
                { refund_status: { $exists: true, $ne: null } }
            ]
        };
        
        // Lọc theo trạng thái hoàn tiền
        if (status && ['pending', 'processing', 'completed'].includes(status)) {
            query.refund_status = status;
        }
        
        // Lấy danh sách booking cần hoàn tiền
        const refundBookings = await TourBookingSchema.find(query)
            .populate({
                path: 'userId',
                select: 'name email phone'
            })
            .populate({
                path: 'slotId',
                select: 'dateTour',
                populate: {
                    path: 'tour',
                    select: 'nameTour destination departure_location duration tourType'
                }
            })
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            count: refundBookings.length,
            data: refundBookings
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách hoàn tiền:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách hoàn tiền'
        });
    }
};

// API cập nhật trạng thái hoàn tiền
const updateRefundStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { refund_status, refund_method, refund_note } = req.body;
        
        // Lấy thông tin file upload nếu có
        const refund_image = req.file ? `/uploads/refund-confirmations/${req.file.filename}` : null;
        
        // Kiểm tra trạng thái hợp lệ
        if (!['pending', 'processing', 'completed'].includes(refund_status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái hoàn tiền không hợp lệ'
            });
        }
        
        // Tìm booking
        const booking = await TourBookingSchema.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }
        
        // Kiểm tra booking có cần hoàn tiền không
        if (!booking.refund_status && booking.refund_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Booking này không cần hoàn tiền'
            });
        }
        
        // Cập nhật trạng thái hoàn tiền
        booking.refund_status = refund_status;
        booking.refund_method = refund_method;
        booking.refund_note = refund_note;
        booking.refund_image = refund_image;
        
        // Đồng bộ payment_status với refund_status để client hiển thị đúng
        if (refund_status === 'pending') {
            booking.payment_status = 'refund_pending';
        } else if (refund_status === 'processing') {
            booking.payment_status = 'refund_processing';
        } else if (refund_status === 'completed') {
            booking.payment_status = 'refund_completed';
            booking.refund_date = new Date();
        }
        
        // Nếu đã hoàn tiền xong, cập nhật ngày hoàn tiền
        if (refund_status === 'completed') {
            booking.refund_date = new Date();
        }
        
        await booking.save();
        
        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái hoàn tiền thành công',
            data: booking
        });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái hoàn tiền:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật trạng thái hoàn tiền'
        });
    }
};

// API lấy thống kê hoàn tiền
const getRefundStats = async (req, res) => {
    try {
        // Lấy thống kê hoàn tiền theo trạng thái
        const stats = await TourBookingSchema.aggregate([
            {
                $match: {
                    refund_amount: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: "$refund_status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$refund_amount" }
                }
            }
        ]);
        
        // Tạo đối tượng kết quả
        const result = {
            total: 0,
            pending: 0,
            processing: 0,
            completed: 0,
            totalAmount: 0,
            pendingAmount: 0,
            processingAmount: 0,
            completedAmount: 0
        };
        
        // Điền dữ liệu từ kết quả aggregate
        stats.forEach(stat => {
            if (stat._id) {
                result[stat._id] = stat.count;
                result[`${stat._id}Amount`] = stat.totalAmount;
            } else {
                result.null = stat.count;
            }
            result.total += stat.count;
            result.totalAmount += stat.totalAmount;
        });
        
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê hoàn tiền:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thống kê hoàn tiền'
        });
    }
};

// Xử lý yêu cầu hoàn tiền từ client
const submitRefundRequest = async (req, res) => {
    try {
        const { bookingId, bankInfo, contactInfo, refundReason, userId, shouldCancelBooking } = req.body;
        
        // Tìm booking
        const booking = await TourBookingSchema.findById(bookingId).populate('slotId');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }
        
        // Kiểm tra quyền sở hữu booking
        if (booking.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền yêu cầu hoàn tiền cho booking này'
            });
        }
        
        // Nếu cần hủy booking trước
        if (shouldCancelBooking) {
            // Kiểm tra trạng thái booking có thể hủy
            if (booking.payment_status === 'cancelled' || booking.payment_status === 'pending_cancel') {
            return res.status(400).json({
                success: false,
                    message: 'Booking đã được hủy trước đó'
                });
            }
            
            // Kiểm tra trạng thái có thể hủy
            const allowedStatuses = ['confirmed', 'completed', 'deposit_paid'];
            if (!allowedStatuses.includes(booking.payment_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể hủy booking đã được xác nhận hoặc đã thanh toán'
                });
            }

            // Nếu là deposit_paid, phải có xác nhận từ admin
            if (booking.payment_status === 'deposit_paid' && !booking.depositPaidAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking đặt cọc chưa được admin xác nhận, không thể hủy'
                });
            }
            
            // Kiểm tra thời gian hủy
            const tourDate = new Date(booking.slotId.dateTour);
            const currentDate = new Date();
            const daysDifference = Math.ceil((tourDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

            // Không cho phép hủy nếu đã đến ngày khởi hành
            if (daysDifference <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể hủy đặt chỗ khi tour đã khởi hành" 
                });
            }
            
            // Hủy booking
            booking.payment_status = 'cancelled';
            booking.cancelledAt = new Date();
            booking.cancelReason = refundReason;
        } else {
            // Kiểm tra trạng thái booking (phải đã hủy hoặc đang chờ hủy)
            if (booking.payment_status !== 'cancelled' && booking.payment_status !== 'pending_cancel') {
                return res.status(400).json({
                    success: false,
                    message: 'Chỉ có thể yêu cầu hoàn tiền cho booking đã được hủy'
                });
            }
        }
        
        // Tính toán số tiền hoàn trả theo chính sách
        const tourDate = new Date(booking.slotId.dateTour);
        const currentDate = new Date();
        const daysDifference = Math.ceil((tourDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Chính sách hoàn tiền theo Điều khoản & Chính sách
        let refundPercentage = 0;
        if (daysDifference >= 30) {
            refundPercentage = 100; // Trước 30 ngày: Hoàn 100%
        } else if (daysDifference >= 15) {
            refundPercentage = 70;  // Từ 15-29 ngày: Hoàn 70%
        } else if (daysDifference >= 7) {
            refundPercentage = 50;  // Từ 7-14 ngày: Hoàn 50%
        } else if (daysDifference >= 4) {
            refundPercentage = 30;  // Từ 4-6 ngày: Hoàn 30%
        } else {
            refundPercentage = 0;   // Dưới 3 ngày: Không hoàn tiền
        }
        
        // Tính toán dựa trên số tiền đã thanh toán thực tế
        let baseAmount = 0;
        if (booking.payment_status === 'completed') {
            baseAmount = booking.totalPriceTour || 0;
        } else if (booking.payment_status === 'deposit_paid' || booking.isDeposit) {
            baseAmount = booking.depositAmount || 0;
        } else {
            baseAmount = booking.totalPriceTour || 0;
        }
        
        const calculatedRefundAmount = Math.round(baseAmount * refundPercentage / 100);
        
        // Cập nhật thông tin hoàn tiền
        booking.refundInfo = {
            amount: calculatedRefundAmount,
            bankInfo: bankInfo,
            contactInfo: contactInfo,
            refundReason: refundReason,
            requestedAt: new Date(),
            status: 'pending'
        };
        
        // Cập nhật trạng thái hoàn tiền
        booking.refund_status = 'pending';
        booking.refund_amount = calculatedRefundAmount;
        booking.refund_method = 'bank_transfer';
        
        // Cập nhật trạng thái payment thành refund_pending để hiển thị đúng trên UI
        booking.payment_status = 'refund_pending';
        
        await booking.save();
        
        res.status(200).json({
            success: true,
            message: shouldCancelBooking ? 
                'Tour đã được hủy và yêu cầu hoàn tiền đã được gửi thành công! Admin sẽ xử lý trong vòng 3-5 ngày làm việc.' :
                'Yêu cầu hoàn tiền đã được gửi thành công! Admin sẽ xử lý trong vòng 3-5 ngày làm việc.',
            data: {
                bookingId: booking._id,
                refundAmount: calculatedRefundAmount,
                refundStatus: 'pending',
                paymentStatus: 'refund_pending'
            }
        });
        
    } catch (error) {
        console.error('Error submitting refund request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi yêu cầu hoàn tiền'
        });
    }
};

module.exports = {
    getByIdBookingTour,
    BookingTour,
    getBookingToursByUser,
    cancelBookingTour,
    getAllBookingsForAdmin,
    adminConfirmCancelBooking,
    requestCancelBooking,

    getBookingStats,
    confirmCashPayment,
    confirmFullPayment,
    getAccurateRevenue,
    getRefundList,
    updateRefundStatus,
    getRefundStats,
    submitRefundRequest
};

// Lấy bookings theo date slot ID cho trang chi tiết slot
const getBookingsBySlotId = async (req, res) => {
    try {
        const { slotId } = req.params;
        
        if (!slotId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu slotId" 
            });
        }

        const bookings = await TourBookingSchema.find({ slotId })
            .populate({
                path: 'userId',
                select: 'username email name'
            })
            .populate({
                path: 'slotId',
                select: 'dateTour availableSeats tour',
                populate: {
                    path: 'tour',
                    select: 'nameTour destination departure_location duration price imageTour tourType maxPeople',
                    populate: {
                        path: 'destination',
                        model: 'Location',
                        select: 'locationName country'
                    }
                }
            })
            .sort({ createdAt: -1 });
            
        console.log(`Found ${bookings.length} bookings for slot ${slotId}`);
        bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
                id: booking._id,
                payment_status: booking.payment_status,
                totalPriceTour: booking.totalPriceTour,
                adultsTour: booking.adultsTour,
                childrenTour: booking.childrenTour,
                toddlerTour: booking.toddlerTour,
                infantTour: booking.infantTour
            });
        });

        res.status(200).json({
            success: true,
            message: `Lấy thành công ${bookings.length} booking cho slot ${slotId}`,
            data: bookings
        });

    } catch (error) {
        console.error('Lỗi lấy bookings theo slotId:', error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server", 
            error: error.message 
        });
    }
};

module.exports = {
    getByIdBookingTour,
    BookingTour,
    getBookingToursByUser,
    cancelBookingTour,
    getAllBookingsForAdmin,
    adminConfirmCancelBooking,
    requestCancelBooking,
    getBookingStats,
    confirmCashPayment,
    confirmFullPayment,
    getAccurateRevenue,
    getRefundList,
    updateRefundStatus,
    getRefundStats,
    submitRefundRequest,
    getBookingsBySlotId
};
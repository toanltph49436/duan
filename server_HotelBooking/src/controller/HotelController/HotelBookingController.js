const HotelBooking = require("../../models/Hotel/HotelBooking.js");
const Hotel = require("../../models/Hotel/HotelModel.js");
const DateHotel = require("../../models/Hotel/DateHotel.js");
const { checkHotelAvailability } = require('./HotelController.js');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const { sendMailHotelBookingCashSuccess } = require("../mail/sendMail.js");
const getByIdHotelBooking = async (req, res) => {
    try {
        const booking = await HotelBooking.findById(req.params.id)
            .populate('userId', 'username email')
            .populate({
                path: 'hotelId',
                select: 'hotelName location address starRating hotelImages roomTypes policies contactInfo',
                populate: {
                    path: 'location',
                    select: 'locationName country'
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
            data: booking,
            paymentInfo
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Đặt phòng khách sạn
const bookHotel = async (req, res) => {
    try {
        const {
            userId,
            hotelId,
            checkInDate,
            checkOutDate,
            fullNameUser,
            email,
            phone,
            address,
            roomBookings,
            payment_method,
            paymentType = 'full',
            note,
            specialRequests
        } = req.body;

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) return res.status(400).json({ success: false, message: "Ngày check-in không thể là ngày trong quá khứ" });
        if (checkOut <= checkIn) return res.status(400).json({ success: false, message: "Ngày check-out phải sau ngày check-in" });

        const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        // Lấy thông tin khách sạn
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: "Không tìm thấy khách sạn" });

        // Kiểm tra tình trạng phòng
        const totalRoomsNeeded = roomBookings.reduce((sum, r) => sum + r.numberOfRooms, 0);
        const totalGuests = roomBookings.reduce((sum, r) => sum + r.guests.length, 0);
        const availability = await checkHotelAvailability(hotelId, checkIn, checkOut, totalRoomsNeeded, totalGuests);
        if (!availability.available) return res.status(400).json({ success: false, message: "Không có đủ phòng trống" });

        // Tính toán giá đơn giản (không có thuế và phí dịch vụ)
        let totalPrice = 0;
        const processedRoomBookings = [];

        for (const roomBooking of roomBookings) {
            const roomType = hotel.roomTypes[roomBooking.roomTypeIndex];
            if (!roomType) return res.status(400).json({ success: false, message: `Loại phòng không tồn tại: ${roomBooking.roomTypeIndex}` });

            const pricePerNight = roomType.finalPrice || roomType.basePrice;
            const roomTotalPrice = pricePerNight * roomBooking.numberOfRooms * numberOfNights;
            totalPrice += roomTotalPrice;

            processedRoomBookings.push({
                roomTypeIndex: roomBooking.roomTypeIndex,
                roomTypeName: roomType.typeName,
                numberOfRooms: roomBooking.numberOfRooms,
                pricePerNight,
                totalPrice: roomTotalPrice,
                guests: roomBooking.guests || [],
                specialRequests: roomBooking.specialRequests || ''
            });
        }

        // Deposit
        let depositAmount = 0;
        let isDeposit = false;
        if (paymentType === 'deposit') {
            depositAmount = totalPrice * 0.3;
            isDeposit = true;
        }

        const mongoose = require('mongoose');
        const finalUserId = userId && userId !== '000000000000000000000000' ? userId : new mongoose.Types.ObjectId();

        const newBooking = new HotelBooking({
            userId: finalUserId,
            hotelId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfNights,
            fullNameUser,
            email,
            phone,
            address,
            roomBookings: processedRoomBookings,
            totalGuests,
            totalPrice,
            isDeposit,
            depositAmount,
            payment_method,
            paymentType,
            note,
            specialRequests
        });

        if (payment_method === 'cash') {
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + 24);
            newBooking.cashPaymentDeadline = deadline;
        }

        await newBooking.save();
        await updateRoomAvailability(hotelId, checkIn, checkOut, roomBookings, 'book');

        // VNPay xử lý
        let vnpayUrl = null;
        if (payment_method === 'bank_transfer') {
            try {
                const paymentAmount = isDeposit ? depositAmount : totalPrice;
                const vnpay = new VNPay({
                    tmnCode: 'LH54Z11C',
                    secureSecret: 'PO0WDG07TJOGP1P8SO6Z9PHVPIBUWBGQ',
                    vnpayHost: 'https://sandbox.vnpayment.vn',
                    testMode: true,
                    hashAlgorithm: 'SHA512',
                    loggerFn: ignoreLogger,
                });

                vnpayUrl = await vnpay.buildPaymentUrl({
                    vnp_Amount: paymentAmount,
                    vnp_IpAddr: req.ip || '127.0.0.1',
                    vnp_TxnRef: `${newBooking._id}-${Date.now()}`,
                    vnp_OrderInfo: `Thanh toán đặt phòng khách sạn ${hotel.hotelName}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: `http://localhost:8080/api/vnpay/payment-callback`,
                    vnp_Locale: VnpLocale.VN,
                    vnp_CreateDate: dateFormat(new Date()),
                    vnp_ExpireDate: dateFormat(new Date(Date.now() + 24 * 60 * 60 * 1000))
                });

                console.log('Generated VNPay URL:', vnpayUrl);
                return res.status(201).json({
                    success: true,
                    message: "Đặt tour thành công - chuyển đến VNPay",
                    newBooking,
                    vnpayUrl,
                    bookingId: newBooking._id
                });
            } catch (err) {
                console.error("Lỗi tạo VNPay URL:", err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi server khi tạo VNPay URL",
                    error: err.message
                });
            }
        }
        if (payment_method === 'cash') {
            await sendMailHotelBookingCashSuccess(newBooking);
        }
        const populatedBooking = await HotelBooking.findById(newBooking._id)
            .populate('userId', 'username email')
            .populate({
                path: 'hotelId',
                select: 'hotelName location address starRating',
                populate: { path: 'location', select: 'locationName country' }
            });

        return res.status(201).json({
            success: true,
            message: payment_method === 'bank_transfer' ? "Đặt phòng thành công - chuyển đến VNPay" : "Đặt phòng thành công",
            booking: populatedBooking,
            bookingId: newBooking._id,
            paymentUrl: vnpayUrl
        });

    } catch (err) {
        console.error("Lỗi tạo booking:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo booking",
            error: err.message,
        });
    }
};



// Cập nhật tình trạng phòng
const updateRoomAvailability = async (hotelId, checkInDate, checkOutDate, roomBookings, action = 'book') => {
    try {
        const dates = [];
        const currentDate = new Date(checkInDate);
        while (currentDate < checkOutDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        for (const date of dates) {
            let dateHotel = await DateHotel.findOne({
                hotel: hotelId,
                date: date
            });

            if (!dateHotel) {
                // Tạo mới nếu chưa có
                const hotel = await Hotel.findById(hotelId);
                dateHotel = new DateHotel({
                    hotel: hotelId,
                    date: date,
                    roomAvailability: hotel.roomTypes.map((rt, index) => ({
                        roomTypeIndex: index,
                        availableRooms: rt.totalRooms,
                        bookedRooms: 0
                    }))
                });
            }

            // Cập nhật số phòng
            for (const roomBooking of roomBookings) {
                const roomAvailability = dateHotel.roomAvailability.find(
                    room => room.roomTypeIndex === roomBooking.roomTypeIndex
                );

                if (roomAvailability) {
                    if (action === 'book') {
                        roomAvailability.availableRooms -= roomBooking.numberOfRooms;
                        roomAvailability.bookedRooms += roomBooking.numberOfRooms;
                    } else if (action === 'cancel') {
                        roomAvailability.availableRooms += roomBooking.numberOfRooms;
                        roomAvailability.bookedRooms -= roomBooking.numberOfRooms;
                    }
                }
            }

            await dateHotel.save();
        }
    } catch (error) {
        console.error('Error updating room availability:', error);
        throw error;
    }
};

// Lấy danh sách booking của user
const getHotelBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        let filter = { userId };
        if (status) {
            filter.payment_status = status;
        }

        const bookings = await HotelBooking.find(filter)
            .populate({
                path: 'hotelId',
                select: 'hotelName location address starRating hotelImages',
                populate: {
                    path: 'location',
                    select: 'locationName country'
                }
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await HotelBooking.countDocuments(filter);

        res.status(200).json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Hủy booking
const cancelHotelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;

        const booking = await HotelBooking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy booking"
            });
        }

        if (booking.payment_status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Booking đã được hủy trước đó"
            });
        }

        // Tính toán hoàn tiền dựa trên chính sách
        const refundAmount = calculateHotelRefund(booking);

        // Cập nhật booking
        booking.payment_status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancelReason = cancelReason;
        booking.refund_amount = refundAmount;

        if (refundAmount > 0) {
            booking.refund_status = 'pending';
        }

        await booking.save();

        // Cập nhật lại tình trạng phòng
        await updateRoomAvailability(
            booking.hotelId,
            booking.checkInDate,
            booking.checkOutDate,
            booking.roomBookings,
            'cancel'
        );

        res.status(200).json({
            success: true,
            message: "Hủy booking thành công",
            refundAmount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Tính toán hoàn tiền cho hotel
const calculateHotelRefund = (booking) => {
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const daysBefore = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));

    let refundPercent = 0;

    if (daysBefore >= 7) {
        refundPercent = 90; // Hoàn 90% nếu hủy trước 7 ngày
    } else if (daysBefore >= 3) {
        refundPercent = 70; // Hoàn 70% nếu hủy trước 3 ngày
    } else if (daysBefore >= 1) {
        refundPercent = 50; // Hoàn 50% nếu hủy trước 1 ngày
    } else {
        refundPercent = 0; // Không hoàn tiền nếu hủy trong ngày
    }

    const totalPaid = booking.isFullyPaid ? booking.totalPrice : booking.depositAmount;
    return Math.floor(totalPaid * refundPercent / 100);
};

// Lấy tất cả booking cho admin
const getAllHotelBookingsForAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            hotelId,
            checkInDate,
            checkOutDate,
            search
        } = req.query;

        let filter = {};

        if (status) {
            filter.payment_status = status;
        }

        if (hotelId) {
            filter.hotelId = hotelId;
        }

        if (checkInDate && checkOutDate) {
            filter.checkInDate = {
                $gte: new Date(checkInDate),
                $lte: new Date(checkOutDate)
            };
        }

        if (search) {
            filter.$or = [
                { fullNameUser: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await HotelBooking.find(filter)
            .populate('userId', 'username email')
            .populate({
                path: 'hotelId',
                select: 'hotelName location address',
                populate: {
                    path: 'location',
                    select: 'locationName country'
                }
            })
            .populate('cancelledBy', 'username')
            .select('+paymentImage +fullPaymentImage') // Thêm các trường hình ảnh thanh toán
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await HotelBooking.countDocuments(filter);

        res.status(200).json({
            success: true,
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Xác nhận thanh toán tiền mặt
const confirmHotelCashPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, note } = req.body;
        const paymentImage = req.file; // File được upload từ middleware

        console.log('🔍 Debug confirmHotelCashPayment:');
        console.log('- adminId:', adminId);
        console.log('- note:', note);
        console.log('- paymentImage:', paymentImage ? paymentImage.filename : 'No file uploaded');

        // Tìm booking cần xác nhận thanh toán
        const booking = await HotelBooking.findById(id)
            .populate('hotelId', 'hotelName location')
            .populate('userId', 'username email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đặt phòng cần xác nhận thanh toán"
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Không thể xác nhận thanh toán cho đặt phòng có trạng thái: ${booking.payment_status}`
            });
        }

        // Kiểm tra phương thức thanh toán
        if (booking.payment_method !== 'cash') {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể xác nhận thanh toán cho đặt phòng thanh toán tiền mặt"
            });
        }

        // Kiểm tra deadline thanh toán tiền mặt
        if (booking.cashPaymentDeadline && new Date() > new Date(booking.cashPaymentDeadline)) {
            return res.status(400).json({
                success: false,
                message: "Đã quá hạn thanh toán tiền mặt (24 giờ)"
            });
        }

        // Xác định loại thanh toán dựa trên paymentType
        if (booking.paymentType === 'deposit') {
            // Cập nhật trạng thái thanh toán cọc
            booking.payment_status = 'deposit_paid';
            booking.isDeposit = true;
            booking.depositPaidAt = new Date(); // Thời gian thanh toán cọc
            booking.paymentConfirmedBy = adminId;
            if (note) {
                booking.paymentNote = note;
            }
            if (paymentImage) {
                booking.paymentImage = paymentImage.filename; // Lưu tên file ảnh
            }
        } else {
            // Thanh toán toàn bộ
            booking.payment_status = 'completed';
            booking.isFullyPaid = true;
            booking.fullPaidAt = new Date();
            booking.paymentConfirmedBy = adminId;
            if (note) {
                booking.paymentNote = note;
            }
            if (paymentImage) {
                booking.paymentImage = paymentImage.filename;
            }
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: booking.paymentType === 'deposit' ? "Xác nhận thanh toán cọc thành công" : "Xác nhận thanh toán toàn bộ thành công",
            booking: {
                _id: booking._id,
                payment_status: booking.payment_status,
                depositPaidAt: booking.depositPaidAt,
                fullPaidAt: booking.fullPaidAt,
                paymentConfirmedBy: booking.paymentConfirmedBy,
                paymentNote: booking.paymentNote,
                paymentImage: booking.paymentImage,
                customerInfo: {
                    name: booking.fullNameUser,
                    email: booking.email,
                    phone: booking.phone
                },
                hotelInfo: {
                    name: booking.hotelId?.hotelName,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate,
                    totalAmount: booking.totalPrice
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

// Xác nhận thanh toán toàn bộ
const confirmHotelFullPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, note } = req.body;
        const paymentImage = req.file; // File được upload từ middleware

        // Tìm booking cần xác nhận thanh toán toàn bộ
        const booking = await HotelBooking.findById(id)
            .populate('hotelId', 'hotelName location')
            .populate('userId', 'username email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đặt phòng cần xác nhận thanh toán"
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (booking.payment_status !== 'deposit_paid') {
            return res.status(400).json({
                success: false,
                message: `Chỉ có thể xác nhận thanh toán toàn bộ cho đặt phòng đã thanh toán cọc. Trạng thái hiện tại: ${booking.payment_status}`
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
                hotelInfo: {
                    name: booking.hotelId?.hotelName,
                    checkIn: booking.checkInDate,
                    checkOut: booking.checkOutDate,
                    totalAmount: booking.totalPrice
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

// Thống kê booking
const getHotelBookingStats = async (req, res) => {
    try {
        const { startDate, endDate, hotelId } = req.query;

        let matchFilter = {};

        if (startDate && endDate) {
            matchFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (hotelId) {
            matchFilter.hotelId = mongoose.Types.ObjectId(hotelId);
        }

        const stats = await HotelBooking.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$payment_status', ['completed', 'deposit_paid']] },
                                '$totalPrice',
                                0
                            ]
                        }
                    },
                    pendingBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'pending'] }, 1, 0]
                        }
                    },
                    confirmedBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'confirmed'] }, 1, 0]
                        }
                    },
                    completedBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'completed'] }, 1, 0]
                        }
                    },
                    cancelledBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$payment_status', 'cancelled'] }, 1, 0]
                        }
                    },
                    totalGuests: { $sum: '$totalGuests' },
                    averageBookingValue: { $avg: '$totalPrice' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || {
                totalBookings: 0,
                totalRevenue: 0,
                pendingBookings: 0,
                confirmedBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
                totalGuests: 0,
                averageBookingValue: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Xác nhận thanh toán từ client (tương tự tour)
const confirmHotelPayment = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await HotelBooking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy booking"
            });
        }

        // Cập nhật trạng thái thanh toán
        if (booking.paymentType === 'deposit') {
            booking.payment_status = 'deposit_paid';
            booking.isDeposit = true;
            booking.depositPaidAt = new Date();
        } else {
            booking.payment_status = 'completed';
            booking.isFullyPaid = true;
            booking.fullPaidAt = new Date();
        }

        booking.booking_status = 'confirmed';
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Xác nhận thanh toán thành công",
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

module.exports = {
    getByIdHotelBooking,
    bookHotel,
    getHotelBookingsByUser,
    cancelHotelBooking,
    getAllHotelBookingsForAdmin,
    confirmHotelCashPayment,
    confirmHotelFullPayment,
    confirmHotelPayment,
    getHotelBookingStats,
    updateRoomAvailability
};
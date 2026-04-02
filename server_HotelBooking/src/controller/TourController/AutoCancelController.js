const TourBookingSchema = require('../../models/Tour/TourBooking');
const DateTourModel = require('../../models/Tour/DateTour');
const HotelBooking = require('../../models/Hotel/HotelBooking');
const { updateRoomAvailability } = require('../HotelController/HotelBookingController');

// Hàm tự động hủy các booking tiền mặt quá hạn 48h
const autoCancel48hExpiredBookings = async (req, res) => {
    try {
        const now = new Date();
        
        // Tìm tất cả booking tiền mặt đã quá hạn 48h và chưa bị hủy
        const expiredBookings = await TourBookingSchema.find({
            payment_method: 'cash',
            payment_status: { $in: ['pending'] }, // Chỉ hủy những booking đang pending
            cashPaymentDeadline: { $lt: now }, // Đã quá thời hạn
            cashPaymentDeadline: { $ne: null } // Có thiết lập thời hạn
        }).populate('slotId');

        let cancelledCount = 0;
        const cancelledBookings = [];

        for (const booking of expiredBookings) {
            try {
                // Cập nhật trạng thái booking thành cancelled
                booking.payment_status = 'cancelled';
                booking.cancelledAt = new Date();
                booking.cancelReason = 'Tự động hủy do quá hạn thanh toán tiền mặt (48h)';
                await booking.save();

                // Hoàn trả số ghế về slot
                if (booking.slotId) {
                    const totalPassengers = booking.adultsTour + 
                        (booking.childrenTour || 0) + 
                        (booking.toddlerTour || 0) + 
                        (booking.infantTour || 0);
                    
                    booking.slotId.availableSeats += totalPassengers;
                    await booking.slotId.save();
                }

                cancelledCount++;
                cancelledBookings.push({
                    bookingId: booking._id,
                    customerName: booking.fullNameUser,
                    email: booking.email,
                    phone: booking.phone,
                    totalAmount: booking.totalPriceTour,
                    deadline: booking.cashPaymentDeadline
                });

                console.log(`✅ Đã hủy booking ${booking._id} do quá hạn thanh toán tiền mặt`);
            } catch (error) {
                console.error(`❌ Lỗi khi hủy booking ${booking._id}:`, error);
            }
        }

        // Trả về kết quả
        if (res) {
            res.status(200).json({
                success: true,
                message: `Đã tự động hủy ${cancelledCount} booking quá hạn thanh toán tiền mặt`,
                cancelledCount,
                cancelledBookings
            });
        }

        return {
            success: true,
            cancelledCount,
            cancelledBookings
        };

    } catch (error) {
        console.error('❌ Lỗi trong quá trình tự động hủy booking:', error);
        
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tự động hủy booking',
                error: error.message
            });
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Hàm kiểm tra booking sắp hết hạn (còn 6h)
const checkBookingsNearExpiry = async (req, res) => {
    try {
        const now = new Date();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        
        // Tìm booking sắp hết hạn trong 6h tới
        const nearExpiryBookings = await TourBookingSchema.find({
            payment_method: 'cash',
            payment_status: 'pending',
            cashPaymentDeadline: {
                $gte: now,
                $lte: sixHoursLater
            }
        }).populate({
            path: 'slotId',
            populate: {
                path: 'tour',
                select: 'nameTour destination'
            }
        });

        const warningBookings = nearExpiryBookings.map(booking => ({
            bookingId: booking._id,
            customerName: booking.fullNameUser,
            email: booking.email,
            phone: booking.phone,
            tourName: booking.slotId?.tour?.nameTour,
            destination: booking.slotId?.tour?.destination,
            totalAmount: booking.totalPriceTour,
            deadline: booking.cashPaymentDeadline,
            hoursRemaining: Math.ceil((booking.cashPaymentDeadline - now) / (1000 * 60 * 60))
        }));

        if (res) {
            res.status(200).json({
                success: true,
                message: `Có ${warningBookings.length} booking sắp hết hạn thanh toán`,
                count: warningBookings.length,
                bookings: warningBookings
            });
        }

        return {
            success: true,
            count: warningBookings.length,
            bookings: warningBookings
        };

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra booking sắp hết hạn:', error);
        
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi kiểm tra booking sắp hết hạn',
                error: error.message
            });
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Hàm tự động hủy các hotel booking tiền mặt quá hạn 24h
const autoCancelExpiredHotelBookings = async (req, res) => {
    try {
        const now = new Date();
        
        // Tìm tất cả hotel booking tiền mặt đã quá hạn 24h và chưa bị hủy
        const expiredBookings = await HotelBooking.find({
            payment_method: 'cash',
            payment_status: { $in: ['pending'] }, // Chỉ hủy những booking đang pending
            cashPaymentDeadline: { $lt: now }, // Đã quá thời hạn
            cashPaymentDeadline: { $ne: null } // Có thiết lập thời hạn
        }).populate('hotelId');

        let cancelledCount = 0;
        const cancelledBookings = [];

        for (const booking of expiredBookings) {
            try {
                // Cập nhật trạng thái booking thành cancelled
                booking.payment_status = 'cancelled';
                booking.cancelledAt = new Date();
                booking.cancelReason = 'Tự động hủy do quá hạn thanh toán tiền mặt (24h)';
                await booking.save();

                // Hoàn trả phòng về hotel
                try {
                    await updateRoomAvailability(
                        booking.hotelId._id,
                        booking.checkInDate,
                        booking.checkOutDate,
                        booking.roomBookings,
                        'cancel'
                    );
                } catch (roomError) {
                    console.error(`❌ Lỗi khi hoàn trả phòng cho booking ${booking._id}:`, roomError);
                }

                cancelledCount++;
                cancelledBookings.push({
                    bookingId: booking._id,
                    customerName: booking.fullNameUser,
                    email: booking.email,
                    phone: booking.phone,
                    totalAmount: booking.totalPrice,
                    deadline: booking.cashPaymentDeadline,
                    hotelName: booking.hotelId?.hotelName
                });

                console.log(`✅ Đã hủy hotel booking ${booking._id} do quá hạn thanh toán tiền mặt`);
            } catch (error) {
                console.error(`❌ Lỗi khi hủy hotel booking ${booking._id}:`, error);
            }
        }

        // Trả về kết quả
        if (res) {
            res.status(200).json({
                success: true,
                message: `Đã tự động hủy ${cancelledCount} hotel booking quá hạn thanh toán tiền mặt`,
                cancelledCount,
                cancelledBookings
            });
        }

        return {
            success: true,
            cancelledCount,
            cancelledBookings
        };

    } catch (error) {
        console.error('❌ Lỗi trong quá trình tự động hủy hotel booking:', error);
        
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tự động hủy hotel booking',
                error: error.message
            });
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

// Hàm kiểm tra hotel booking sắp hết hạn (còn 6h)
const checkHotelBookingsNearExpiry = async (req, res) => {
    try {
        const now = new Date();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        
        // Tìm hotel booking sắp hết hạn trong 6h tới
        const nearExpiryBookings = await HotelBooking.find({
            payment_method: 'cash',
            payment_status: 'pending',
            cashPaymentDeadline: {
                $gte: now,
                $lte: sixHoursLater
            }
        }).populate('hotelId');

        const warningBookings = nearExpiryBookings.map(booking => ({
            bookingId: booking._id,
            customerName: booking.fullNameUser,
            email: booking.email,
            phone: booking.phone,
            hotelName: booking.hotelId?.hotelName,
            totalAmount: booking.totalPrice,
            deadline: booking.cashPaymentDeadline,
            hoursRemaining: Math.ceil((booking.cashPaymentDeadline - now) / (1000 * 60 * 60))
        }));

        if (res) {
            res.status(200).json({
                success: true,
                message: `Có ${warningBookings.length} hotel booking sắp hết hạn thanh toán`,
                count: warningBookings.length,
                bookings: warningBookings
            });
        }

        return {
            success: true,
            count: warningBookings.length,
            bookings: warningBookings
        };

    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra hotel booking sắp hết hạn:', error);
        
        if (res) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi kiểm tra hotel booking sắp hết hạn',
                error: error.message
            });
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    autoCancel48hExpiredBookings,
    checkBookingsNearExpiry,
    autoCancelExpiredHotelBookings,
    checkHotelBookingsNearExpiry
};
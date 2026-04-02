const HotelBooking = require("../../models/Hotel/HotelBooking"); // import model

// Lấy tất cả booking hotel theo userId
const getAllBookingHotelByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await HotelBooking.find({ userId })
            .populate("userId")      // lấy thông tin user
            .populate("hotelId")     // lấy thông tin khách sạn
            .sort({ createdAt: -1 }) // booking mới nhất trước
            .lean();

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin booking hotel thành công",
            data: bookings,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
module.exports = { getAllBookingHotelByUserId }
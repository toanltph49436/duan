const HotelBooking = require("../../models/Hotel/HotelBooking.js")

const getRecentBookingHotels = async (req, res) => {
    try {
        const bookings = await HotelBooking.find()
            .populate("hotelId")
            .populate("userId")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin booking hotel đầy đủ thành công",
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllBookingHotelByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const bookings = await HotelBooking.find({ userId })
            .populate("hotelId")
            .populate("userId")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin booking hotel đầy đủ thành công",
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getRecentBookingHotels, getAllBookingHotelByUserId };

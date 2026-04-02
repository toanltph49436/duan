const CheckOutTour = require("../../models/Tour/checkOutTour.js")
const BookingTour = require("../../models/Tour/TourBooking.js")

const checkOutBookingTour = async (req, res) => {
    try {
        const { BookingTourId,payment_method, amount } = req.body;

        // Kiểm tra xem BookingTour có tồn tại không
        const booking = await BookingTour.findById(BookingTourId);
        if (!booking) {
            return res.status(404).json({ message: "Không tìm thấy booking" });
        }
        
        // Tạo thông tin thanh toán
        const newPayment = new CheckOutTour({
            BookingTourId,
            payment_date: new Date(), 
            payment_method,
            payment_status: "pending" ,
            amount: booking.totalPriceTour
        });

        const savedPayment = await newPayment.save();

        res.status(201).json({
            message: "Thanh toán thành công",
            payment: savedPayment,
            finalPrice: booking.totalPriceTour
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thanh toán", error: error.message });
    }
};

const getRecentBookingTours = async (req, res) => {
    try {
        const recentBookings = await BookingTour.find()
            .populate("userId")
            .populate({
                path: "slotId",
                populate: {
                    path: "tour",
                    model: "Tour"
                }
            })
            .populate("cancelledBy")
            .sort({ createdAt: -1 }) 
            .limit(10)               
            .lean();

        return res.status(200).json({
            success: true,
            message: "Lấy booking tour gần đây nhất của tất cả user thành công",
            data: recentBookings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

  
const getAllBookingTourByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const bookings = await BookingTour.find({ userId })
            .populate("userId")          
            .populate({
                path: "slotId",        
                populate: {
                    path: "tour",       
                    model: "Tour"
                }
            })
            .populate("cancelledBy")     
            .sort({ createdAt: -1 })  // Tour mới nhất ở đầu
            .lean();                  

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin booking tour đầy đủ thành công",
            data: bookings
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





module.exports = { checkOutBookingTour, getRecentBookingTours, getAllBookingTourByUserId };
  
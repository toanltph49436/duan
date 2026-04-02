const mongoose = require("mongoose");
const RoomInventoryBooking = require("../../models/Room/RoomInventoryBooking.js");
const BookingOnlyRoom = require("../../models/Room/BookingRoom.js");
const RoomModel = require("../../models/Room/RoomModel.js");
const { StatusCodes } = require('http-status-codes');

// Tính số đêm giữa check-in và check-out
const calculateNights = (checkIn, checkOut) => {
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const createBookingOnlyRoom = async (req, res) => {
    try {
        const {
            userId,
            userName,
            emailName,
            phoneName,
            check_in_date,
            check_out_date,
            payment_method,
            payment_status,
            adults,
            children,
            itemRoom,
        } = req.body;

        if (!itemRoom || !Array.isArray(itemRoom) || itemRoom.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Danh sách phòng không được để trống",
            });
        }

        const nights = calculateNights(check_in_date, check_out_date);
        let total_price = 0;

        // Kiểm tra từng phòng
        for (const item of itemRoom) {
            const roomData = await RoomModel.findById(item.roomId);
            if (!roomData) {
                return res.status(404).json({
                    success: false,
                    message: `Phòng với ID ${item.roomId} không tồn tại`,
                });
            }

            const totalGuests = adults + children;
            if (totalGuests > roomData.capacityRoom) {
                return res.status(400).json({
                    success: false,
                    message: `Phòng ${roomData.name || item.roomId} chỉ chứa tối đa ${roomData.capacityRoom} khách, bạn đang đặt ${totalGuests}`,
                });
            }

            // Kiểm tra phòng đã được đặt chưa
            const existingBooking = await BookingOnlyRoom.findOne({
                "itemRoom.roomId": item.roomId,
                status: { $nin: ["cancelled", "checked_out"] },
                $or: [
                    {
                        check_in_date: { $lt: new Date(check_out_date) },
                        check_out_date: { $gt: new Date(check_in_date) },
                    },
                ],
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: `Phòng ${roomData.name || item.roomId} đã được đặt trong khoảng thời gian này`,
                });
            }

            total_price += roomData.priceRoom * nights;
        }
        const bookingStatus = payment_status === "completed" ? "completed" : "pending";
        // Tạo đơn đặt phòng
        const newBooking = await BookingOnlyRoom.create({
            userId,
            userName,
            emailName,
            phoneName,
            check_in_date,
            check_out_date,
            payment_method,
            payment_status: bookingStatus,
            adults,
            children,
            total_price,
            itemRoom,
        });

        // Tạo bản ghi RoomInventoryBooking cho mỗi phòng
        for (const item of itemRoom) {
            await RoomInventoryBooking.create({
                Room: item.roomId,
                check_in_date: new Date(check_in_date),
                check_out_date: new Date(check_out_date),
                booked_quantity: 1,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Đặt phòng thành công",
            booking: newBooking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getBookingWithDetails = async (req, res) => {
    try {
        const bookings = await BookingOnlyRoom.find()
            .populate("itemRoom.roomId", "nameRoom priceRoom amenitiesRoom locationId")
        return res.status(200).json({
            success: true,
            message: "Bookings retrieved with user and room info",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


const getOrderById = async (req, res) => {
    try {
        const { userId } = req.params;
        const order = await BookingOnlyRoom.find({ userId }).populate("itemRoom.roomId", "nameRoom priceRoom amenitiesRoom locationId")
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Order not found" })
        }
        return res.status(StatusCodes.OK).json(order)
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
}

module.exports = { createBookingOnlyRoom, getBookingWithDetails, getOrderById };
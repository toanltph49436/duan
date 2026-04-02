const express = require('express');
const {
    getByIdHotelBooking,
    bookHotel,
    getHotelBookingsByUser,
    cancelHotelBooking,
    getAllHotelBookingsForAdmin,
    confirmHotelCashPayment,
    confirmHotelFullPayment,
    confirmHotelPayment,
    getHotelBookingStats
} = require('../../controller/HotelController/HotelBookingController.js');
const { uploadPaymentImage } = require('../../Middleware/uploadMiddleware');
const { getAllBookingHotelByUserId } = require('../../controller/HotelController/getCheckoutHotel.js');

const RouterHotelBooking = express.Router();

// User routes
RouterHotelBooking.post('/hotel-booking', bookHotel);
RouterHotelBooking.get('/hotel-booking/:id', getByIdHotelBooking);
RouterHotelBooking.get('/hotel-booking/user/:userId', getHotelBookingsByUser);
RouterHotelBooking.put('/hotel-booking/cancel/:id', cancelHotelBooking);
RouterHotelBooking.put('/hotel-booking/confirm-payment/:id', confirmHotelPayment);

// Admin routes
RouterHotelBooking.get('/admin/hotel-bookings', getAllHotelBookingsForAdmin);
RouterHotelBooking.get('/admin/hotel-bookings/stats', getHotelBookingStats);
RouterHotelBooking.put('/admin/hotel-bookings/confirm-payment/:id', uploadPaymentImage, confirmHotelCashPayment);
RouterHotelBooking.put('/admin/hotel-bookings/confirm-full-payment/:id', uploadPaymentImage, confirmHotelFullPayment);

RouterHotelBooking.get('/hotel-bookings/user/:userId', getAllBookingHotelByUserId)
module.exports = RouterHotelBooking;
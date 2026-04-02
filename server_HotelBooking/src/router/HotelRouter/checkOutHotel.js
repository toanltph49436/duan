const express = require('express');
const { getRecentBookingHotels, getAllBookingHotelByUserId } = require('../../controller/HotelController/checkOutHotel.js');
const RouterCheckOutBookingHotel = express.Router();

RouterCheckOutBookingHotel.get('/checkOutBookingHotel', getRecentBookingHotels)
RouterCheckOutBookingHotel.get('/checkOutBookingHotel/:userId', getAllBookingHotelByUserId)

module.exports = RouterCheckOutBookingHotel

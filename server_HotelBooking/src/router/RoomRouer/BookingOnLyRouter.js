const express = require('express');
const { createBookingOnlyRoom, getBookingWithDetails, getOrderById } = require('./../../controller/Room/BookingOnLyController.js');

const RouterBookingOnly = express.Router();
RouterBookingOnly.post('/booking-room', createBookingOnlyRoom);
RouterBookingOnly.get('/booking-room', getBookingWithDetails);
// RouterBookingOnly.delete('/room/:id', DeleteRoom);
RouterBookingOnly.get('/booking-room/:userId', getOrderById);
// RouterBookingOnly.put('/room/:id', UpdateRoom);
module.exports = RouterBookingOnly
const express = require('express');
const { checkOutBookingTour, getRecentBookingTours, getAllBookingTourByUserId } = require('../../controller/TourController/checkOutTour.js');
const RouterChecOutBookingTour = express.Router();
RouterChecOutBookingTour.post('/checkOutBookingTour/:id', checkOutBookingTour)
RouterChecOutBookingTour.get('/checkOutBookingTour', getRecentBookingTours)
RouterChecOutBookingTour.get('/checkOutBookingTour/:userId', getAllBookingTourByUserId)

module.exports = RouterChecOutBookingTour
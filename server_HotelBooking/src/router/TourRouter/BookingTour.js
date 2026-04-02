const express = require('express');
const { 
    getByIdBookingTour, 
    BookingTour, 
    getBookingToursByUser, 
    cancelBookingTour,
    getAllBookingsForAdmin,
    adminConfirmCancelBooking,
    requestCancelBooking,

    getBookingStats,
    confirmCashPayment,
    confirmFullPayment,
    getAccurateRevenue,
    getRefundList,
    updateRefundStatus,
    getRefundStats,
    submitRefundRequest,
    getBookingsBySlotId
} = require('./../../controller/TourController/TourBookingController.js');
const { uploadPaymentImage, uploadRefundImage } = require('../../Middleware/uploadMiddleware');
const RouterBookingTour = express.Router();

// User routes
RouterBookingTour.post('/bookingTour', BookingTour)
RouterBookingTour.get('/bookingTour/:id', getByIdBookingTour)
RouterBookingTour.get('/bookingTour/user/:userId', getBookingToursByUser)
RouterBookingTour.put('/bookingTour/cancel/:id', cancelBookingTour)
RouterBookingTour.put('/bookingTour/request-cancel/:id', requestCancelBooking)

RouterBookingTour.post('/refund/request', submitRefundRequest)

// Admin routes
RouterBookingTour.get('/admin/bookings', getAllBookingsForAdmin)
RouterBookingTour.get('/admin/bookings/stats', getBookingStats)

RouterBookingTour.get('/booking/tour/date/:slotId', getBookingsBySlotId)

RouterBookingTour.get('/admin/bookings/revenue', getAccurateRevenue)
RouterBookingTour.put('/admin/bookings/cancel/:id', adminConfirmCancelBooking)
RouterBookingTour.put('/admin/bookings/confirm-payment/:id', uploadPaymentImage, confirmCashPayment)

// Quản lý hoàn tiền
RouterBookingTour.get('/admin/refunds', getRefundList)
RouterBookingTour.get('/admin/refunds/stats', getRefundStats)
RouterBookingTour.put('/admin/refunds/:bookingId', uploadRefundImage, updateRefundStatus)
RouterBookingTour.put('/admin/bookings/confirm-full-payment/:id', uploadPaymentImage, confirmFullPayment)

module.exports = RouterBookingTour
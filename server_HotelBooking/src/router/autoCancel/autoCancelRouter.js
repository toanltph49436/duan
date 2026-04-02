const express = require('express');
const { autoCancel48hExpiredBookings, checkBookingsNearExpiry } = require('../../controller/TourController/AutoCancelController');

const router = express.Router();

// API tự động hủy booking quá hạn 48h
router.post('/auto-cancel-expired', autoCancel48hExpiredBookings);

// API kiểm tra booking sắp hết hạn
router.get('/check-near-expiry', checkBookingsNearExpiry);

module.exports = router;
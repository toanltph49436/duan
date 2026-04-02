const express = require('express');

const { 
    PostdateTour, 
    GetDateTour, 
    GetAllSlotsByTourId,
    GetAllDateSlots, 
    UpdateDateSlot, 
    DeleteDateSlot,
    getTourStats,
    getToursByStatus,
    updateTourBookingStatsAPI,
    markCustomerNoShow,
    getNoShowCustomers,
    getSlotDetail,
    assignEmployeeToDateSlot
} = require('../../controller/TourController/DateTour');
const { verifyToken, verifyTokenAndAdmin } = require("../../Middleware/verifyToken");
const { verifyClerkTokenAndAdmin } = require("../../Middleware/Middleware");

const dateRouter = express.Router();

// Các API cơ bản cho quản lý slot thời gian tour
dateRouter.post('/date', PostdateTour);
dateRouter.get('/date/slot/:id', GetDateTour);
dateRouter.get('/date/slot-detail/:id', getSlotDetail); // API mới cho trang chi tiết slot
dateRouter.get('/date/tour/:tourId', GetAllSlotsByTourId);
dateRouter.get('/dateslots', GetAllDateSlots); // API mới để lấy tất cả dateslots
dateRouter.put('/date/slot/:id', UpdateDateSlot);
dateRouter.delete('/date/slot/:id', DeleteDateSlot);

// API mới cho quản lý tour theo trạng thái
dateRouter.get('/stats', verifyClerkTokenAndAdmin, getTourStats);
dateRouter.get('/status/all', getToursByStatus); // API mới để lấy tất cả tour không phân biệt trạng thái
dateRouter.get('/status/:status', getToursByStatus);
dateRouter.post('/update-stats', verifyTokenAndAdmin, updateTourBookingStatsAPI);

// API quản lý khách hàng không tham gia tour
dateRouter.post('/booking/:bookingId/mark-no-show', verifyClerkTokenAndAdmin, markCustomerNoShow);
dateRouter.get('/slot/:slotId/no-show-customers', verifyClerkTokenAndAdmin, getNoShowCustomers);

// API phân công HDV theo ngày
dateRouter.post('/dateslot/:dateSlotId/assign-employee', verifyClerkTokenAndAdmin, assignEmployeeToDateSlot);

module.exports = {
    dateRouter
}
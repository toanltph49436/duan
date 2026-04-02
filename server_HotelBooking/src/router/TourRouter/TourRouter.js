const express = require('express');


const { AddTour, DeleteTour, getAllTours, GetTourById, TourFeatured, TourTopSelling, UpdateTour, assignEmployeeToTour, updateTourStatus } = require('./../../controller/TourController/TourController.js');
const { verifyClerkTokenAndAdmin } = require('../../Middleware/Middleware.js');

const TourRouter = express.Router();
TourRouter.get('/tour', getAllTours)
TourRouter.get('/featured', TourFeatured)
TourRouter.get('/tourtopselling', TourTopSelling)
TourRouter.post('/tour', AddTour)
TourRouter.delete('/tour/:id', DeleteTour)
TourRouter.put('/tour/:id', UpdateTour)
TourRouter.get('/tour/:id', GetTourById)


// API phân công nhân viên cho tour
TourRouter.put('/tour/:id/assign-employee', verifyClerkTokenAndAdmin, assignEmployeeToTour)

// API cập nhật trạng thái tour bởi HDV
TourRouter.put('/tour/status/:id', updateTourStatus)

module.exports = TourRouter;
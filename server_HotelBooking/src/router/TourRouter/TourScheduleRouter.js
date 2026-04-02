const express = require('express')
const { DeleteTourSchedule, GetByIdTourSchedule, GetTourScheduleAll, PostTourSchedule, PutTourSchedule } = require('./../../controller/TourController/TourScheduleController.js');

const { verifyToken, verifyTokenAndAdmin } = require("../../Middleware/verifyToken");

const TourSchedule = express.Router();
TourSchedule.get('/tourschedule', GetTourScheduleAll);
TourSchedule.get('/tourschedule/:id', GetByIdTourSchedule);
TourSchedule.post('/tourschedule', PostTourSchedule);
TourSchedule.put('/tourschedule/:id', PutTourSchedule);
TourSchedule.delete('/tourschedule/:id', DeleteTourSchedule);

module.exports = TourSchedule
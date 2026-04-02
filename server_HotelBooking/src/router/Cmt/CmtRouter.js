const express = require('express');
const { DeleteCmtByUserTour, GetCmtByTourId, PostCmt, PostReply, PutCmtByUserTour } = require('../../controller/Cmt/CmtController.js');


const CmtRouter = express.Router();
CmtRouter.post('/cmt/:userId/:tourId', PostCmt)
CmtRouter.post('/cmt/:commentId/reply', PostReply)
CmtRouter.put('/cmt/:userId/:tourId', PutCmtByUserTour)
CmtRouter.get('/cmt/tour/:tourId', GetCmtByTourId);
CmtRouter.delete('/cmt/:userId/:tourId', DeleteCmtByUserTour)


module.exports = CmtRouter
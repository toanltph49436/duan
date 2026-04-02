const { StatusCodes } = require("http-status-codes");
const TourScheduleModel = require("../../models/Tour/TourScheduleModel.js");




const GetTourScheduleAll = async (req,res) => {
   try {
           const tourSchedule = await TourScheduleModel.find().populate('Tour');
           return res.status(StatusCodes.OK).json({
               success: true,
               message: "Tour add successfully",
               tourSchedule: tourSchedule
           })
       } catch (error) {
           return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
               success: false,
               message: error.message
           })
       }
}


const PostTourSchedule = async (req, res) => {
    try {
        const { Tour, schedules } = req.body;

        if (!Tour || !schedules || !Array.isArray(schedules)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Tour ID and schedules array are required"
            });
        }

        let tourSchedule = await TourScheduleModel.findOne({ Tour });

        if (tourSchedule) {
            // Cập nhật lại toàn bộ schedules
            tourSchedule.schedules = schedules;
            await tourSchedule.save();
        } else {
            // Tạo mới
            tourSchedule = await TourScheduleModel.create({ Tour, schedules });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour schedule saved successfully",
            tourSchedule
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
  };


const PutTourSchedule = async (req, res) => {
    try {
        const tourSchedule = await TourScheduleModel.findByIdAndUpdate(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            tourSchedule: tourSchedule
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const GetByIdTourSchedule = async (req, res) => {
    try {
        const tourSchedule = await TourScheduleModel.findById(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            tourSchedule: tourSchedule
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const DeleteTourSchedule = async (req, res) => {
    try {
        const tourSchedule = await TourScheduleModel.findByIdAndDelete(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            tourSchedule: tourSchedule
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { GetTourScheduleAll, PostTourSchedule, PutTourSchedule, GetByIdTourSchedule, DeleteTourSchedule };

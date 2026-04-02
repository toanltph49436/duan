const TransportScheduleModel = require("../../models/Transport/TransportScheduleModel.js");
const { StatusCodes } = require('http-status-codes');

const PostTransport = async (req,res) =>{
     try {
         const transportScheduleModel = await TransportScheduleModel.create(req.body);
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Tour add successfully",
                transportScheduleModel: transportScheduleModel
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            })
        }
}

const GetTransport= async (req, res) => {
    try {
        const transportScheduleModel = await TransportScheduleModel.find().populate('transport');
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            transportScheduleModel: transportScheduleModel
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const PutTransport = async (req, res) => {
    try {
        const transportScheduleModel = await TransportScheduleModel.findByIdAndUpdate(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            transportScheduleModel: transportScheduleModel
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const DelTransport = async (req, res) => {
    try {
        const transportScheduleModel = await TransportScheduleModel.findByIdAndDelete(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            transportScheduleModel: transportScheduleModel
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const GetByIdTransport = async (req, res) => {
    try {
        const transportScheduleModel = await TransportScheduleModel.findById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            transportScheduleModel: transportScheduleModel
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { PostTransport, GetTransport, PutTransport, DelTransport, GetByIdTransport };
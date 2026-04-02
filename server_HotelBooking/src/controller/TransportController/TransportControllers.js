const { StatusCodes } = require("http-status-codes");
const TransportModel = require("../../models/Transport/TransportModel.js");


const GetTransportAll = async (req, res) => {
    try {
        const transport = await TransportModel.find();
        return res.status(StatusCodes.OK).json({

            success: true,
            message: "Tour getall successfully",
            transport: transport
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const AddTransport = async (req, res) => {
    try {
        const transport = await TransportModel.create(req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour add successfully",
            transport: transport
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const UpdateTransport = async (req, res) => {
    try {
        const transport = await TransportModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Tour update successfully",
            transport: transport
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const GetTransportById = async (req, res) => {
    try {
        const transport = await TransportModel.findById(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({

            success: true,
            message: "Tour byid successfully",
            transport: transport
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

const DeleteTransport = async (req, res) => {
    try {
        const transport = await TransportModel.findByIdAndDelete(req.params.id);
        return res.status(StatusCodes.OK).json({

            success: true,
            message: "Tour delete successfully",
            transport: transport
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { GetTransportAll, AddTransport, UpdateTransport, GetTransportById, DeleteTransport };
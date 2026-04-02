const { StatusCodes } = require('http-status-codes');
const RoomModel = require('../../models/Room/RoomModel.js');

const RoomAll = async (req, res) => {
    try {
        const room = await RoomModel.find().populate('locationId', 'locationName country')
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Get all rooms successfully",
            rooms: room,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
}

const AddRoom = async (req, res) => {
    try {
        const room = await RoomModel.create(req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Post rooms successfully",
            rooms: room,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
}

const DeleteRoom = async (req, res) => {
    try {
        const room = await RoomModel.findByIdAndDelete(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "delete rooms successfully",
            rooms: room,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
}

const UpdateRoom = async (req, res) => {
    try {
        const room = await RoomModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "put rooms successfully",
            rooms: room,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
}

const GetRoomById = async (req, res) => {
    try {
        const room = await RoomModel.findById(req.params.id).populate('locationId', 'locationName country');
        if (!room) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Room not found",
            });
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Get room by ID successfully",
            rooms: room,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = { RoomAll, AddRoom, DeleteRoom, UpdateRoom, GetRoomById };
const LocationSchema = require("../../models/Location/locationModel.js");

const PostLocation = async (req, res) => {
    try {
        const postLocation = await LocationSchema.create(req.body);
        res.status(200).json({
            success: true,
            message: "successfully created location",
            location: postLocation
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create location",
            error: error.message
        })
    }
}

const getLocationAll = async (req, res) => {
    try {
        const locations = await LocationSchema.find();
        res.status(200).json({
            success: true,
            messgase: "Sucssesfylly get All locations",
            location: locations
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get locations",
            error: error.message
        })
    }
}

const getLocationById = async (req, res) => {
    try {
        const location = await LocationSchema.findById(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Successfully get location by id",
            location: location
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Faied to get location by id",
            error: error.message
        })
    }
}

const updateLocation = async (req, res) => {
    try {
        const location = await LocationSchema.findByIdAndUpdate(req.params.id, req.body)
        res.status(200).json({
            success: true,
            message: "Successfully update location",
            location: location
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update location",
            error: error.message
        })
    }
}

const deleteLocation = async (req, res) => {
    try {
        const location = await LocationSchema.findByIdAndDelete(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Successfully deleted location",
            location: location
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failted to delete location",
            error: error.message
        })
    }
}

module.exports = { PostLocation, getLocationAll, getLocationById, updateLocation, deleteLocation };
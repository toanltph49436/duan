const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    country: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model("Location", LocationSchema)
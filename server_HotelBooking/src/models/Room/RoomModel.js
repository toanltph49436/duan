const mongoose = require("mongoose");


const RoomModel = new mongoose.Schema({
    nameRoom: { type: String, required: true },
    priceRoom: { type: Number, required: true },
    imageRoom: [{ type: String, required: true }],
    typeRoom: { type: String, required: true },
    descriptionRoom: { type: String },
    amenitiesRoom: [{ type: String, required: true }],
    statusRoom: {
        type: String,
        enum: ['waiting', 'available', 'full', 'cancelled'],
        default: 'available'
    },
    capacityRoom: {
        type: Number,
        required: true,
        min: 1
    },
    waitingSince: { type: Date, default: null },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model("Room", RoomModel);
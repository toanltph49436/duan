const mongoose = require("mongoose");



const RoomInventoryBooking = new mongoose.Schema({
    Room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    booking_date: { type: Date },
    booked_quantity: { type: Number },
}, { timestamps: true });
module.exports = mongoose.model("RoomInventoryBooking", RoomInventoryBooking);
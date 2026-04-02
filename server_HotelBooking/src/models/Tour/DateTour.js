const mongoose = require("mongoose");

const DateSlotSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
        required: true,
    },
    dateTour: {
        type: Date,
        required: true,
    },
    availableSeats: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    tourStatus: {
        type: String,
        enum: ['preparing', 'ongoing', 'completed', 'postponed'],
        default: 'preparing'
    },
    statusNote: { type: String },
    statusUpdatedAt: { type: Date },
    statusUpdatedBy: { type: String },
    bookedSeats: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    },
    departureTime: { type: String, default: "08:00" },
    returnTime: { type: String, default: "18:00" }
}, { timestamps: true });

module.exports = mongoose.model("DateSlot", DateSlotSchema);

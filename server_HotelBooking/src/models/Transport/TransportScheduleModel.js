const mongoose = require("mongoose");


const TransportScheduleModel = new mongoose.Schema({
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transport",
        required: true,
    },
    departureTime: { type: Date, required: true },
    arrivalTime:{type:Date, required:true},
    priceTransport:{type:Number, required:true},
    availableSeats: { type: Number, required: true },


}, {timestamps:true})
module.exports = mongoose.model("TransportSchedule", TransportScheduleModel)
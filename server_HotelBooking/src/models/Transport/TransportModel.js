const mongoose = require("mongoose");


const TransportModel = new mongoose.Schema({
    transportType: { type: String, required: true },
    transportName: { type: String, required: true },
    transportNumber: { type: String, required: true },
    departureLocation: { type: String, required: true },
    arrivalLocation: { type: String, required: true },
    imageTransport: [{ type: String, required: true }],
    
    // Thông tin giá vé máy bay (chỉ áp dụng cho transportType = "Máy Bay")
    flightPrice: { type: Number, default: 0 },             // Giá vé máy bay người lớn
    flightPriceChildren: { type: Number, default: 0 },     // Giá vé máy bay trẻ em
    flightPriceLittleBaby: { type: Number, default: 0 },   // Giá vé máy bay trẻ nhỏ
    flightPriceBaby: { type: Number, default: 0 },         // Giá vé máy bay em bé
}, { timestamps: true })
module.exports = mongoose.model("Transport", TransportModel)
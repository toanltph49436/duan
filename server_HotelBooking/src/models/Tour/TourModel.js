const mongoose = require("mongoose");

const TransportItemSchema = new mongoose.Schema({
    TransportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transport",
        required: true
    }
}, { _id: false })
const TourModel = new mongoose.Schema({
    nameTour: { type: String, required: true, unique: true }, // Tên tour
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true }, // điểm đến
    departure_location: { type: String, required: true }, // Địa điểm khởi hành
    duration: { type: String, required: true }, // Thời gian tour   
    price: { type: Number, required: true },             // Giá gốc tour (không bao gồm vé máy bay)
    discountPercent: { type: Number },                     // Giá khuyến mãi (nếu có)
    finalPrice: { type: Number },                    // Giá cuối cùng sau áp dụng phiếu giảm giá
    discountExpiryDate: { type: Date },                    // Thời hạn phiếu giảm giá
    itemTransport: [TransportItemSchema], // Phương tiện di chuyển
    return_time: { type: String }, // Thời gian kết thúc (VD: "18:00")
    departure_time: { type: String }, // Thời gian khởi hành (VD: "08:00")

    // Thông tin vé máy bay     
    flightPrice: { type: Number, default: 0 },             // Giá vé máy bay người lớn
    flightPriceChildren: { type: Number, default: 0 },     // Giá vé máy bay trẻ em
    flightPriceLittleBaby: { type: Number, default: 0 },   // Giá vé máy bay trẻ nhỏ
    flightPriceBaby: { type: Number, default: 0 },         // Giá vé máy bay em bé
    imageTour: [{ type: String, required: true }],

    descriptionTour: { type: String },
    featured: { type: Boolean, default: false },
    priceChildren: { type: Number, required: true },
    priceLittleBaby: { type: Number, required: true },
    pricebaby: { type: Number, default: 0 },
    singleRoom: { type: Boolean },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },


    // Trạng thái tour HDV
    tourStatus: {
        type: String,
        enum: ['preparing', 'ongoing', 'completed', 'postponed'],
        default: 'preparing'
    },
    statusNote: { type: String }, // Ghi chú về trạng thái
    statusUpdatedAt: { type: Date }, // Thời gian cập nhật trạng thái
    statusUpdatedBy: { type: String } // Người cập nhật trạng thái
}, { timestamps: true })
module.exports = mongoose.model("Tour", TourModel)
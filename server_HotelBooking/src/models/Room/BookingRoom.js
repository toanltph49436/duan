const mongoose = require('mongoose');

const RoomItemSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    }
}, { _id: false })
const BookingOnySchema = new mongoose.Schema({
    itemRoom: [RoomItemSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userName: { type: String, required: true },
    emailName: { type: String, required: true },
    phoneName: { type: String, required: true },
    total_price: { type: Number, required: true },
    check_in_date: { type: Date, required: true },
    check_out_date: { type: Date, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    payment_method: {
        type: String,
        required: true,
        enum: ['cash', 'credit_card', 'bank_transfer'],
    },
    payment_status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'checked_out', 'no_show'],
        default: 'pending',
      }
}, {
    timestamps: true
})
module.exports = mongoose.model("BookingOnlyRoom", BookingOnySchema)
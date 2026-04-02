const mongoose = require("mongoose");



const checkOutTourSchema = new mongoose.Schema({
    BookingTourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingTour',
        required: true,
    },
    payment_date: { type: Date},
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
    isConfirmed: { type: Boolean, default: false },
    amount: { type: Number },
}, { timestamps: true })

module.exports = mongoose.model("checkOutTour", checkOutTourSchema)
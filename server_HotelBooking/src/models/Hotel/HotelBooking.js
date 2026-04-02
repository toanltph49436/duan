const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    birthDate: { type: Date, required: true },
    idNumber: { type: String }, // CMND/CCCD
    nationality: { type: String, default: "Việt Nam" }
}, { _id: false });

const RoomBookingSchema = new mongoose.Schema({
    roomTypeIndex: { type: Number, required: true }, // Index của room type trong hotel
    roomTypeName: { type: String, required: true }, // Tên loại phòng
    numberOfRooms: { type: Number, required: true }, // Số phòng đặt
    pricePerNight: { type: Number, required: true }, // Giá mỗi đêm
    totalPrice: { type: Number, required: true }, // Tổng giá cho loại phòng này
    guests: [GuestSchema], // Danh sách khách trong các phòng này
    specialRequests: { type: String } // Yêu cầu đặc biệt
}, { _id: false });

const HotelBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    
    // Thông tin đặt phòng
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfNights: { type: Number, required: true },
    
    // Thông tin liên hệ
    fullNameUser: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    
    // Thông tin phòng đặt
    roomBookings: [RoomBookingSchema],
    totalGuests: { type: Number, required: true },
    
    // Thông tin giá
    totalPrice: { type: Number, required: true }, // Tổng tiền cuối cùng
    
    // Thông tin thanh toán
    isDeposit: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
    isFullyPaid: { type: Boolean, default: false },
    
    payment_method: {
        type: String,
        required: true,
        enum: ['cash', 'bank_transfer'],
    },
    paymentType: {
        type: String,
        enum: ['deposit', 'full', 'remaining'],
        default: 'full'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'pending_cancel', 'deposit_paid'],
        default: 'pending',
    },
    
    // Deadline thanh toán tiền mặt
    cashPaymentDeadline: { type: Date },
    
    // Thông tin thanh toán cọc
    depositPaidAt: { type: Date },
    paymentConfirmedBy: { type: String },
    paymentNote: { type: String },
    paymentImage: { type: String },
    
    // Thông tin thanh toán toàn bộ
    fullPaidAt: { type: Date },
    fullPaymentConfirmedBy: { type: String },
    fullPaymentNote: { type: String },
    fullPaymentImage: { type: String },
    
    // Thông tin hủy đặt phòng
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    cancelReason: { type: String },
    cancelRequestedAt: { type: Date },
    cancel_requested: { type: Boolean, default: false },
    cancel_reason: { type: String },
    cancel_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    refund_amount: { type: Number, default: 0 },
    cancel_policy_note: { type: String },
    
    // Thông tin hoàn tiền
    refund_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', null],
        default: null
    },
    refund_date: {
        type: Date,
        default: null
    },
    refund_method: {
        type: String,
        enum: ['cash', 'bank_transfer', null],
        default: null
    },
    refund_note: {
        type: String,
        default: null
    },
    
    // Trạng thái check-in/check-out
    checkIn_status: {
        type: String,
        enum: ['pending', 'checked_in', 'no_show', null],
        default: 'pending'
    },
    checkOut_status: {
        type: String,
        enum: ['pending', 'checked_out', 'extended', null],
        default: null
    },
    actualCheckInTime: { type: Date },
    actualCheckOutTime: { type: Date },
    
    // Trạng thái no-show
    no_show_status: {
        type: String,
        enum: ['checked_in', 'no_show', null],
        default: null
    },
    no_show_marked_at: {
        type: Date,
        default: null
    },
    deposit_converted_to_revenue: {
        type: Boolean,
        default: false
    },
    no_show_email_sent: {
        type: Boolean,
        default: false
    },
    no_show_email_sent_at: {
        type: Date,
        default: null
    },
    
    // Ghi chú và yêu cầu đặc biệt
    note: { type: String },
    specialRequests: { type: String },
    
    // Thông tin phòng được gán (sau khi check-in)
    assignedRooms: [{
        roomNumber: { type: String },
        roomTypeIndex: { type: Number },
        floor: { type: Number }
    }]
    
}, { timestamps: true });

// Index để tìm kiếm nhanh
HotelBookingSchema.index({ userId: 1 });
HotelBookingSchema.index({ hotelId: 1 });
HotelBookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
HotelBookingSchema.index({ payment_status: 1 });
HotelBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HotelBooking', HotelBookingSchema);
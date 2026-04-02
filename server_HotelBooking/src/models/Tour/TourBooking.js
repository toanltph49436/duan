const mongoose = require("mongoose");

const PassengerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    gender: { type: String, enum: ["Nam", "Nữ"], required: true },
    birthDate: { type: Date, required: true },
    singleRoom: { type: Boolean, default: false } 
}, { _id: false });

const TourBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DateSlot",  
        required: true,
    },
    // Thông tin liên hệ
    fullNameUser: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },

    // Tổng giá tour
    totalPriceTour: { type: Number, default: 0 },

    
    // Thông tin đặt cọc
    isDeposit: { type: Boolean, default: false }, // Đã đặt cọc hay chưa
    depositAmount: { type: Number, default: 0 }, // Số tiền đã đặt cọc
    isFullyPaid: { type: Boolean, default: false }, // Đã thanh toán đầy đủ chưa

    // Số lượng từng nhóm khách
    adultsTour: { type: Number, required: true },      // Người lớn (>= 12 tuổi)
    childrenTour: { type: Number },    // Trẻ em (5-11 tuổi)
    toddlerTour: { type: Number },     // Trẻ nhỏ (2-4 tuổi)
    infantTour: { type: Number },      // Em bé (< 2 tuổi)

    // Danh sách hành khách
    adultPassengers: [PassengerSchema],  
    childPassengers: [PassengerSchema],
    toddlerPassengers: [PassengerSchema],
    infantPassengers: [PassengerSchema],
    note:{type:String},
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
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'pending_cancel', 'deposit_paid', 'refund_pending', 'refund_processing', 'refund_completed'],
        default: 'pending',
    },
    // Thời hạn thanh toán tiền mặt (48h từ khi đặt)
    cashPaymentDeadline: { type: Date },
    
    // Thông tin xác nhận thanh toán cọc
    depositPaidAt: { type: Date }, // Thời gian admin xác nhận thanh toán cọc
    paymentConfirmedBy: { type: String }, // ID admin xác nhận thanh toán cọc
    paymentNote: { type: String }, // Ghi chú khi xác nhận thanh toán cọc
    paymentImage: { type: String }, // Ảnh xác nhận thanh toán cọc
    
    // Thông tin xác nhận thanh toán toàn bộ
    fullPaidAt: { type: Date }, // Thời gian admin xác nhận thanh toán toàn bộ
    fullPaymentConfirmedBy: { type: String }, // ID admin xác nhận thanh toán toàn bộ
    fullPaymentNote: { type: String }, // Ghi chú khi xác nhận thanh toán toàn bộ
    fullPaymentImage: { type: String }, // Ảnh xác nhận thanh toán toàn bộ
    
    cancelledAt: { type: Date }, // Thời gian hủy đặt chỗ
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Admin xác nhận hủy
    cancelReason: { type: String }, // Lý do hủy
    cancelRequestedAt: { type: Date }, // Thời gian yêu cầu hủy
    cancel_requested: { type: Boolean, default: false },
    cancel_reason: { type: String },
    cancel_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    refund_amount: { type: Number, default: 0 },
    cancel_policy_note: { type: String },

    // Trạng thái hoàn tiền: pending (đang chờ), processing (đang xử lý), completed (đã hoàn tiền)
    refund_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', null],
        default: null
    },
    // Ngày hoàn tiền
    refund_date: {
        type: Date,
        default: null
    },
    // Phương thức hoàn tiền
    refund_method: {
        type: String,
        enum: ['cash', 'bank_transfer', null],
        default: null
    },
    // Ghi chú hoàn tiền
    refund_note: {
        type: String,
        default: null
    },
    // Hình ảnh xác nhận hoàn tiền
    refund_image: {
        type: String,
        default: null
    },
    // Thông tin hoàn tiền từ client
    refundInfo: {
        amount: { type: Number },
        bankInfo: {
            bankName: { type: String },
            accountNumber: { type: String },
            accountHolderName: { type: String }
        },
        contactInfo: {
            phoneNumber: { type: String },
            email: { type: String }
        },
        refundReason: { type: String },
        requestedAt: { type: Date },
        status: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' }
    },
    // Trạng thái không tham gia tour
    no_show_status: {
        type: String,
        enum: ['participated', 'no_show', null],
        default: null
    },
    // Thời gian đánh dấu không tham gia
    no_show_marked_at: {
        type: Date,
        default: null
    },
    // Tiền cọc chuyển thành doanh thu
    deposit_converted_to_revenue: {
        type: Boolean,
        default: false
    },
    // Email thông báo đã gửi
    no_show_email_sent: {
        type: Boolean,
        default: false
    },
    // Thời gian gửi email thông báo
    no_show_email_sent_at: {
        type: Date,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.model('BookingTour', TourBookingSchema);

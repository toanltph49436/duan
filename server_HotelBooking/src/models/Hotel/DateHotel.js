const mongoose = require("mongoose");

const RoomAvailabilitySchema = new mongoose.Schema({
    roomTypeIndex: { type: Number, required: true }, // Index của room type trong hotel
    availableRooms: { type: Number, required: true }, // Số phòng còn trống
    bookedRooms: { type: Number, default: 0 }, // Số phòng đã đặt
    priceOverride: { type: Number }, // Giá ghi đè cho ngày cụ thể (nếu có)
    discountOverride: { type: Number }, // Giảm giá ghi đè cho ngày cụ thể
    finalPriceOverride: { type: Number } // Giá cuối cùng ghi đè
}, { _id: false });

const DateHotelSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    roomAvailability: [RoomAvailabilitySchema], // Tình trạng từng loại phòng
    specialPricing: { type: Boolean, default: false }, // Có giá đặc biệt không
    seasonType: { 
        type: String, 
        enum: ['low', 'normal', 'high', 'peak'], 
        default: 'normal' 
    }, // Mùa du lịch
    status: {
        type: String,
        enum: ['available', 'fully_booked', 'maintenance', 'closed'],
        default: 'available'
    },
    notes: { type: String }, // Ghi chú đặc biệt cho ngày này
    minimumStay: { type: Number, default: 1 }, // Số đêm tối thiểu
    maximumStay: { type: Number }, // Số đêm tối đa
    blackoutDate: { type: Boolean, default: false }, // Ngày cấm đặt phòng
    earlyCheckIn: { type: Boolean, default: false }, // Cho phép check-in sớm
    lateCheckOut: { type: Boolean, default: false } // Cho phép check-out muộn
}, { timestamps: true });

// Index để tìm kiếm nhanh
DateHotelSchema.index({ hotel: 1, date: 1 }, { unique: true });
DateHotelSchema.index({ date: 1 });
DateHotelSchema.index({ status: 1 });

// Middleware để cập nhật finalPriceOverride
DateHotelSchema.pre('save', function(next) {
    this.roomAvailability.forEach(room => {
        if (room.priceOverride && room.discountOverride) {
            room.finalPriceOverride = room.priceOverride * (1 - room.discountOverride / 100);
        } else if (room.priceOverride) {
            room.finalPriceOverride = room.priceOverride;
        }
    });
    next();
});

module.exports = mongoose.model("DateHotel", DateHotelSchema);
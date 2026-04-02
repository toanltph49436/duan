const mongoose = require("mongoose");

const AmenitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String } // Icon class hoặc URL
}, { _id: false });

const RoomTypeSchema = new mongoose.Schema({
    typeName: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    maxOccupancy: { type: Number, required: true },
    bedType: { type: String, required: true },
    roomSize: { type: Number },
    amenities: [AmenitySchema],
    images: [{ type: String }],
    totalRooms: { type: Number, required: true },
    floorNumber: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    finalPrice: { type: Number },
    discountExpiryDate: { type: Date }
});

const HotelSchema = new mongoose.Schema({
    hotelName: { type: String, required: true },
    description: { type: String },
    location: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Location", 
        required: true 
    },
    address: { type: String, required: true },

    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    starRating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    hotelImages: [{ type: String }],
    roomTypes: [RoomTypeSchema],
    hotelAmenities: [AmenitySchema], // Tiện ích chung của khách sạn
    policies: {
        checkIn: { type: String, default: "14:00" },
        checkOut: { type: String, default: "12:00" },
        cancellationPolicy: { type: String },
        petPolicy: { type: String },
        smokingPolicy: { type: String }
    },
    pricingPolicy: {
        taxIncluded: { type: Boolean, default: false }, // true: thuế đã tính vào giá phòng, false: tách riêng
        serviceChargeIncluded: { type: Boolean, default: false }, // true: phí dịch vụ đã tính vào giá phòng, false: tách riêng
        taxRate: { type: Number, default: 0.1 }, // Tỷ lệ thuế VAT (10%)
        serviceChargeRate: { type: Number, default: 0.05 } // Tỷ lệ phí dịch vụ (5%)
    },
    contactInfo: {
        phone: { type: String },
        email: { type: String },
        website: { type: String }
    },
    status: { type: Boolean, default: true }, // Hoạt động hay không
    featured: { type: Boolean, default: false }, // Khách sạn nổi bật
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    assignedEmployee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Admin", 
        default: null 
    }
}, { timestamps: true });

// Middleware để tính finalPrice cho roomTypes
HotelSchema.pre('save', function(next) {
    this.roomTypes.forEach(roomType => {
        if (roomType.discountPercent && roomType.discountPercent > 0) {
            roomType.finalPrice = roomType.basePrice * (1 - roomType.discountPercent / 100);
        } else {
            roomType.finalPrice = roomType.basePrice;
        }
    });
    next();
});

module.exports = mongoose.model("Hotel", HotelSchema);
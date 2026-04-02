const mongoose = require("mongoose");

const AmenitySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    icon: { 
        type: String,
        default: 'setting'
    },
    description: { 
        type: String,
        trim: true,
        maxlength: 200
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'Tiện ích trong phòng (cá nhân)',
            'Tiện ích chung (dùng chung)',
            'Tiện ích phòng & an toàn cho trẻ em'
        ]
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
});

// Index để tối ưu tìm kiếm
AmenitySchema.index({ category: 1 });
AmenitySchema.index({ isActive: 1 });

// Middleware để tự động cập nhật usageCount
AmenitySchema.pre('save', function(next) {
    if (this.isNew) {
        this.usageCount = 0;
    }
    next();
});

// Static method để tìm tiện ích theo danh mục
AmenitySchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method để tìm tiện ích đang hoạt động
AmenitySchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ category: 1, name: 1 });
};

// Instance method để tăng số lần sử dụng
AmenitySchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    return this.save();
};

module.exports = mongoose.model("Amenity", AmenitySchema);

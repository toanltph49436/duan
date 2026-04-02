const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password_hash: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true
    },
    full_name: { 
        type: String,
        trim: true
    },
    phone_number: { 
        type: String,
        trim: true
    },
    address: { 
        type: String,
        trim: true
    },
    profile_picture: { 
        type: String 
    },
    employee_id: {
        type: String,
        unique: true
    },
    position: {
        type: String,
        enum: ['tour_guide', 'customer_service', 'manager', 'other'],
        default: 'tour_guide'
    },
    department: {
        type: String,
        enum: ['tour', 'hotel', 'transport', 'general'],
        default: 'tour'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    hire_date: {
        type: Date,
        default: Date.now
    },
    last_login: {
        type: Date
    },
    // Thông tin được tạo bởi admin nào
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { 
    timestamps: true 
});

// Tự động tạo full_name từ firstName và lastName
EmployeeSchema.pre('save', function (next) {
    if (this.firstName && this.lastName) {
        this.full_name = `${this.lastName} ${this.firstName}`;
    }
    
    // Tự động tạo employee_id nếu chưa có
    if (!this.employee_id) {
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.employee_id = `EMP${timestamp}${randomNum}`;
    }
    
    next();
});

// Index để tìm kiếm nhanh
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ position: 1 });
EmployeeSchema.index({ department: 1 });

const Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = Employee;

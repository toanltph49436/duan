const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    clerkId: { type: String, unique: true, sparse: true }, 
    email: { type: String, required: true, unique: true },
    password_hash: { type: String },                       
    firstName: { type: String },
    lastName: { type: String },
    full_name: { type: String },
    phone_number: { type: String },
    address: { type: String },
    profile_picture: { type: String },
}, { timestamps: true });

// Tự động cập nhật updated_at khi save
AdminSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;

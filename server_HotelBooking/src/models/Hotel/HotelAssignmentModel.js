const mongoose = require("mongoose");

const HotelAssignmentSchema = new mongoose.Schema({
	employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
	hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
	role: { type: String, enum: ['receptionist', 'manager', 'supervisor'], default: 'receptionist' },
	permissions: [{
		type: String,
		enum: ['view_rooms', 'book_rooms', 'manage_bookings', 'view_reports', 'manage_guests', 'manage_room_types', 'view_hotel_info'],
		default: ['view_rooms', 'book_rooms', 'manage_bookings', 'view_hotel_info']
	}],
	assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
	assignedAt: { type: Date, default: Date.now },
	status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
	notes: { type: String, trim: true }
}, { timestamps: true });

HotelAssignmentSchema.index({ employeeId: 1, hotelId: 1 }, { unique: true });
HotelAssignmentSchema.index({ hotelId: 1, status: 1 });
HotelAssignmentSchema.index({ employeeId: 1, status: 1 });

HotelAssignmentSchema.virtual('employee', { ref: 'Employee', localField: 'employeeId', foreignField: '_id', justOne: true });
HotelAssignmentSchema.virtual('hotel', { ref: 'Hotel', localField: 'hotelId', foreignField: '_id', justOne: true });
HotelAssignmentSchema.set('toJSON', { virtuals: true });
HotelAssignmentSchema.set('toObject', { virtuals: true });

const HotelAssignment = mongoose.model("HotelAssignment", HotelAssignmentSchema);
module.exports = HotelAssignment;

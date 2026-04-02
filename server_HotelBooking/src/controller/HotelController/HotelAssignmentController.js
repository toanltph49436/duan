const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const HotelAssignment = require("../../models/Hotel/HotelAssignmentModel");
const Employee = require("../../models/People/EmployeeModel");
const Hotel = require("../../models/Hotel/HotelModel");

const getAllHotelAssignments = async (req, res) => {
	try {
		const assignments = await HotelAssignment.find()
			.populate('employeeId', 'firstName lastName full_name email department position status')
			.populate('hotelId', 'hotelName address starRating status location');
		return res.status(StatusCodes.OK).json({ success: true, assignments });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const getHotelAssignmentsByHotel = async (req, res) => {
	try {
		const { hotelId } = req.params;
		const assignments = await HotelAssignment.find({ hotelId })
			.populate('employeeId', 'firstName lastName full_name email department position status')
			.populate('hotelId', 'hotelName address starRating status location');
		return res.status(StatusCodes.OK).json({ success: true, assignments });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const getHotelAssignmentsByEmployee = async (req, res) => {
	try {
		const { employeeId } = req.params;
		const assignments = await HotelAssignment.find({ employeeId })
			.populate('employeeId', 'firstName lastName full_name email department position status')
			.populate('hotelId', 'hotelName address starRating status location');
		return res.status(StatusCodes.OK).json({ success: true, assignments });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const createHotelAssignment = async (req, res) => {
	try {
		const { employeeId, hotelId, role, permissions, notes } = req.body;
		const employee = await Employee.findById(employeeId);
		if (!employee) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Nhân viên không tồn tại' });
		const hotel = await Hotel.findById(hotelId);
		if (!hotel) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Khách sạn không tồn tại' });

		const existingAssignment = await HotelAssignment.findOne({ employeeId, status: 'active' });
		if (existingAssignment) return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Nhân viên này đã được phân công cho khách sạn khác' });

		const existingHotelAssignment = await HotelAssignment.findOne({ hotelId, status: 'active' });
		if (existingHotelAssignment) return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Khách sạn này đã có nhân viên quản lý' });

		// Determine assignedBy from request context (middleware may set different fields)
		const assignedBy = (req.admin && req.admin.id)
			|| (req.user && req.user.id)
			|| (req.auth && req.auth.userId)
			|| employee.created_by; // fallback to creator of employee if available

		if (!assignedBy) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: 'Không xác định được admin thực hiện phân công (assignedBy). Vui lòng đăng nhập bằng tài khoản Quản trị.'
			});
		}

		const newAssignment = await HotelAssignment.create({
			employeeId,
			hotelId,
			role: role || 'receptionist',
			permissions: permissions || ['view_rooms','book_rooms','manage_bookings','view_hotel_info'],
			assignedBy,
			notes
		});
		return res.status(StatusCodes.CREATED).json({ success: true, assignment: newAssignment });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const updateHotelAssignment = async (req, res) => {
	try {
		const { assignmentId } = req.params;
		const { role, permissions, status, employeeId } = req.body;
		const assignment = await HotelAssignment.findById(assignmentId);
		if (!assignment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Phân công không tồn tại' });

		if (employeeId) {
			const clash = await HotelAssignment.findOne({ employeeId, status: 'active', _id: { $ne: assignmentId } });
			if (clash) return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Nhân viên này đã được phân công cho khách sạn khác' });
			assignment.employeeId = employeeId;
		}
		if (role) assignment.role = role;
		if (permissions) assignment.permissions = permissions;
		if (status) assignment.status = status;
		await assignment.save();
		return res.status(StatusCodes.OK).json({ success: true, assignment });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const deleteHotelAssignment = async (req, res) => {
	try {
		const { assignmentId } = req.params;
		const deleted = await HotelAssignment.findByIdAndDelete(assignmentId);
		if (!deleted) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Phân công không tồn tại' });
		return res.status(StatusCodes.OK).json({ success: true });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const getEmployeeHotelAssignments = async (req, res) => {
	try {
		const employeeId = req.user?.id || req.employee?.employeeId;
		const assignments = await HotelAssignment.find({ employeeId, status: 'active' })
			.populate('hotelId', 'hotelName address starRating status location');
		if (!assignments.length) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Bạn chưa được phân công quản lý khách sạn nào' });
		return res.status(StatusCodes.OK).json({ success: true, assignments });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

const getEmployeeHotelInfo = async (req, res) => {
	try {
		const employeeId = req.user?.id || req.employee?.employeeId;
		const assignment = await HotelAssignment.findOne({ employeeId, status: 'active' }).populate('hotelId');
		if (!assignment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Bạn chưa được phân công quản lý khách sạn nào' });
		const hotel = assignment.hotelId;
		const Room = mongoose.model('Room');
		const rooms = await Room.find({ hotelId: hotel._id }).select('nameRoom statusRoom typeRoom priceRoom');
		return res.status(StatusCodes.OK).json({ success: true, hotel: {
			_id: hotel._id,
			hotelName: hotel.hotelName,
			address: hotel.address,
			starRating: hotel.starRating,
			status: hotel.status,
			location: hotel.location,
		}, rooms, permissions: assignment.permissions });
	} catch (e) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: e.message });
	}
};

module.exports = {
	getAllHotelAssignments,
	getHotelAssignmentsByHotel,
	getHotelAssignmentsByEmployee,
	createHotelAssignment,
	updateHotelAssignment,
	deleteHotelAssignment,
	getEmployeeHotelAssignments,
	getEmployeeHotelInfo,
};

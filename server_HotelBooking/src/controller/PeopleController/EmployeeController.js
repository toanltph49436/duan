const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../../models/People/EmployeeModel");
const Admin = require("../../models/People/AdminModel");
const TourModel = require("../../models/Tour/TourModel");

// Tạo Access Token
const generateAccessToken = (employee) => {
    return jwt.sign(
        {
            employeeId: employee._id,
            email: employee.email,
            employee_id: employee.employee_id,
            position: employee.position,
            department: employee.department,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

// Tạo Refresh Token
const generateRefreshToken = (employee) => {
    return jwt.sign(
        { employeeId: employee._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "1y" }
    );
};

// Đăng nhập

const loginEmployee = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc"
            });
        }

        // Tìm nhân viên theo email
        const employee = await Employee.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (!employee) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Email không tồn tại trong hệ thống"
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (employee.status !== 'active') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên"
            });
        }

        // So sánh mật khẩu
        // const isMatch = await bcrypt.compare(password, employee.password_hash);
        // if (!isMatch) {
        //     return res.status(StatusCodes.UNAUTHORIZED).json({
        //         success: false,
        //         message: "Mật khẩu không chính xác"
        //     });
        // }

        // Cập nhật last_login
        employee.last_login = new Date();
        await employee.save();

        // Tạo tokens
        const accessToken = jwt.sign(
            { 
                employeeId: employee._id,
                email: employee.email,
                role: 'employee'
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { 
                employeeId: employee._id,
                email: employee.email,
                role: 'employee'
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Lưu refresh token vào database
        employee.refresh_token = refreshToken;
        await employee.save();

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                employee: {
                    id: employee._id,
                    email: employee.email,
                    full_name: employee.full_name,
                    phone_number: employee.phone_number,
                    role: employee.role,
                    status: employee.status
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Đăng xuất cho nhân viên HDV
const logoutEmployee = async (req, res) => {
    try {
        const { employeeId } = req.employee;

        // Xóa refresh token khỏi database
        await Employee.findByIdAndUpdate(
            employeeId,
            { $unset: { refresh_token: 1 } }
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Đăng xuất thành công"
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Refresh token cho nhân viên HDV
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Refresh token là bắt buộc"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Tìm nhân viên và kiểm tra refresh token
        const employee = await Employee.findById(decoded.employeeId);
        if (!employee || employee.refresh_token !== refreshToken) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Refresh token không hợp lệ"
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (employee.status !== 'active') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa"
            });
        }

        // Tạo access token mới
        const newAccessToken = jwt.sign(
            { 
                employeeId: employee._id,
                email: employee.email,
                role: 'employee'
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Token được làm mới thành công",
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Refresh token không hợp lệ hoặc đã hết hạn"
            });
        }
        
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

// Lấy thông tin profile nhân viên
const getEmployeeProfile = async (req, res) => {
    try {
        const employeeId = req.employee.employeeId;
        
        const employee = await Employee.findById(employeeId)
            .select('-password_hash')
            .populate('created_by', 'full_name email');

        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy thông tin nhân viên"
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Lấy thông tin thành công",
            employee
        });

    } catch (error) {
        console.error("Get employee profile error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Cập nhật thông tin profile nhân viên
const updateEmployeeProfile = async (req, res) => {
    try {
        const employeeId = req.employee.employeeId;
        const { firstName, lastName, phone_number, address } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName.trim();
        if (lastName) updateData.lastName = lastName.trim();
        if (phone_number) updateData.phone_number = phone_number.trim();
        if (address) updateData.address = address.trim();

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            updateData,
            { new: true }
        ).select('-password_hash');

        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy nhân viên"
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Cập nhật thông tin thành công",
            employee
        });

    } catch (error) {
        console.error("Update employee profile error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const employeeId = req.employee.employeeId;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc"
            });
        }

        if (newPassword.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy nhân viên"
            });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, employee.password_hash);
        if (!isMatch) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Mật khẩu hiện tại không chính xác"
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu
        employee.password_hash = hashedPassword;
        await employee.save();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Lấy danh sách tour được phân công cho HDV
const getAssignedTours = async (req, res) => {
    try {
        const employeeId = req.employee.employeeId;
        
        console.log("Getting assigned tours for employee:", employeeId);
        console.log("Employee object from token:", req.employee);
        
        // Tìm Employee để lấy ObjectId
        const employee = await Employee.findById(employeeId);
        console.log("Found employee:", employee ? employee._id : "Not found");
        
        if (!employee) {
            console.log("Employee not found with ID:", employeeId);
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy thông tin nhân viên"
            });
        }
        
        // Tìm tất cả DateSlot được phân công cho nhân viên này
        const DateTour = require('../../models/Tour/DateTour');
        const TourScheduleModel = require('../../models/Tour/TourScheduleModel');
        
        const assignedDateSlots = await DateTour.find({ 
            assignedEmployee: employee._id 
        })
        .populate({
            path: 'tour',
            populate: [
                {
                    path: 'itemTransport.TransportId',
                    select: 'transportName transportNumber transportType'
                },
                {
                    path: 'destination',
                    select: 'locationName country'
                }
            ]
        })
        .populate('assignedEmployee', 'firstName lastName full_name email employee_id position')
        .sort({ dateTour: 1 });

        console.log("Found assigned date slots:", assignedDateSlots.length);
        
        // Lấy danh sách tour unique từ các DateSlot
        const tourIds = [...new Set(assignedDateSlots.map(slot => slot.tour._id.toString()))];
        const uniqueTours = [];
        
        for (const tourId of tourIds) {
            const tourSlots = assignedDateSlots.filter(slot => slot.tour._id.toString() === tourId);
            if (tourSlots.length > 0) {
                const tour = tourSlots[0].tour;
                
                // Lấy schedules cho tour này
                const tourSchedule = await TourScheduleModel.findOne({ Tour: tour._id });
                if (tourSchedule) {
                    tour.schedules = tourSchedule.schedules || [];
                } else {
                    tour.schedules = [];
                }
                
                // Thêm thông tin về các ngày được phân công
                tour.assignedDates = tourSlots.map(slot => ({
                    dateSlotId: slot._id,
                    dateTour: slot.dateTour,
                    status: slot.status,
                    tourStatus: slot.tourStatus,
                    availableSeats: slot.availableSeats,
                    bookedSeats: slot.bookedSeats,
                    totalRevenue: slot.totalRevenue,
                    depositAmount: slot.depositAmount,
                    refundAmount: slot.refundAmount,
                    statusNote: slot.statusNote,
                    statusUpdatedAt: slot.statusUpdatedAt
                }));
                uniqueTours.push(tour);
            }
        }

        console.log("Found unique assigned tours:", uniqueTours.length);
        console.log("Tours with assignedDates:", uniqueTours.map(tour => ({
            tourId: tour._id,
            tourName: tour.nameTour,
            assignedDatesCount: tour.assignedDates ? tour.assignedDates.length : 0,
            assignedDates: tour.assignedDates
        })));

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Lấy danh sách tour được phân công thành công",
            tours: uniqueTours,
            total: uniqueTours.length
        });

    } catch (error) {
        console.error("Get assigned tours error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// === ADMIN FUNCTIONS ===

// Tạo tài khoản nhân viên mới (chỉ admin)
const createEmployee = async (req, res) => {
    try {
        console.log("=== CREATE EMPLOYEE REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request user:", req.user);
        
        const { email, password, firstName, lastName, phone_number, address, position, department } = req.body;
        const adminId = req.user.adminData._id;
        
        console.log("Extracted adminId:", adminId);

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Email, mật khẩu, họ và tên là bắt buộc"
            });
        }

        if (password.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự"
            });
        }

        // Kiểm tra email đã tồn tại
        const existingEmployee = await Employee.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (existingEmployee) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Email đã tồn tại trong hệ thống"
            });
        }

        // Hash mật khẩu
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Tạo nhân viên mới
        const employeeData = {
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone_number: phone_number ? phone_number.trim() : undefined,
            address: address ? address.trim() : undefined,
            position: position || 'tour_guide',
            department: department || 'tour',
            created_by: adminId
        };
        
        console.log("Employee data to be created:", employeeData);
        
        const employee = new Employee(employeeData);
        console.log("Employee object created:", employee);
        
        await employee.save();
        console.log("Employee saved successfully:", employee);

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Tạo tài khoản nhân viên thành công",
            employee: {
                id: employee._id,
                email: employee.email,
                employee_id: employee.employee_id,
                full_name: employee.full_name,
                position: employee.position,
                department: employee.department,
                status: employee.status
            }
        });

    } catch (error) {
        console.error("Create employee error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Lấy danh sách tất cả nhân viên (chỉ admin)
const getAllEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, position, department, search } = req.query;

        // Tạo filter
        let filter = {};
        if (status) filter.status = status;
        if (position) filter.position = position;
        if (department) filter.department = department;
        
        // Tìm kiếm theo tên hoặc email
        if (search) {
            filter.$or = [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employee_id: { $regex: search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(filter)
            .select('-password_hash')
            .populate('created_by', 'full_name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Employee.countDocuments(filter);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Lấy danh sách nhân viên thành công",
            employees,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_employees: total,
                per_page: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Get all employees error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Cập nhật thông tin nhân viên (chỉ admin)
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone_number, address, position, department, status } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName.trim();
        if (lastName) updateData.lastName = lastName.trim();
        if (phone_number) updateData.phone_number = phone_number.trim();
        if (address) updateData.address = address.trim();
        if (position) updateData.position = position;
        if (department) updateData.department = department;
        if (status) updateData.status = status;

        const employee = await Employee.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password_hash');

        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy nhân viên"
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Cập nhật thông tin nhân viên thành công",
            employee
        });

    } catch (error) {
        console.error("Update employee error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Xóa nhân viên (chỉ admin)
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByIdAndDelete(id);

        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy nhân viên"
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Xóa nhân viên thành công"
        });

    } catch (error) {
        console.error("Delete employee error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

// Reset mật khẩu nhân viên (chỉ admin)
const resetEmployeePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
        }

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Không tìm thấy nhân viên"
            });
        }

        // Hash mật khẩu mới
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        employee.password_hash = hashedPassword;
        await employee.save();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Reset mật khẩu thành công"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Lỗi server: " + error.message
        });
    }
};

module.exports = {
    // Employee functions
    loginEmployee,
    logoutEmployee,
    refreshToken,
    getEmployeeProfile,
    updateEmployeeProfile,
    changePassword,
    getAssignedTours,
    
    // Admin functions
    createEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword
};

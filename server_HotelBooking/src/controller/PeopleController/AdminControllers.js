const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/People/AdminModel.js");

const registerAdmin = async (req, res) => {
    try {
        const { adminname, password, email, full_name } = req.body;

        const existingAdmin = await Admin.findOne({ adminname });
        if (existingAdmin) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: "Adminname đã tồn tại",
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            adminname,
            password_hash,
            email,
            full_name,
        });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Đăng ký admin thành công",
            admin: {
                adminname: admin.adminname,
                email: admin.email,
                full_name: admin.full_name,
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { adminname, password } = req.body;

        const admin = await Admin.findOne({ adminname });
        if (!admin) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Admin không tồn tại",
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Sai mật khẩu",
            });
        }

        const token = jwt.sign(
            { adminId: admin._id, adminname: admin.adminname },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            admin: {
                adminname: admin.adminname,
                full_name: admin.full_name,
                email: admin.email,
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};

// (Tùy chọn) Lấy danh sách admin (chỉ admin mới có quyền)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password_hash');
        return res.status(StatusCodes.OK).json({
            success: true,
            admins,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { registerAdmin, loginAdmin, getAllAdmins };

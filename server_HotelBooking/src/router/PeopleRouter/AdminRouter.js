const express = require("express");
const { StatusCodes } = require("http-status-codes");

const { verifyClerkToken, verifyClerkTokenAndAdmin } = require("../../Middleware/Middleware.js");
const Admin = require('./../../models/People/AdminModel.js');

const AdminRouter = express.Router();

AdminRouter.post("/syncUser", verifyClerkToken, async (req, res) => {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "No clerkId provided" });
    }

    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });
    }

    try {
        // Tìm admin theo clerkId
        let admin = await Admin.findOne({ clerkId });

        if (admin) {
            // Nếu admin tồn tại với clerkId đó, cập nhật info
            admin.email = email;
            admin.firstName = firstName;
            admin.lastName = lastName;
            admin.full_name = [lastName, firstName].filter(Boolean).join(" ");
            await admin.save();

            return res.status(StatusCodes.OK).json({ message: "User synced", admin });
        }

        // Nếu admin chưa tồn tại với clerkId này, kiểm tra email đã có admin nào dùng chưa
        const emailUsed = await Admin.findOne({ email });

        if (emailUsed) {
            return res.status(403).json({ message: "Email này đã được sử dụng làm admin." });
        }

        // Kiểm tra xem đã có admin nào chưa
        // const existingAdmins = await Admin.countDocuments();

        // if (existingAdmins >= 1) {
        //     return res.status(403).json({ message: "Chỉ cho phép 1 tài khoản admin." });
        // }

        // Tạo admin mới nếu chưa có admin nào và email chưa dùng
        admin = await Admin.create({
            clerkId,
            email,
            firstName,
            lastName,
            full_name: [lastName, firstName].filter(Boolean).join(" "),
        });

        res.status(StatusCodes.OK).json({ message: "User synced", admin });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  });


// API để lấy danh sách tất cả admin
AdminRouter.get("/admins", verifyClerkTokenAndAdmin, async (req, res) => {
    try {
        const admins = await Admin.find().select('-password_hash');
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Get all admins successfully",
            admins: admins
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
});

// API để lấy thông tin admin theo ID
AdminRouter.get("/admin/profile/:id", verifyClerkTokenAndAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password_hash');
        if (!admin) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Admin not found"
            });
        }
        res.status(StatusCodes.OK).json({
            success: true,
            message: "Get admin by id successfully",
            admin: admin
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
});
  
module.exports = AdminRouter;
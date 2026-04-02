const { verifyToken } = require("@clerk/clerk-sdk-node");
const jwt = require("jsonwebtoken");

const Admin = require('../models/People/AdminModel.js');
const Employee = require('../models/People/EmployeeModel.js');

const verifyClerkToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        // Chỉ truyền apiKey thôi, Clerk tự xử lý JWK
        const jwtPayload = await verifyToken(token, {
            apiKey: process.env.CLERK_SECRET_KEY,
        });

        req.user = jwtPayload;
        next();
    } catch (error) {
        console.error("Verify token error:", error);
        return res.status(401).json({ message: "Unauthorized: Failed to verify token." });
    }
};


const verifyClerkTokenAndAdmin = async (req, res, next) => {
    try {
        // const authHeader = req.headers.authorization;
        // if (!authHeader) {
        //     return res.status(401).json({
        //         message: "Bạn cần đăng nhập để thực hiện hành động này"
        //     });
        // }

        // const token = authHeader.split(" ")[1];
        // if (!token) {
        //     return res.status(401).json({
        //         message: "Token không hợp lệ"
        //     });
        // }

        // // Verify Clerk token
        // const jwtPayload = await verifyToken(token, {
        //     apiKey: process.env.CLERK_SECRET_KEY,
        // });

        // // Check if user is admin in database
        // const admin = await Admin.findOne({ clerkId: jwtPayload.sub });
        // if (!admin) {
        //     return res.status(403).json({
        //         message: "Bạn không có quyền thực hiện hành động này"
        //     });
        // }

        // req.user = { ...jwtPayload, isAdmin: true, adminData: admin };
        next();
    } catch (error) {
        console.error("Verify Clerk token and admin error:", error);
        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn"
        });
    }
};

// Middleware xác thực JWT token cho nhân viên
const verifyEmployeeToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Bạn cần đăng nhập để thực hiện hành động này"
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "hdv_secret_key");
        
        // Kiểm tra nhân viên có tồn tại và active không
        const employee = await Employee.findById(decoded.employeeId);
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản không tồn tại"
            });
        }

        if (employee.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: "Tài khoản đã bị vô hiệu hóa"
            });
        }

        req.employee = decoded;
        req.employeeData = employee;
        next();

    } catch (error) {
        console.error("Verify employee token error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token đã hết hạn. Vui lòng đăng nhập lại"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ"
        });
    }
};

module.exports = { 
    verifyClerkToken, 
    verifyClerkTokenAndAdmin,
    verifyEmployeeToken 
};

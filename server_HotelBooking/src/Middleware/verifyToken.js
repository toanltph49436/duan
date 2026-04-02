const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

// Middleware để xác thực token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Bạn cần đăng nhập để thực hiện hành động này"
        });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Token không hợp lệ"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Token không hợp lệ hoặc đã hết hạn"
        });
    }
};

// Middleware để xác thực token và kiểm tra quyền admin
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Bạn không có quyền thực hiện hành động này"
            });
        }
    });
};

module.exports = { verifyToken, verifyTokenAndAdmin };
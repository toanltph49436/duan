const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const paymentUploadsDir = path.join(__dirname, '../../uploads/payment-confirmations');
const hotelUploadsDir = path.join(__dirname, '../../uploads/hotels');
const refundUploadsDir = path.join(__dirname, '../../uploads/refund-confirmations');

if (!fs.existsSync(paymentUploadsDir)) {
    fs.mkdirSync(paymentUploadsDir, { recursive: true });
}

if (!fs.existsSync(hotelUploadsDir)) {
    fs.mkdirSync(hotelUploadsDir, { recursive: true });
}

if (!fs.existsSync(refundUploadsDir)) {
    fs.mkdirSync(refundUploadsDir, { recursive: true });
}

// Cấu hình storage cho payment images
const paymentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, paymentUploadsDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique với timestamp và booking ID
        const bookingId = req.params.id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `payment-${bookingId}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

// Cấu hình storage cho hotel images
const hotelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, hotelUploadsDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique với timestamp
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const ext = path.extname(file.originalname);
        const filename = `hotel-${timestamp}-${randomString}${ext}`;
        cb(null, filename);
    }
});

// Cấu hình storage cho refund images
const refundStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, refundUploadsDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique với timestamp và booking ID
        const bookingId = req.params.bookingId;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `refund-${bookingId}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    // Chỉ cho phép file ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
};

// Cấu hình multer cho payment images
const paymentUpload = multer({
    storage: paymentStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
});

// Cấu hình multer cho hotel images
const hotelUpload = multer({
    storage: hotelStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB cho hình ảnh khách sạn
    }
});

// Cấu hình multer cho refund images
const refundUpload = multer({
    storage: refundStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB cho hình ảnh hoàn tiền
    }
});

// Middleware để xử lý upload single payment image
const uploadPaymentImage = paymentUpload.single('paymentImage');

// Middleware để xử lý upload multiple hotel images
const uploadHotelImages = hotelUpload.array('images', 10); // Tối đa 10 ảnh

// Middleware để xử lý upload single refund image
const uploadRefundImage = refundUpload.single('refund_image');

// Middleware wrapper để xử lý lỗi payment upload
const handlePaymentUploadError = (req, res, next) => {
    uploadPaymentImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File quá lớn. Kích thước tối đa là 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload file: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        // File upload là tùy chọn, không bắt buộc
        // Admin có thể xác nhận thanh toán mà không cần upload ảnh
        
        next();
    });
};

// Middleware wrapper để xử lý lỗi hotel upload
const handleHotelUploadError = (req, res, next) => {
    uploadHotelImages(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File quá lớn. Kích thước tối đa là 10MB.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Quá nhiều file. Tối đa 10 ảnh.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload file: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        next();
    });
};

// Middleware wrapper để xử lý lỗi refund upload
const handleRefundUploadError = (req, res, next) => {
    uploadRefundImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File quá lớn. Kích thước tối đa là 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Lỗi upload file: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        
        next();
    });
};

module.exports = {
    uploadPaymentImage: handlePaymentUploadError,
    uploadHotelImages: handleHotelUploadError,
    uploadRefundImage: handleRefundUploadError
};
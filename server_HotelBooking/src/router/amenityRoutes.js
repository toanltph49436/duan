const express = require('express');
const router = express.Router();
const AmenityController = require('../controller/AmenityController');
const { verifyClerkTokenAndAdmin } = require('../Middleware/Middleware');

// Middleware xác thực cho tất cả routes
router.use(verifyClerkTokenAndAdmin);

// GET /api/admin/amenities - Lấy danh sách tất cả tiện ích
router.get('/', AmenityController.getAllAmenities);

// GET /api/admin/amenities/active - Lấy danh sách tiện ích đang hoạt động
router.get('/active', AmenityController.getActiveAmenities);

// GET /api/admin/amenities/category/:category - Lấy tiện ích theo danh mục
router.get('/category/:category', AmenityController.getAmenitiesByCategory);

// GET /api/admin/amenities/search - Tìm kiếm tiện ích
router.get('/search', AmenityController.searchAmenities);

// GET /api/admin/amenities/stats - Lấy thống kê tiện ích
router.get('/stats', AmenityController.getAmenityStats);

// GET /api/admin/amenities/:id - Lấy tiện ích theo ID
router.get('/:id', AmenityController.getAmenityById);

// POST /api/admin/amenities - Tạo tiện ích mới
router.post('/', AmenityController.createAmenity);

// PUT /api/admin/amenities/:id - Cập nhật tiện ích
router.put('/:id', AmenityController.updateAmenity);

// DELETE /api/admin/amenities/:id - Xóa tiện ích
router.delete('/:id', AmenityController.deleteAmenity);

module.exports = router;

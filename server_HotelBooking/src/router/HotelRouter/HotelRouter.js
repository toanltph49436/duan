const express = require('express');
const {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    searchHotels,
    getHotelAvailability,
    addRoomType,
    updateRoomType,
    deleteRoomType,
    getRoomAvailability,
    getRoomStatusByFloor
} = require('../../controller/HotelController/HotelController.js');
const { uploadHotelImages } = require('../../Middleware/uploadMiddleware');

const RouterHotel = express.Router();

// Middleware để bypass xác thực cho admin routes
RouterHotel.use('/admin', (req, res, next) => {
    console.log('Admin route accessed:', req.path);
    next();
});

// Public routes
RouterHotel.get('/hotels', getAllHotels);
RouterHotel.get('/hotels/search', searchHotels);
RouterHotel.get('/hotels/:id', getHotelById);
RouterHotel.get('/hotels/:id/availability', getHotelAvailability);
RouterHotel.get('/hotels/:id/rooms/status-by-floor', getRoomStatusByFloor);

// Test route without middleware
RouterHotel.get('/admin/test', (req, res) => {
    res.json({ success: true, message: 'Test route working' });
});

// Admin routes
RouterHotel.get('/admin/hotels', getAllHotels);
RouterHotel.get('/admin/hotels/:id', getHotelById);
RouterHotel.post('/admin/hotels', createHotel);
RouterHotel.put('/admin/hotels/:id', updateHotel);
RouterHotel.delete('/admin/hotels/:id', deleteHotel);

// Room management routes
RouterHotel.post('/admin/hotels/:id/rooms', addRoomType);
RouterHotel.put("/admin/hotels/:hotelId/rooms/:roomTypeId", updateRoomType);
RouterHotel.delete('/admin/hotels/:hotelId/rooms/:roomTypeId', deleteRoomType);
RouterHotel.get('/admin/hotels/:id/rooms/availability', getRoomAvailability);

// Upload endpoint for hotel images
RouterHotel.post('/admin/upload/hotel-images', uploadHotelImages, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được upload'
            });
        }

        const imageUrls = req.files.map(file => {
            return `http://localhost:8080/uploads/hotels/${file.filename}`;
        });

        res.status(200).json({
            success: true,
            message: 'Upload hình ảnh thành công',
            data: {
                images: imageUrls
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload hình ảnh',
            error: error.message
        });
    }
});

module.exports = RouterHotel;
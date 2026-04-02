require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');

const cleanNullTours = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Tìm các record có tour = null
        const nullTours = await DateTour.find({ tour: null });
        console.log(`Tìm thấy ${nullTours.length} record có tour = null:`);
        
        nullTours.forEach(record => {
            console.log(`- ID: ${record._id}, Ngày: ${record.dateTour}, Chỗ trống: ${record.availableSeats}`);
        });
        
        if (nullTours.length > 0) {
            console.log('\n=== TÙY CHỌN XỬ LÝ ===');
            console.log('1. Xóa các record này (khuyến nghị)');
            console.log('2. Giữ lại để kiểm tra thêm');
            console.log('\nĐể xóa, chạy lệnh: node clean_null_tours.js --delete');
            
            // Nếu có tham số --delete thì xóa
            if (process.argv.includes('--delete')) {
                const deleteResult = await DateTour.deleteMany({ tour: null });
                console.log(`\nĐã xóa ${deleteResult.deletedCount} record có tour = null`);
            }
        } else {
            console.log('Không có record nào có tour = null');
        }
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Đã ngắt kết nối MongoDB');
    }
};

cleanNullTours();
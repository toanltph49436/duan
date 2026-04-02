require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const fixNullToursDirect = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Lấy dữ liệu giống như API
        const toursWithPopulate = await DateTour.find({ status: 'upcoming' })
            .populate({
                path: 'tour',
                select: 'nameTour destination departure imagesTour durationTour priceTour maxPeople tourType transport'
            })
            .sort({ dateTour: 1 });
        
        console.log(`\nTổng số tour upcoming: ${toursWithPopulate.length}`);
        
        // Tìm các record có tour null sau khi populate
        const nullTourRecords = toursWithPopulate.filter(record => !record.tour);
        const validTourRecords = toursWithPopulate.filter(record => record.tour);
        
        console.log(`Records có tour hợp lệ: ${validTourRecords.length}`);
        console.log(`Records có tour NULL: ${nullTourRecords.length}`);
        
        if (nullTourRecords.length > 0) {
            console.log(`\n=== Danh sách records có tour NULL ===`);
            nullTourRecords.forEach(record => {
                console.log(`- DateTour ID: ${record._id}`);
                console.log(`  Tour ID: ${record.tour || 'NULL'}`);
                console.log(`  Date: ${record.dateTour}`);
                console.log(`  Status: ${record.status}`);
                console.log(`  Available Seats: ${record.availableSeats}`);
                console.log('');
            });
            
            // Kiểm tra tham số dòng lệnh để xóa
            if (process.argv.includes('--delete')) {
                console.log(`🗑️  Đang xóa ${nullTourRecords.length} records có tour NULL...`);
                
                const deleteIds = nullTourRecords.map(record => record._id);
                const deleteResult = await DateTour.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
                
                // Kiểm tra lại
                console.log(`\n🔄 Kiểm tra lại sau khi xóa...`);
                const remainingTours = await DateTour.find({ status: 'upcoming' })
                    .populate('tour')
                    .sort({ dateTour: 1 });
                
                const stillNullTours = remainingTours.filter(tour => !tour.tour);
                
                console.log(`Tổng số tour upcoming còn lại: ${remainingTours.length}`);
                console.log(`Tour có object NULL: ${stillNullTours.length}`);
                
                if (stillNullTours.length === 0) {
                    console.log(`🎉 Đã sửa xong! Không còn tour NULL nào.`);
                } else {
                    console.log(`⚠️  Vẫn còn ${stillNullTours.length} tour NULL`);
                }
            } else {
                console.log(`\n💡 Để xóa các records có tour NULL, chạy lệnh:`);
                console.log(`node fix_null_tours_direct.js --delete`);
            }
        } else {
            console.log(`\n✅ Không có records nào có tour NULL!`);
        }
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nĐã ngắt kết nối MongoDB');
    }
};

fixNullToursDirect();
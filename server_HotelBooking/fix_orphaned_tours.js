require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const fixOrphanedTours = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Tìm tất cả DateTour records
        const allDateTours = await DateTour.find({});
        console.log(`\nTổng số DateTour records: ${allDateTours.length}`);
        
        const orphanedRecords = [];
        const validRecords = [];
        
        // Kiểm tra từng record
        for (const dateTour of allDateTours) {
            if (!dateTour.tour) {
                console.log(`❌ DateTour ${dateTour._id} có tour ID là NULL`);
                orphanedRecords.push(dateTour);
                continue;
            }
            
            // Kiểm tra xem tour ID có tồn tại không
            const tourExists = await Tour.findById(dateTour.tour);
            if (!tourExists) {
                console.log(`❌ DateTour ${dateTour._id} tham chiếu đến tour ID ${dateTour.tour} KHÔNG TỒN TẠI`);
                orphanedRecords.push(dateTour);
            } else {
                validRecords.push(dateTour);
            }
        }
        
        console.log(`\n=== Kết quả kiểm tra ===`);
        console.log(`Records hợp lệ: ${validRecords.length}`);
        console.log(`Records orphaned: ${orphanedRecords.length}`);
        
        if (orphanedRecords.length > 0) {
            console.log(`\n=== Danh sách records orphaned ===`);
            orphanedRecords.forEach(record => {
                console.log(`- ID: ${record._id}, Tour ID: ${record.tour || 'NULL'}, Date: ${record.dateTour}, Status: ${record.status}`);
            });
            
            // Kiểm tra tham số dòng lệnh để xóa
            if (process.argv.includes('--delete')) {
                console.log(`\n🗑️  Đang xóa ${orphanedRecords.length} records orphaned...`);
                
                const deleteIds = orphanedRecords.map(record => record._id);
                const deleteResult = await DateTour.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records orphaned`);
                
                // Test lại API
                console.log(`\n🔄 Kiểm tra lại dữ liệu sau khi xóa...`);
                const remainingTours = await DateTour.find({}).populate('tour');
                const nullTours = remainingTours.filter(tour => !tour.tour);
                
                console.log(`Tổng số DateTour còn lại: ${remainingTours.length}`);
                console.log(`DateTour có tour NULL: ${nullTours.length}`);
                
                if (nullTours.length === 0) {
                    console.log(`🎉 Đã sửa xong! Không còn tour NULL nào.`);
                } else {
                    console.log(`⚠️  Vẫn còn ${nullTours.length} tour NULL`);
                }
            } else {
                console.log(`\n💡 Để xóa các records orphaned này, chạy lệnh:`);
                console.log(`node fix_orphaned_tours.js --delete`);
            }
        } else {
            console.log(`\n✅ Không có records orphaned nào!`);
        }
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nĐã ngắt kết nối MongoDB');
    }
};

fixOrphanedTours();
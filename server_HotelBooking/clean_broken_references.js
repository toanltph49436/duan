require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const cleanBrokenReferences = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Lấy tất cả DateTour records
        const allDateTours = await DateTour.find({});
        console.log(`\nTổng số DateTour records: ${allDateTours.length}`);
        
        // Lấy tất cả Tour IDs hợp lệ
        const validTours = await Tour.find({}, '_id');
        const validTourIds = new Set(validTours.map(tour => tour._id.toString()));
        console.log(`Tổng số Tour hợp lệ: ${validTours.length}`);
        
        // Tìm DateTour records có tour ID không hợp lệ
        const brokenRecords = [];
        const validRecords = [];
        
        for (const dateTour of allDateTours) {
            if (!dateTour.tour) {
                console.log(`❌ DateTour ${dateTour._id} có tour field NULL`);
                brokenRecords.push(dateTour);
            } else if (!validTourIds.has(dateTour.tour.toString())) {
                console.log(`❌ DateTour ${dateTour._id} tham chiếu đến tour ID không tồn tại: ${dateTour.tour}`);
                brokenRecords.push(dateTour);
            } else {
                validRecords.push(dateTour);
            }
        }
        
        console.log(`\n=== Kết quả ===`);
        console.log(`Records hợp lệ: ${validRecords.length}`);
        console.log(`Records bị lỗi: ${brokenRecords.length}`);
        
        if (brokenRecords.length > 0) {
            console.log(`\n=== Danh sách records bị lỗi ===`);
            brokenRecords.forEach(record => {
                console.log(`- ID: ${record._id}`);
                console.log(`  Tour ID: ${record.tour || 'NULL'}`);
                console.log(`  Date: ${record.dateTour}`);
                console.log(`  Status: ${record.status}`);
                console.log('');
            });
            
            if (process.argv.includes('--delete')) {
                console.log(`🗑️  Đang xóa ${brokenRecords.length} records bị lỗi...`);
                
                const deleteIds = brokenRecords.map(record => record._id);
                const deleteResult = await DateTour.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
                
                // Kiểm tra lại
                console.log('\n🔄 Kiểm tra lại...');
                const remainingTours = await DateTour.find({});
                console.log(`DateTour records còn lại: ${remainingTours.length}`);
                
                // Test API
                await new Promise(resolve => setTimeout(resolve, 1000));
                const axios = require('axios');
                try {
                    const response = await axios.get('http://localhost:3002/api/status/upcoming');
                    const tours = response.data.data;
                    const nullTours = tours.filter(tour => !tour.tour);
                    
                    console.log(`\nAPI Response:`);
                    console.log(`- Total tours: ${tours.length}`);
                    console.log(`- NULL tours: ${nullTours.length}`);
                    
                    if (nullTours.length === 0) {
                        console.log('🎉 Thành công! Không còn tour NULL.');
                    } else {
                        console.log('⚠️  Vẫn còn tour NULL - có thể cần restart server.');
                    }
                } catch (apiErr) {
                    console.log('❌ Lỗi API:', apiErr.message);
                }
            } else {
                console.log(`\n💡 Để xóa các records bị lỗi, chạy:`);
                console.log(`node clean_broken_references.js --delete`);
            }
        } else {
            console.log(`\n✅ Không có records bị lỗi!`);
        }
        
    } catch (error) {
        console.error('Lỗi:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\nĐã ngắt kết nối MongoDB');
    }
};

cleanBrokenReferences();
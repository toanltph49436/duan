require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const deleteSpecificNullTours = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Danh sách ID cụ thể từ API response có tour NULL
        const nullTourIds = [
            '686f1af8ff57e3f1aac86029',
            '686f1af8ff57e3f1aac8602a', 
            '687e10c8ccde3ce5ab516c02',
            '687e10c8ccde3ce5ab516c03'
        ];
        
        console.log(`\nSẽ xóa ${nullTourIds.length} DateTour records có tour NULL:`);
        nullTourIds.forEach(id => console.log(`- ${id}`));
        
        // Kiểm tra các record này trước khi xóa
        console.log('\n=== Kiểm tra records trước khi xóa ===');
        for (const id of nullTourIds) {
            try {
                const record = await DateTour.findById(id);
                if (record) {
                    console.log(`✓ Found: ${id} - Tour ID: ${record.tour || 'NULL'} - Date: ${record.dateTour}`);
                } else {
                    console.log(`✗ Not found: ${id}`);
                }
            } catch (err) {
                console.log(`✗ Error checking ${id}: ${err.message}`);
            }
        }
        
        // Xóa các records
        if (process.argv.includes('--delete')) {
            console.log('\n🗑️  Đang xóa các records...');
            
            const deleteResult = await DateTour.deleteMany({ 
                _id: { $in: nullTourIds.map(id => new mongoose.Types.ObjectId(id)) } 
            });
            
            console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
            
            // Kiểm tra lại API
            console.log('\n🔄 Đợi 2 giây rồi kiểm tra API...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test API bằng axios
            const axios = require('axios');
            try {
                const response = await axios.get('http://localhost:3002/api/status/upcoming');
                const tours = response.data.data;
                const nullTours = tours.filter(tour => !tour.tour);
                
                console.log(`API Response - Total: ${tours.length}, NULL tours: ${nullTours.length}`);
                
                if (nullTours.length === 0) {
                    console.log('🎉 Thành công! Không còn tour NULL nào trong API.');
                } else {
                    console.log('⚠️  Vẫn còn tour NULL:');
                    nullTours.forEach(tour => {
                        console.log(`  - ${tour._id}`);
                    });
                }
            } catch (apiErr) {
                console.log('❌ Lỗi khi test API:', apiErr.message);
            }
        } else {
            console.log('\n💡 Để xóa các records này, chạy lệnh:');
            console.log('node delete_specific_null_tours.js --delete');
        }
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nĐã ngắt kết nối MongoDB');
    }
};

deleteSpecificNullTours();
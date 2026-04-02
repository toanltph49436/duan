require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const fixCloudDatabase = async () => {
    try {
        // Sử dụng connection string từ .env (MongoDB Atlas)
        const mongoUri = process.env.MONGODB_URI;
        console.log('Kết nối đến MongoDB Atlas...');
        console.log('URI:', mongoUri.substring(0, 50) + '...');
        
        await mongoose.connect(mongoUri);
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        // Lấy dữ liệu giống như API
        console.log('\n🔍 Kiểm tra dữ liệu upcoming tours...');
        const upcomingTours = await DateTour.find({ status: 'upcoming' })
            .populate({
                path: 'tour',
                select: 'nameTour destination departure imagesTour durationTour priceTour maxPeople tourType transport'
            })
            .sort({ dateTour: 1 });
        
        console.log(`Tổng số upcoming tours: ${upcomingTours.length}`);
        
        // Phân loại tours
        const nullTours = upcomingTours.filter(tour => !tour.tour);
        const validTours = upcomingTours.filter(tour => tour.tour);
        
        console.log(`Tours hợp lệ: ${validTours.length}`);
        console.log(`Tours có tour NULL: ${nullTours.length}`);
        
        if (nullTours.length > 0) {
            console.log('\n❌ Danh sách tours có tour NULL:');
            nullTours.forEach((tour, index) => {
                console.log(`${index + 1}. ID: ${tour._id}`);
                console.log(`   Date: ${tour.dateTour}`);
                console.log(`   Status: ${tour.status}`);
                console.log(`   Available Seats: ${tour.availableSeats}`);
                console.log('');
            });
            
            if (process.argv.includes('--delete')) {
                console.log(`🗑️  Đang xóa ${nullTours.length} tours có tour NULL...`);
                
                const deleteIds = nullTours.map(tour => tour._id);
                const deleteResult = await DateTour.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records từ MongoDB Atlas`);
                
                // Kiểm tra lại
                console.log('\n🔄 Kiểm tra lại dữ liệu...');
                const remainingUpcoming = await DateTour.find({ status: 'upcoming' })
                    .populate('tour')
                    .sort({ dateTour: 1 });
                
                const stillNullTours = remainingUpcoming.filter(tour => !tour.tour);
                
                console.log(`Upcoming tours còn lại: ${remainingUpcoming.length}`);
                console.log(`Tours vẫn có tour NULL: ${stillNullTours.length}`);
                
                if (stillNullTours.length === 0) {
                    console.log('🎉 Thành công! Đã xóa hết tours có tour NULL.');
                    
                    // Test API sau 2 giây
                    console.log('\n⏳ Đợi 2 giây rồi test API...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const axios = require('axios');
                    try {
                        const response = await axios.get('http://localhost:3002/api/status/upcoming');
                        const apiTours = response.data.data;
                        const apiNullTours = apiTours.filter(tour => !tour.tour);
                        
                        console.log(`\n📊 Kết quả API:`);
                        console.log(`- Total tours: ${apiTours.length}`);
                        console.log(`- NULL tours: ${apiNullTours.length}`);
                        
                        if (apiNullTours.length === 0) {
                            console.log('🎉 HOÀN THÀNH! API không còn trả về tour NULL.');
                        } else {
                            console.log('⚠️  API vẫn trả về tour NULL - có thể cần restart server.');
                        }
                    } catch (apiErr) {
                        console.log('❌ Lỗi khi test API:', apiErr.message);
                    }
                } else {
                    console.log('⚠️  Vẫn còn tours có tour NULL.');
                }
            } else {
                console.log('\n💡 Để xóa các tours có tour NULL, chạy:');
                console.log('node fix_cloud_database.js --delete');
            }
        } else {
            console.log('\n✅ Không có tours nào có tour NULL!');
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.name === 'MongoNetworkError') {
            console.error('Lỗi kết nối MongoDB Atlas. Kiểm tra:');
            console.error('1. Internet connection');
            console.error('2. MongoDB Atlas credentials');
            console.error('3. IP whitelist trong MongoDB Atlas');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
    }
};

fixCloudDatabase();
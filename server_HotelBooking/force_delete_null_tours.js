require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const forceDeleteNullTours = async () => {
    let client;
    try {
        // Kết nối trực tiếp bằng MongoDB driver (không qua Mongoose)
        const mongoUri = process.env.MONGODB_URI;
        console.log('Kết nối trực tiếp đến MongoDB Atlas...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db(); // Sử dụng database mặc định từ URI
        const dateTourCollection = db.collection('datetours'); // Collection name thường là lowercase + plural
        const tourCollection = db.collection('tours');
        
        // Lấy tất cả tour IDs hợp lệ
        console.log('\n🔍 Lấy danh sách Tour IDs hợp lệ...');
        const validTours = await tourCollection.find({}, { projection: { _id: 1 } }).toArray();
        const validTourIds = new Set(validTours.map(tour => tour._id.toString()));
        console.log(`Tổng số Tour hợp lệ: ${validTours.length}`);
        
        // Lấy tất cả DateTour records có status = 'upcoming'
        console.log('\n🔍 Kiểm tra DateTour records...');
        const upcomingDateTours = await dateTourCollection.find({ status: 'upcoming' }).toArray();
        console.log(`Tổng số DateTour upcoming: ${upcomingDateTours.length}`);
        
        // Tìm records có tour ID không hợp lệ
        const invalidRecords = [];
        const validRecords = [];
        
        for (const record of upcomingDateTours) {
            if (!record.tour) {
                console.log(`❌ Record ${record._id} có tour field NULL`);
                invalidRecords.push(record);
            } else if (!validTourIds.has(record.tour.toString())) {
                console.log(`❌ Record ${record._id} tham chiếu đến tour ID không tồn tại: ${record.tour}`);
                invalidRecords.push(record);
            } else {
                validRecords.push(record);
            }
        }
        
        console.log(`\n📊 Kết quả:`);
        console.log(`Records hợp lệ: ${validRecords.length}`);
        console.log(`Records không hợp lệ: ${invalidRecords.length}`);
        
        if (invalidRecords.length > 0) {
            console.log(`\n❌ Danh sách records không hợp lệ:`);
            invalidRecords.forEach((record, index) => {
                console.log(`${index + 1}. ID: ${record._id}`);
                console.log(`   Tour ID: ${record.tour || 'NULL'}`);
                console.log(`   Date: ${record.dateTour}`);
                console.log(`   Available Seats: ${record.availableSeats}`);
                console.log('');
            });
            
            if (process.argv.includes('--delete')) {
                console.log(`🗑️  Đang xóa ${invalidRecords.length} records không hợp lệ...`);
                
                const deleteIds = invalidRecords.map(record => record._id);
                const deleteResult = await dateTourCollection.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
                
                // Kiểm tra lại
                console.log('\n🔄 Kiểm tra lại...');
                const remainingUpcoming = await dateTourCollection.find({ status: 'upcoming' }).toArray();
                console.log(`DateTour upcoming còn lại: ${remainingUpcoming.length}`);
                
                // Test API
                console.log('\n⏳ Đợi 3 giây rồi test API...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const axios = require('axios');
                try {
                    const response = await axios.get('http://localhost:3002/api/status/upcoming');
                    const apiTours = response.data.data;
                    const apiNullTours = apiTours.filter(tour => !tour.tour);
                    
                    console.log(`\n📊 Kết quả API sau khi xóa:`);
                    console.log(`- Total tours: ${apiTours.length}`);
                    console.log(`- NULL tours: ${apiNullTours.length}`);
                    
                    if (apiNullTours.length === 0) {
                        console.log('🎉 THÀNH CÔNG! API không còn trả về tour NULL.');
                        console.log('✅ Vấn đề hiển thị N/A đã được giải quyết.');
                    } else {
                        console.log('⚠️  API vẫn trả về tour NULL:');
                        apiNullTours.forEach(tour => {
                            console.log(`   - ${tour._id}`);
                        });
                    }
                } catch (apiErr) {
                    console.log('❌ Lỗi khi test API:', apiErr.message);
                }
            } else {
                console.log(`\n💡 Để xóa các records không hợp lệ, chạy:`);
                console.log(`node force_delete_null_tours.js --delete`);
            }
        } else {
            console.log(`\n✅ Tất cả records đều hợp lệ!`);
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
        }
    }
};

forceDeleteNullTours();
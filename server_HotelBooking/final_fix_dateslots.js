require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const finalFixDateSlots = async () => {
    let client;
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('🔧 FINAL FIX: Kết nối đến MongoDB Atlas...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db();
        const dateSlotsCollection = db.collection('dateslots'); // Đây là collection thực tế
        const tourCollection = db.collection('tours');
        
        // Lấy tất cả tour IDs hợp lệ
        console.log('\n🔍 Lấy danh sách Tour IDs hợp lệ...');
        const validTours = await tourCollection.find({}, { projection: { _id: 1 } }).toArray();
        const validTourIds = new Set(validTours.map(tour => tour._id.toString()));
        console.log(`Tổng số Tour hợp lệ: ${validTours.length}`);
        
        // Lấy tất cả DateSlots có status = 'upcoming'
        console.log('\n🔍 Kiểm tra DateSlots với status upcoming...');
        const upcomingSlots = await dateSlotsCollection.find({ status: 'upcoming' }).toArray();
        console.log(`Tổng số DateSlots upcoming: ${upcomingSlots.length}`);
        
        // Tìm records có tour ID không hợp lệ
        const invalidRecords = [];
        const validRecords = [];
        
        console.log('\n🔍 Phân tích từng record:');
        for (const record of upcomingSlots) {
            console.log(`\n--- Record ${record._id} ---`);
            console.log(`Tour ID: ${record.tour || 'NULL'}`);
            console.log(`Date: ${record.dateTour}`);
            console.log(`Available Seats: ${record.availableSeats}`);
            
            if (!record.tour) {
                console.log(`❌ Tour field NULL`);
                invalidRecords.push(record);
            } else if (!validTourIds.has(record.tour.toString())) {
                console.log(`❌ Tour ID không tồn tại: ${record.tour}`);
                invalidRecords.push(record);
            } else {
                console.log(`✅ Tour ID hợp lệ`);
                validRecords.push(record);
            }
        }
        
        console.log(`\n📊 KẾT QUẢ PHÂN TÍCH:`);
        console.log(`Records hợp lệ: ${validRecords.length}`);
        console.log(`Records không hợp lệ: ${invalidRecords.length}`);
        
        if (invalidRecords.length > 0) {
            console.log(`\n❌ DANH SÁCH RECORDS KHÔNG HỢP LỆ:`);
            invalidRecords.forEach((record, index) => {
                console.log(`${index + 1}. ID: ${record._id}`);
                console.log(`   Tour ID: ${record.tour || 'NULL'}`);
                console.log(`   Date: ${record.dateTour}`);
                console.log(`   Available Seats: ${record.availableSeats}`);
                console.log('');
            });
            
            if (process.argv.includes('--delete')) {
                console.log(`\n🗑️  ĐANG XÓA ${invalidRecords.length} RECORDS KHÔNG HỢP LỆ...`);
                
                const deleteIds = invalidRecords.map(record => record._id);
                const deleteResult = await dateSlotsCollection.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ ĐÃ XÓA ${deleteResult.deletedCount} RECORDS`);
                
                // Kiểm tra lại
                console.log('\n🔄 KIỂM TRA LẠI SAU KHI XÓA...');
                const remainingUpcoming = await dateSlotsCollection.find({ status: 'upcoming' }).toArray();
                console.log(`DateSlots upcoming còn lại: ${remainingUpcoming.length}`);
                
                // Test API ngay lập tức
                console.log('\n⏳ ĐANG TEST API...');
                const axios = require('axios');
                try {
                    const response = await axios.get('http://localhost:3002/api/status/upcoming');
                    const apiTours = response.data.data;
                    const apiNullTours = apiTours.filter(tour => !tour.tour);
                    
                    console.log(`\n📊 KẾT QUẢ API SAU KHI XÓA:`);
                    console.log(`- Total tours: ${apiTours.length}`);
                    console.log(`- NULL tours: ${apiNullTours.length}`);
                    
                    if (apiNullTours.length === 0) {
                        console.log('\n🎉🎉🎉 THÀNH CÔNG! 🎉🎉🎉');
                        console.log('✅ API không còn trả về tour NULL.');
                        console.log('✅ Vấn đề hiển thị N/A đã được giải quyết hoàn toàn!');
                        console.log('✅ Trang quản lý thời gian tour sẽ hiển thị đúng dữ liệu.');
                    } else {
                        console.log('\n⚠️  API vẫn trả về tour NULL:');
                        apiNullTours.forEach((tour, index) => {
                            console.log(`   ${index + 1}. ID: ${tour._id}`);
                        });
                        console.log('\n🔧 Có thể cần restart server hoặc kiểm tra thêm.');
                    }
                } catch (apiErr) {
                    console.log('❌ Lỗi khi test API:', apiErr.message);
                    console.log('💡 Hãy thử restart server và test lại.');
                }
            } else {
                console.log(`\n💡 ĐỂ XÓA CÁC RECORDS KHÔNG HỢP LỆ, CHẠY:`);
                console.log(`node final_fix_dateslots.js --delete`);
                console.log(`\n⚠️  LƯU Ý: Lệnh này sẽ xóa vĩnh viễn ${invalidRecords.length} records không hợp lệ!`);
            }
        } else {
            console.log(`\n✅ TẤT CẢ RECORDS ĐỀU HỢP LỆ!`);
            console.log('🤔 Nếu API vẫn trả về NULL, có thể cần restart server.');
        }
        
    } catch (error) {
        console.error('❌ LỖI:', error.message);
        console.error(error.stack);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
        }
    }
};

finalFixDateSlots();
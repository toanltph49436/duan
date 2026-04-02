require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const fixDateSlots = async () => {
    let client;
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('Kết nối đến MongoDB Atlas...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db();
        const dateSlotsCollection = db.collection('dateslots');
        const tourCollection = db.collection('tours');
        
        // Kiểm tra dateslots collection
        console.log('\n🔍 Kiểm tra DateSlots collection...');
        const totalDateSlots = await dateSlotsCollection.countDocuments();
        console.log(`Tổng số DateSlots: ${totalDateSlots}`);
        
        // Lấy sample để xem cấu trúc
        const sample = await dateSlotsCollection.findOne();
        if (sample) {
            console.log('\n📋 Cấu trúc sample DateSlot:');
            console.log('Fields:', Object.keys(sample).join(', '));
            console.log('Sample data:', JSON.stringify(sample, null, 2));
        }
        
        // Tìm records có status = 'upcoming'
        const upcomingSlots = await dateSlotsCollection.find({ status: 'upcoming' }).toArray();
        console.log(`\nDateSlots với status 'upcoming': ${upcomingSlots.length}`);
        
        if (upcomingSlots.length > 0) {
            // Lấy tất cả tour IDs hợp lệ
            const validTours = await tourCollection.find({}, { projection: { _id: 1 } }).toArray();
            const validTourIds = new Set(validTours.map(tour => tour._id.toString()));
            console.log(`Tổng số Tour hợp lệ: ${validTours.length}`);
            
            // Kiểm tra từng record
            const invalidRecords = [];
            const validRecords = [];
            
            console.log('\n🔍 Kiểm tra từng DateSlot upcoming:');
            for (const record of upcomingSlots) {
                console.log(`\n--- DateSlot ${record._id} ---`);
                console.log(`Tour field: ${record.tour || 'NULL'}`);
                console.log(`Date: ${record.dateTour || record.date || 'N/A'}`);
                console.log(`Available Seats: ${record.availableSeats || 'N/A'}`);
                
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
            
            console.log(`\n📊 Kết quả:`);
            console.log(`Records hợp lệ: ${validRecords.length}`);
            console.log(`Records không hợp lệ: ${invalidRecords.length}`);
            
            if (invalidRecords.length > 0 && process.argv.includes('--delete')) {
                console.log(`\n🗑️  Đang xóa ${invalidRecords.length} records không hợp lệ...`);
                
                const deleteIds = invalidRecords.map(record => record._id);
                const deleteResult = await dateSlotsCollection.deleteMany({ _id: { $in: deleteIds } });
                
                console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
                
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
                        console.log('⚠️  API vẫn trả về tour NULL.');
                    }
                } catch (apiErr) {
                    console.log('❌ Lỗi khi test API:', apiErr.message);
                }
            } else if (invalidRecords.length > 0) {
                console.log(`\n💡 Để xóa các records không hợp lệ, chạy:`);
                console.log(`node fix_dateslots.js --delete`);
            }
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

fixDateSlots();
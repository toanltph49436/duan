require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const findAllDateTourCollections = async () => {
    let client;
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('🔍 TÌM KIẾM TẤT CẢ COLLECTIONS CHỨA DATETOUR DATA...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db();
        
        // Lấy tất cả collections
        const collections = await db.listCollections().toArray();
        console.log(`\n📋 Tổng số collections: ${collections.length}`);
        
        // Kiểm tra từng collection
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n🔍 Kiểm tra collection: ${collectionName}`);
            
            try {
                const collection = db.collection(collectionName);
                const count = await collection.countDocuments();
                
                if (count > 0) {
                    // Lấy sample document
                    const sample = await collection.findOne();
                    const fields = Object.keys(sample);
                    
                    console.log(`   📊 ${count} documents`);
                    console.log(`   🏷️  Fields: ${fields.join(', ')}`);
                    
                    // Kiểm tra xem có phải DateTour collection không
                    const hasDateTourFields = fields.includes('tour') && 
                                            fields.includes('dateTour') && 
                                            fields.includes('availableSeats');
                    
                    if (hasDateTourFields) {
                        console.log(`   🎯 ĐÂY CÓ THỂ LÀ DATETOUR COLLECTION!`);
                        
                        // Kiểm tra status upcoming
                        const upcomingCount = await collection.countDocuments({ status: 'upcoming' });
                        console.log(`   📈 Upcoming records: ${upcomingCount}`);
                        
                        if (upcomingCount > 0) {
                            console.log(`   🔥 COLLECTION NÀY CÓ UPCOMING RECORDS!`);
                            
                            // Lấy vài records để kiểm tra
                            const upcomingRecords = await collection.find({ status: 'upcoming' }).limit(3).toArray();
                            
                            console.log(`   📋 Sample upcoming records:`);
                            upcomingRecords.forEach((record, index) => {
                                console.log(`      ${index + 1}. ID: ${record._id}`);
                                console.log(`         Tour: ${record.tour || 'NULL'}`);
                                console.log(`         Date: ${record.dateTour}`);
                                console.log(`         Seats: ${record.availableSeats}`);
                            });
                            
                            // Kiểm tra có bao nhiêu records có tour NULL
                            const nullTourCount = await collection.countDocuments({ 
                                status: 'upcoming', 
                                $or: [
                                    { tour: null },
                                    { tour: { $exists: false } }
                                ]
                            });
                            
                            console.log(`   ❌ Records có tour NULL: ${nullTourCount}`);
                            
                            // Nếu đây là collection có vấn đề, đề xuất xóa
                            if (nullTourCount > 0) {
                                console.log(`   🚨 COLLECTION NÀY CÓ VẤN ĐỀ!`);
                                console.log(`   💡 Để xóa ${nullTourCount} records NULL, chạy:`);
                                console.log(`   node find_all_datetour_collections.js --delete-${collectionName}`);
                            }
                        }
                    }
                } else {
                    console.log(`   📊 0 documents (rỗng)`);
                }
            } catch (err) {
                console.log(`   ❌ Lỗi: ${err.message}`);
            }
        }
        
        // Kiểm tra xem có argument để xóa không
        const deleteArg = process.argv.find(arg => arg.startsWith('--delete-'));
        if (deleteArg) {
            const collectionToDelete = deleteArg.replace('--delete-', '');
            console.log(`\n🗑️  ĐANG XÓA RECORDS NULL TRONG COLLECTION: ${collectionToDelete}`);
            
            const collection = db.collection(collectionToDelete);
            const deleteResult = await collection.deleteMany({ 
                status: 'upcoming', 
                $or: [
                    { tour: null },
                    { tour: { $exists: false } }
                ]
            });
            
            console.log(`✅ Đã xóa ${deleteResult.deletedCount} records`);
            
            // Test API
            console.log('\n⏳ Test API sau khi xóa...');
            const axios = require('axios');
            try {
                const response = await axios.get('http://localhost:3002/api/status/upcoming');
                const apiTours = response.data.data;
                const apiNullTours = apiTours.filter(tour => !tour.tour);
                
                console.log(`\n📊 KẾT QUẢ API:`);
                console.log(`- Total tours: ${apiTours.length}`);
                console.log(`- NULL tours: ${apiNullTours.length}`);
                
                if (apiNullTours.length === 0) {
                    console.log('\n🎉🎉🎉 THÀNH CÔNG! 🎉🎉🎉');
                    console.log('✅ Vấn đề N/A đã được giải quyết!');
                } else {
                    console.log('\n⚠️  Vẫn còn NULL tours.');
                }
            } catch (apiErr) {
                console.log('❌ Lỗi API:', apiErr.message);
            }
        }
        
    } catch (error) {
        console.error('❌ LỖI:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
        }
    }
};

findAllDateTourCollections();
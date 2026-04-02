require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const findAPICollection = async () => {
    let client;
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('🔍 TÌM COLLECTION CHỨA DỮ LIỆU API...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db();
        
        // IDs từ API response
        const apiIds = [
            '686f1af8ff57e3f1aac86029',
            '686f1af8ff57e3f1aac8602a', 
            '687e10c8ccde3ce5ab516c02',
            '688a35bf545cb6f652b91569',
            '687e10c8ccde3ce5ab516c03'
        ];
        
        console.log('\n🎯 Tìm kiếm IDs từ API response:');
        apiIds.forEach(id => console.log(`   - ${id}`));
        
        // Lấy tất cả collections
        const collections = await db.listCollections().toArray();
        console.log(`\n📋 Kiểm tra ${collections.length} collections...`);
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n🔍 Kiểm tra collection: ${collectionName}`);
            
            try {
                const collection = db.collection(collectionName);
                
                // Tìm kiếm từng ID
                for (const id of apiIds) {
                    try {
                        const doc = await collection.findOne({ _id: new ObjectId(id) });
                        if (doc) {
                            console.log(`   ✅ FOUND ID ${id} in collection ${collectionName}!`);
                            console.log(`   📋 Document:`, JSON.stringify(doc, null, 2));
                            
                            // Kiểm tra tất cả documents trong collection này
                            const allDocs = await collection.find({}).toArray();
                            console.log(`   📊 Total documents in ${collectionName}: ${allDocs.length}`);
                            
                            // Kiểm tra upcoming records
                            const upcomingDocs = await collection.find({ status: 'upcoming' }).toArray();
                            console.log(`   📈 Upcoming documents: ${upcomingDocs.length}`);
                            
                            if (upcomingDocs.length > 0) {
                                console.log(`   🔥 COLLECTION NÀY CÓ UPCOMING RECORDS!`);
                                
                                // Đếm NULL tours
                                let nullCount = 0;
                                upcomingDocs.forEach(doc => {
                                    if (!doc.tour) nullCount++;
                                });
                                
                                console.log(`   ❌ Records có tour NULL: ${nullCount}`);
                                
                                if (nullCount > 0) {
                                    console.log(`   🎯 ĐÂY LÀ COLLECTION GÂY VẤN ĐỀ!`);
                                    
                                    // Liệt kê các records NULL
                                    console.log(`   📋 Danh sách records NULL:`);
                                    upcomingDocs.forEach((doc, index) => {
                                        if (!doc.tour) {
                                            console.log(`      ${index + 1}. ID: ${doc._id} | Date: ${doc.dateTour}`);
                                        }
                                    });
                                    
                                    // Tạo lệnh xóa
                                    const nullIds = upcomingDocs.filter(doc => !doc.tour).map(doc => doc._id);
                                    console.log(`\n   🗑️  Lệnh xóa records NULL:`);
                                    console.log(`   db.${collectionName}.deleteMany({ _id: { $in: [${nullIds.map(id => `ObjectId("${id}")`).join(', ')}] } })`);
                                }
                            }
                            
                            return; // Tìm thấy rồi thì dừng
                        }
                    } catch (err) {
                        // ID không hợp lệ, bỏ qua
                    }
                }
                
            } catch (error) {
                console.log(`   ❌ Lỗi kiểm tra collection ${collectionName}:`, error.message);
            }
        }
        
        console.log('\n❌ Không tìm thấy collection nào chứa các IDs từ API');
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
        }
    }
};

findAPICollection();
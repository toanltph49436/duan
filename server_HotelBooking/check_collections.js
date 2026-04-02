require('dotenv').config();
const { MongoClient } = require('mongodb');

const checkCollections = async () => {
    let client;
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('Kết nối đến MongoDB Atlas...');
        
        client = new MongoClient(mongoUri);
        await client.connect();
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        const db = client.db();
        
        // Liệt kê tất cả collections
        console.log('\n📋 Danh sách tất cả collections:');
        const collections = await db.listCollections().toArray();
        collections.forEach((collection, index) => {
            console.log(`${index + 1}. ${collection.name}`);
        });
        
        // Kiểm tra các collection có thể chứa DateTour
        const possibleNames = ['datetours', 'DateTours', 'dateTours', 'date_tours', 'DateTour'];
        
        console.log('\n🔍 Kiểm tra collections có thể chứa DateTour:');
        for (const name of possibleNames) {
            try {
                const collection = db.collection(name);
                const count = await collection.countDocuments();
                if (count > 0) {
                    console.log(`✅ ${name}: ${count} documents`);
                    
                    // Lấy sample document
                    const sample = await collection.findOne();
                    if (sample) {
                        console.log(`   Sample fields: ${Object.keys(sample).join(', ')}`);
                        if (sample.status) {
                            const upcomingCount = await collection.countDocuments({ status: 'upcoming' });
                            console.log(`   Upcoming records: ${upcomingCount}`);
                        }
                    }
                } else {
                    console.log(`❌ ${name}: không tồn tại hoặc rỗng`);
                }
            } catch (err) {
                console.log(`❌ ${name}: lỗi - ${err.message}`);
            }
        }
        
        // Kiểm tra tours collection
        console.log('\n🔍 Kiểm tra Tours collection:');
        const toursCollection = db.collection('tours');
        const toursCount = await toursCollection.countDocuments();
        console.log(`Tours: ${toursCount} documents`);
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
        }
    }
};

checkCollections();
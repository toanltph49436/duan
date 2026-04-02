require('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

async function debugAPICollection() {
    try {
        console.log('🔍 DEBUGGING API COLLECTION...');
        
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB Atlas');
        
        // Kiểm tra model name và collection name
        console.log('\n📋 MODEL INFO:');
        console.log('Model name:', DateTour.modelName);
        console.log('Collection name:', DateTour.collection.name);
        
        // Lấy dữ liệu giống như API
        console.log('\n🔍 TRUY VẤN GIỐNG API:');
        const dateTours = await DateTour.find({ status: 'upcoming' })
            .populate('tour')
            .sort({ dateTour: 1 });
            
        console.log(`📊 Tổng số records: ${dateTours.length}`);
        
        let nullCount = 0;
        dateTours.forEach((dt, index) => {
            const tourInfo = dt.tour ? `${dt.tour.nameTour}` : 'NULL';
            if (!dt.tour) nullCount++;
            console.log(`${index + 1}. ID: ${dt._id} | Tour: ${tourInfo} | Date: ${dt.dateTour}`);
        });
        
        console.log(`\n❌ NULL tours: ${nullCount}`);
        
        // Kiểm tra raw data
        console.log('\n🔍 RAW DATA CHECK:');
        const rawData = await DateTour.find({ status: 'upcoming' }).sort({ dateTour: 1 });
        console.log(`Raw records: ${rawData.length}`);
        
        rawData.forEach((dt, index) => {
            console.log(`${index + 1}. ID: ${dt._id} | Tour ID: ${dt.tour} | Date: ${dt.dateTour}`);
        });
        
        // Kiểm tra tour IDs có tồn tại không
        console.log('\n🔍 CHECKING TOUR IDS:');
        const tourIds = rawData.map(dt => dt.tour).filter(id => id);
        const uniqueTourIds = [...new Set(tourIds)];
        console.log('Unique tour IDs:', uniqueTourIds);
        
        for (const tourId of uniqueTourIds) {
            const tour = await Tour.findById(tourId);
            console.log(`Tour ${tourId}: ${tour ? tour.nameTour : 'NOT FOUND'}`);
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Đã ngắt kết nối MongoDB Atlas');
    }
}

debugAPICollection();
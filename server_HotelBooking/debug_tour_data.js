image.pngrequire('dotenv').config();
const mongoose = require('mongoose');
const DateTour = require('./src/models/Tour/DateTour');
const Tour = require('./src/models/Tour/TourModel');

const debugTourData = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/HotelBooking');
        console.log('Đã kết nối MongoDB');
        
        // Lấy tất cả DateTour records
        const allDateTours = await DateTour.find({}).limit(10);
        console.log(`\nTổng số DateTour records: ${allDateTours.length}`);
        
        for (const dateTour of allDateTours) {
            console.log(`\n--- DateTour ID: ${dateTour._id} ---`);
            console.log(`Tour ID: ${dateTour.tour}`);
            console.log(`Date: ${dateTour.dateTour}`);
            console.log(`Status: ${dateTour.status}`);
            
            // Kiểm tra xem tour ID có tồn tại trong collection Tour không
            if (dateTour.tour) {
                const tourExists = await Tour.findById(dateTour.tour);
                if (!tourExists) {
                    console.log(`❌ Tour ID ${dateTour.tour} KHÔNG TỒN TẠI trong collection Tour`);
                } else {
                    console.log(`✅ Tour tồn tại: ${tourExists.nameTour}`);
                }
            } else {
                console.log(`❌ Tour ID là NULL`);
            }
        }
        
        // Test populate để xem kết quả
        console.log('\n=== TEST POPULATE ===');
        const populatedTours = await DateTour.find({}).populate('tour').limit(5);
        
        populatedTours.forEach(record => {
            console.log(`\nDateTour ID: ${record._id}`);
            console.log(`Tour populated:`, record.tour ? `${record.tour.nameTour}` : 'NULL');
        });
        
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nĐã ngắt kết nối MongoDB');
    }
};

debugTourData();
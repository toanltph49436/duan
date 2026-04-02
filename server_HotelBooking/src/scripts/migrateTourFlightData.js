const mongoose = require('mongoose');
const Tour = require('../models/Tour/TourModel');
const Transport = require('../models/Transport/TransportModel');

// Script để migration dữ liệu tour có transport máy bay
async function migrateTourFlightData() {
    try {
        console.log('🚀 Bắt đầu migration dữ liệu tour có máy bay...');
        
        // Tìm tất cả các tour
        const tours = await Tour.find({}).populate('itemTransport.TransportId');
        console.log(`📊 Tìm thấy ${tours.length} tour để kiểm tra`);
        
        let updatedCount = 0;
        
        for (const tour of tours) {
            // Kiểm tra xem tour có transport loại "Máy Bay" không
            const hasAirplaneTransport = tour.itemTransport.some(item => 
                item.TransportId && item.TransportId.transportType === 'Máy Bay'
            );
            
            // Nếu có máy bay nhưng chưa set includesFlight = true
            if (hasAirplaneTransport && !tour.includesFlight) {
                console.log(`✈️ Tour "${tour.nameTour}" có máy bay nhưng chưa set includesFlight`);
                
                // Lấy thông tin giá vé máy bay từ transport (nếu có)
                const airplaneTransport = tour.itemTransport.find(item => 
                    item.TransportId && item.TransportId.transportType === 'Máy Bay'
                )?.TransportId;
                
                const updateData = {
                    includesFlight: true,
                    flightPrice: airplaneTransport?.flightPrice || 0,
                    flightPriceChildren: airplaneTransport?.flightPriceChildren || 0,
                    flightPriceLittleBaby: airplaneTransport?.flightPriceLittleBaby || 0,
                    flightPriceBaby: airplaneTransport?.flightPriceBaby || 0
                };
                
                await Tour.findByIdAndUpdate(tour._id, updateData);
                updatedCount++;
                
                console.log(`✅ Đã cập nhật tour "${tour.nameTour}" với includesFlight = true`);
                console.log(`   - Giá vé máy bay người lớn: ${updateData.flightPrice.toLocaleString()} VNĐ`);
            }
        }
        
        console.log(`🎉 Migration hoàn thành! Đã cập nhật ${updatedCount} tour`);
        
    } catch (error) {
        console.error('❌ Lỗi khi migration:', error);
    }
}

// Hàm để rollback migration (nếu cần)
async function rollbackMigration() {
    try {
        console.log('🔄 Bắt đầu rollback migration...');
        
        const result = await Tour.updateMany(
            { includesFlight: true },
            {
                $set: {
                    includesFlight: false,
                    flightPrice: 0,
                    flightPriceChildren: 0,
                    flightPriceLittleBaby: 0,
                    flightPriceBaby: 0
                }
            }
        );
        
        console.log(`🎉 Rollback hoàn thành! Đã reset ${result.modifiedCount} tour`);
        
    } catch (error) {
        console.error('❌ Lỗi khi rollback:', error);
    }
}

// Hàm để kiểm tra dữ liệu sau migration
async function checkMigrationResult() {
    try {
        console.log('🔍 Kiểm tra kết quả migration...');
        
        const toursWithFlight = await Tour.find({ includesFlight: true }).populate('itemTransport.TransportId');
        console.log(`✈️ Tìm thấy ${toursWithFlight.length} tour có includesFlight = true`);
        
        for (const tour of toursWithFlight) {
            const hasAirplane = tour.itemTransport.some(item => 
                item.TransportId && item.TransportId.transportType === 'Máy Bay'
            );
            
            console.log(`📋 Tour: ${tour.nameTour}`);
            console.log(`   - Có máy bay: ${hasAirplane ? '✅' : '❌'}`);
            console.log(`   - Giá vé máy bay: ${tour.flightPrice?.toLocaleString() || 0} VNĐ`);
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra:', error);
    }
}

module.exports = {
    migrateTourFlightData,
    rollbackMigration,
    checkMigrationResult
};

// Chạy migration nếu file được gọi trực tiếp
if (require.main === module) {
    // Load environment variables
    require('dotenv').config();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelbooking';
    console.log('🔗 Kết nối MongoDB:', MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    
    mongoose.connect(MONGODB_URI)
        .then(async () => {
            console.log('📡 Đã kết nối MongoDB');
            
            switch (command) {
                case 'migrate':
                    await migrateTourFlightData();
                    break;
                case 'rollback':
                    await rollbackMigration();
                    break;
                case 'check':
                    await checkMigrationResult();
                    break;
                default:
                    console.log('📖 Sử dụng:');
                    console.log('  node migrateTourFlightData.js migrate   - Chạy migration');
                    console.log('  node migrateTourFlightData.js rollback  - Rollback migration');
                    console.log('  node migrateTourFlightData.js check     - Kiểm tra kết quả');
            }
            
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Lỗi kết nối MongoDB:', error);
            process.exit(1);
        });
}
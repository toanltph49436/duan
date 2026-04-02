const mongoose = require('mongoose');
const Tour = require('../models/Tour/TourModel');
const Transport = require('../models/Transport/TransportModel');

// Load environment variables
require('dotenv').config();

async function checkTourTransportData() {
    try {
        console.log('🔍 Kiểm tra dữ liệu tour và transport...');
        
        // Kiểm tra tất cả transport
        const transports = await Transport.find({});
        console.log(`🚌 Tìm thấy ${transports.length} transport:`);
        
        const airplaneTransports = transports.filter(t => t.transportType === 'Máy Bay');
        console.log(`✈️ Trong đó có ${airplaneTransports.length} transport loại máy bay:`);
        
        airplaneTransports.forEach(transport => {
            console.log(`   - ${transport.transportName} (${transport.transportType})`);
            console.log(`     Giá vé: ${transport.flightPrice?.toLocaleString() || 0} VNĐ`);
        });
        
        // Kiểm tra tất cả tour
        const tours = await Tour.find({}).populate('itemTransport.TransportId');
        console.log(`\n🎯 Tìm thấy ${tours.length} tour:`);
        
        for (const tour of tours) {
            console.log(`\n📋 Tour: "${tour.nameTour}"`);
            console.log(`   - ID: ${tour._id}`);
            console.log(`   - includesFlight: ${tour.includesFlight}`);
            console.log(`   - Giá vé máy bay: ${tour.flightPrice?.toLocaleString() || 0} VNĐ`);
            
            if (tour.itemTransport && tour.itemTransport.length > 0) {
                console.log(`   - Transport được chọn:`);
                tour.itemTransport.forEach(item => {
                    if (item.TransportId) {
                        console.log(`     * ${item.TransportId.transportName} (${item.TransportId.transportType})`);
                        if (item.TransportId.transportType === 'Máy Bay') {
                            console.log(`       🔥 TOUR NÀY CÓ TRANSPORT MÁY BAY!`);
                            console.log(`       - includesFlight: ${tour.includesFlight}`);
                            console.log(`       - Giá vé transport: ${item.TransportId.flightPrice?.toLocaleString() || 0} VNĐ`);
                        }
                    } else {
                        console.log(`     * Transport ID không tồn tại`);
                    }
                });
            } else {
                console.log(`   - Không có transport nào`);
            }
        }
        
        // Tìm tour có máy bay nhưng chưa set includesFlight
        console.log('\n🔍 Tìm tour có máy bay nhưng chưa set includesFlight...');
        let foundIssues = 0;
        
        for (const tour of tours) {
            const hasAirplane = tour.itemTransport?.some(item => 
                item.TransportId && item.TransportId.transportType === 'Máy Bay'
            );
            
            if (hasAirplane && !tour.includesFlight) {
                foundIssues++;
                console.log(`⚠️  Tour "${tour.nameTour}" có máy bay nhưng includesFlight = false`);
            }
        }
        
        if (foundIssues === 0) {
            console.log('✅ Không tìm thấy vấn đề nào!');
        }
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
    }
}

// Kết nối MongoDB và chạy
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelbooking';
console.log('🔗 Kết nối MongoDB:', MONGODB_URI.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('📡 Đã kết nối MongoDB\n');
        await checkTourTransportData();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Lỗi kết nối MongoDB:', error);
        process.exit(1);
    });
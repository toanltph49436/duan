const cron = require('node-cron');
const { 
    autoCancel48hExpiredBookings, 
    checkBookingsNearExpiry,
    autoCancelExpiredHotelBookings,
    checkHotelBookingsNearExpiry 
} = require('../controller/TourController/AutoCancelController');

// Chạy mỗi giờ để kiểm tra và hủy booking quá hạn
const startAutoCancelJob = () => {
    // Chạy mỗi giờ (0 phút của mỗi giờ)
    cron.schedule('0 * * * *', async () => {
        console.log('🔄 Bắt đầu kiểm tra booking quá hạn thanh toán tiền mặt...');
        
        try {
            // Tự động hủy tour booking quá hạn
            const tourResult = await autoCancel48hExpiredBookings();
            
            if (tourResult.success && tourResult.cancelledCount > 0) {
                console.log(`✅ Đã tự động hủy ${tourResult.cancelledCount} tour booking quá hạn`);
                
                // Log chi tiết các tour booking đã hủy
                tourResult.cancelledBookings.forEach(booking => {
                    console.log(`   - Tour Booking ${booking.bookingId}: ${booking.customerName} (${booking.email})`);
                });
            } else {
                console.log('ℹ️ Không có tour booking nào quá hạn cần hủy');
            }

            // Tự động hủy hotel booking quá hạn
            const hotelResult = await autoCancelExpiredHotelBookings();
            
            if (hotelResult.success && hotelResult.cancelledCount > 0) {
                console.log(`✅ Đã tự động hủy ${hotelResult.cancelledCount} hotel booking quá hạn`);
                
                // Log chi tiết các hotel booking đã hủy
                hotelResult.cancelledBookings.forEach(booking => {
                    console.log(`   - Hotel Booking ${booking.bookingId}: ${booking.customerName} (${booking.email}) - ${booking.hotelName}`);
                });
            } else {
                console.log('ℹ️ Không có hotel booking nào quá hạn cần hủy');
            }
            
        } catch (error) {
            console.error('❌ Lỗi trong quá trình tự động hủy booking:', error);
        }
    });
    
    // Chạy mỗi 6 giờ để kiểm tra booking sắp hết hạn (để gửi thông báo)
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔔 Kiểm tra booking sắp hết hạn thanh toán...');
        
        try {
            // Kiểm tra tour booking sắp hết hạn
            const tourResult = await checkBookingsNearExpiry();
            
            if (tourResult.success && tourResult.count > 0) {
                console.log(`⚠️ Có ${tourResult.count} tour booking sắp hết hạn trong 6h tới:`);
                
                tourResult.bookings.forEach(booking => {
                    console.log(`   - ${booking.customerName} (${booking.phone}): ${booking.tourName} - Còn ${booking.hoursRemaining}h`);
                });
            } else {
                console.log('ℹ️ Không có tour booking nào sắp hết hạn');
            }

            // Kiểm tra hotel booking sắp hết hạn
            const hotelResult = await checkHotelBookingsNearExpiry();
            
            if (hotelResult.success && hotelResult.count > 0) {
                console.log(`⚠️ Có ${hotelResult.count} hotel booking sắp hết hạn trong 6h tới:`);
                
                hotelResult.bookings.forEach(booking => {
                    console.log(`   - ${booking.customerName} (${booking.phone}): ${booking.hotelName} - Còn ${booking.hoursRemaining}h`);
                });
            } else {
                console.log('ℹ️ Không có hotel booking nào sắp hết hạn');
            }
                
            // Ở đây có thể thêm logic gửi email/SMS thông báo
            // await sendExpiryWarningNotifications([...tourResult.bookings, ...hotelResult.bookings]);
            
        } catch (error) {
            console.error('❌ Lỗi khi kiểm tra booking sắp hết hạn:', error);
        }
    });
    
    console.log('🚀 Auto-cancel job đã được khởi động:');
    console.log('   - Kiểm tra hủy booking quá hạn: mỗi giờ');
    console.log('   - Kiểm tra booking sắp hết hạn: mỗi 6 giờ');
};

// Hàm dừng tất cả cron jobs (nếu cần)
const stopAutoCancelJob = () => {
    cron.getTasks().forEach(task => {
        task.stop();
    });
    console.log('🛑 Đã dừng tất cả auto-cancel jobs');
};

module.exports = {
    startAutoCancelJob,
    stopAutoCancelJob
};
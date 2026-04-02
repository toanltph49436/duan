const mongoose = require('mongoose');
const HotelBooking = require('./src/models/Hotel/HotelBooking.js');

// Kết nối MongoDB
mongoose.connect('mongodb+srv://tourBooking:J6el3KvyFV9YPJnc@cluster0.iir9j2w.mongodb.net/tourBooking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function updateBookingWithTestImage() {
    try {
        // Tìm booking đầu tiên có trạng thái deposit_paid
        const booking = await HotelBooking.findOne({ payment_status: 'deposit_paid' });
        
        if (booking) {
            console.log('Tìm thấy booking:', booking._id);
            
            // Cập nhật thêm hình ảnh test
            await HotelBooking.updateOne(
                { _id: booking._id },
                { paymentImage: '/uploads/payment-confirmations/test-payment-image.svg' }
            );
            
            console.log('Đã cập nhật booking với hình ảnh test');
            console.log('Booking ID:', booking._id);
            console.log('Payment Image:', booking.paymentImage);
        } else {
            console.log('Không tìm thấy booking nào có trạng thái deposit_paid');
            
            // Tìm booking bất kỳ
            const anyBooking = await HotelBooking.findOne();
            if (anyBooking) {
                console.log('Cập nhật booking bất kỳ:', anyBooking._id);
                await HotelBooking.updateOne(
                    { _id: anyBooking._id },
                    { 
                        paymentImage: '/uploads/payment-confirmations/test-payment-image.svg',
                        fullPaymentImage: '/uploads/payment-confirmations/test-payment-image.svg'
                    }
                );
                console.log('Đã cập nhật booking với hình ảnh test');
            }
        }
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Lỗi:', error);
        mongoose.disconnect();
    }
}

updateBookingWithTestImage();
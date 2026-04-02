require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/People/AdminModel.js');

// Script để cập nhật clerkId cho admin
// Sử dụng: node update_admin_clerkid.js <your_clerk_id>

const updateAdminClerkId = async () => {
    try {
        const newClerkId = process.argv[2];
        
        if (!newClerkId) {
            console.log('❌ Vui lòng cung cấp clerkId:');
            console.log('Cách sử dụng: node update_admin_clerkid.js <your_clerk_id>');
            console.log('\n📝 Để lấy clerkId của bạn:');
            console.log('1. Mở Developer Tools (F12) trong trình duyệt');
            console.log('2. Vào tab Console');
            console.log('3. Nhập: window.Clerk.user.id');
            console.log('4. Copy clerkId và chạy lại script này');
            process.exit(1);
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');
        
        // Tìm admin test và cập nhật clerkId
        const admin = await Admin.findOne({ email: 'admin@test.com' });
        
        if (!admin) {
            console.log('❌ Không tìm thấy admin test');
            process.exit(1);
        }
        
        admin.clerkId = newClerkId;
        await admin.save();
        
        console.log('✅ Đã cập nhật clerkId thành công!');
        console.log('📋 Thông tin admin:');
        console.log(`   - ClerkId: ${admin.clerkId}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - Tên: ${admin.firstName} ${admin.lastName}`);
        
        await mongoose.disconnect();
        console.log('\n🎉 Bây giờ bạn có thể truy cập trang admin và xem thống kê!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

updateAdminClerkId();
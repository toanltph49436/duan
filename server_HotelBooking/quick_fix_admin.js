require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/People/AdminModel.js');

// Script nhanh để cập nhật admin với clerkId thực tế
// Thay đổi clerkId bên dưới thành clerkId thực tế của bạn

const YOUR_REAL_CLERK_ID = 'THAY_DOI_CLERK_ID_CUA_BAN_O_DAY'; // ⚠️ THAY ĐỔI DÒNG NÀY

const quickFixAdmin = async () => {
    try {
        if (YOUR_REAL_CLERK_ID === 'THAY_DOI_CLERK_ID_CUA_BAN_O_DAY') {
            console.log('❌ Vui lòng mở file quick_fix_admin.js và thay đổi YOUR_REAL_CLERK_ID');
            console.log('\n📝 Để lấy clerkId của bạn:');
            console.log('1. Mở trang admin trong trình duyệt');
            console.log('2. Nhấn F12 -> Console');
            console.log('3. Nhập: window.Clerk.user.id');
            console.log('4. Copy clerkId và thay vào dòng 7 trong file này');
            console.log('5. Chạy lại: node quick_fix_admin.js');
            return;
        }
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');
        
        // Cập nhật admin test với clerkId thực tế
        const result = await Admin.updateOne(
            { email: 'admin@test.com' },
            { clerkId: YOUR_REAL_CLERK_ID }
        );
        
        if (result.modifiedCount > 0) {
            console.log('✅ Đã cập nhật clerkId thành công!');
            console.log(`📋 ClerkId mới: ${YOUR_REAL_CLERK_ID}`);
            console.log('\n🎉 Bây giờ bạn có thể truy cập trang thống kê tổng quan!');
        } else {
            console.log('❌ Không tìm thấy admin để cập nhật');
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

quickFixAdmin();
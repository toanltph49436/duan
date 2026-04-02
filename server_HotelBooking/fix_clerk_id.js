require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/People/AdminModel.js');

// Hướng dẫn lấy Clerk ID thực:
console.log('🔍 HƯỚNG DẪN LẤY CLERK ID THỰC:');
console.log('1. Mở trang admin trong trình duyệt');
console.log('2. Nhấn F12 để mở Developer Tools');
console.log('3. Vào tab Console');
console.log('4. Gõ lệnh: window.Clerk.user.id');
console.log('5. Copy Clerk ID hiển thị');
console.log('6. Thay thế YOUR_REAL_CLERK_ID bên dưới bằng ID thực\n');

// THAY ĐỔI GIÁ TRỊ NÀY BẰNG CLERK ID THỰC CỦA BẠN
const YOUR_REAL_CLERK_ID = 'user_test123'; // ⚠️ THAY ĐỔI GIÁ TRỊ NÀY!

if (YOUR_REAL_CLERK_ID === 'user_test123') {
    console.log('❌ BẠN CHƯA THAY ĐỔI CLERK ID!');
    console.log('Vui lòng làm theo hướng dẫn trên để lấy Clerk ID thực và thay thế trong file này.');
    process.exit(1);
}

async function updateClerkId() {
    try {
        console.log('🔄 Đang kết nối MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // Tìm admin với email admin@test.com
        const admin = await Admin.findOne({ email: 'admin@test.com' });
        
        if (!admin) {
            console.log('❌ Không tìm thấy admin với email admin@test.com');
            return;
        }

        console.log('📋 Admin hiện tại:');
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - ClerkId cũ: ${admin.clerkId}`);
        console.log(`   - ClerkId mới: ${YOUR_REAL_CLERK_ID}`);

        // Cập nhật ClerkId
        admin.clerkId = YOUR_REAL_CLERK_ID;
        await admin.save();

        console.log('\n✅ CẬP NHẬT THÀNH CÔNG!');
        console.log('🎉 Bây giờ bạn có thể truy cập trang "Thống kê tổng quan" mà không bị lỗi quyền.');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối MongoDB');
    }
}

updateClerkId();
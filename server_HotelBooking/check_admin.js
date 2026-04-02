require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/People/AdminModel.js');

// Script để kiểm tra admin trong database
const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');
        
        const adminCount = await Admin.countDocuments();
        console.log(`📊 Số lượng admin trong database: ${adminCount}`);
        
        if (adminCount > 0) {
            const admins = await Admin.find();
            console.log('\n👥 Danh sách admin:');
            admins.forEach((admin, index) => {
                console.log(`\n${index + 1}. Admin:`);
                console.log(`   - ID: ${admin._id}`);
                console.log(`   - ClerkId: ${admin.clerkId}`);
                console.log(`   - Email: ${admin.email}`);
                console.log(`   - Tên: ${admin.firstName} ${admin.lastName}`);
                console.log(`   - Ngày tạo: ${admin.createdAt}`);
            });
        } else {
            console.log('\n❌ Không có admin nào trong database');
            console.log('💡 Chạy lệnh sau để tạo admin test:');
            console.log('node -e "require(\'dotenv\').config(); const mongoose = require(\'mongoose\'); const Admin = require(\'./src/models/People/AdminModel.js\'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const testAdmin = new Admin({ clerkId: \'user_test123\', email: \'admin@test.com\', firstName: \'Admin\', lastName: \'Test\' }); await testAdmin.save(); console.log(\'Đã tạo admin test:\', testAdmin); mongoose.disconnect(); });"');
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
};

checkAdmin();
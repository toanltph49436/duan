require('dotenv').config();
const axios = require('axios');

// Script để test endpoint /stats sau khi cập nhật ClerkId
async function testStatsEndpoint() {
    console.log('🧪 TESTING STATS ENDPOINT...');
    console.log('📍 URL: http://localhost:3002/api/stats');
    console.log('');
    
    try {
        // Test với token giả (sẽ fail)
        console.log('❌ Test 1: Với token giả (mong đợi lỗi 401)');
        try {
            const response1 = await axios.get('http://localhost:3002/api/stats', {
                headers: {
                    'Authorization': 'Bearer fake_token'
                }
            });
            console.log('   Kết quả bất ngờ: Thành công!', response1.status);
        } catch (error) {
            console.log('   ✅ Kết quả mong đợi: Lỗi', error.response?.status, error.response?.data?.message);
        }
        
        console.log('');
        console.log('ℹ️  Test 2: Với token thực từ Clerk');
        console.log('   👉 Để test này, bạn cần:');
        console.log('   1. Mở trang admin trong trình duyệt');
        console.log('   2. Mở Developer Tools (F12)');
        console.log('   3. Vào tab Console');
        console.log('   4. Gõ lệnh sau để test:');
        console.log('');
        console.log('   fetch("/api/stats", {');
        console.log('     headers: {');
        console.log('       "Authorization": `Bearer ${await window.Clerk.session.getToken()}`');
        console.log('     }');
        console.log('   }).then(r => r.json()).then(console.log)');
        console.log('');
        console.log('   🎯 Nếu ClerkId đã được cập nhật đúng, bạn sẽ thấy dữ liệu thống kê');
        console.log('   ❌ Nếu vẫn lỗi 403, ClerkId chưa được cập nhật đúng');
        
    } catch (error) {
        console.error('❌ Lỗi khi test:', error.message);
    }
}

testStatsEndpoint();
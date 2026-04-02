const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing Room Status API with REAL data...');
    
    // Test với hotel ID thực tế từ database
    const hotelId = '68ac972b1c2f309f07af9bd1';
    
    console.log(`🔗 Testing: http://localhost:8080/api/hotels/${hotelId}/rooms/status-by-floor`);
    
    const response = await axios.get(`http://localhost:8080/api/hotels/${hotelId}/rooms/status-by-floor`);
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
    // Kiểm tra dữ liệu
    if (response.data?.success && response.data?.data?.roomsByFloor) {
      const roomsByFloor = response.data.data.roomsByFloor;
      console.log('\n📊 Room Data Analysis:');
      console.log(`Total floors: ${roomsByFloor.length}`);
      
      roomsByFloor.forEach(floor => {
        console.log(`\n🏗️ Floor ${floor.floor}: ${floor.totalRooms} rooms`);
        if (floor.rooms && floor.rooms.length > 0) {
          console.log(`  Sample rooms: ${floor.rooms.slice(0, 5).map(r => r.roomNumber).join(', ')}`);
          console.log(`  Room types: ${[...new Set(floor.rooms.map(r => r.roomType))].join(', ')}`);
        }
      });
      
      const totalRooms = roomsByFloor.reduce((sum, floor) => sum + floor.totalRooms, 0);
      console.log(`\n🎯 Total rooms across all floors: ${totalRooms}`);
      
    } else {
      console.log('❌ No room data found in response');
    }
    
  } catch (error) {
    console.error('❌ API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test API
console.log('🚀 Starting API test...');
testAPI();
// Test script để kiểm tra slot API
const axios = require('axios');

async function testSlotAPI() {
  try {
    console.log('Testing slot API...');
    
    // Test API lấy slots theo tour ID
    const tourId = '68a9d3fd26fcf2bbda64c72a'; // Tour ID từ log
    console.log(`\nTesting /api/date/tour/${tourId}...`);
    
    const slotsResponse = await axios.get(`http://localhost:8080/api/date/tour/${tourId}`);
    console.log('Slots response status:', slotsResponse.status);
    console.log('Slots response data:', JSON.stringify(slotsResponse.data, null, 2));
    
    if (slotsResponse.data.data && slotsResponse.data.data.length > 0) {
      const firstSlot = slotsResponse.data.data[0];
      console.log('\nFirst slot details:');
      console.log('- Slot ID:', firstSlot._id);
      console.log('- Date:', firstSlot.dateTour);
      console.log('- Assigned Employee:', firstSlot.assignedEmployee);
      
      if (firstSlot.assignedEmployee) {
        console.log('  - Employee ID:', firstSlot.assignedEmployee._id);
        console.log('  - First Name:', firstSlot.assignedEmployee.firstName);
        console.log('  - Last Name:', firstSlot.assignedEmployee.lastName);
        console.log('  - Full Name:', firstSlot.assignedEmployee.full_name);
        console.log('  - Email:', firstSlot.assignedEmployee.email);
        console.log('  - Employee ID:', firstSlot.assignedEmployee.employee_id);
        console.log('  - Position:', firstSlot.assignedEmployee.position);
      } else {
        console.log('  - No assigned employee found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSlotAPI();
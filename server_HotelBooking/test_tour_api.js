const axios = require('axios');

const testTourAPI = async () => {
    try {
        // Lấy danh sách tour trước
        console.log('Getting tour list...');
        const toursResponse = await axios.get('http://localhost:8080/api/tour');
        
        if (!toursResponse.data.tours || toursResponse.data.tours.length === 0) {
            console.log('No tours found in database');
            return;
        }
        
        const firstTour = toursResponse.data.tours[0];
        const tourId = firstTour._id;
        
        console.log('\n=== USING TOUR ===');
        console.log('Tour ID:', tourId);
        console.log('Tour Name:', firstTour.nameTour);
        
        // Test tour detail API
        console.log('\n=== TESTING TOUR DETAIL API ===');
        const response = await axios.get(`http://localhost:8080/api/tour/${tourId}`);
        
        console.log('Success:', response.data.success);
        console.log('Message:', response.data.message);
        
        if (response.data.tour) {
            const tour = response.data.tour;
            console.log('\n=== TOUR DETAILS ===');
            console.log('Tour ID:', tour._id);
            console.log('Tour Name:', tour.nameTour);
            console.log('Assigned Employee:', tour.assignedEmployee);
            
            if (tour.assignedEmployee) {
                console.log('\n=== ASSIGNED EMPLOYEE DETAILS ===');
                console.log('Employee ID:', tour.assignedEmployee._id);
                console.log('First Name:', tour.assignedEmployee.firstName);
                console.log('Last Name:', tour.assignedEmployee.lastName);
                console.log('Full Name:', tour.assignedEmployee.full_name);
                console.log('Email:', tour.assignedEmployee.email);
                console.log('Employee ID:', tour.assignedEmployee.employee_id);
                console.log('Position:', tour.assignedEmployee.position);
            } else {
                console.log('\n=== NO ASSIGNED EMPLOYEE ===');
                console.log('assignedEmployee field is null or undefined');
            }
        }
        
    } catch (error) {
        console.error('Error testing tour API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
};

testTourAPI();

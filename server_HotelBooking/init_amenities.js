const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_booking')
    .then(() => console.log('Đã kết nối MongoDB'))
    .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Import model
const Amenity = require('./src/models/Hotel/AmenityModel');

// Dữ liệu tiện ích mẫu
const sampleAmenities = [
    // Tiện ích trong phòng (cá nhân)
    {
        name: 'Giường ngủ thoải mái',
        icon: 'bed',
        description: 'Chăn, ga, gối, nệm sạch sẽ và thoải mái',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Điều hòa / Quạt máy',
        icon: 'ac',
        description: 'Điều hòa nhiệt độ hoặc quạt máy để làm mát',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'TV màn hình phẳng',
        icon: 'tv',
        description: 'TV màn hình phẳng có cáp/Netflix',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'WiFi miễn phí',
        icon: 'wifi',
        description: 'Kết nối internet tốc độ cao miễn phí',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Phòng tắm riêng',
        icon: 'bathroom',
        description: 'Vòi sen, nước nóng lạnh, toilet riêng biệt',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Đồ dùng vệ sinh cá nhân',
        icon: 'toiletries',
        description: 'Xà phòng, dầu gội, bàn chải, kem đánh răng',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Khăn tắm, khăn mặt',
        icon: 'towels',
        description: 'Khăn tắm và khăn mặt sạch sẽ',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Ấm đun nước / Trà cà phê',
        icon: 'coffee',
        description: 'Ấm đun nước và trà, cà phê miễn phí',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Tủ lạnh mini',
        icon: 'minibar',
        description: 'Tủ lạnh mini để bảo quản đồ uống',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Điện thoại bàn',
        icon: 'phone',
        description: 'Điện thoại bàn để liên hệ lễ tân',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    {
        name: 'Tủ khóa an toàn',
        icon: 'safebox',
        description: 'Tủ khóa an toàn để cất giữ đồ quý giá',
        category: 'Tiện ích trong phòng (cá nhân)',
        isActive: true
    },
    
    // Tiện ích chung (dùng chung)
    {
        name: 'Bãi đậu xe',
        icon: 'parking',
        description: 'Bãi đậu xe miễn phí hoặc thu phí',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Lễ tân 24/7',
        icon: 'reception',
        description: 'Dịch vụ lễ tân hoạt động 24/7',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Nhà hàng / Quầy bar',
        icon: 'restaurant',
        description: 'Nhà hàng, quầy bar và buffet sáng',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Phòng gym',
        icon: 'gym',
        description: 'Phòng tập thể dục với đầy đủ thiết bị',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Hồ bơi',
        icon: 'pool',
        description: 'Hồ bơi ngoài trời hoặc trong nhà',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Dịch vụ giặt ủi',
        icon: 'laundry',
        description: 'Dịch vụ giặt ủi nhanh chóng',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Dịch vụ đưa đón sân bay',
        icon: 'shuttle',
        description: 'Dịch vụ đưa đón sân bay và thuê xe',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Khu giữ hành lý',
        icon: 'luggage',
        description: 'Khu vực giữ hành lý an toàn',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Khu làm việc',
        icon: 'business',
        description: 'Khu làm việc (business center)',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    {
        name: 'Cửa hàng tiện ích mini',
        icon: 'convenience',
        description: 'Cửa hàng tiện ích mini trong khách sạn',
        category: 'Tiện ích chung (dùng chung)',
        isActive: true
    },
    
    // Tiện ích phòng & an toàn cho trẻ em
    {
        name: 'Cũi trẻ em / Giường nôi',
        icon: 'crib',
        description: 'Cũi trẻ em hoặc giường nôi an toàn cho bé',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Giường phụ cho bé',
        icon: 'extra-bed',
        description: 'Giường phụ nhỏ gọn phù hợp cho trẻ em',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Đồ chơi nhỏ trong phòng',
        icon: 'toys',
        description: 'Đồ chơi an toàn cho trẻ em trong phòng',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Phòng cách âm',
        icon: 'soundproof',
        description: 'Phòng cách âm an toàn cho bé ngủ',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Ổ cắm điện có nắp an toàn',
        icon: 'safe-outlet',
        description: 'Ổ cắm điện có nắp bảo vệ an toàn cho trẻ em',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Cầu thang / Lan can có chắn an toàn',
        icon: 'safety-gate',
        description: 'Cầu thang và lan can có chắn bảo vệ an toàn',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Dịch vụ giữ trẻ (Baby-sitting)',
        icon: 'babysitting',
        description: 'Dịch vụ giữ trẻ chuyên nghiệp theo yêu cầu',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Bộ sơ cứu trong phòng',
        icon: 'first-aid',
        description: 'Bộ sơ cứu đầy đủ trong phòng hoặc khu vực',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Dịch vụ trông trẻ theo giờ',
        icon: 'childcare',
        description: 'Dịch vụ trông trẻ theo giờ linh hoạt',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Xe đẩy (Stroller) cho bé',
        icon: 'stroller',
        description: 'Xe đẩy chất lượng cao cho trẻ em',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Sữa tắm / Dầu gội trẻ em',
        icon: 'baby-toiletries',
        description: 'Sữa tắm và dầu gội chuyên dụng cho trẻ em',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    },
    {
        name: 'Dịch vụ cung cấp sữa bột / Bỉm',
        icon: 'baby-supplies',
        description: 'Dịch vụ cung cấp sữa bột và bỉm theo yêu cầu',
        category: 'Tiện ích phòng & an toàn cho trẻ em',
        isActive: true
    }
];

// Hàm khởi tạo dữ liệu
async function initializeAmenities() {
    try {
        console.log('Bắt đầu khởi tạo dữ liệu tiện ích...');
        
        // Xóa dữ liệu cũ (nếu có)
        await Amenity.deleteMany({});
        console.log('Đã xóa dữ liệu tiện ích cũ');
        
        // Thêm dữ liệu mới
        const result = await Amenity.insertMany(sampleAmenities);
        console.log(`Đã thêm thành công ${result.length} tiện ích`);
        
        // Hiển thị danh sách tiện ích đã tạo
        console.log('\nDanh sách tiện ích đã tạo:');
        result.forEach((amenity, index) => {
            console.log(`${index + 1}. ${amenity.name} (${amenity.category})`);
        });
        
        console.log('\nKhởi tạo dữ liệu tiện ích hoàn tất!');
        
    } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu:', error);
    } finally {
        // Đóng kết nối
        mongoose.connection.close();
        console.log('Đã đóng kết nối MongoDB');
    }
}

// Chạy script
initializeAmenities();

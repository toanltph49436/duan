const mongoose = require('mongoose');
const Location = require('../models/Location/locationModel.js');
require('dotenv').config();

// Kết nối database
const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }
        
        await mongoose.connect(`${MONGODB_URI}/TourBooking`);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Dữ liệu location mẫu
const locations = [
    {
        _id: '674a0123456789abcdef0001',
        locationName: 'Hà Nội',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0002',
        locationName: 'TP. Hồ Chí Minh',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0003',
        locationName: 'Đà Nẵng',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0004',
        locationName: 'Hội An',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0005',
        locationName: 'Nha Trang',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0006',
        locationName: 'Phú Quốc',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0007',
        locationName: 'Đà Lạt',
        country: 'Việt Nam'
    },
    {
        _id: '674a0123456789abcdef0008',
        locationName: 'Sapa',
        country: 'Việt Nam'
    }
];

// Hàm seed locations
const seedLocations = async () => {
    try {
        // Xóa tất cả location cũ
        await Location.deleteMany({});
        console.log('Đã xóa tất cả location cũ');

        // Thêm location mới
        await Location.insertMany(locations);
        console.log('Đã thêm thành công', locations.length, 'locations');

        // Hiển thị danh sách locations đã thêm
        const addedLocations = await Location.find({});
        console.log('\nDanh sách locations:');
        addedLocations.forEach(location => {
            console.log(`- ${location.locationName}, ${location.country} (ID: ${location._id})`);
        });

    } catch (error) {
        console.error('Lỗi khi seed locations:', error);
    } finally {
        mongoose.connection.close();
        console.log('\nĐã đóng kết nối database');
    }
};

// Chạy script
const runSeed = async () => {
    await connectDB();
    await seedLocations();
};

runSeed();

module.exports = { seedLocations };
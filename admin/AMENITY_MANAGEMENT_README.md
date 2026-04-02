# Quản lý Tiện ích Khách sạn

## Tổng quan
Tính năng Quản lý Tiện ích Khách sạn cho phép admin quản lý danh sách các tiện ích có sẵn tại khách sạn một cách độc lập và có hệ thống.

## Tính năng chính

### 1. Xem danh sách tiện ích
- Hiển thị tất cả tiện ích với thông tin chi tiết
- Phân loại theo danh mục
- Hiển thị trạng thái hoạt động
- Sắp xếp theo danh mục và tên

### 2. Thêm tiện ích mới
- Tên tiện ích (bắt buộc)
- Danh mục (bắt buộc)
- Icon (tùy chọn)
- Mô tả (tùy chọn)
- Trạng thái hoạt động

### 3. Chỉnh sửa tiện ích
- Cập nhật thông tin tiện ích
- Thay đổi trạng thái hoạt động
- Sửa danh mục và mô tả

### 4. Xóa tiện ích
- Xóa tiện ích không còn sử dụng
- Kiểm tra tiện ích có đang được sử dụng không
- Bảo vệ dữ liệu khỏi xóa nhầm

### 5. Tìm kiếm và lọc
- Tìm kiếm theo tên tiện ích
- Lọc theo danh mục
- Lọc theo trạng thái

## Danh mục tiện ích

### Tiện ích trong phòng (cá nhân)
- 🛏 Giường ngủ thoải mái (chăn, ga, gối, nệm sạch sẽ)
- ❄️ Điều hòa / quạt máy
- 📺 TV màn hình phẳng (có cáp/Netflix)
- 📶 WiFi miễn phí
- 🚿 Phòng tắm riêng (vòi sen, nước nóng lạnh)
- 🧴 Đồ dùng vệ sinh cá nhân (xà phòng, dầu gội, bàn chải, kem đánh răng)
- 🧖 Khăn tắm, khăn mặt
- ☕ Ấm đun nước / trà, cà phê miễn phí
- 🧊 Tủ lạnh mini
- 📞 Điện thoại bàn (liên hệ lễ tân)
- 🔒 Tủ khóa an toàn (safe box)

### Tiện ích chung (dùng chung trong khách sạn)
- 🅿️ Bãi đậu xe miễn phí/thu phí
- 🛎 Lễ tân 24/7
- 🍳 Nhà hàng / quầy bar / buffet sáng
- 🏋️ Phòng gym (nếu có)
- 🏊 Hồ bơi
- 🧺 Dịch vụ giặt ủi
- 🚖 Dịch vụ đưa đón sân bay / thuê xe
- 📦 Khu giữ hành lý
- 👨‍💻 Khu làm việc (business center)
- 🛒 Cửa hàng tiện ích mini

### Tiện ích phòng & an toàn cho trẻ em
- 🛏 Cũi trẻ em / giường nôi
- 🛌 Giường phụ cho bé
- 🧸 Đồ chơi nhỏ trong phòng
- 🔇 Phòng cách âm (an toàn cho bé ngủ)
- 🔒 Ổ cắm điện có nắp an toàn
- 🪜 Cầu thang / lan can có chắn an toàn
- 🚼 Dịch vụ giữ trẻ (baby-sitting)
- 🩹 Bộ sơ cứu trong phòng / khu vực
- 👶 Dịch vụ trông trẻ theo giờ
- 🚼 Xe đẩy (stroller) cho bé
- 🧴 Sữa tắm / dầu gội trẻ em
- 🍼 Dịch vụ cung cấp sữa bột / bỉm (theo yêu cầu)

## Cách sử dụng

### 1. Truy cập trang quản lý tiện ích
- Vào menu "Quản lý Khách sạn"
- Chọn "Quản lý Tiện ích"

### 2. Thêm tiện ích mới
- Click nút "Thêm Tiện ích Mới"
- Điền đầy đủ thông tin
- Click "Thêm mới"

### 3. Chỉnh sửa tiện ích
- Click nút "Sửa" trong bảng
- Thay đổi thông tin cần thiết
- Click "Cập nhật"

### 4. Xóa tiện ích
- Click nút "Xóa" trong bảng
- Xác nhận hành động xóa

### 5. Tìm kiếm tiện ích
- Sử dụng ô tìm kiếm để tìm theo tên
- Kết quả hiển thị real-time

## API Endpoints

### GET /api/admin/amenities
- Lấy danh sách tất cả tiện ích

### GET /api/admin/amenities/active
- Lấy danh sách tiện ích đang hoạt động

### GET /api/admin/amenities/category/:category
- Lấy tiện ích theo danh mục

### GET /api/admin/amenities/:id
- Lấy thông tin tiện ích theo ID

### POST /api/admin/amenities
- Tạo tiện ích mới

### PUT /api/admin/amenities/:id
- Cập nhật tiện ích

### DELETE /api/admin/amenities/:id
- Xóa tiện ích

### GET /api/admin/amenities/search
- Tìm kiếm tiện ích

### GET /api/admin/amenities/stats
- Lấy thống kê tiện ích

## Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId,
  name: String,           // Tên tiện ích (bắt buộc)
  icon: String,           // Icon (tùy chọn)
  description: String,    // Mô tả (tùy chọn)
  category: String,       // Danh mục (bắt buộc)
  isActive: Boolean,      // Trạng thái hoạt động
  usageCount: Number,     // Số lần sử dụng
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

## Lưu ý quan trọng

### 1. Bảo mật
- Chỉ admin mới có quyền truy cập
- Sử dụng Clerk authentication
- Kiểm tra quyền admin trong database

### 2. Validation
- Tên tiện ích phải duy nhất
- Danh mục phải thuộc danh sách cho phép
- Mô tả tối đa 200 ký tự

### 3. Xóa tiện ích
- Không thể xóa tiện ích đang được sử dụng
- Kiểm tra usageCount trước khi xóa
- Hiển thị cảnh báo nếu tiện ích đang được sử dụng

### 4. Tích hợp với khách sạn
- Tiện ích được sử dụng trong form thêm/sửa khách sạn
- Tự động cập nhật danh sách tiện ích
- Hiển thị tiện ích trong danh sách khách sạn

## Khởi tạo dữ liệu mẫu

Để có dữ liệu tiện ích mẫu, chạy script:

```bash
cd server_HotelBooking
node init_amenities.js
```

Script này sẽ tạo 16 tiện ích mẫu với đầy đủ thông tin.

## Troubleshooting

### 1. Lỗi không thể tạo tiện ích
- Kiểm tra tên tiện ích có trùng không
- Đảm bảo đã chọn danh mục
- Kiểm tra kết nối database

### 2. Lỗi không thể xóa tiện ích
- Kiểm tra tiện ích có đang được sử dụng không
- Xem thông báo lỗi chi tiết
- Có thể cần ẩn tiện ích thay vì xóa

### 3. Lỗi hiển thị tiện ích
- Kiểm tra API endpoint
- Kiểm tra quyền truy cập
- Kiểm tra console browser

## Tương lai

### Tính năng có thể bổ sung
- Quản lý icon tùy chỉnh
- Thống kê sử dụng tiện ích
- Import/Export danh sách tiện ích
- Quản lý tiện ích theo từng khách sạn
- Tích hợp với hệ thống đặt phòng

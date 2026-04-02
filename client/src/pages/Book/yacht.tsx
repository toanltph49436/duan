import { useState } from 'react';

// Định nghĩa kiểu dữ liệu cho Room
interface Room {
  id: number;
  type: string;
  price: number;
  size: string;
  description: string;
  amenities: string[];
  image: string;
  available: number;
}

const YachtDetailPage = () => {
  // Dữ liệu fix cứng
  const yacht = {
    id: 1,
    name: 'Du thuyền Heritage Bình Chuẩn Cát Bà',
    description: 'Du thuyền sang trọng 5 sao với đầy đủ tiện nghi hiện đại, thiết kế tối tân và dịch vụ đẳng cấp thế giới. Trải nghiệm kỳ nghỉ hoàn hảo trên biển với Ocean Dream.',

    detailedIntro: [
      {
        title: "Du thuyền tuyệt đẹp về đêm",
        content: "Du thuyền Heritage Cruises Bình Chuẩn có kiến trúc độc đáo, thiết kế mang đậm nét truyền thống và lịch sử. Với 20 phòng rộng rãi và tất cả các cabin có bồn tắm cạnh cửa kính lớn,có ban công với tầm nhìn toàn cảnh vịnh Lan Hạ. Trên du thuyền nhiều tiện nghi nổi bật mà du thuyền thường không có như phòng tranh, thư viện, gian hàng bán đồ lưu niệm, quầy bar liền kề hồ bơi.."
      },
      {
        title: "Bể bơi bốn mùa của du thuyền ",
        content: "Đặc biệt, du thuyền có bể bơi bốn mùa mang lại cảm giác hài lòng cho những du khách đi vào mùa lạnh. Đây chính là điểm thú vị của du thuyền và hoàn toàn phù hợp với những gia đình có trẻ nhỏ. Bên cạnh đó là quầy bar với rất nhiều đồ uống ngon miệng và được trang trí đẹp mắt. Thật tuyệt vời khi bạn vừa nhâm nhi 1 ly cocktail, vừa ngâm mình trong nước ấm. "
      },
      {
        title: "Nhà hàng Tonkin",
        content: "Nhà hàng Tonkin của du thuyền thiết kế theo lối kiến trúc Đông Dương và đậm tính nghệ thuật sẽ phục vụ du khách các bữa ăn tươi ngon trong chuyến đi. Bên cạnh sự nổi trội về phòng nghỉ và tiện ích thì lịch trình tàu cũng rất thú vị. Những điểm tham quan như: làng chài Việt Hải,  hang Sáng Tối hay đảo Ba Trái Đào đều rất nổi tiếng và không thể bỏ qua....."
      },
      {
        title: "Hành trình độc đáo",
        content: "Du thuyền sẽ đưa bạn khám phá hành trình độc đáo quanh quần đảo Cát Bà - Di sản thiên nhiên thế giới được UNESCO công nhận, với các điểm dừng chân tại những bãi biển đẹp nhất Vịnh Hạ Long."
      }
    ],
    overview: [
      'Dài 150m, rộng 20m, 8 tầng',
      'Đóng mới năm 2022',
      'Tàu mang cờ quốc tế',
      'Tốc độ tối đa 25 hải lý/giờ',
      '2 hồ bơi vô cực',
      '4 nhà hàng cao cấp',
      '1 spa 5 sao'
    ],
    capacity: 200,
    price: 4150000,
    image: 'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/images/5hdlww87m5ptha7h.webp',
    amenities: [
      { name: 'Hồ bơi vô cực', icon: '🏊' },
      { name: 'Nhà hàng 5 sao', icon: '🍽️' },
      { name: 'Spa cao cấp', icon: '💆' },
      { name: 'Phòng gym', icon: '💪' },
      { name: 'Quầy bar', icon: '🍸' },
      { name: 'Sân khấu biểu diễn', icon: '🎭' }
    ],
    rooms: [
      {
        id: 101,
        type: 'Phòng Ocean Suite',
        price: 4370000,
        size: '25m²',
        description: 'Phòng tiêu chuẩn với view biển, giường đôi hoặc 2 giường đơn',
        amenities: ['TV màn hình phẳng', 'Minibar', 'Điều hòa', 'Wifi'],
        image: 'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/Ph%C3%B2ng%20Delta%20Suite/b1zy0kd45oky2b4k.webp',
        available: 10
      },
      {
        id: 102,
        type: 'Phòng Ocean Suite',
        price: 4620000,
        size: '35m²',
        description: 'Phòng rộng với ban công riêng nhìn ra biển',
        amenities: ['TV màn hình phẳng', 'Minibar', 'Khu vực tiếp khách', 'Bồn tắm'],
        image: 'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/Ph%C3%B2ng%20Ocean%20Suite/ceb6gpnbn7ujv921.webp',
        available: 5
      },
      {
        id: 103,
        type: 'Phòng Captain Suite',
        price: 4870000,
        size: '50m²',
        description: 'Suite cao cấp với phòng khách riêng và nhiều tiện nghi',
        amenities: ['TV 2 màn hình', 'Minibar cao cấp', 'Bồn tắm Jacuzzi', 'Dịch vụ butler'],
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop',
        available: 2
      }
    ],
    gallery: [
      'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/images/5hdlww87m5ptha7h.webp',
      'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/images/q4om9c6ar8dtx2f3.webp',
      'https://minio.fares.vn/mixivivu-dev/tour/du-thuyen-heritage-binh-chuan-cat-ba/images/l5vcfa270dz4z6s0.webp'
    ]
  };

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [duration, setDuration] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const totalPrice = selectedRoom ? (yacht.price + selectedRoom.price) * duration : 0;

  const handleBook = () => {
    // Xử lý đặt phòng
    console.log('Booking details:', {
      yacht: yacht.name,
      room: selectedRoom?.type,
      duration,
      totalPrice
    });
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  return (
    <div className="max-w-screen-2xl mx-auto mt-15 px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">{yacht.name}</h1>
          <h2 className="text-3xl font-bold">{yacht.price} đ/ khách</h2>
        </div>
        <p className="text-xl text-gray-600">{yacht.description}</p>
      </div>


      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Yacht image */}
          <div className="rounded-lg shadow-md overflow-hidden mb-8">
            <img
              src={yacht.image}
              alt={yacht.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('overview')}
              >
                Tổng quan
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'rooms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('rooms')}
              >
                Phòng nghỉ
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'gallery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('gallery')}
              >
                Hình ảnh
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Thông tin du thuyền</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {yacht.overview.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-2xl font-bold mb-4">Đặc điểm nổi bật</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {yacht.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-xl mr-2">{amenity.icon}</span>

                        <span>{typeof amenity === 'string' ? amenity : (typeof amenity.name === 'string' ? amenity.name : (amenity.name?.name || amenity || 'Tiện ích'))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 mb-8 mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-800">Giới thiệu du thuyền Heritage</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {yacht.detailedIntro.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold mb-2 text-blue-700">{item.title}</h3>
                          <p className="text-gray-700">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Tại sao nên chọn {yacht.name}?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <h3 className="font-semibold mb-2">⭐ Dịch vụ đẳng cấp</h3>
                        <p className="text-gray-700 text-sm">Đội ngũ nhân viên chuyên nghiệp được đào tạo bài bản, luôn sẵn sàng phục vụ 24/7</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <h3 className="font-semibold mb-2">⚓ An toàn tuyệt đối</h3>
                        <p className="text-gray-700 text-sm">Hệ thống an ninh, cứu hộ hiện đại đạt tiêu chuẩn quốc tế</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <h3 className="font-semibold mb-2">🌊 Trải nghiệm độc nhất</h3>
                        <p className="text-gray-700 text-sm">Hành trình được thiết kế riêng để khám phá vẻ đẹp hoang sơ của Cát Bà</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-6">
                  {yacht.rooms.map(room => (
                    <div
                      key={room.id}
                      className={`border rounded-lg overflow-hidden transition-all ${selectedRoom?.id === room.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                    >
                      <div className="flex flex-col md:flex-row">
                        <img
                          src={room.image}
                          alt={room.type}
                          className="mx-auto block rounded-lg w-auto max-w-full h-52 object-cover border border-gray-200 shadow-sm"
                        />
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-xl">{room.type}</h3>
                              <p className="text-gray-600">{room.size}</p>
                              <p className="my-2">{room.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {room.amenities.map((item, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {new Intl.NumberFormat('vi-VN').format(room.price)}₫
                              </p>
                              <p className="text-sm text-gray-500">/khách</p>
                              <p className="text-sm mt-1">Còn {room.available} phòng</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedRoom({ id: room.id, type: room.type, price: room.price, size: room.size, description: room.description, amenities: room.amenities, image: room.image, available: room.available })}
                            className={`mt-4 w-full py-2 rounded-lg ${selectedRoom?.id === room.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                          >
                            {selectedRoom?.id === room.id ? 'Đã chọn' : 'Chọn phòng'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {yacht.gallery.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Booking */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Đặt du thuyền</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ngày khởi hành</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Số ngày</label>
              <input
                type="number"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {selectedRoom && (
              <>
                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Thuê du thuyền:</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN').format(yacht.price * 1000)} ₫/khách
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Phòng {selectedRoom.type}:</span>
                    <span>
                      {new Intl.NumberFormat('vi-VN').format(selectedRoom.price * 1000)} ₫/khách
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-3">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat('vi-VN').format(
                        (yacht.price + selectedRoom.price) * 1000
                      )} ₫/khách
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleBook}
                  disabled={!selectedRoom}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedRoom
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Đặt ngay
                </button>

                {bookingSuccess && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center">
                    Đặt phòng thành công!
                  </div>
                )}
              </>
            )}

            {!selectedRoom && (
              <div className="text-center py-4 text-gray-500">
                Vui lòng chọn phòng để tiếp tục
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YachtDetailPage;
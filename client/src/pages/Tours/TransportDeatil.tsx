

const transport = {
  transport_id: 1,
  transport_type: "Xe khách",
  name: "Xe Hoàng Long",
  number: "HL-01",
  departure_location: "Hà Nội",
  arrival_location: "Hải Phòng",
  image_transport: "https://media.vneconomy.vn/images/upload/2023/07/20/30.jpg",
};

const schedule = [
  {
    schedule_id: 101,
    departure_time: "2025-06-20T08:00",
    arrival_time: "2025-06-20T10:30",
    price: 120000,
    available_seats: 12,
  },
  {
    schedule_id: 102,
    departure_time: "2025-06-20T14:00",
    arrival_time: "2025-06-20T16:30",
    price: 120000,
    available_seats: 5,
  },
  {
    schedule_id: 103,
    departure_time: "2025-06-21T08:00",
    arrival_time: "2025-06-21T10:30",
    price: 120000,
    available_seats: 20,
  },
];

const TransportDetail = () => {
  return (
    
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6 mt-20">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <img
            src={transport.image_transport}
            alt={transport.name}
            className="w-full h-[300px] object-cover"
          />
          <div className="p-6 md:flex md:justify-between md:items-center bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-2">{transport.name}</h1>
              <p className="text-gray-700 mb-1">🚍 Loại phương tiện: <strong>{transport.transport_type}</strong></p>
              <p className="text-gray-700 mb-1">🆔 Số hiệu: <strong>{transport.number}</strong></p>
              <p className="text-gray-700">📍 Hành trình: <strong>{transport.departure_location} → {transport.arrival_location}</strong></p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition">Đặt vé nhanh</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">🕑 Lịch trình khởi hành</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="p-3 text-left">📅 Ngày đi</th>
                  <th className="p-3 text-left">🕘 Giờ xuất phát</th>
                  <th className="p-3 text-left">🕙 Giờ đến</th>
                  <th className="p-3 text-left">💰 Giá vé</th>
                  <th className="p-3 text-left">🎫 Ghế trống</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s.schedule_id} className="hover:bg-gray-50 border-b">
                    <td className="p-3">{new Date(s.departure_time).toLocaleDateString()}</td>
                    <td className="p-3">{new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3">{new Date(s.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-3 text-blue-600 font-semibold">{s.price.toLocaleString("vi-VN")}đ</td>
                    <td className="p-3">{s.available_seats}</td>
                    <td className="p-3 text-center">
                      <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-md hover:shadow-lg transition">Đặt vé</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    
  );
};

export default TransportDetail;

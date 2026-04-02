import { useState } from "react";

interface TransportType {
  from: string;
  to: string;
  image: string;
  date: string;
}

interface TransportData {
  [key: string]: TransportType[];
}

const Transport = () => {
  const [tripType, setTripType] = useState("roundtrip");
  const [directOnly, setDirectOnly] = useState(false);
  const [from, setFrom] = useState("HAN Sân bay Quốc tế Nội Bài");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [showError, setShowError] = useState(false);

  const handleSearch = () => {
    if (!to) {
      setShowError(true);
      return;
    }
    setShowError(false);
    alert("Đang tìm chuyến...");
  };

  const transportData: TransportData = {
  transport: [
    {
      from: "Hà Nội",
      to: "Bangkok",
      image: "https://cdn.saigontimestravel.com/storage/images/retail/wp-content/uploads/2024/08/bangkok-thai-lan-1.jpg",
      date: "19 tháng 6 - 21 tháng 6",
    },
    {
      from: "Hà Nội",
      to: "Kuta",
      image: "https://media.istockphoto.com/id/904453184/vi/anh/n%C3%BAi-ph%C3%BA-s%C4%A9-v%C3%A0-%C4%91%C6%B0%E1%BB%9Dng-ch%C3%A2n-tr%E1%BB%9Di-tokyo.jpg?s=612x612&w=0&k=20&c=Rcww2jkfT2EiP73fVwkYO1OBVvou7NPng_ZwjTWad0A=",
      date: "13 tháng 6 - 27 tháng 6",
    },
    {
      from: "Hà Nội",
      to: "Tokyo",
      image: "https://media.istockphoto.com/id/484915982/vi/anh/akihabara-tokyo.jpg?s=612x612&w=0&k=20&c=NUqzICFIaaQAxpnryr_q-bYHUb18woGf8RKd3yJiG0M=",
      date: "19 tháng 6 - 16 tháng 7",
    },
    {
      from: "Hà Nội",
      to: "Chiang Mai",
      image: "https://media.istockphoto.com/id/622780072/vi/anh/nh%E1%BB%AFng-%C4%91i%E1%BB%83m-h%E1%BA%A5p-d%E1%BA%ABn-nh%E1%BA%A5t-c%E1%BB%A7a-landscape-in-chiang-mai-n%C3%BAi-inthanon.jpg?s=612x612&w=0&k=20&c=TnoN2DTBhq0wYir8C5t-X-H1c0sQQ9fgU2g5-EtI-1U=",
      date: "16 tháng 6 - 22 tháng 6",
    },
    {
      from: "TP.HCM",
      to: "Seoul",
      image: "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      date: "10 tháng 7 - 18 tháng 7",
    },
    {
      from: "Đà Nẵng",
      to: "Singapore",
      image: "https://duhocinec.com/wp-content/uploads/2024/09/dat-nuoc-singapore-01.jpg",
      date: "5 tháng 7 - 9 tháng 7",
    },
    {
      from: "Hà Nội",
      to: "Paris",
      image: "https://media.istockphoto.com/id/1185953092/vi/anh/%C4%91i%E1%BB%83m-thu-h%C3%BAt-ch%C3%ADnh-c%E1%BB%A7a-paris-v%C3%A0-to%C3%A0n-ch%C3%A2u-%C3%A2u-l%C3%A0-th%C3%A1p-eiffel-trong-nh%E1%BB%AFng-tia-n%E1%BA%AFng-m%E1%BA%B7t-tr%E1%BB%9Di-l%E1%BA%B7n.jpg?s=612x612&w=0&k=20&c=QX7TNdmG1wcxmsCDKlfDK7ic45yuFl7QW0l95mKfZWE=",
      date: "2 tháng 8 - 12 tháng 8",
    },
    {
      from: "TP.HCM",
      to: "Sydney",
      image: "https://objectstorage.omzcloud.vn/pys-object-storage/web/uploads/posts/avatar/1648181662.jpg",
      date: "15 tháng 8 - 25 tháng 8",
    },
    {
      from: "Hà Nội",
      to: "Dubai",
      image: "https://objectstorage.omzcloud.vn/pys-object-storage/web/uploads/posts/avatar/1657162996.jpg",
      date: "1 tháng 9 - 7 tháng 9",
    },
    {
      from: "Đà Nẵng",
      to: "Kuala Lumpur",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJTmQScNXRWdcHCVZ_e5gNTEW2x4hRVC48Jw&s",
      date: "22 tháng 6 - 28 tháng 6",
    },
    {
      from: "TP.HCM",
      to: "New York",
      image: "https://images.pexels.com/photos/597909/pexels-photo-597909.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      date: "12 tháng 9 - 22 tháng 9",
    },
    {
      from: "Hà Nội",
      to: "Luang Prabang",
      image: "https://dulichviet.com.vn/images/bandidau/du-lich-co-do-Luang-Prabang-lao.jpg",
      date: "6 tháng 7 - 11 tháng 7",
    },
  ],

  domestic: [
    {
      from: "TP.HCM",
      to: "Đà Nẵng",
      image: "https://source.unsplash.com/400x250/?danang",
      date: "20 tháng 6 - 24 tháng 6",
    },
    {
      from: "Hà Nội",
      to: "Phú Quốc",
      image: "https://source.unsplash.com/400x250/?phu-quoc",
      date: "25 tháng 6 - 30 tháng 6",
    },
  ],
};


  return (
    <div className=" max-w-screen-2xl mx-auto pt-4 pb-20 px-4 md:px-8 lg:px-32 mt-20">
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#006CAA]">Tìm kiếm phương tiện</h1>
          <p className="text-gray-500 mt-2">So sánh và đặt chuyến đi theo lịch trình của bạn</p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center text-sm mb-6">
          {["roundtrip", "oneway", "multi"].map((type) => (
            <label key={type} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value={type}
                checked={tripType === type}
                onChange={() => setTripType(type)}
                className="accent-blue-600"
              />
              {type === "roundtrip" ? "Khứ hồi" : type === "oneway" ? "Một chiều" : "Nhiều chặng"}
            </label>
          ))}
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={directOnly}
              onChange={() => setDirectOnly(!directOnly)}
              className="accent-blue-600"
            />
            Chỉ chuyến bay thẳng
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nơi đi</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-blue-500"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="VD: HAN"
            />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-700 mb-1">Nơi đến</label>
            <input
              type="text"
              className={`w-full border px-4 py-2 rounded-lg ${showError ? "border-red-500" : "border-gray-300"} focus:outline-blue-500`}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="VD: SGN"
            />
            {showError && (
              <span className="absolute text-xs text-red-600 mt-1">Nhập sân bay hoặc thành phố</span>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Ngày đi</label>
            <input
              type="date"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-blue-500"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>

          {tripType === "roundtrip" && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ngày về</label>
              <input
                type="date"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-blue-500"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Hành khách</label>
            <select
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-blue-500"
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num}>{num} người lớn</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Tìm chuyến
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách chuyến bay phổ biến */}
      <div className="mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-1">Chuyến bay phổ biến gần bạn</h2>
        <p className="text-gray-500">Tìm ưu đãi cho chuyến bay trong nước và quốc tế</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {transportData.transport.map((item: TransportType, index: number) => (
            <div key={index} className="rounded-lg overflow-hidden shadow hover:shadow-md transition">
              <img src={item.image} alt={item.to} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">
                  {item.from} đến {item.to}
                </h3>
                <p className="text-sm text-gray-500">{item.date} · Khứ hồi</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transport;

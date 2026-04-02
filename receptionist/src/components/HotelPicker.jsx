import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HotelPicker = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/hotels");
        const payload = res?.data;
        const hotelsArray = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.hotels)
          ? payload.hotels
          : Array.isArray(payload)
          ? payload
          : [];
        setHotels(hotelsArray);
      } catch (e) {
        setError("Không tải được danh sách khách sạn");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) return <div className="p-6 text-center">Đang tải khách sạn...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen p-6 container mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">Chọn khách sạn để đăng nhập</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {hotels.map((h) => (
          <button
            key={h._id}
            onClick={() => navigate(`/${h._id}/login`)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 text-left h-[260px] flex flex-col"
          >
            {h.hotelImages?.[0] && (
              <img src={h.hotelImages[0]} alt={h.hotelName} className="w-full h-32 object-cover rounded" />
            )}
            <div className="mt-3 flex-1 flex flex-col">
              <div className="font-medium text-ellipsis-1">{h.hotelName}</div>
              <div className="text-sm text-gray-500 text-ellipsis-2">{h.address}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HotelPicker;



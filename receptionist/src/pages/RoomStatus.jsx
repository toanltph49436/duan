import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const RoomStatus = () => {
  const { selectedHotel } = useAuth();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedHotel) return;
    
    const fetchRoomStatus = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.get(
          `http://localhost:8080/api/hotels/${selectedHotel._id}/rooms/status-by-floor`
        );
        
        if (response.data?.success) {
          setRoomData(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Không thể lấy thông tin phòng');
        }
      } catch (err) {
        console.error('Error fetching room status:', err);
        setError(err.response?.data?.message || err.message || 'Lỗi khi lấy thông tin phòng');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, [selectedHotel]);

  if (!selectedHotel) {
    return (
      <div className="p-6 text-center text-gray-600">
        Vui lòng chọn khách sạn để xem thông tin phòng
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="p-6 text-center text-gray-600">
        Không có dữ liệu phòng
      </div>
    );
  }

  const totalRooms = roomData.roomsByFloor.reduce((sum, floor) => sum + floor.totalRooms, 0);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="mb-6 rounded-xl p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Room Status Dashboard</h1>
        <p className="text-blue-100 text-lg">{selectedHotel.hotelName}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-blue-100">
            Tổng cộng: <span className="font-bold text-white">{totalRooms}</span> phòng
          </div>
          <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            {totalRooms} available
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid gap-6">
          {roomData.roomsByFloor.map((floor) => (
            <div key={floor.floor} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tầng {floor.floor} - {floor.totalRooms} phòng
              </h3>
              <div className="grid grid-cols-6 gap-3">
                {floor.rooms.map((room) => (
                  <div
                    key={room.roomNumber}
                    className="bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg p-3 text-center transition-colors duration-200 cursor-pointer"
                  >
                    <div className="text-lg font-bold text-green-800">{room.roomNumber}</div>
                    <div className="text-xs text-green-600 mt-1">{room.roomType}</div>
                    <div className="text-xs text-green-700 mt-1">{room.bedType}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chú thích</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Cleaning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatus;

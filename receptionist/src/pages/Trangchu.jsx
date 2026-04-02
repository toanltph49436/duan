import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const TrangChu = () => {
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
        
        console.log('Fetching room status for hotel:', selectedHotel._id);
        const response = await axios.get(
          `http://localhost:8080/api/hotels/${selectedHotel._id}/rooms/status-by-floor`
        );
        
        console.log('API Response:', response.data);
        
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

  // Sample reservations data
  const reservations = [
    {
      name: "John Doe",
      room: "Room 105",
      checkIn: "9:00 AM",
      checkOut: "9:00 PM"
    },
    {
      name: "Jane Smith", 
      room: "Room 108",
      checkIn: "10:00 AM",
      checkOut: "11:00 PM"
    },
    {
      name: "Robert Johnson",
      room: "Room 110", 
      checkIn: "12:00 PM",
      checkOut: "11:00 AM"
    }
  ];

  // Sample service usage data
  const services = [
    { room: "Room 105", service: "Breakfast", cost: "$20" },
    { room: "Room 108", service: "Laundry", cost: "$15" },
    { room: "Room 110", service: "Spa", cost: "$50" }
  ];

  if (!selectedHotel) {
    return (
      <div className="p-6 text-center text-gray-600">
        Vui lòng chọn khách sạn để xem thông tin phòng
      </div>
    );
  }

  const totalRooms = roomData ? roomData.roomsByFloor.reduce((sum, floor) => sum + floor.totalRooms, 0) : 0;
  const availableCount = totalRooms; // Tạm thời coi tất cả phòng đều available

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin phòng...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Room Status Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Room Status</h2>
              <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {availableCount} available
              </span>
            </div>
            
            {/* Room Grid */}
            {roomData && roomData.roomsByFloor && roomData.roomsByFloor.length > 0 ? (
              <div className="space-y-6">
                {roomData.roomsByFloor.map((floor) => (
                  <div key={floor.floor} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Tầng {floor.floor} - {floor.totalRooms} phòng
                    </h3>
                    <div className="grid grid-cols-6 gap-3">
                      {floor.rooms && floor.rooms.map((room) => (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Không có dữ liệu phòng để hiển thị</p>
                <p className="text-sm mt-2">Debug: selectedHotel = {JSON.stringify(selectedHotel)}</p>
                <p className="text-sm">roomData = {JSON.stringify(roomData)}</p>
              </div>
            )}
            
            {/* Legend */}
            <div className="flex space-x-8 mt-6">
              <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-3 shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <div className="flex items-center bg-red-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-3 shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Occupied</span>
              </div>
              <div className="flex items-center bg-orange-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mr-3 shadow-md"></div>
                <span className="text-sm font-medium text-gray-700">Cleaning</span>
              </div>
            </div>
          </div>

          {/* Reservations Card */}
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Reservations</h2>
              <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Add reservation
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search reservations"
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 transition-all duration-200"
              />
            </div>
            
            {/* Reservations List */}
            <div className="space-y-4">
              {reservations.map((reservation, index) => (
                <div key={index} className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-bold text-gray-900 text-lg">{reservation.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">Room: {reservation.room}</p>
                  <p className="text-sm text-gray-600">Check-in: {reservation.checkIn}</p>
                  <p className="text-sm text-gray-600">Check-out: {reservation.checkOut}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service Usage Card */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Service Usage</h2>
              <button className="text-indigo-400 hover:text-indigo-600 transform hover:scale-110 transition-all duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            
            {/* Service Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg">
                    <th className="text-left py-4 px-6 font-bold text-indigo-800">Room</th>
                    <th className="text-left py-4 px-6 font-bold text-indigo-800">Service</th>
                    <th className="text-left py-4 px-6 font-bold text-indigo-800">Cost</th>
                    <th className="text-right py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} className="border-b border-indigo-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-cyan-50 transition-all duration-200">
                      <td className="py-4 px-6 text-gray-900 font-semibold">{service.room}</td>
                      <td className="py-4 px-6 text-indigo-600 font-medium">{service.service}</td>
                      <td className="py-4 px-6 text-gray-900 font-bold text-lg">{service.cost}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-indigo-400 hover:text-indigo-600 transform hover:scale-110 transition-all duration-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrangChu;

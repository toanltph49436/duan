/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import instanceClient from "../../../../configs/instance";
import { Link } from "react-router-dom";

interface Room {
  _id: string;
  nameRoom: string;
  locationId: string;
  typeRoom: string;
  capacityRoom: number;
  amenitiesRoom: string;
  priceRoom: number;
  imageRoom: string[];
  locationName: string;
  country: string;
}

const RoomList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["room"],
    queryFn: () => instanceClient.get("/room"),
  });

  const rooms: Room[] = data?.data?.rooms || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-blue-600 text-lg font-semibold">Đang tải phòng...</span>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl p-4 mx-auto font-sans mt-8">
      <main className="flex flex-col md:flex-row gap-6 px-4 md:px-8 py-6">
        <Sidebar />

        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-600">Danh sách phòng</h2>
            <select className="border text-sm rounded px-3 py-1">
              <option>Mặc định</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <Link to={`/roomdetail/${room._id}`}>
                  <img
                    src={room.imageRoom[0]}
                    alt={room.nameRoom}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-1">�� {room.locationName} - {room.country}</p>
                  <Link to={`/roomdetail/${room._id}`}>
                    <h3 className="text-blue-600 font-semibold text-lg mb-1">
                      {room.nameRoom}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-1">🛏 Loại phòng: {room.typeRoom}</p>
                  <p className="text-sm text-gray-600 mb-1">👥 Sức chứa: {room.capacityRoom} người</p>
                  <p className="text-red-600 font-bold text-2xl mt-2">
                    {room.priceRoom.toLocaleString("vi-VN")}₫/đêm
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RoomList;

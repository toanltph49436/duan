/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import LeftRoomDetail from "./LeftRoom/LeftRoom";
import { useRoom } from "../UseRoom/useRoom";
import RightRoom from "./RightRoom/RightRoom";
import Service from "./Text/Service";


const Roomdetail = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const {room} = useRoom();
  return (
    <div className="pb-10 mt-20 max-w-screen-xl mx-auto">
      <div className=" p-4 font-sans">
        {/* Title */}
        <h1 className="mb-2 text-4xl text-amber-700 font-semibold my-5">
          {room?.nameRoom}
        </h1>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-8">
          {/* Image */}
          <LeftRoomDetail />

          {/* Booking box */}
          <RightRoom/>
        </div>
      </div>
      <Service/>

      {/* Khám phá thêm về khách sạn */}
      <div className=" mx-auto mt-6 bg-white rounded-xl shadow overflow-hidden">
        {/* Hình ảnh + overlay tiêu đề */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {room?.imageRoom?.slice(0, 3).map((img:any, index:any) => (
              <img
                key={index}
                src={img}
                alt={`Ảnh phòng ${index + 1}`}
                className="h-56 w-full object-cover"
              />
            ))}
          </div>

          {/* Tiêu đề overlay nằm trên ảnh */}
          <div className="absolute left-0 bottom-0 w-full bg-black bg-opacity-70 px-6 py-3">
            <span className="text-white text-lg font-bold">
             Khám Phá {room?.nameRoom}
            </span>
          </div>
        </div>
        {/* Nội dung mô tả */}
        <div className="p-6 pt-8">
          <div className="mb-2">
            <p>
              <div
                dangerouslySetInnerHTML={{
                  __html: room?.descriptionRoom || "",
                }}
              />
            </p>
            </div>
        </div>
      </div>

      {/* Chính sách và FAQ */}
      <div className=" mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái */}
        <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-start min-h-[220px]">
          <div className="font-bold text-lg mb-4">
            Chính sách và những thông tin liên quan của Leaf Beachfront Hotel Da Nang
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            {/* Icon hỏi đáp */}
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <ellipse cx="30" cy="30" rx="30" ry="30" fill="#e3effc" />
              <ellipse cx="20" cy="40" rx="10" ry="10" fill="#b6dafe" />
              <text x="15" y="45" fontSize="30" fill="#2196f3">?</text>
            </svg>
          </div>
        </div>
        {/* Cột phải */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow p-0 divide-y border">
            {/* FAQ item */}
            <div>
              <button
                className="w-full text-left px-6 py-4 font-semibold hover:bg-gray-50 flex justify-between items-center focus:outline-none"
                type="button"
                onClick={() => setOpenFaq(0)}
              >
                Những tiện ích tại Leaf Beachfront Hotel Da Nang?
                <span className="ml-2">{openFaq === 0 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 0 && (
                <div className="px-6 pb-4 text-gray-700 text-sm">
                  Máy lạnh, Hồ bơi, Nhà hàng, Lễ tân 24h, Chỗ đậu xe, WiFi, Thang máy...
                </div>
              )}
            </div>
            <div>
              <button
                className="w-full text-left px-6 py-4 font-semibold hover:bg-gray-50 flex justify-between items-center focus:outline-none"
                type="button"
                onClick={() => setOpenFaq(1)}
              >
                Leaf Beachfront Hotel Da Nang có mức giá là bao nhiêu?
                <span className="ml-2">{openFaq === 1 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 1 && (
                <div className="px-6 pb-4 text-gray-700 text-sm">
                  Giá phòng thay đổi theo từng thời điểm, vui lòng kiểm tra trên hệ thống để biết giá chính xác.
                </div>
              )}
            </div>
            <div>
              <button
                className="w-full text-left px-6 py-4 font-semibold hover:bg-gray-50 flex justify-between items-center focus:outline-none"
                type="button"
                onClick={() => setOpenFaq(2)}
              >
                Thời gian nhận phòng và trả phòng của Leaf Beachfront Hotel Da Nang?
                <span className="ml-2">{openFaq === 2 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 2 && (
                <div className="px-6 pb-4 text-gray-700 text-sm">
                  Nhận phòng từ 14:00, trả phòng trước 12:00.
                </div>
              )}
            </div>
            <div>
              <button
                className="w-full text-left px-6 py-4 font-semibold hover:bg-gray-50 flex justify-between items-center focus:outline-none"
                type="button"
                onClick={() => setOpenFaq(3)}
              >
                Leaf Beachfront Hotel Da Nang có phục vụ ăn sáng không?
                <span className="ml-2">{openFaq === 3 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 3 && (
                <div className="px-6 pb-4 text-gray-700 text-sm">
                  Có, khách sạn phục vụ bữa sáng miễn phí cho khách lưu trú.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roomdetail;

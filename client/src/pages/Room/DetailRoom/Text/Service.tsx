/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRoom } from "../../UseRoom/useRoom"

const Service = () => {
    const {room} = useRoom();
    console.log(room);
    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case "WiFi miễn phí":
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 13a10 10 0 0114 0M8.5 16.5a5 5 0 017 0M12 20h.01" />
                    </svg>
                );
            case "Miễn phí bữa sáng":
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 8h18M4 8l1 12h14l1-12" />
                    </svg>
                );
            case "View đẹp":
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                );
            case "Dịch vụ phòng":
                return (
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M8 7V3h8v4M3 11h18M5 11v10h14V11" />
                    </svg>
                );
            case "Hồ bơi":
                return (
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 20c1 0 1-1 2-1s1 1 2 1 1-1 2-1 1 1 2 1 1-1 2-1 1 1 2 1 1-1 2-1 1 1 2 1" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                );
        }
    };
      
  return (
      <div className=" mx-auto mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Đánh giá */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="flex items-end gap-2 mb-2">
                  <span className="text-red-600 text-5xl font-extrabold leading-none">9,0</span>
                  <span className="text-gray-600 font-semibold text-xl pb-1">/10</span>
              </div>
              <div className="text-lg text-gray-700 font-semibold mt-1 mb-2">Xuất sắc</div>
              <div className="text-base text-gray-500 mb-3">48 đánh giá</div>
              <hr className="w-full border-gray-200 mb-3" />
              <div className="w-full">
                  <div className="text-lg font-semibold mb-1">
                      Khách nói gì về kỳ nghỉ của họ
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-700 text-base">Thuy L. T.</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-semibold">
                          9.4/10
                      </span>
                  </div>
                  <div className="text-gray-600 text-base mt-1">
                      Tôi đã có 1 trải nghiệm tuyệt vời ở đây...chất lượng 5 sao...tôi sẽ quay lại đây nếu có cơ hội
                  </div>
              </div>
          </div>
          {/* Vị trí */}
          <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">Trong khu vực</span>
                  <button className="text-blue-600 text-base hover:underline flex items-center gap-1">
                      <svg
                          className="w-5 h-5 inline-block"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                      >
                          <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                          <circle cx="12" cy="10.5" r="3" />
                      </svg>
                      Xem bản đồ
                  </button>
              </div>
              <div className="flex items-center text-base text-gray-700 mb-2">
                  <svg
                      className="w-5 h-5 mr-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                  >
                      <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                      <circle cx="12" cy="10.5" r="3" />
                  </svg>
                  38 Võ Nguyên Giáp, Mân Thái, Sơn Trà, Đà Nẵng, Việt Nam, 550000
              </div>
              <div className="flex items-center text-base text-blue-700 mb-3">
                  <svg
                      className="w-5 h-5 mr-1 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                  >
                      <path d="M9.049 2.927C9.469 1.837 10.531 1.837 10.951 2.927l1.286 3.319a1 1 0 00.95.69h3.462c1.11 0 1.572 1.424.677 2.09l-2.8 2.034a1 1 0 00-.364 1.118l1.286 3.319c.42 1.09-.34 1.988-1.23 1.322l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.89.666-1.65-.232-1.23-1.322l1.286-3.319a1 1 0 00-.364-1.118L2.074 9.026c-.895-.666-.433-2.09.677-2.09h3.462a1 1 0 00.95-.69l1.286-3.319z" />
                  </svg>
                  Gần khu vui chơi giải trí
              </div>
              <ul className="text-base text-gray-700 space-y-1">
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Four Points by Sheraton Danang</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">968 m</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Đối diện Sở 35 Cty TNHH Huy Đăng Ngô Q...</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">1.65 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Biển Phạm Văn Đồng</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">2.10 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Bảo tàng 3D Art In Paradise Đà Nẵng</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">1.24 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Đối diện Sở 35 Cty TNHH Huy Đăng Ngô Q...</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">1.65 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Bệnh viện 199 - Bộ Công An</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">2.54 km</span>
                  </li>
                  <li className="flex items-center justify-between">
                      <div className="flex items-center min-w-0">
                          <svg className="w-5 h-5 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M21 10.5a8.38 8.38 0 01-.9 3.8c-1.5 3-6.1 7.7-6.1 7.7s-4.6-4.7-6.1-7.7A8.38 8.38 0 013 10.5 8.5 8.5 0 1112 19a8.5 8.5 0 019-8.5z" />
                              <circle cx="12" cy="10.5" r="3" />
                          </svg>
                          <span className="truncate">Trường Cao đẳng Nghề Đà Nẵng</span>
                      </div>
                      <span className="ml-2 text-gray-500 font-medium min-w-[70px] text-right">3.00 km</span>
                  </li>
              </ul>
          </div>
          {/* Tiện ích */}
          <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg">Tiện ích chính</span>
                  <button className="text-blue-600 text-base hover:underline flex items-center gap-1">
                      Xem thêm
                      <svg
                          className="w-5 h-5 ml-1 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                      >
                          <path
                              d="M9 5l7 7-7 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          />
                      </svg>
                  </button>
              </div>
              <div className="grid grid-cols-1 gap-y-3 text-base text-gray-700">
                  {room?.amenitiesRoom?.map((amenity:any, index:any) => (
                      <div key={index} className="flex items-center gap-2">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  )
}

export default Service
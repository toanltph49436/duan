/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTour } from "../useTour/UseTour";
const Schedule = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const {tour,isLoading, error}  = useTour();
    const schedule = tour?.schedules
    if (isLoading) return <p>Đang tải lịch trình...</p>;
    if (error) return <p>Đã xảy ra lỗi khi tải lịch trình.</p>;
    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        🗓️ Lịch trình tour
                    </h2>
                </div>
                <p className="text-gray-600 text-lg">Chi tiết hoạt động từng ngày trong chuyến du lịch</p>
            </div>

            {/* Schedule Content */}
            <div className="space-y-4">
                {schedule?.map((item:any, index:any) => (
                    <div
                        key={item._id}
                        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${
                            openIndex === index ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg'
                        }`}
                    >
                        <div
                            className="px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                        index === 0 ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                                        index === 2 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {item.dayNumber}
                                        </h3>
                                        <p className="text-blue-600 font-semibold">
                                            📍 {item.location}
                                        </p>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-300 ${
                                    openIndex === index ? 'rotate-180' : ''
                                }`}>
                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <div className={`transition-all duration-300 ease-in-out ${
                            openIndex === index 
                                ? 'max-h-[2000px] opacity-100' 
                                : 'max-h-0 opacity-0 overflow-hidden'
                        }`}>
                            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                                {/* Activity Description */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                                        </svg>
                                        Hoạt động trong ngày
                                    </h4>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {item.activity}
                                    </div>
                                </div>

                                {/* Images Gallery */}
                                {item.imageTourSchedule && item.imageTourSchedule.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                                            </svg>
                                            Hình ảnh minh họa
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {item.imageTourSchedule.map((img: string, idx: number) => (
                                                <div key={idx} className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                                    <img
                                                        src={img}
                                                        alt={`Hình ảnh ${item.dayNumber} - ${idx + 1}`}
                                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Note */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-500 text-white rounded-full p-2 mt-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-800 mb-2">Lưu ý về lịch trình:</h4>
                        <ul className="text-blue-700 space-y-1 text-sm">
                            <li>• Lịch trình có thể thay đổi tùy theo điều kiện thời tiết và tình hình thực tế</li>
                            <li>• Thời gian di chuyển là ước tính, có thể thay đổi do tình hình giao thông</li>
                            <li>• Hướng dẫn viên sẽ thông báo chi tiết về lịch trình mỗi ngày</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Schedule;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from 'react-router-dom';
import instanceClient from '../../../configs/instance';
import LeftTourDetail from './Left/LeftTourDetail';
import Content from './Content/Content';
import RightTourDetail from './Right/RightTourDetail';
import Schedule from './Content/Schedule';
import Evaluate from './Content/Evaluate';
import { useEffect, useRef, useState } from 'react';

const TourPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'reviews'>('overview');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  const { id: tourId } = useParams<{ id: string }>();
  const { data: tourD } = useQuery({
    queryKey: ['/date/tour/', tourId],
    queryFn: () => instanceClient.get(`/date/tour/${tourId}`)
  })
  const slots = tourD?.data?.data || [];

  const { data: tour } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => instanceClient.get(`/tour/${id}`)
  })
  const tours = tour?.data?.tour

  useEffect(() => {
    if (selectedDate && slots.length > 0) {
      const matchingSlot = slots.find(slot =>
        new Date(slot.dateTour).toDateString() === selectedDate.toDateString()
      );
      console.log("Matching slot:", matchingSlot);
    }
  }, [selectedDate, slots]);

  const handleChooseOtherDate = () => {
    setSelectedDate(null);
    scrollToCalendar();
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date && slots.length > 0) {
      const matchingSlot = slots.find(slot =>
        new Date(slot.dateTour).toDateString() === date.toDateString()
      );
      console.log("Matching slot after selection:", matchingSlot);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-blue-100">
              <span>Trang chủ</span>
              <span>/</span>
              <span>Tours</span>
              <span>/</span>
              <span className="text-white font-medium">{tours?.nameTour}</span>
            </div>
          </nav>

          {/* Title & Info */}
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {tours?.nameTour}
            </h1>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              {/* Khởi hành */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500/30 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm">Khởi hành từ</div>
                    <div className="text-white font-bold text-lg">{tours?.departure_location}</div>
                  </div>
                </div>
              </div>

              {/* Điểm đến */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-500/30 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm">Điểm đến</div>
                    <div className="text-white font-bold text-lg">{tours?.destination?.locationName}</div>
                    <div className="text-blue-200 text-sm">{tours?.destination?.country}</div>
                  </div>
                </div>
              </div>

              {/* Thời gian */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-500/30 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm">Thời gian</div>
                    <div className="text-white font-bold text-lg">{tours?.duration}</div>
                  </div>
                </div>
              </div>

              {/* Phương tiện */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="bg-green-500/30 rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 17h16M4 17l2-5h12l2 5M6 12V7h12v5" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm">Phương tiện</div>
                    <div className="text-white font-bold text-lg">
                      {tours?.itemTransport && tours.itemTransport.length > 0 ? (
                        tours.itemTransport.map((t: any, i: number) => (
                          <span key={i}>
                            {t.TransportId?.transportName}
                            {i < tours.itemTransport.length - 1 && ', '}
                          </span>
                        ))
                      ) : (
                        "Chưa có thông tin"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <LeftTourDetail
                  refDiv={calendarRef}
                  selectedDate={selectedDate}
                  setSelectedDate={handleDateSelect}
                />
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex">
                    <button
                      className={`px-8 py-4 font-semibold text-lg transition-all duration-300 relative ${activeTab === 'overview'
                        ? 'text-blue-600 bg-white border-b-3 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                      onClick={() => setActiveTab('overview')}
                    >
                      📋 Tổng quan chi tiết
                      {activeTab === 'overview' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                      )}
                    </button>
                    <button
                      className={`px-8 py-4 font-semibold text-lg transition-all duration-300 relative ${activeTab === 'schedule'
                        ? 'text-blue-600 bg-white border-b-3 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                      onClick={() => setActiveTab('schedule')}
                    >
                      🗓️ Lịch trình
                      {activeTab === 'schedule' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                      )}
                    </button>
                    <button
                      className={`px-8 py-4 font-semibold text-lg transition-all duration-300 relative ${activeTab === 'reviews'
                        ? 'text-blue-600 bg-white border-b-3 border-blue-600'
                        : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      ⭐ Đánh giá
                      {activeTab === 'reviews' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                      <Content />
                    </div>
                  )}
                  {activeTab === 'schedule' && (
                    <div className="animate-fade-in">
                      <Schedule />
                    </div>
                  )}
                  {activeTab === 'reviews' && (
                    <div className="animate-fade-in">
                      <Evaluate />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <RightTourDetail
                  onChooseDate={selectedDate ? handleChooseOtherDate : scrollToCalendar}
                  selectedDate={selectedDate}
                  tour={tours}
                  slots={slots}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .border-b-3 { border-bottom-width: 3px; }
      `}</style>
    </>
  );
};

export default TourPage;

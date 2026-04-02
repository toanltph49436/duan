/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import instanceClient from "../../../../configs/instance";
import { useEffect, useState } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from 'react-toastify';

dayjs.extend(utc);
interface TourData {
    dateTour: string;
}
interface LeftTourDetailProps {
    refDiv: React.RefObject<HTMLDivElement | null>;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

// Hàm kiểm tra ngày có hợp lệ để chọn không
const isDateSelectable = (date: Date): boolean => {
    const today = dayjs().startOf('day');
    const checkDate = dayjs(date).startOf('day');
    return checkDate.isAfter(today);
};

function renderEventContent(eventInfo: any) {
    const eventDate = dayjs(eventInfo.event.start);
    const isSelectable = isDateSelectable(eventDate.toDate());
    
    return (
        <div className={`font-bold text-xs whitespace-pre-line cursor-pointer ${
            isSelectable ? 'text-white' : 'text-gray-400'
        }`}>
            {eventInfo.event.title}
        </div>
    );
}

const LeftTourDetail = ({ refDiv, selectedDate, setSelectedDate }: LeftTourDetailProps) => {
    const { id: tourId } = useParams<{ id: string }>();
    const { id } = useParams<{ id: string }>();
    const handleThumbnailClick = (src: string) => {
        setMainImage(src);
    };

    const { data } = useQuery({
        queryKey: ['/date/tour/', tourId],
        queryFn: () => instanceClient.get(`/date/tour/${tourId}`)
    })
    const slots = data?.data?.data || [];

    const { data: tour } = useQuery({
        queryKey: ['tour', id],
        queryFn: () => instanceClient.get(`/tour/${id}`)
    })
    const tours = tour?.data?.tour

    const [mainImage, setMainImage] = useState(tours?.imageTour?.[0]);
    useEffect(() => {
        if (tours?.imageTour?.[0]?.length > 0) {
            setMainImage(tours?.imageTour?.[0]);
        }
    }, [tours]);

    const events = slots?.map((slot: any) => {
        const date = dayjs(slot.dateTour);
        const isSelectable = isDateSelectable(date.toDate());
        const priceToShow = tours?.finalPrice ?? tours?.price;
        
        return {
            title: `Còn: ${slot.availableSeats} chỗ \nGiá: ${priceToShow?.toLocaleString('vi-VN')} đ`,
            date: date.format("YYYY-MM-DD"),
            backgroundColor: isSelectable ? '#3B82F6' : '#9CA3AF',
            borderColor: isSelectable ? '#2563EB' : '#6B7280',
            textColor: isSelectable ? '#FFFFFF' : '#9CA3AF'
        };
    });

    function handleDateClick(info: any) {
        const clickedDate = dayjs(info.date);
        
        // Kiểm tra ngày có hợp lệ để chọn không
        if (!isDateSelectable(info.date)) {
            toast.warning("Không thể chọn ngày đã qua hoặc ngày hôm nay");
            return;
        }

        const clickedDateStr = clickedDate.format("YYYY-MM-DD");
        const isDateAvailable = events.some((event: any) => event.date === clickedDateStr);
        
        if (isDateAvailable) {
            setSelectedDate(info.date);
            const slot = slots.find((s: any) => dayjs(s.dateTour).format("YYYY-MM-DD") === clickedDateStr);
            if (slot) {
                console.log("Selected slot:", slot);
                toast.success(`Đã chọn ngày ${clickedDate.format("DD/MM/YYYY")} - Còn ${slot.availableSeats} chỗ`);
            }
        } else {
            toast.warning("Ngày này không có tour, vui lòng chọn ngày khác");
            console.log("Ngày này không có tour");
        }
    }

    function handleEventClick(clickInfo: any) {
        const clickedDate = dayjs(clickInfo.event.start);
        
        // Kiểm tra ngày có hợp lệ để chọn không
        if (!isDateSelectable(clickInfo.event.start)) {
            toast.warning("Không thể chọn ngày đã qua hoặc ngày hôm nay");
            return;
        }

        const clickedDateStr = clickedDate.format("YYYY-MM-DD");
        const isDateAvailable = events.some((event: any) => event.date === clickedDateStr);
        
        if (isDateAvailable) {
            setSelectedDate(clickInfo.event.start);
            const slot = slots.find((s: any) => dayjs(s.dateTour).format("YYYY-MM-DD") === clickedDateStr);
            if (slot) {
                console.log("Selected slot:", slot);
                toast.success(`Đã chọn ngày ${clickedDate.format("DD/MM/YYYY")} - Còn ${slot.availableSeats} chỗ`);
            }
        } else {
            toast.warning("Ngày này không có tour, vui lòng chọn ngày khác");
            console.log("Ngày này không có tour");
        }
    }

    // Hàm tạo class cho các ô ngày
    const dayCellClassNames = (arg: any) => {
        const date = dayjs(arg.date);
        if (!isDateSelectable(date.toDate())) {
            return ['disabled-date'];
        }
        return [];
    };

    const selectedSlot = slots?.find((slot: TourData) =>
        dayjs(slot?.dateTour).isSame(selectedDate, 'day')
    );
    return (
        <>
            {/* Image Gallery Section */}
            <div className="p-6">
                <div className="space-y-6">
                    {/* Main Image */}
                    <div className="relative group">
                        <div className="w-full overflow-hidden shadow-2xl aspect-video rounded-2xl">
                            <img
                                src={mainImage || ""}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                alt="Main tour image"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>

                            {/* Image counter */}
                            <div className="absolute px-3 py-1 text-sm font-medium text-white rounded-full top-4 right-4 bg-black/60 backdrop-blur-sm">
                                {tours?.imageTour?.length || 0} ảnh
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    <div className="grid grid-cols-5 gap-3">
                        {tours?.imageTour?.slice(0, 5).map((src: string, index: number) => (
                            <div
                                key={index}
                                className="relative cursor-pointer group"
                                onClick={() => handleThumbnailClick(src)}
                            >
                                <div className="overflow-hidden shadow-md aspect-video rounded-xl">
                                    <img
                                        src={src}
                                        className={`w-full h-full object-cover transition-all duration-300 ${mainImage === src
                                                ? 'ring-3 ring-blue-500 ring-offset-2'
                                                : 'group-hover:scale-110 group-hover:brightness-110'
                                            }`}
                                        alt={`Tour image ${index + 1}`}
                                    />
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 transition-opacity duration-200 opacity-0 bg-black/20 group-hover:opacity-100 rounded-xl"></div>

                                {/* Active indicator */}
                                {mainImage === src && (
                                    <div className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-blue-500 rounded-full top-1 right-1">
                                        ✓
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div ref={refDiv} className="p-6 border-t border-gray-100">
                <div className="p-8 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
                    <div className="mb-6 text-center">
                        <h2 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                            📅 Lịch Tour Du Lịch
                        </h2>
                        <p className="text-gray-600">Chọn ngày khởi hành phù hợp với lịch trình của bạn</p>
                        
                        {/* Legend cho calendar */}
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-gray-700">Có thể đặt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                <span className="text-gray-500">Đã hết hạn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                                <span className="text-gray-400">Không thể chọn</span>
                            </div>
                        </div>
                    </div>

                    {selectedDate == null ? (
                        <div className="p-6 bg-white shadow-xl rounded-2xl">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: ''
                                }}
                                height="auto"
                                dayMaxEventRows={2}
                                fixedWeekCount={false}
                                locale="vi"
                                buttonText={{
                                    today: 'Hôm nay'
                                }}
                                events={events}
                                eventContent={renderEventContent}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                dayCellClassNames={dayCellClassNames}
                                selectable={true}
                                selectConstraint={{
                                    start: dayjs().add(1, 'day').startOf('day').toDate(),
                                    end: '2100-12-31'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="p-8 bg-white shadow-xl rounded-3xl animate-fade-in">
                            {/* Header với ngày đã chọn */}
                            <div className="flex items-center justify-between mb-8">
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="flex items-center gap-2 px-4 py-2 font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-50 rounded-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Quay lại lịch
                                </button>
                                <div className="text-center">
                                    <div className="mb-1 text-sm text-gray-500">Ngày đã chọn</div>
                                    <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text">
                                        {selectedDate ? dayjs(selectedDate).format("DD/MM/YYYY") : ""}
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="mb-2 text-2xl font-bold text-gray-800">💰 Bảng giá chi tiết</h3>
                                    <p className="text-gray-600">Giá tour cho ngày đã chọn</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Người lớn */}
                                    <div className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-white bg-blue-500 rounded-full">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">Người lớn</div>
                                                    <div className="text-sm text-gray-600">(Từ 12 tuổi trở lên)</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {(selectedSlot?.tour?.finalPrice ?? selectedSlot?.tour?.price)?.toLocaleString('vi-VN')}
                                                </div>
                                                <div className="text-sm text-gray-600">VNĐ</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trẻ em */}
                                    <div className="p-6 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-white bg-green-500 rounded-full">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">Trẻ em</div>
                                                    <div className="text-sm text-gray-600">(Từ 5 đến 11 tuổi)</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {selectedSlot?.tour?.priceChildren?.toLocaleString('vi-VN')}
                                                </div>
                                                <div className="text-sm text-gray-600">VNĐ</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Em bé */}
                                    <div className="p-6 border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 text-white bg-yellow-500 rounded-full">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">Em bé</div>
                                                    <div className="text-sm text-gray-600">(Từ 2 đến 4 tuổi)</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {selectedSlot?.tour?.priceLittleBaby?.toLocaleString('vi-VN')}
                                                </div>
                                                <div className="text-sm text-gray-600">VNĐ</div>
                                            </div>
                                        </div>
                                    </div>

                                   
                                </div>

                                {/* Note */}
                                <div className="p-4 border border-blue-200 bg-blue-50 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-500 text-white rounded-full p-1 mt-0.5">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-blue-800">
                                            <div className="mb-1 font-semibold">Lưu ý về giá tour:</div>
                                            <ul className="space-y-1 text-blue-700">
                                                <li>• Giá đã bao gồm VAT và các phí dịch vụ</li>
                                                <li>• Trẻ em dưới 2 tuổi được miễn phí (không chiếm ghế, giường)</li>
                                                <li>• Giá có thể thay đổi tùy theo thời điểm cao điểm</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LeftTourDetail;
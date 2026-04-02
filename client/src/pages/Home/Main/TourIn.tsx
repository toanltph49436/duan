/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useRef, useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import instanceClient from '../../../../configs/instance';
import { TicketIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.15,
            duration: 0.6,
            ease: 'easeOut',
        },
    }),
};

const TourIn = () => {
    const { data } = useQuery({
        queryKey: ['tour'],
        queryFn: async () => instanceClient.get('/tour'),
    });


    const tours = data?.data?.tours?.filter((tour: any) => tour.tourType === 'noidia') || [];
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const [swiperInstance, setSwiperInstance] = useState<any>(null);

    useEffect(() => {
        if (swiperInstance && prevRef.current && nextRef.current) {
            swiperInstance.params.navigation.prevEl = prevRef.current;
            swiperInstance.params.navigation.nextEl = nextRef.current;

            swiperInstance.navigation.destroy();
            swiperInstance.navigation.init();
            swiperInstance.navigation.update();
        }
    }, [swiperInstance]);

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-blue-600 mb-3">
                        Tour Du Lịch Trong Nước
                    </h2>
                    <p className="text-blue-400 max-w-xl mx-auto text-lg">
                        Khám phá những điểm đến hấp dẫn với các tour du lịch được thiết kế đặc biệt dành cho bạn
                    </p>
                </div>

                <div className="relative w-full max-w-screen-5xl mx-auto pb-8 overflow-hidden">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={16}
                        slidesPerView={1}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop
                        onSwiper={(swiper) => setSwiperInstance(swiper)}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                        }}
                        className="pb-8"
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                    >
                        {tours.map((tour: any, index: number) => (
                            <SwiperSlide key={tour._id} className="h-auto">
                                <motion.div
                                    className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                    custom={index}
                                    variants={cardVariants}
                                >
                                    <div className="relative">
                                        <Link to={`/detailtour/${tour._id}`}>
                                            <img
                                                src={tour.imageTour[0]}
                                                alt={tour.nameTour}
                                                className="w-full object-cover aspect-[16/10]"
                                            />
                                        </Link>

                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <Link to={`/detailtour/${tour._id}`}>
                                            <h3 className="text-lg font-bold text-gray-800 leading-snug truncate line-clamp-2 min-h-[36px]">
                                                {tour.nameTour}
                                            </h3>
                                        </Link>


                                        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span className='line-clamp-1'>{tour.destination?.locationName} - {tour.destination?.country}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                <span className='line-clamp-1'>Thời gian: {tour.duration}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end min-h-[40px]">
                                            <div className="flex flex-col">
                                                <span className={`text-sm text-gray-400 line-through ${tour.price > tour.finalPrice ? '' : 'invisible'}`}>
                                                    {tour.price.toLocaleString('vi-VN')}đ
                                                </span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    Giá: {(tour.finalPrice ?? tour.price)?.toLocaleString('vi-VN') || "N/A"}đ
                                                </span>
                                            </div>

                                            {tour.discountPercent && (
                                                <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded border border-red-400">
                                                    <TicketIcon className="w-4 h-4" />
                                                    -{tour.discountPercent}%
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between text-sm mb-4 text-gray-600">
                                            <span>
                                                Còn lại: <strong>{tour.remainingSlots} chỗ</strong>
                                            </span>
                                            <Link to={`detailtour/${tour._id}`}>
                                                <span className="text-blue-600 hover:underline text-sm cursor-pointer">
                                                    Chi tiết
                                                </span>
                                            </Link>
                                        </div>
                                        <button className="mt-auto w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                                            Đặt ngay
                                        </button>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Nút điều hướng */}
                    <button
                        ref={prevRef}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-blue-100 transition"
                    >
                        <FaChevronLeft className="text-blue-600" />
                    </button>
                    <button
                        ref={nextRef}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-blue-100 transition"
                    >
                        <FaChevronRight className="text-blue-600" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TourIn;

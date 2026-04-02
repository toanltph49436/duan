import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import instanceClient from '../../../../configs/instance';
import { Link } from 'react-router-dom';

const International = () => {
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // gọi API lấy danh sách tours
    const { data } = useQuery({
        queryKey: ['tours'],
        queryFn: () => instanceClient.get('/tour'),
    });

    const tours = data?.data?.tours || [];

    return (
        <div className="min-h-full w-full flex flex-col items-center relative overflow-hidden py-12 sm:py-16">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
                {/* Heading */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start px-2 sm:px-4 md:px-6 lg:px-8 mb-10">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
                            Các gói du lịch trong nước & ngoài nước
                        </h2>
                        <div className="w-16 h-1 mt-2 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-full" />
                    </div>
                    <p className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed">
                        Khám phá những điểm đến tuyệt vời trong và ngoài nước với các gói tour được thiết kế hoàn hảo, 
                        mang đến trải nghiệm du lịch đáng nhớ và giá trị tốt nhất.
                    </p>
                </div>

                {/* Chỉ 1 slider chung cho tất cả tour */}
                <div className="relative w-full max-w-screen-xl mx-auto pb-8 overflow-hidden px-2 sm:px-4 md:px-6">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={16}
                        slidesPerView={1}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onSwiper={(swiper) => {
                            setTimeout(() => {
                                if (
                                    swiper.params.navigation &&
                                    typeof swiper.params.navigation !== 'boolean'
                                ) {
                                    swiper.params.navigation.prevEl = prevRef.current;
                                    swiper.params.navigation.nextEl = nextRef.current;
                                    swiper.navigation.destroy();
                                    swiper.navigation.init();
                                    swiper.navigation.update();
                                }
                            });
                        }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                        }}
                    >
                        {tours.map((tour: any) => (
                            <SwiperSlide key={tour._id}>
                                <article className="relative overflow-hidden rounded-xl shadow-md transition duration-300 hover:shadow-2xl group h-[320px]">
                                    <Link to={`/detailtour/${tour._id}`}>
                                     <img
                                        src={tour.imageTour?.[0]}
                                        alt={tour.nameTour}
                                        className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="relative bg-gradient-to-t from-black/70 to-black/10 h-full flex flex-col justify-end items-center text-center p-4">
                                        <h3 className="text-lg font-semibold text-white drop-shadow line-clamp-2">
                                            {tour.nameTour}
                                        </h3>
                                        <p className="text-sm text-white/90 mt-1">
                                            {tour.duration}
                                        </p>
                                        <p className="text-sm text-blue-300 mt-1">
                                            {tour.Address}
                                        </p>
                                    </div>
                                    </Link>
                                    
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Nút điều hướng */}
                    <button
                        ref={prevRef}
                        className="absolute top-1/2 left-2 -translate-y-1/2 z-10 bg-white text-gray-800 hover:bg-gray-100 hover:scale-110 p-2 rounded-full shadow-lg transition duration-300"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        ref={nextRef}
                        className="absolute top-1/2 right-2 -translate-y-1/2 z-10 bg-white text-gray-800 hover:scale-110 p-2 rounded-full shadow-lg transition duration-300"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default International;

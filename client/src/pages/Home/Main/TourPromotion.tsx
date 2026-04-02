/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import instanceClient from '../../../../configs/instance';
import { Link } from 'react-router-dom';

// Animation variants cho từng card
const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.1,
            duration: 0.6,
            ease: 'easeOut',
        },
    }),
};

const TourPromotion = () => {
    const { data } = useQuery({
        queryKey: ['featured'],
        queryFn: () => instanceClient.get('/featured')
    })
    const tours = data?.data?.tourFeatured || []
    
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-blue-600 mb-3">
                        Tour Du Lịch Nổi Bật
                    </h2>
                    <p className="text-blue-400 max-w-2xl mx-auto text-lg">
                        Khám phá những điểm đến hấp dẫn với các tour du lịch được thiết kế đặc biệt dành cho bạn
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.slice(0, 6).map((tour: any, index: number) => (
                        <motion.div
                            key={`${tour._id}-${index}`}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.4 }}
                            custom={index}
                            variants={cardVariants}
                        >
                            <div className="relative">
                                <Link to={`detailtour/${tour._id}`}>
                                    <img
                                        src={tour.imageTour[0]}
                                        alt={tour.nameTour}
                                        className="w-full object-cover"
                                    />
                                </Link>

                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                {/* Tên tour */}
                                <Link to={`detailtour/${tour._id}`}>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 leading-snug truncate">
                                        {tour.nameTour}
                                    </h3>
                                </Link>
                                {/* Ngày khởi hành, Địa điểm, Đánh giá */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{tour.destination?.locationName} - {tour.destination?.country}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>Thời gian: {tour.duration}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end min-h-[56px]">
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


                                {/* Còn chỗ + chi tiết */}
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
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="px-6 py-3 bg-white border border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300 shadow">
                        Xem thêm tour
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TourPromotion;

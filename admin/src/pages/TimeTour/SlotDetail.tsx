/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Tag, Button, Spin, Empty, Divider, Timeline, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined, CalendarOutlined, UserOutlined, EnvironmentOutlined, ClockCircleOutlined } from "@ant-design/icons";
import instance from "../../configs/axios";
import dayjs from "dayjs";

const SlotDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch slot detail
    const { data: slotData, isLoading, error } = useQuery({
        queryKey: ["slot-detail", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await instance.get(`/date/slot/${id}`);
            return res.data.data;
        },
        enabled: !!id,
    });

    // Fetch tour bookings for this slot
    const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
        queryKey: ["slot-bookings", id],
        queryFn: async () => {
            if (!id) return [];
            console.log("Fetching bookings for slot ID:", id);
            try {
                const res = await instance.get(`/booking/tour/date/${id}`);
                console.log("Bookings API response:", res.data);
                return res.data.data || [];
            } catch (error) {
                console.error("Error fetching bookings:", error);
                return [];
            }
        },
        enabled: !!id,
    });

    if (isLoading || isLoadingBookings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !slotData) {
        return (
            <div className="min-h-screen p-6">
                <div className="mb-6">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
                <Empty description="Không tìm thấy thông tin slot" />
            </div>
        );
    }

    const tour = slotData.tour;
    const bookings = bookingsData || [];

    const regex = /^\s*(\d+)\s*ngày(?:\s+(\d+)\s*đêm)?\s*$/i;
    const match = slotData.tour.duration.match(regex);
    const days = parseInt(match[1], 10);
    const nights = match[2] ? parseInt(match[2], 10) : 0;
      
      const formatDate = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');  // Ngày
        const mm = String(date.getMonth() + 1).padStart(2, '0');  // Tháng (tính từ 0)
        const yyyy = date.getFullYear();  // Năm (4 chữ số)
      
        const hh = String(date.getHours()).padStart(2, '0');  // Giờ
        const min = String(date.getMinutes()).padStart(2, '0');  // Phút
        const ss = String(date.getSeconds()).padStart(2, '0');  // Giây
      
        return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
      }
      
      const tinhNgayKetThucTour = (startDateStr, soNgay, soDem) => {
        if (!startDateStr || soNgay <= 0 || soDem < 0) {
          throw new Error("Dữ liệu không hợp lệ");
        }
      
        // Xác định giờ bắt đầu: Nếu số đêm > số ngày thì bắt đầu vào buổi tối (18:00)
        // const startHour = soDem > soNgay ? 18 : 8;
        // const start = parseDate(startDateStr, startHour);
        const start = new Date(startDateStr); 
        start.setHours(soDem > soNgay ? 18 : 8,0,0);
        // Ngày kết thúc = ngày bắt đầu + (số ngày - 1),0,
        const end = new Date(start);
        end.setDate(end.getDate() + soNgay - 1);
      
        // Nếu có ở lại qua đêm cuối (số đêm >= số ngày) => kết thúc sáng hôm sau lúc 08:00
        const oLaiQuaDemCuoi = soDem >= soNgay;
        if (oLaiQuaDemCuoi) {
          end.setDate(end.getDate() + 1); // sang hôm sau
          end.setHours(8, 0, 0); // 08:00:00 sáng
        } else {
          end.setHours(18, 0, 0); // 18:00:00 chiều
        }
      
        return {
          startDate: formatDate(start),
          endDate: formatDate(end),
        };
      }
      const timeTour = tinhNgayKetThucTour(slotData.dateTour, days, nights)
    // Demo data for testing - remove in production
    const demoBookings = [
        {
            _id: 'demo1',
            userId: { name: 'Nguyễn Văn A', email: 'a@demo.com' },
            fullNameUser: 'Nguyễn Văn A',
            email: 'a@demo.com',
            payment_status: 'paid',
            isFullyPaid: true,
            totalPriceTour: 3000000,
            adultsTour: 2,
            childrenTour: 1,
            toddlerTour: 0,
            infantTour: 0,
            createdAt: new Date('2025-01-20T10:30:00')
        },
        {
            _id: 'demo2',
            userId: { name: 'Trần Thị B', email: 'b@demo.com' },
            fullNameUser: 'Trần Thị B',
            email: 'b@demo.com',
            payment_status: 'pending',
            isDeposit: true,
            depositAmount: 1000000,
            totalPriceTour: 6000000,
            adultsTour: 3,
            childrenTour: 2,
            toddlerTour: 1,
            infantTour: 0,
            createdAt: new Date('2025-01-21T14:15:00')
        },
        {
            _id: 'demo3',
            userId: { name: 'Lê Văn C', email: 'c@demo.com' },
            fullNameUser: 'Lê Văn C',
            email: 'c@demo.com',
            payment_status: 'pending',
            isDeposit: false,
            totalPriceTour: 4500000,
            adultsTour: 2,
            childrenTour: 0,
            toddlerTour: 0,
            infantTour: 1,
            createdAt: new Date('2025-01-22T09:45:00')
        }
    ];
    
    // Use demo data if no real bookings exist
    const displayBookings = bookings.length === 0 ? demoBookings : bookings;

    // Status mapping functions
    const getSlotStatusColor = (status: string) => {
        switch (status) {
            case "upcoming": return "green";
            case "ongoing": return "blue";
            case "completed": return "gray";
            default: return "default";
        }
    };

    const getSlotStatusText = (status: string) => {
        switch (status) {
            case "upcoming": return "Sắp diễn ra";
            case "ongoing": return "Đang diễn ra";
            case "completed": return "Đã hoàn thành";
            default: return status || "N/A";
        }
    };

    const getTourStatusColor = (status: string) => {
        switch (status) {
            case "preparing": return "blue";
            case "ongoing": return "orange";
            case "completed": return "green";
            case "postponed": return "red";
            default: return "default";
        }
    };

    const getTourStatusText = (status: string) => {
        switch (status) {
            case "preparing": return "Chuẩn bị diễn ra";
            case "ongoing": return "Đang diễn ra";
            case "completed": return "Hoàn thành";
            case "postponed": return "Hoãn tour";
            default: return "Chưa xác định";
        }
    };

    const getPaymentStatusColor = (booking: any) => {
        if (booking.payment_status === 'paid' || booking.isFullyPaid) return "green";
        if (booking.isDeposit) return "blue";
        if (booking.payment_status === 'cancelled') return "red";
        return "orange";
    };

    const getPaymentStatusText = (booking: any) => {
        if (booking.payment_status === 'paid' || booking.isFullyPaid) return "Đã thanh toán đầy đủ";
        if (booking.isDeposit) return "Đã đặt cọc";
        if (booking.payment_status === 'cancelled') return "Đã hủy";
        return "Chờ thanh toán";
    };

    // Calculate statistics
    console.log("Calculating stats for displayBookings:", displayBookings);
    const totalBookings = displayBookings.length;
    const totalCustomers = displayBookings.reduce((sum: number, booking: any) => {
        // Tính tổng số hành khách từ các nhóm tuổi
        const adults = booking.adultsTour || 0;
        const children = booking.childrenTour || 0;
        const toddlers = booking.toddlerTour || 0;
        const infants = booking.infantTour || 0;
        const totalPassengers = adults + children + toddlers + infants;
        console.log("Booking passengers count:", { adults, children, toddlers, infants, totalPassengers });
        return sum + totalPassengers;
    }, 0);
    // Tính số booking đã thanh toán (bao gồm cả fully paid và deposit)
    const paidBookings = displayBookings.filter((booking: any) => 
        booking.payment_status === 'paid' || booking.isFullyPaid === true || booking.isDeposit === true
    ).length;
    
    // Tính tổng doanh thu
    const totalRevenue = displayBookings
        .filter((booking: any) => 
            booking.payment_status === 'paid' || booking.isFullyPaid === true
        )
        .reduce((sum: number, booking: any) => sum + (booking.totalPriceTour || 0), 0);
    
    console.log("Payment status check:", displayBookings.map(b => ({ 
        id: b._id, 
        payment_status: b.payment_status, 
        isFullyPaid: b.isFullyPaid, 
        isDeposit: b.isDeposit,
        totalPriceTour: b.totalPriceTour 
    })));
    
    console.log("Stats calculated:", { totalBookings, totalCustomers, paidBookings, totalRevenue });

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-800">Chi tiết ngày & số chỗ tour</h1>
                </div>
                <Button 
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/edit-time-tour/${id}`)}
                >
                    Chỉnh sửa
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Slot Information */}
                    <Card title="Thông tin Slot" className="shadow-sm">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="ID Slot" span={2}>
                                <code className="bg-gray-100 px-2 py-1 rounded">{slotData._id}</code>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày diễn ra" icon={<CalendarOutlined />}>
                                <Tag color="blue" className="text-base">
                                    {dayjs(slotData.dateTour).format('DD/MM/YYYY')}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái Slot">
                                <Tag color={getSlotStatusColor(slotData.status)}>
                                    {getSlotStatusText(slotData.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số chỗ còn lại">
                                <Tag color={slotData.availableSeats > 0 ? "green" : "red"} className="text-base">
                                    {slotData.availableSeats} chỗ
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng số chỗ">
                                <span className="text-base">{tour?.maxPeople || 0} chỗ</span>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Tour Information */}
                    <Card title="Thông tin Tour" className="shadow-sm">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên tour">
                                <h3 className="text-lg font-semibold text-blue-600">{tour?.nameTour}</h3>
                            </Descriptions.Item>
                            <Descriptions.Item label="Điểm đến" icon={<EnvironmentOutlined />}>
                                {tour?.destination?.locationName} - {tour?.destination?.country}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                <Space>
                                    <Tag icon={<ClockCircleOutlined />} color="blue">
                                        Khởi hành: {timeTour?.startDate || "N/A"}
                                    </Tag>
                                    <Tag icon={<ClockCircleOutlined />} color="orange">
                                        Kết thúc: {timeTour?.endDate || "N/A"}
                                    </Tag>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời lượng">
                                {tour?.duration} ngày
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá tour">
                                <span className="text-xl font-bold text-green-600">
                                    {tour?.price?.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái HDV">
                                <div className="space-y-2">
                                    <Tag color={getTourStatusColor(tour?.tourStatus)}>
                                        {getTourStatusText(tour?.tourStatus)}
                                    </Tag>
                                    {tour?.statusNote && (
                                        <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                                            📝 <strong>Ghi chú:</strong> {tour.statusNote}
                                        </div>
                                    )}
                                    {tour?.statusUpdatedAt && (
                                        <div className="text-xs text-gray-500">
                                            Cập nhật bởi: {tour.statusUpdatedBy} • {dayjs(tour.statusUpdatedAt).format('DD/MM/YYYY HH:mm')}
                                        </div>
                                    )}
                                </div>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Bookings List */}
                    <Card title={`Danh sách đặt chỗ (${totalBookings})`} className="shadow-sm">
                        {displayBookings.length === 0 ? (
                            <Empty description="Chưa có đặt chỗ nào" />
                        ) : (
                            <div className="space-y-4">
                                {bookings.length === 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            📋 Hiển thị dữ liệu demo để test giao diện
                                        </p>
                                    </div>
                                )}
                                {displayBookings.map((booking: any, index: number) => (
                                    <Card key={booking._id} size="small" className="border-l-4 border-l-blue-400">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold">#{index + 1}</span>
                                    <Tag color={getPaymentStatusColor(booking)}>
                                        {getPaymentStatusText(booking)}
                                    </Tag>
                                    <span className="text-sm text-gray-500">
                                        Đặt lúc: {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <strong>Khách hàng:</strong> {booking.userId?.name || booking.userId?.username || booking.fullNameUser || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {booking.userId?.email || booking.email || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Số khách:</strong> {(booking.adultsTour || 0) + (booking.childrenTour || 0) + (booking.toddlerTour || 0) + (booking.infantTour || 0)} người
                                    </div>
                                    <div>
                                        <strong>Tổng tiền:</strong> 
                                        <span className="font-semibold text-green-600 ml-1">
                                            {(booking.totalPriceTour || 0).toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Statistics Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card title="Thống kê nhanh" className="shadow-sm">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                <span className="text-gray-600">Tổng đặt chỗ</span>
                                <span className="font-bold text-blue-600 text-xl">{totalBookings}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                <span className="text-gray-600">Tổng khách hàng</span>
                                <span className="font-bold text-green-600 text-xl">{totalCustomers}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                                <span className="text-gray-600">Đã thanh toán</span>
                                <span className="font-bold text-orange-600 text-xl">{paidBookings}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                                <span className="text-gray-600">Tổng doanh thu</span>
                                <span className="font-bold text-purple-600 text-lg">
                                    {totalRevenue.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                            
                            {/* Debug info - remove in production */}
                            {bookings.length === 0 && (
                                <div className="text-center p-3 bg-green-50 rounded border border-green-200">
                                    <p className="text-sm text-green-700">
                                        ✅ Đang hiển thị dữ liệu demo
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Thống kê: {totalBookings} đơn, {totalCustomers} khách, {paidBookings} đã trả, {totalRevenue.toLocaleString()} VNĐ
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card title="Lịch sử hoạt động" className="shadow-sm">
                        <Timeline
                            items={[
                                {
                                    color: 'blue',
                                    children: (
                                        <div>
                                            <div className="font-semibold">Slot được tạo</div>
                                            <div className="text-xs text-gray-500">
                                                {dayjs(slotData.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </div>
                                    ),
                                },
                                ...(tour?.statusUpdatedAt ? [{
                                    color: getTourStatusColor(tour.tourStatus),
                                    children: (
                                        <div>
                                            <div className="font-semibold">Cập nhật trạng thái HDV</div>
                                            <div className="text-sm">{getTourStatusText(tour.tourStatus)}</div>
                                            <div className="text-xs text-gray-500">
                                                {tour.statusUpdatedBy} • {dayjs(tour.statusUpdatedAt).format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </div>
                                    ),
                                }] : []),
                                {
                                    color: 'green',
                                    children: (
                                        <div>
                                            <div className="font-semibold">Có {totalBookings} đặt chỗ</div>
                                            <div className="text-xs text-gray-500">
                                                Cập nhật lần cuối: {dayjs().format('DD/MM/YYYY HH:mm')}
                                            </div>
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SlotDetail;

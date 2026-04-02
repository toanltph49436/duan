/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Card, Typography, Spin, Space } from "antd";
import { HomeOutlined, StarOutlined } from "@ant-design/icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import instance from "../../configs/axios";

const { Title, Text } = Typography;

const PopularHotels = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["checkOutBookingHotel"],
        queryFn: () => instance.get("/checkOutBookingHotel"),
    });

    const bookings = data?.data?.data || [];
    console.log("phobien",bookings);
    
    // Debug: Kiểm tra dữ liệu thô
    if (bookings.length > 0) {
        console.log("First booking sample:", {
            hotelId: bookings[0].hotelId,
            hotelName: bookings[0].hotelId?.hotelName,
            bookingStatus: bookings[0].booking_status,
            paymentStatus: bookings[0].payment_status,
            totalPrice: bookings[0].totalPrice
        });
    }
    
    // Lấy tất cả bookings để hiển thị khách sạn phổ biến
    const allBookings = bookings;
    
    // Chỉ lấy các booking đã hoàn thành cho thống kê doanh thu
    const completedBookings = bookings.filter(
        (b: any) => b.booking_status === "confirmed" || b.booking_status === "completed" || b.payment_status === "completed"
    );

    // Thống kê theo khách sạn (sử dụng tất cả bookings)
    const hotelStats = allBookings.reduce((acc: any, booking: any) => {
        const hotelId = booking.hotelId?._id;
        const hotelName = booking.hotelId?.hotelName;
        
        if (!hotelId) return acc;

        if (!acc[hotelId]) {
            acc[hotelId] = {
                id: hotelId,
                name: hotelName,
                bookingCount: 0,
                totalRevenue: 0,
                rooms: new Set()
            };
        }

        const totalRooms = booking.roomBookings?.reduce((sum: any, room: any) => sum + room.numberOfRooms, 0) || 0;
        acc[hotelId].bookingCount += totalRooms;
        
        // Chỉ tính doanh thu từ các booking đã hoàn thành
        if (booking.booking_status === "confirmed" || booking.booking_status === "completed" || booking.payment_status === "completed") {
            acc[hotelId].totalRevenue += booking.totalPrice || 0;
        }
        
        // Thêm tên các loại phòng
        if (booking.roomBookings) {
            booking.roomBookings.forEach((room: any) => {
                if (room.roomTypeName) {
                    acc[hotelId].rooms.add(room.roomTypeName);
                }
            });
        }

        return acc;
    }, {});

    // Chuyển đổi thành array và sắp xếp theo số lượng đặt
    const popularHotels = Object.values(hotelStats)
        .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
        .slice(0, 5);

    console.log("Hotel stats:", hotelStats);
    console.log("Popular hotels:", popularHotels);

    // Debug: Hiển thị dữ liệu thô
    const debugInfo = {
        totalBookings: bookings.length,
        bookingsWithHotelId: bookings.filter((b: any) => b.hotelId?._id).length,
        bookingsWithHotelName: bookings.filter((b: any) => b.hotelId?.hotelName).length,
        uniqueHotels: Object.keys(hotelStats).length,
        hotelNames: Object.values(hotelStats).map((h: any) => h.name)
    };
    console.log("Debug info:", debugInfo);

    // Màu sắc cho biểu đồ
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

    // Chuẩn bị dữ liệu cho biểu đồ
    const pieData = popularHotels.map((hotel: any, index: number) => ({
        name: hotel.name,
        value: hotel.bookingCount,
        revenue: hotel.totalRevenue,
        color: COLORS[index % COLORS.length]
    }));

    return (
        <Card
            style={{
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "none",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                height: "100%",
            }}
            title={
                <Space>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <StarOutlined style={{ fontSize: 20, color: "white" }} />
                    </div>
                    <Title level={4} style={{ margin: 0 }}>
                        Khách sạn phổ biến
                    </Title>
                </Space>
            }
        >
            {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: 16, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: 12 }}>
                        <strong>Debug:</strong> {debugInfo.totalBookings} bookings, {debugInfo.bookingsWithHotelId} with hotelId, {debugInfo.uniqueHotels} unique hotels
                        <br />
                        <strong>Hotel names:</strong> {debugInfo.hotelNames.join(', ')}
                    </div>
                    
                    {pieData.length > 0 ? (
                        <div style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any, props: any) => [
                                            `${value} phòng`,
                                            `${props.payload.name}`
                                        ]}
                                        labelFormatter={(label) => `Khách sạn: ${label}`}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        formatter={(value, entry, index) => (
                                            <span style={{ color: COLORS[index % COLORS.length] }}>
                                                {value} - {pieData[index]?.value || 0} phòng
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <HomeOutlined style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }} />
                            <div style={{ color: "#999" }}>Chưa có dữ liệu đặt phòng</div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default PopularHotels;

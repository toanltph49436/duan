/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Space, Typography } from "antd";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import instance from "../../configs/axios";

const HotelWeeklyStatistics = () => {
    const { Text } = Typography;

    const { data } = useQuery({
        queryKey: ["checkOutBookingHotel"],
        queryFn: () => instance.get("/checkOutBookingHotel"),
    });

    const bookings: any[] = data?.data?.data || [];

    // Ngày bắt đầu tuần hiện tại (T2)
    const now = dayjs();
    const startOfWeek = now.startOf('week').add(1, 'day'); // dayjs tuần bắt đầu từ CN, +1 để ra T2

    // Tạo mảng 7 ngày trong tuần
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

    // Dữ liệu chart
    const chartData = daysOfWeek.map(day => {
        const dayBookings = bookings.filter(b =>
            b.checkInDate && dayjs(b.checkInDate).isSame(day, 'day')
        );
        const totalRevenue = dayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        return {
            day: `T${day.day() === 0 ? 7 : day.day()}`, // T2-T7, CN
            bookings: dayBookings.length,
            revenue: totalRevenue
        };
    });

    // Tổng doanh thu tuần
    const totalRevenueWeek = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookingsWeek = chartData.reduce((sum, d) => sum + d.bookings, 0);

    return (
        <Col xs={24} lg={12}>
            <Card
                style={{
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                }}
                title={
                    <Space direction="vertical" size={4}>
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
                                <CalendarOutlined style={{ fontSize: 20, color: "white" }} />
                            </div>
                            <Text strong style={{ fontSize: 18 }}>
                                📊 Đặt phòng theo tuần
                            </Text>
                        </Space>
                        <Text>Số phòng tuần này: {totalBookingsWeek}</Text>
                        <Text>Doanh thu tuần: {totalRevenueWeek ? (totalRevenueWeek / 1_000_000).toFixed(1) : 0}M VNĐ</Text>
                    </Space>
                }
            >
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                            formatter={(value: any, name: any) => [
                                name === 'bookings' ? `${value} phòng` : `${(value / 1_000_000).toFixed(1)}M VNĐ`,
                                name === 'bookings' ? 'Số phòng' : 'Doanh thu'
                            ]}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="bookings" fill="#667eea" name="Số phòng" />
                        <Bar yAxisId="right" dataKey="revenue" fill="#764ba2" name="Doanh thu" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Col>
    );
};

export default HotelWeeklyStatistics;

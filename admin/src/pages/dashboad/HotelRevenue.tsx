/* eslint-disable @typescript-eslint/no-explicit-any */
import { DollarOutlined } from "@ant-design/icons";
import { Card, Col,  Space, Typography } from "antd";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import instance from "../../configs/axios";
import dayjs from "dayjs";

const HotelRevenue = () => {
    const { Text } = Typography;

    const { data } = useQuery({
        queryKey: ["checkOutBookingHotel"],
        queryFn: () => instance.get("/checkOutBookingHotel"),
    });

    const bookings: any[] = data?.data?.data || [];

    // Tạo danh sách 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Nhóm dữ liệu theo tháng
    const chartData = months.map(month => {
        const monthBookings = bookings.filter(b =>
            b.checkInDate && dayjs(b.checkInDate).month() + 1 === month
        );
        const totalRevenue = monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        return {
            month: `Tháng ${month}`,
            revenue: totalRevenue,
            bookings: monthBookings.length,
        };
    });

    // Tổng doanh thu và tổng phòng
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalBookings = chartData.reduce((sum, d) => sum + d.bookings, 0);

    const customTicks = [10_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000];

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
                                    <DollarOutlined style={{ fontSize: 20, color: "white" }} />
                                </div>
                                <Text strong style={{ fontSize: 18 }}>
                                    📈 Doanh thu & số phòng theo tháng
                                </Text>
                            </Space>
                            <Text>Tổng số phòng: {totalBookings}</Text>
                            <Text>Tổng doanh thu: {totalRevenue ? (totalRevenue / 1_000_000).toFixed(1) : 0}M VNĐ</Text>
                        </Space>
                    }
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip 
                                formatter={(value: any, name: any) => [
                                    name === 'bookings' ? `${value} phòng` : `${(value / 1_000_000).toFixed(1)}M VNĐ`,
                                    name === 'bookings' ? 'Số phòng' : 'Doanh thu'
                                ]}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#667eea" strokeWidth={3} dot={{ r: 5 }} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#764ba2" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
    );
};

export default HotelRevenue;

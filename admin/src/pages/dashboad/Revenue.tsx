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

const RevenueMonthly = () => {
    const { Text } = Typography;

    const { data } = useQuery({
        queryKey: ["checkOutBookingTour"],
        queryFn: () => instance.get("/checkOutBookingTour"),
    });

    const bookings: any[] = data?.data?.data || [];

    // Tạo danh sách 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Nhóm dữ liệu theo tháng
    const chartData = months.map(month => {
        const monthBookings = bookings.filter(b =>
            b.slotId?.dateTour && dayjs(b.slotId.dateTour).month() + 1 === month
        );
        const totalRevenue = monthBookings.reduce((sum, b) => sum + (b.totalPriceTour || 0), 0);
        return {
            month: `Tháng ${month}`,
            revenue: totalRevenue,
            bookings: monthBookings.length,
        };
    });

    // Tổng doanh thu và tổng tour
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
                                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <DollarOutlined style={{ fontSize: 20, color: "white" }} />
                                </div>
                                <Text strong style={{ fontSize: 18 }}>
                                    📈 Doanh thu & số tour theo tháng
                                </Text>
                            </Space>
                            <Text>Tổng số tour: {totalBookings}</Text>
                            <Text>Tổng doanh thu: {(totalRevenue / 1_000_000).toFixed(1)}M VNĐ</Text>
                        </Space>
                    }
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 12 }} axisLine={{ stroke: "#d9d9d9" }} />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: "#666", fontSize: 12 }}
                                axisLine={{ stroke: "#d9d9d9" }}
                                label={{ value: "Số tour", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
                            />
                            <YAxis
                                yAxisId="right"
                                ticks={customTicks}
                                tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                                tick={{ fill: "#666", fontSize: 12 }}
                                axisLine={{ stroke: "#d9d9d9" }}
                                domain={[0, 50_000_000]}
                                label={{ value: "Doanh thu (VNĐ)", angle: 90, position: "insideRight", style: { textAnchor: "middle" } }}
                            />
                            <Tooltip
                                formatter={(value: any, name: string) => [
                                    name === "bookings"
                                        ? `${value} tour`
                                        : `${(value / 1_000_000).toFixed(1)}M VNĐ`,
                                    name === "bookings" ? "Số tour" : "Doanh thu",
                                ]}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#43e97b" strokeWidth={3} dot={{ r: 5 }} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f093fb" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>


    );
};

export default RevenueMonthly;

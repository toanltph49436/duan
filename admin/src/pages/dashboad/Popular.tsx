/* eslint-disable @typescript-eslint/no-explicit-any */
import { FireOutlined } from "@ant-design/icons";
import { Card, Col, Space, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import instance from "../../configs/axios";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const Popular = () => {
    const { Text } = Typography;

    const { data } = useQuery({
        queryKey: ["checkOutBookingTour"],
        queryFn: () => instance.get("/checkOutBookingTour"),
    });

    const bookings: any[] = data?.data?.data || [];
    
    // Nhóm theo tour
    const tourMap: Record<string, { name: string; tours: number; revenue: number }> = {};

    bookings.forEach(b => {
        const tourName = b.slotId?.tour?.nameTour || "Không xác định";
        if (!tourMap[tourName]) {
            tourMap[tourName] = { name: tourName, tours: 0, revenue: 0 };
        }
        tourMap[tourName].tours += 1;
        tourMap[tourName].revenue += b.totalPriceTour || 0;
    });

    const truncate = (str: string, length: number = 10) =>
        str.length > length ? str.slice(0, length) + "..." : str;

    // Chuyển thành mảng và lấy top 5
    const serviceDistributionData = Object.values(tourMap)
        .sort((a, b) => b.tours - a.tours)
        .slice(0, 5)
        .map((item, index) => ({
            ...item,
            name: truncate(item.name, 10), // cắt tên tour
            value: item.tours, // Dùng cho PieChart
            color: ["#43e97b", "#38f9d7", "#4facfe", "#f093fb", "#f5576c"][index],
        }));
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
                    <Space>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FireOutlined style={{ fontSize: 20, color: "white" }} />
                        </div>
                        <Text strong style={{ fontSize: 18 }}>
                            🎯 Top 5 Tour Đặt Nhiều Nhất
                        </Text>
                    </Space>
                }
            >
                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={serviceDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent, tours, revenue }) =>
                                `${name}\n${((percent || 0) * 100).toFixed(0)}% | ${tours} tour\n${(revenue / 1_000_000).toFixed(1)}M VNĐ`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {serviceDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any, name: any, props: any) => {
                                if (name === "value") return [`${value}%`, "Tỷ lệ"];
                                if (name === "tours") return [`${props.payload.tours} tour`, "Số tour đặt"];
                                if (name === "revenue") return [`${(props.payload.revenue / 1_000_000).toFixed(1)}M VNĐ`, "Doanh thu"];
                                return [value, name];
                            }}
                            contentStyle={{
                                borderRadius: 8,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                background: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                            }}
                        />
                        <Legend
                            formatter={(value, entry, index) => {
                                const data = serviceDistributionData[index];
                                return (
                                    <span style={{ color: "#666" }}>
                                        {value} - {data.tours} tour - {(data.revenue / 1_000_000).toFixed(1)}M VNĐ
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </Col>
    );
};

export default Popular;

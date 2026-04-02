/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Space, Typography, Spin } from "antd";
import instance from "../../configs/axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const SumTour = () => {
    const { Text } = Typography;

    const { data, isLoading } = useQuery({
        queryKey: ["checkOutBookingTour"],
        queryFn: () => instance.get("/checkOutBookingTour"),
    });

    const bookings = data?.data?.data || [];

    // Chỉ lấy các tour đã hoàn thành
    const completedBookings = bookings.filter(
        (b: any) => b.payment_status === "completed" && b.fullPaidAt
    );

    // Mốc thời gian
    const today = dayjs().startOf("day");
    const startOfWeek = dayjs().startOf("week").startOf("day");
    const endOfWeek = dayjs().endOf("week").endOf("day");
    const startOfMonth = dayjs().startOf("month").startOf("day");
    const endOfMonth = dayjs().endOf("month").endOf("day");

    // Count
    const todayCount = completedBookings.filter((b: any) =>
        dayjs(b.createdAt).isSame(today, "day")
    ).length;

    const weekCount = completedBookings.filter((b: any) =>
        dayjs(b.createdAt).isBetween(startOfWeek, endOfWeek, null, "[]")
    ).length;

    const monthCount = completedBookings.filter((b: any) =>
        dayjs(b.createdAt).isBetween(startOfMonth, endOfMonth, null, "[]")
    ).length;

    // Doanh thu
    const todayRevenue = completedBookings
        .filter((b:any) => dayjs(b.createdAt).isSame(today, "day"))
        .reduce((sum:any, b:any) => sum + (b.totalPriceTour || 0), 0);

    const weekRevenue = completedBookings
        .filter((b: any) => dayjs(b.createdAt).isBetween(startOfWeek, endOfWeek, null, "[]"))
        .reduce((sum:any, b:any) => sum + (b.totalPriceTour || 0), 0);

    const monthRevenue = completedBookings
        .filter((b: any) => dayjs(b.createdAt).isBetween(startOfMonth, endOfMonth, null, "[]"))
        .reduce((sum:any, b:any) => sum + (b.totalPriceTour || 0), 0);

    const totalRevenue = completedBookings.reduce(
        (sum:any, b:any) => sum + (b.totalPriceTour || 0),
        0
    );

    return (
        <div>
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} lg={24}>
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
                                        background:
                                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <CalendarOutlined style={{ fontSize: 20, color: "white" }} />
                                </div>
                                <Text strong style={{ fontSize: 18 }}>
                                    Tổng tour đã đặt & Doanh thu
                                </Text>
                            </Space>
                        }
                    >
                        {isLoading ? (
                            <Spin />
                        ) : (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    background:
                                        "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)",
                                    borderRadius: 12,
                                    margin: "16px 0",
                                }}
                            >
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background:
                                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 24px",
                                        boxShadow: "0 8px 25px rgba(79, 172, 254, 0.3)",
                                    }}
                                >
                                    <CalendarOutlined style={{ fontSize: 36, color: "white" }} />
                                </div>

                                <div style={{ marginBottom: 32 }}>
                                    <Text
                                        style={{
                                            fontSize: 18,
                                            color: "#666",
                                            marginBottom: 16,
                                            display: "block",
                                        }}
                                    >
                                        Tổng cộng:{" "}
                                        <strong style={{ color: "#4facfe" }}>
                                            {completedBookings.length}
                                        </strong>{" "}
                                        tour -{" "}
                                        <strong style={{ color: "#00f2fe" }}>
                                            {(totalRevenue / 1000000).toFixed(1)}M VNĐ
                                        </strong>
                                    </Text>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-around",
                                        marginTop: 24,
                                        flexWrap: "wrap",
                                        gap: "16px",
                                    }}
                                >
                                    <div style={{ textAlign: "center", minWidth: "120px" }}>
                                        <div
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 700,
                                                color: "#4facfe",
                                                marginBottom: 8,
                                            }}
                                        >
                                            {todayCount}
                                        </div>
                                        <Text style={{ color: "#666", fontSize: 14 }}>Hôm nay</Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#4facfe",
                                                marginTop: 4,
                                            }}
                                        >
                                            {(todayRevenue / 1000000).toFixed(1)}M VNĐ
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center", minWidth: "120px" }}>
                                        <div
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 700,
                                                color: "#00f2fe",
                                                marginBottom: 8,
                                            }}
                                        >
                                            {weekCount}
                                        </div>
                                        <Text style={{ color: "#666", fontSize: 14 }}>Tuần này</Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#00f2fe",
                                                marginTop: 4,
                                            }}
                                        >
                                            {(weekRevenue / 1000000).toFixed(1)}M VNĐ
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "center", minWidth: "120px" }}>
                                        <div
                                            style={{
                                                fontSize: 24,
                                                fontWeight: 700,
                                                color: "#667eea",
                                                marginBottom: 8,
                                            }}
                                        >
                                            {monthCount}
                                        </div>
                                        <Text style={{ color: "#666", fontSize: 14 }}>Tháng này</Text>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#667eea",
                                                marginTop: 4,
                                            }}
                                        >
                                            {(monthRevenue / 1000000).toFixed(1)}M VNĐ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SumTour;

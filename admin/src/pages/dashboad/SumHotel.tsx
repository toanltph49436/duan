/* eslint-disable @typescript-eslint/no-explicit-any */
import { HomeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Space, Typography, Spin } from "antd";
import instance from "../../configs/axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isBetween);
dayjs.extend(isoWeek); // tuần bắt đầu từ thứ 2

const SumHotel = () => {
  const { Text } = Typography;

  const { data, isLoading } = useQuery({
    queryKey: ["checkOutBookingHotel"],
    queryFn: () => instance.get("/checkOutBookingHotel"),
  });

  const bookings = data?.data?.data || [];

  // Mốc thời gian
  const todayStart = dayjs().startOf("day");
  const todayEnd = dayjs().endOf("day");

  const weekStart = dayjs().startOf("isoWeek");
  const weekEnd = dayjs().endOf("isoWeek");

  const monthStart = dayjs().startOf("month");
  const monthEnd = dayjs().endOf("month");

  // Số lượng booking
  const todayCount = bookings.filter(b =>
    dayjs(b.createdAt).isBetween(todayStart, todayEnd, null, "[]")
  ).length;

  const weekCount = bookings.filter(b =>
    dayjs(b.createdAt).isBetween(weekStart, weekEnd, null, "[]")
  ).length;

  const monthCount = bookings.filter(b =>
    dayjs(b.createdAt).isBetween(monthStart, monthEnd, null, "[]")
  ).length;

  // Doanh thu (nếu muốn)
  const todayRevenue = bookings
    .filter(b => dayjs(b.createdAt).isBetween(todayStart, todayEnd, null, "[]"))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const weekRevenue = bookings
    .filter(b => dayjs(b.createdAt).isBetween(weekStart, weekEnd, null, "[]"))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const monthRevenue = bookings
    .filter(b => dayjs(b.createdAt).isBetween(monthStart, monthEnd, null, "[]"))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

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
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeOutlined style={{ fontSize: 20, color: "white" }} />
                </div>
                <Text strong style={{ fontSize: 18 }}>
                  Tổng phòng đã đặt & Doanh thu
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
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                  borderRadius: 12,
                  margin: "16px 0",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <HomeOutlined style={{ fontSize: 36, color: "white" }} />
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
                    <strong style={{ color: "#667eea" }}>{bookings.length}</strong> phòng -{" "}
                    <strong style={{ color: "#764ba2" }}>
                      {totalRevenue ? (totalRevenue / 1000000).toFixed(1) : 0}M VNĐ
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
                        color: "#667eea",
                        marginBottom: 8,
                      }}
                    >
                      {todayCount}
                    </div>
                    <Text style={{ color: "#666", fontSize: 14 }}>Hôm nay</Text>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#667eea",
                        marginTop: 4,
                      }}
                    >
                      {todayRevenue ? (todayRevenue / 1000000).toFixed(1) : 0}M VNĐ
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "120px" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#764ba2",
                        marginBottom: 8,
                      }}
                    >
                      {weekCount}
                    </div>
                    <Text style={{ color: "#666", fontSize: 14 }}>Tuần này</Text>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#764ba2",
                        marginTop: 4,
                      }}
                    >
                      {weekRevenue ? (weekRevenue / 1000000).toFixed(1) : 0}M VNĐ
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "120px" }}>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#4facfe",
                        marginBottom: 8,
                      }}
                    >
                      {monthCount}
                    </div>
                    <Text style={{ color: "#666", fontSize: 14 }}>Tháng này</Text>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4facfe",
                        marginTop: 4,
                      }}
                    >
                      {monthRevenue ? (monthRevenue / 1000000).toFixed(1) : 0}M VNĐ
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

export default SumHotel;

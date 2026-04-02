/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tag, Space, Typography, Spin, Avatar } from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import instance from "../../configs/axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const HotelRecently = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["checkOutBookingHotel"],
    queryFn: () => instance.get("/checkOutBookingHotel"),
  });

  const bookings = data?.data?.data || [];

  // Sắp xếp theo thời gian tạo mới nhất và lấy 10 booking gần đây
  const recentBookings = bookings
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Hàm lấy màu trạng thái
  const getStatusColor = (record: any) => {
    const status = record.booking_status || record.payment_status || record.checkIn_status || "unknown";
    switch (status) {
      case "completed":
      case "confirmed":
        return "green";
      case "pending":
      case "pending_payment":
        return "orange";
      case "cancelled":
      case "pending_cancellation":
        return "red";
      default:
        return "default";
    }
  };

  // Hàm lấy text trạng thái
  const getStatusText = (record: any) => {
    const status = record.booking_status || record.payment_status || record.checkIn_status || "unknown";
    switch (status) {
      case "completed":
      case "confirmed":
        return "Hoàn thành";
      case "pending":
      case "pending_payment":
        return "Chờ thanh toán";
      case "cancelled":
        return "Đã hủy";
      case "pending_cancellation":
        return "Chờ hủy";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.fullNameUser || record.userId?.fullName || "Khách hàng"}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email || record.userId?.email || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Khách sạn",
      key: "hotel",
      render: (record: any) => (
        <Space>
          <HomeOutlined style={{ color: "#667eea" }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.hotelId?.hotelName || "N/A"}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.roomBookings?.map((room: any) => room.roomTypeName).join(", ") || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Ngày đặt",
      key: "checkIn",
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{dayjs(record.checkInDate).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.checkOutDate).format("DD/MM/YYYY")}
          </Text>
        </div>
      ),
    },
    {
      title: "Số phòng",
      key: "quantity",
      render: (record: any) => {
        const totalRooms = record.roomBookings?.reduce((sum: any, room: any) => sum + room.numberOfRooms, 0) || 0;
        return (
          <Tag color="blue" style={{ fontWeight: 500 }}>
            {totalRooms} phòng
          </Tag>
        );
      },
    },
    {
      title: "Tổng tiền",
      key: "totalPrice",
      render: (record: any) => (
        <div style={{ fontWeight: 600, color: "#667eea" }}>
          {record.totalPrice ? (record.totalPrice / 1000000).toFixed(1) : 0}M VNĐ
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (record: any) => (
        <Tag color={getStatusColor(record)}>
          {getStatusText(record)}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      key: "createdAt",
      render: (record: any) => (
        <Text type="secondary">{dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
      ),
    },
  ];

  return (
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
          <Title level={4} style={{ margin: 0 }}>
            Đặt phòng gần đây
          </Title>
        </Space>
      }
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={recentBookings}
          columns={columns}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 800 }}
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: 12,
          }}
        />
      )}
    </Card>
  );
};

export default HotelRecently;

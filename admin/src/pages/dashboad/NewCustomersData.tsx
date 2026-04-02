/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Space, Typography, Spin } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import instance from "../../configs/axios";

const NewCustomersChart = () => {
    const { Text } = Typography;
    const { data: userData, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: () => instance.get("/user"),
    });

    const users = userData?.data?.user || [];

    // Mốc tháng hiện tại
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Tính số lượng
    const newCustomers = users.filter(
        (user: any) => new Date(user.createdAt) >= startOfMonth && new Date(user.createdAt) <= endOfMonth
    ).length;

    const returningCustomers = users.filter(
        (user: any) => new Date(user.createdAt) < startOfMonth
    ).length;

    // Dữ liệu cho biểu đồ
    const chartData = [
        { type: "Khách hàng mới", count: newCustomers },
        { type: "Khách hàng cũ", count: returningCustomers },
    ];

    return (
        <Col xs={24} lg={12}>
            <Card
                style={{
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                }}
                title={
                    <Space>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <UserOutlined style={{ fontSize: 20, color: 'white' }} />
                        </div>
                        <Text strong style={{ fontSize: 18 }}>👥 Khách hàng mới vs Khách hàng cũ</Text>
                    </Space>
                }
            >
                {isLoading ? (
                    <Spin />
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" tick={{ fontSize: 14, fill: "#666" }} />
                            <YAxis tick={{ fontSize: 14, fill: "#666" }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#667eea" barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Card>
        </Col>
    );
};

export default NewCustomersChart;

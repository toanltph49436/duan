/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Select, Tag, Button, Popconfirm, message, DatePicker, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../configs/axios";
import dayjs from "dayjs";
import { EditOutlined, DeleteOutlined, FilterOutlined, EyeOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const ListTime = () => {
    const [selectedTour, setSelectedTour] = useState<string | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();

    // Fetch all tours
    const { data: tourData, isLoading: isTourLoading } = useQuery({
        queryKey: ["tour"],
        queryFn: async () => instance.get("/tour"),
    });
    const tours = tourData?.data?.tours || [];

    // Fetch all slots if no tour is selected, or slots for selected tour
    const { data: slotData, isLoading: isSlotLoading } = useQuery({
        queryKey: ["slots", selectedTour],
        queryFn: async () => {
            if (!selectedTour) {
                // Fetch all slots from all tours
                const res = await instance.get(`/status/all`);
                return res.data.data || [];
            }
            const res = await instance.get(`/date/tour/${selectedTour}`);
            return res.data.data || [];
        },
        // Always enabled, even without selectedTour
        enabled: true,
    });
    
    // Apply date range filter
    const applyFilters = () => {
        let filtered = slotData || [];
        
        // Apply date range filter if set
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = dateRange[0].startOf('day');
            const endDate = dateRange[1].endOf('day');
            
            filtered = filtered.filter((slot: any) => {
                const slotDate = dayjs(slot.dateTour);
                return slotDate.isAfter(startDate) && slotDate.isBefore(endDate);
            });
        }
        
        return filtered;
    };
    
    // Update filtered slots whenever data or filters change
    const slots = applyFilters();

    // Delete slot mutation
    const { mutate: deleteSlot, isPending: isDeleting } = useMutation({
        mutationFn: async (slotId: string) => {
            return await instance.delete(`/date/slot/${slotId}`);
        },
        onSuccess: () => {
            messageApi.success("Xóa slot thành công!");
            queryClient.invalidateQueries({ queryKey: ["slots", selectedTour] });
        },
        onError: () => {
            messageApi.error("Xóa slot thất bại!");
        },
    });

    // Table columns
    const columns = [
        {
            title: "Tên Tour",
            dataIndex: ["tour", "nameTour"],
            key: "tourName",
            render: (_: string, record: any) => (
                <span>{record.tour?.nameTour || "N/A"}</span>
            ),
        },
        {
            title: "Điểm đến",
            key: "destination",
            render: (_: any, record: any) => {
                console.log("Record data:", record);
                console.log("Tour data:", record.tour);
                console.log("Destination data:", record.tour?.destination);
                
                // Kiểm tra xem destination có được populate không
                const destination = record.tour?.destination;
                
                if (destination && typeof destination === 'object') {
                    // Destination được populate đầy đủ
                    return (
                        <span>
                            {destination.locationName || "N/A"} - {destination.country || "N/A"}
                        </span>
                    );
                } else if (destination && typeof destination === 'string') {
                    // Destination chỉ là ObjectId string
                    return <span>ID: {destination}</span>;
                } else {
                    return <span>N/A - N/A</span>;
                }
            },
        },
        {
            title: "Ngày diễn ra",
            dataIndex: "dateTour",
            key: "dateTour",
            sorter: (a: any, b: any) => dayjs(a.dateTour).unix() - dayjs(b.dateTour).unix(),
            render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
        },
        {
            title: "Trạng thái Tour",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "";
                let text = "";
                
                switch(status) {
                    case "upcoming":
                        color = "green";
                        text = "Sắp diễn ra";
                        break;
                    case "ongoing":
                        color = "blue";
                        text = "Đang diễn ra";
                        break;
                    case "completed":
                        color = "gray";
                        text = "Đã hoàn thành";
                        break;
                    default:
                        color = "default";
                        text = status || "N/A";
                }
                
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Trạng thái HDV",
            key: "tourStatus",
            render: (_: any, record: any) => {
                const tourStatus = record.tourStatus || 'preparing';
                const statusNote = record.statusNote;
                const updatedBy = record.statusUpdatedBy;
                const updatedAt = record.statusUpdatedAt;
                let color = "";
                let text = "";
                
                switch (tourStatus) {
                    case "preparing":
                        color = "blue";
                        text = "Chuẩn bị diễn ra";
                        break;
                    case "ongoing":
                        color = "orange";
                        text = "Đang diễn ra";
                        break;
                    case "completed":
                        color = "green";
                        text = "Hoàn thành";
                        break;
                    case "postponed":
                        color = "red";
                        text = "Hoãn tour";
                        break;
                    default:
                        color = "default";
                        text = "Chưa xác định";
                }
                
                return (
                    <div className="space-y-1">
                        <Tag color={color}>{text}</Tag>
                        {statusNote && (
                            <div className="text-xs text-gray-500" title={statusNote}>
                                📝 {statusNote.length > 30 ? statusNote.substring(0, 30) + '...' : statusNote}
                            </div>
                        )}
                        {updatedAt && (
                            <div className="text-xs text-gray-400">
                                {updatedBy} • {dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Số chỗ còn lại",
            dataIndex: "availableSeats",
            key: "availableSeats",
            render: (seats: number) => <Tag color={seats > 0 ? "green" : "red"}>{seats}</Tag>,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/admin/slot-detail/${record._id}`)}
                        size="small"
                        title="Xem chi tiết"
                    >
                        Chi tiết
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/edit-time-tour/${record._id}`)}
                        type="primary"
                        size="small"
                        title="Chỉnh sửa"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa slot này?"
                        description="Hành động này không thể hoàn tác."
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => deleteSlot(record._id)}
                        okButtonProps={{ loading: isDeleting, danger: true }}
                    >
                        <Button 
                            icon={<DeleteOutlined />} 
                            danger 
                            size="small"
                            title="Xóa"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Prepare tour options
    const tourOptions = tours.map((tour: any) => ({
        label: `${tour.nameTour} (${tour.destination?.locationName || ''} - ${tour.destination?.country || ''})`,
        value: String(tour._id),
        key: String(tour._id),
    }));

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">📅 Danh Sách Ngày & Số Chỗ Tour</h1>
                {contextHolder}
                
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex-1">
                            <Text strong>Lọc theo Tour:</Text>
                            <Select
                                showSearch
                                placeholder="Tất cả tour"
                                loading={isTourLoading}
                                options={[{ label: "Tất cả tour", value: "" }, ...tourOptions]}
                                value={selectedTour}
                                onChange={setSelectedTour}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                                filterOption={(input, option) =>
                                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </div>
                        
                        <div className="flex-1">
                            <Text strong>Lọc theo ngày:</Text>
                            <RangePicker 
                                size="large"
                                style={{ width: '100%' }}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                                allowClear
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <Text type="secondary">
                            <FilterOutlined /> Hiển thị {slots.length} kết quả
                        </Text>
                        <Button 
                            type="primary" 
                            onClick={() => navigate('/admin/add-time-tour')}
                        >
                            Thêm ngày & số chỗ mới
                        </Button>
                    </div>
                </div>
                
                <Table
                    columns={columns}
                    dataSource={slots.map((slot: any) => ({ ...slot, key: String(slot._id) }))}
                    loading={isSlotLoading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "Không có dữ liệu phù hợp với bộ lọc." }}
                    scroll={{ x: 1000 }}
                />
            </div>
        </div>
    );
};

export default ListTime;
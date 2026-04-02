import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Tag, Button, Space, Typography, Image, Badge, Tooltip, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { instanceAdmin } from '../../configs/axios';
import dayjs from 'dayjs';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { EyeOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '@clerk/clerk-react';

const { Title } = Typography;
const { Option } = Select;

interface Tour {
  _id: string;
  tour: {
    _id: string;
    nameTour: string;
    destination: string;
    departure: string;
    imagesTour: string[];
    durationTour: number;
    priceTour: number;
    maxPeople: number;
    tourType: string;
    transport: string;
  };
  dateTour: string;
  availableSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  bookedSeats: number;
  totalRevenue: number;
  depositAmount: number;
  refundAmount: number;
}

const TourStatusList: React.FC = () => {
  const { status: urlStatus } = useParams<{ status: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [status, setStatus] = useState<string>(urlStatus || 'all');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Cập nhật status khi URL thay đổi
  useEffect(() => {
    if (urlStatus) {
      setStatus(urlStatus);
    }
  }, [urlStatus]);

  const { data, isLoading } = useQuery<{ success: boolean; data: Tour[] }>({  
    queryKey: ['tours', status],
    queryFn: async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Không có token xác thực');
        }
        
        // Sử dụng instanceAdmin với token xác thực
        const response = await instanceAdmin.get(`/status/${status}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (err: any) {
        console.error('Error fetching tour status:', err);
        setErrorMessage(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu');
        throw err;
      }
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    navigate(`/admin/tour-status/${value}`);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Tag color="green">Sắp diễn ra</Tag>;
      case 'ongoing':
        return <Tag color="blue">Đang diễn ra</Tag>;
      case 'completed':
        return <Tag color="red">Đã hoàn thành</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: 'Tên Tour',
      dataIndex: ['tour', 'nameTour'],
      key: 'nameTour',
      render: (_text: string, record: Tour) => {
        // Kiểm tra dữ liệu hợp lệ trước khi render
        if (!record?.tour?.imagesTour?.length) {
          return <span>{_text || 'N/A'}</span>;
        }
        return (
          <Space>
            <Image 
              width={50} 
              src={record.tour.imagesTour[0]} 
              preview={false} 
              style={{ borderRadius: '5px' }} 
            />
            <span>{_text || 'N/A'}</span>
          </Space>
        );
      },
    },
    {
      title: 'Điểm đến',
      dataIndex: ['tour', 'destination'],
      key: 'destination',
    },
    {
      title: 'Ngày khởi hành',
      dataIndex: 'dateTour',
      key: 'dateTour',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Trạng thái HDV',
      key: 'tourStatus',
      render: (_: any, record: any) => {
        const tourStatus = record.tourStatus || 'preparing';
        const statusNote = record.statusNote;
        const updatedBy = record.statusUpdatedBy;
        const updatedAt = record.statusUpdatedAt;

        let color = '';
        let text = '';

        switch (tourStatus) {
          case 'preparing':
            color = 'blue';
            text = 'Chuẩn bị diễn ra';
            break;
          case 'ongoing':
            color = 'orange';
            text = 'Đang diễn ra';
            break;
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'postponed':
            color = 'red';
            text = 'Hoãn tour';
            break;
          default:
            color = 'default';
            text = 'Chưa xác định';
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
      title: 'Số chỗ còn trống',
      key: 'availableSeats',
      render: (_text: string, record: Tour) => (
        <Badge 
          count={record.availableSeats} 
          showZero 
          style={{ 
            backgroundColor: record.availableSeats > 0 ? '#52c41a' : '#f5222d',
            fontSize: '12px',
            padding: '0 8px'
          }} 
        />
      ),
    },
    {
      title: 'Số người đã đặt',
      dataIndex: 'bookedSeats',
      key: 'bookedSeats',
      render: (bookedSeats: number) => (
        <Space>
          <TeamOutlined />
          <span>{bookedSeats}</span>
        </Space>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (totalRevenue: number) => (
        <Space>
          <DollarOutlined />
          <span>{totalRevenue.toLocaleString()} VNĐ</span>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_text: string, record: Tour) => {
        // Kiểm tra dữ liệu hợp lệ trước khi render
        if (!record?.tour?._id || !record?._id) {
          return null;
        }
        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết tour">
              <Link to={`/admin/tour-detail/${record.tour._id}`}>
                <Button type="primary" icon={<EyeOutlined />} size="small" />
              </Link>
            </Tooltip>
            <Tooltip title="Xem danh sách người tham gia">
              <Link to={`/admin/tour/participants/${record._id}`}>
                <Button type="dashed" icon={<TeamOutlined />} size="small" />
              </Link>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // Hiển thị thông báo lỗi nếu có
  if (errorMessage) {
    return (
      <Alert
        message="Lỗi"
        description={errorMessage}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Title level={4}>
            {status === 'upcoming' && 'Danh sách Tour sắp diễn ra'}
            {status === 'ongoing' && 'Danh sách Tour đang diễn ra'}
            {status === 'completed' && 'Danh sách Tour đã hoàn thành'}
            {status === 'all' && 'Danh sách tất cả Tour'}
          </Title>
          <Select 
            style={{ width: 200 }} 
            onChange={handleStatusChange}
            value={status}
          >
            <Option value="all">Tất cả</Option>
            <Option value="upcoming">Sắp diễn ra</Option>
            <Option value="ongoing">Đang diễn ra</Option>
            <Option value="completed">Đã hoàn thành</Option>
          </Select>
        </Space>
        
        <Table 
          columns={columns} 
          dataSource={data?.data || []} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Space>
    </Card>
  );
};

export default TourStatusList;
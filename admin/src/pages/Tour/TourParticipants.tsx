import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card, Table, Typography, Space, Tag, Image, Modal, Tabs, List, Descriptions, Badge, Divider, Button, message } from 'antd';
import { UserOutlined, CalendarOutlined, PhoneOutlined, MailOutlined, HomeOutlined, DollarOutlined, UserDeleteOutlined } from '@ant-design/icons';
import axios from '../../configs/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Passenger {
  fullName: string;
  gender: string;
  birthDate?: string;
  singleRoom?: boolean;
}

interface Booking {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  slotId: {
    _id: string;
    dateTour: string;
    availableSeats: number;
    status?: string;
    tour: {
      _id: string;
      nameTour: string;
      destination: string;
      departure_location: string;
      duration: string;
      finalPrice: number;
      imageTour: string[];
      tourType: string;
    };
  };
  fullNameUser: string;
  email: string;
  phone: string;
  totalPriceTour: number;
  adultsTour: number;
  childrenTour: number;
  toddlerTour: number;
  infantTour: number;
  payment_method: string;
  payment_status: string;
  cancelReason?: string;
  cancelRequestedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeposit?: boolean;
  isFullyPaid?: boolean;
  depositAmount?: number;
  depositPaidAt?: string;
  // Trường mới cho trạng thái không tham gia
  no_show_status?: 'participated' | 'no_show' | null;
  no_show_marked_at?: string;
  deposit_converted_to_revenue?: boolean;
  no_show_email_sent?: boolean;
  no_show_email_sent_at?: string;
  depositPaymentConfirmedBy?: string;
  depositPaymentNote?: string;
  paymentImage?: string;
  fullPaidAt?: string;
  fullPaymentConfirmedBy?: string;
  fullPaymentNote?: string;
  fullPaymentImage?: string;
  address?: string;
  note?: string;
  adultPassengers?: Passenger[];
  childPassengers?: Passenger[];
  toddlerPassengers?: Passenger[];
  infantPassengers?: Passenger[];
}

const TourParticipants: React.FC = () => {
  const { slotId } = useParams<{ slotId: string }>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);

  // Fetch bookings for this tour slot
  const { data, isLoading } = useQuery<{ success: boolean; bookings: Booking[] }>({
    queryKey: ['bookings', slotId],
    queryFn: async () => {
      const response = await axios.get(`/admin/bookings?slotId=${slotId}`);
      return response.data;
    },
    enabled: !!slotId,
  });

  const bookings = data?.bookings || [];
  
  // Tính toán thống kê
  const totalPassengers = bookings.reduce((sum, booking) => {
    return sum + booking.adultsTour + (booking.childrenTour || 0) + (booking.toddlerTour || 0) + (booking.infantTour || 0);
  }, 0);
  
  // Tính toán doanh thu từ các booking đã hoàn thành
  const completedRevenue = bookings.reduce((sum, booking) => {
    if (booking.payment_status === 'completed') {
      return sum + booking.totalPriceTour;
    }
    return sum;
  }, 0);

  // Tính toán doanh thu từ tiền cọc của khách không tham gia
  const noShowRevenue = bookings.reduce((sum, booking) => {
    if (booking.no_show_status === 'no_show' && booking.deposit_converted_to_revenue) {
      return sum + (booking.depositAmount || 0);
    }
    return sum;
  }, 0);

  // Tổng doanh thu
  const totalRevenue = completedRevenue + noShowRevenue;

  // Tiền cọc chưa chuyển đổi
  const pendingDepositAmount = bookings.reduce((sum, booking) => {
    if (booking.payment_status === 'deposit_paid' && booking.no_show_status !== 'no_show') {
      return sum + (booking.depositAmount || 0);
    }
    return sum;
  }, 0);

  // Thống kê khách hàng không tham gia
  const noShowCustomers = bookings.filter(booking => booking.no_show_status === 'no_show');
  const noShowPassengers = noShowCustomers.reduce((sum, booking) => {
    return sum + booking.adultsTour + (booking.childrenTour || 0) + (booking.toddlerTour || 0) + (booking.infantTour || 0);
  }, 0);

  // Fetch tour details
  const { data: tourData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['tourSlot', slotId],
    queryFn: async () => {
      const response = await axios.get(`/date/slot/${slotId}`);
      return response.data;
    },
    enabled: !!slotId,
  });

  const showDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const getStatusTag = (booking: Booking) => {
    // Ưu tiên hiển thị trạng thái không tham gia
    if (booking.no_show_status === 'no_show') {
      return <Tag color="red">Không tham gia</Tag>;
    }
    
    switch (booking.payment_status) {
      case 'pending':
        return <Tag color="warning">Chờ thanh toán</Tag>;
      case 'deposit_paid':
        return <Tag color="processing">Đã đặt cọc</Tag>;
      case 'completed':
        return <Tag color="success">Đã thanh toán</Tag>;
      case 'pending_cancel':
        return <Tag color="warning">Chờ xác nhận hủy</Tag>;
      case 'cancelled':
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Hàm đánh dấu khách hàng không tham gia
  const markAsNoShow = async (bookingId: string, reason?: string) => {
    try {
      await axios.post(`/date/booking/${bookingId}/mark-no-show`, {
        reason: reason || 'Khách hàng không tham gia tour'
      });
      
      message.success('Đã đánh dấu khách hàng không tham gia tour');
      // Refresh data
      window.location.reload();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu không tham gia');
    }
  };

  // Hàm xác nhận đánh dấu không tham gia
  const confirmMarkNoShow = (booking: Booking) => {
    Modal.confirm({
      title: 'Xác nhận đánh dấu không tham gia',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn đánh dấu khách hàng <strong>{booking.fullNameUser}</strong> là không tham gia tour?</p>
          <p style={{ color: '#f50' }}>Số tiền đặt cọc {booking.depositAmount?.toLocaleString()} VNĐ sẽ được chuyển thành doanh thu và gửi email thông báo cho khách hàng.</p>
        </div>
      ),
      onOk: () => markAsNoShow(booking._id),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okType: 'danger'
    });
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'fullNameUser',
      key: 'fullNameUser',
      render: (_: string, record: Booking) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.fullNameUser}</Text>
          <Space>
            <MailOutlined />
            <Text>{record.email}</Text>
          </Space>
          <Space>
            <PhoneOutlined />
            <Text>{record.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Số hành khách',
      key: 'passengers',
      render: (_: string, record: Booking) => {
        const totalPassengers = record.adultsTour + (record.childrenTour || 0) + (record.toddlerTour || 0) + (record.infantTour || 0);
        return (
          <Space direction="vertical" size="small">
            <Badge count={totalPassengers} showZero style={{ backgroundColor: '#108ee9' }} />
            <div>
              {record.adultsTour > 0 && <div>Người lớn: {record.adultsTour}</div>}
              {record.childrenTour > 0 && <div>Trẻ em: {record.childrenTour}</div>}
              {record.toddlerTour > 0 && <div>Trẻ nhỏ: {record.toddlerTour}</div>}
              {record.infantTour > 0 && <div>Em bé: {record.infantTour}</div>}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPriceTour',
      key: 'totalPriceTour',
      render: (price: number) => (
        <Text strong style={{ color: '#f50' }}>
          {price.toLocaleString()} VNĐ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: string, record: Booking) => (
        <Space direction="vertical" size="small">
          {getStatusTag(record)}
          {record.no_show_status === 'no_show' && record.deposit_converted_to_revenue && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Cọc đã chuyển thành doanh thu
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: string, record: Booking) => (
        <Space size="middle" direction="vertical">
          <Button 
            type="link" 
            onClick={() => showDetailModal(record)}
            style={{ padding: 0 }}
          >
            Xem chi tiết
          </Button>
          {/* Chỉ hiển thị nút đánh dấu không tham gia cho booking đã đặt cọc và tour đang diễn ra/đã hoàn thành */}
          {record.payment_status === 'deposit_paid' && 
           record.no_show_status !== 'no_show' &&
           (record.slotId?.status === 'ongoing' || record.slotId?.status === 'completed') && (
            <Button 
              type="link" 
              danger
              icon={<UserDeleteOutlined />}
              onClick={() => confirmMarkNoShow(record)}
              style={{ padding: 0 }}
            >
              Đánh dấu không tham gia
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderPassengerList = (passengers: Passenger[] | undefined, title: string) => {
    if (!passengers || passengers.length === 0) return null;
    
    return (
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>{title}</Title>
        <List
          bordered
          dataSource={passengers}
          renderItem={(passenger, index) => (
            <List.Item>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                  <UserOutlined />
                  <Text strong>{passenger.fullName}</Text>
                  <Tag color={passenger.gender === 'male' ? 'blue' : 'pink'}>
                    {passenger.gender === 'male' ? 'Nam' : 'Nữ'}
                  </Tag>
                  {passenger.singleRoom && <Tag color="gold">Phòng đơn</Tag>}
                </Space>
                {passenger.birthDate && (
                  <Space>
                    <CalendarOutlined />
                    <Text>Ngày sinh: {dayjs(passenger.birthDate).format('DD/MM/YYYY')}</Text>
                  </Space>
                )}
              </Space>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        {tourData?.data && (
          <div style={{ marginBottom: 24 }}>
            <Title level={4}>
              Danh sách người tham gia tour: {tourData.data.tour.nameTour}
            </Title>
            <Space>
              <CalendarOutlined />
              <Text>Ngày khởi hành: {dayjs(tourData.data.dateTour).format('DD/MM/YYYY')}</Text>
            </Space>
            
            {/* Thông tin tổng quan */}
            <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Title level={5}>Thông tin tổng quan</Title>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <Text strong>Tổng số hành khách: </Text>
                  <Text style={{ color: '#1890ff' }}>{totalPassengers}</Text>
                </div>
                <div>
                  <Text strong>Tổng doanh thu: </Text>
                  <Text style={{ color: '#52c41a' }}>{totalRevenue.toLocaleString()} VNĐ</Text>
                </div>
                <div>
                  <Text strong>Tiền cọc chờ xử lý: </Text>
                  <Text style={{ color: '#faad14' }}>{pendingDepositAmount.toLocaleString()} VNĐ</Text>
                </div>
                {noShowCustomers.length > 0 && (
                  <>
                    <div>
                      <Text strong>Khách không tham gia: </Text>
                      <Text style={{ color: '#f5222d' }}>{noShowCustomers.length} khách ({noShowPassengers} hành khách)</Text>
                    </div>
                    <div>
                      <Text strong>Doanh thu từ cọc: </Text>
                      <Text style={{ color: '#52c41a' }}>{noShowRevenue.toLocaleString()} VNĐ</Text>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={bookings.filter(booking => booking.payment_status !== 'cancelled')}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title="Chi tiết đặt tour"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedBooking && (
            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin chung" key="1">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Họ tên khách hàng">{selectedBooking.fullNameUser}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedBooking.email}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{selectedBooking.phone}</Descriptions.Item>
                  {selectedBooking.address && (
                    <Descriptions.Item label="Địa chỉ">{selectedBooking.address}</Descriptions.Item>
                  )}
                  <Descriptions.Item label="Tổng tiền">
                    <Text strong style={{ color: '#f50' }}>
                      {selectedBooking.totalPriceTour.toLocaleString()} VNĐ
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái thanh toán">
                    {getStatusTag(selectedBooking)}
                  </Descriptions.Item>
                  {selectedBooking.no_show_status === 'no_show' && (
                    <Descriptions.Item label="Trạng thái tham gia">
                      <Space direction="vertical" size="small">
                        <Tag color="red">Không tham gia</Tag>
                        {selectedBooking.deposit_converted_to_revenue && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Cọc đã chuyển thành doanh thu
                          </Text>
                        )}
                      </Space>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Phương thức thanh toán">
                    {selectedBooking.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </Descriptions.Item>
                  {selectedBooking.note && (
                    <Descriptions.Item label="Ghi chú">{selectedBooking.note}</Descriptions.Item>
                  )}
                </Descriptions>
              </TabPane>
              <TabPane tab="Danh sách hành khách" key="2">
                {renderPassengerList(selectedBooking.adultPassengers, 'Người lớn')}
                {renderPassengerList(selectedBooking.childPassengers, 'Trẻ em')}
                {renderPassengerList(selectedBooking.toddlerPassengers, 'Trẻ nhỏ')}
                {renderPassengerList(selectedBooking.infantPassengers, 'Em bé')}
              </TabPane>
              <TabPane tab="Thông tin thanh toán" key="3">
                <Descriptions bordered column={1}>
                  {(selectedBooking.isDeposit || selectedBooking.payment_status === 'deposit_paid' || selectedBooking.depositAmount) && (
                    <>
                      <Descriptions.Item label="Số tiền đặt cọc">
                        <Text strong style={{ color: '#1890ff' }}>
                          {(selectedBooking.depositAmount || 0).toLocaleString()} VNĐ
                        </Text>
                      </Descriptions.Item>
                      {selectedBooking.depositPaidAt && (
                        <Descriptions.Item label="Thời gian đặt cọc">
                          {dayjs(selectedBooking.depositPaidAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                      )}
                      {selectedBooking.paymentImage && (
                        <Descriptions.Item label="Hình ảnh thanh toán cọc">
                          <Image width={200} src={selectedBooking.paymentImage} />
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                  {selectedBooking.isFullyPaid && (
                    <>
                      <Descriptions.Item label="Thanh toán toàn bộ">
                        <Tag color="success">Đã thanh toán toàn bộ</Tag>
                      </Descriptions.Item>
                      {selectedBooking.fullPaidAt && (
                        <Descriptions.Item label="Thời gian thanh toán">
                          {dayjs(selectedBooking.fullPaidAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                      )}
                      {selectedBooking.fullPaymentImage && (
                        <Descriptions.Item label="Hình ảnh thanh toán toàn bộ">
                          <Image width={200} src={selectedBooking.fullPaymentImage} />
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                  {selectedBooking.payment_status === 'cancelled' && (
                    <>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color="error">Đã hủy</Tag>
                      </Descriptions.Item>
                      {selectedBooking.cancelReason && (
                        <Descriptions.Item label="Lý do hủy">{selectedBooking.cancelReason}</Descriptions.Item>
                      )}
                      {selectedBooking.cancelledAt && (
                        <Descriptions.Item label="Thời gian hủy">
                          {dayjs(selectedBooking.cancelledAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
              </TabPane>
            </Tabs>
          )}
        </Modal>
      </Space>
    </Card>
  );
};

export default TourParticipants;
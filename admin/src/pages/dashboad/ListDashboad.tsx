/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Select,
} from 'antd';
import {
  TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TourRecently from './TourRecently';
import SumTour from './SumTour';
import SumHotel from './SumHotel';
import Overview from './Overview';
import Revenue from './Revenue';
import HotelRevenue from './HotelRevenue';
import Popular from './Popular';
import PopularHotels from './PopularHotels';
import WeeklyStatistics from './WeeklyStatistics';
import HotelWeeklyStatistics from './HotelWeeklyStatistics';
import NewCustomersData from './NewCustomersData';
import BookingStats from './BookingStats';
import HotelBookingStats from './HotelBookingStats';
import HotelRecently from './HotelRecently';

const { Title, Text } = Typography;

const ListDashboad = () => {
  const [filterType, setFilterType] = useState('all');

  return (
    <div style={{
      padding: '32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <Card
        style={{
          marginBottom: 32,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={1} style={{
              margin: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              fontWeight: 700
            }}>
              <TrophyOutlined style={{ marginRight: 12, color: '#faad14' }} />
              Dashboard Analytics
            </Title>
            <Text style={{
              fontSize: '1.1rem',
              color: '#666',
              marginTop: 8,
              display: 'block'
            }}>
              📊 Tổng quan chi tiết về hoạt động kinh doanh và hiệu suất hệ thống
            </Text>
          </Col>
          <Col>
            <Space size="large">
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{
                  width: 160,
                  borderRadius: 8
                }}
                options={[
                  { value: 'all', label: '🎯 Tất cả dịch vụ' },
                  { value: 'hotel', label: '🏨 Khách sạn' },
                  { value: 'tour', label: '🚌 Tour du lịch' },
                ]}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Nội dung dashboard luôn hiển thị */}
      {/* Nếu chọn Tour */}
      {filterType === 'tour' && (
        <>
          <BookingStats />
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Revenue />
            <WeeklyStatistics />
          </Row>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Popular />
            <NewCustomersData />
          </Row>
          <SumTour />
          <TourRecently />
        </>
      )}

      {/* Nếu chọn Hotel */}
      {filterType === 'hotel' && (
        <>
          <HotelBookingStats />
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <HotelRevenue />
            <HotelWeeklyStatistics />
          </Row>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <PopularHotels />
          </Row>
          <SumHotel />
          <HotelRecently />
        </>
      )}

      {/* Nếu chọn All */}
      {filterType === 'all' && (
        <>
          <BookingStats />
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Revenue />
            <WeeklyStatistics />
          </Row>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Popular />
            <NewCustomersData />
          </Row>
          <SumTour />
          <TourRecently />
          <HotelBookingStats />
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <HotelRevenue />
            <HotelWeeklyStatistics />
          </Row>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <PopularHotels />
          </Row>
          <SumHotel />
          <HotelRecently />
        </>
      )}
    </div>
  );
};

export default ListDashboad;

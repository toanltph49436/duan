import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Spin, Alert, Button, Typography, Space, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

interface RoomAvailability {
  roomTypeIndex: number;
  roomType: {
    _id: string;
    typeName: string;
    basePrice: number;
    finalPrice: number;
    maxOccupancy: number;
    totalRooms: number;
    floorNumber?: number;
  };
  availableRooms: number;
}

interface AvailabilityResult {
  available: boolean;
  availableRoomTypes: RoomAvailability[];
  message: string;
}

interface AvailabilityCheckerProps {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  onAvailabilityChange?: (availability: AvailabilityResult | null) => void;
  onRoomSelect?: (roomType: RoomAvailability, price: number) => void;
}

export const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
  hotelId,
  checkInDate,
  checkOutDate,
  guests,
  onAvailabilityChange,
  onRoomSelect
}) => {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Use ref to store callback and avoid dependency issues
  const onAvailabilityChangeRef = useRef(onAvailabilityChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onAvailabilityChangeRef.current = onAvailabilityChange;
  }, [onAvailabilityChange]);



  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    if (!hotelId || !checkInDate || !checkOutDate) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/hotels/${hotelId}/availability`,
        {
          params: {
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests
          }
        }
      );

      if (response.data.success) {
        const availabilityData = response.data.data;
        setAvailability(availabilityData);
        setLastChecked(new Date());
        
        if (onAvailabilityChangeRef.current) {
          onAvailabilityChangeRef.current(availabilityData);
        }
      } else {
        setError(response.data.message || 'Không thể kiểm tra tình trạng phòng');
      }
    } catch (err: any) {
      console.error('Error checking availability:', err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi kiểm tra phòng trống');
    } finally {
      setLoading(false);
    }
  }, [hotelId, checkInDate, checkOutDate, guests]);

  // Auto check when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate && hotelId) {
      // Debounce the API call
      const timer = setTimeout(async () => {
        if (!hotelId || !checkInDate || !checkOutDate) {
          setAvailability(null);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response = await axios.get(
            `http://localhost:8080/api/hotels/${hotelId}/availability`,
            {
              params: {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: guests
              }
            }
          );

          if (response.data.success) {
            const availabilityData = response.data.data;
            setAvailability(availabilityData);
            setLastChecked(new Date());
            
            // Use ref to avoid dependency issues
            if (onAvailabilityChangeRef.current) {
              onAvailabilityChangeRef.current(availabilityData);
            }
          } else {
            setError(response.data.message || 'Không thể kiểm tra tình trạng phòng');
          }
        } catch (err: any) {
          console.error('Error checking availability:', err);
          setError(err.response?.data?.message || 'Lỗi kết nối khi kiểm tra phòng trống');
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setAvailability(null);
      setError(null);
    }
  }, [hotelId, checkInDate, checkOutDate, guests]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get availability status
  const getAvailabilityStatus = () => {
    if (!availability) return null;

    if (availability.available && availability.availableRoomTypes.length > 0) {
      return {
        type: 'success' as const,
        icon: <CheckCircleOutlined />,
        message: `Có ${availability.availableRoomTypes.length} loại phòng trống`
      };
    } else {
      return {
        type: 'warning' as const,
        icon: <ExclamationCircleOutlined />,
        message: 'Không có phòng trống trong thời gian này'
      };
    }
  };

  const status = getAvailabilityStatus();

  if (!checkInDate || !checkOutDate) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">Vui lòng chọn ngày để kiểm tra phòng trống</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      size="small"
      title="Tình trạng phòng trống"
      extra={
        <Button 
          type="text" 
          size="small" 
          icon={<ReloadOutlined />}
          onClick={handleManualRefresh}
          loading={loading}
        >
          Kiểm tra lại
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang kiểm tra phòng trống...</Text>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert
            message="Lỗi kiểm tra phòng trống"
            description={error}
            type="error"
            action={
              <Button size="small" onClick={handleManualRefresh}>
                Thử lại
              </Button>
            }
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Success/Warning State */}
        {status && !loading && !error && (
          <Alert
            message={status.message}
            type={status.type}
            icon={status.icon}
            showIcon
          />
        )}

        {/* Available Rooms */}
        {availability?.available && availability.availableRoomTypes.length > 0 && !loading && !error && (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              Các loại phòng có sẵn:
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {availability.availableRoomTypes.map((room, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ 
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    transition: 'all 0.3s ease'
                  }}
                  hoverable
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                        {room.roomType.typeName}
                      </Title>
                      <Space wrap>
                        <Tag color="blue">
                          Còn {room.availableRooms} phòng
                        </Tag>
                        <Tag color="green">
                          Tối đa {room.roomType.maxOccupancy} khách
                        </Tag>
                        {room.roomType.floorNumber && (
                          <Tag color="orange">
                            Tầng {room.roomType.floorNumber}
                          </Tag>
                        )}
                      </Space>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                          {formatPrice(room.roomType.finalPrice || room.roomType.basePrice)} VNĐ
                        </Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          / đêm
                        </Text>
                      </div>
                      
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onRoomSelect?.(room, room.roomType.finalPrice || room.roomType.basePrice)}
                        disabled={room.availableRooms === 0}
                      >
                        Chọn phòng
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )}

        {/* No Rooms Available */}
        {availability && !availability.available && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">
              Không có phòng trống trong khoảng thời gian này.
              <br />
              Vui lòng chọn ngày khác.
            </Text>
          </div>
        )}

        {/* Last Checked Info */}
        {lastChecked && !loading && (
          <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cập nhật lúc: {lastChecked.toLocaleTimeString('vi-VN')}
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Rate, Tag, Image, Pagination, Spin, message, DatePicker } from 'antd';
import { SearchOutlined, EnvironmentOutlined, StarOutlined, WifiOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

interface Hotel {
  _id: string;
  hotelName: string;
  description: string;
  location: {
    locationName: string;
    country: string;
  };
  starRating: number;
  hotelImages: string[];
  roomTypes: Array<{
    typeName: string;
    basePrice: number;
    maxOccupancy: number;
    finalPrice: number;
  }>;
  hotelAmenities: Array<{
    name: string;
  }>;
  averageRating: number;
  totalReviews: number;
  status: boolean;
}

interface SearchFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  starRating?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;
  const navigate = useNavigate();

  const cities = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hạ Long', 'Nha Trang', 'Phú Quốc',
    'Hội An', 'Huế', 'Vũng Tàu', 'Đà Lạt', 'Cần Thơ'
  ];

  const amenitiesList = [
    'WiFi miễn phí', 'Hồ bơi', 'Phòng gym', 'Spa', 'Nhà hàng',
    'Bar', 'Dịch vụ phòng 24/7', 'Bãi đỗ xe', 'Trung tâm thương mại'
  ];

  useEffect(() => {
    fetchHotels();
  }, [currentPage, filters, searchText]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchText) params.append('search', searchText);
      if (filters.city) params.append('city', filters.city);
      if (filters.checkIn) params.append('checkIn', filters.checkIn);
      if (filters.checkOut) params.append('checkOut', filters.checkOut);
      if (filters.guests) params.append('guests', filters.guests.toString());
      if (filters.starRating) params.append('starRating', filters.starRating.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach(amenity => params.append('amenities', amenity));
      }
      
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());

      const response = await axios.get(`http://localhost:8080/api/hotels/search?${params}`);
      
      if (response.data.success) {
        setHotels(response.data.data || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      message.error('Không thể tải danh sách khách sạn');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getMinPrice = (roomTypes: Hotel['roomTypes']) => {
    if (!roomTypes || roomTypes.length === 0) return 0;
    return Math.min(...roomTypes.map(room => room.finalPrice || room.basePrice));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleViewHotel = (hotelId: string) => {
    const queryParams = new URLSearchParams();
    if (filters.checkIn) queryParams.append('checkIn', filters.checkIn);
    if (filters.checkOut) queryParams.append('checkOut', filters.checkOut);
    if (filters.guests) queryParams.append('guests', filters.guests.toString());
    
    const queryString = queryParams.toString();
    navigate(`/hotels/${hotelId}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div style={{ 
      background: 'transparent',
      minHeight: '100vh',
      padding: '0',
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(161, 196, 253, 0.9) 0%, rgba(194, 233, 251, 0.9) 50%, rgba(251, 194, 235, 0.9) 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '700', 
          marginBottom: '16px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🏨 Khách sạn tại Việt Nam
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Khám phá và đặt những khách sạn tuyệt vời nhất với giá tốt nhất
        </p>
      </div>
      
      <div style={{ 
         maxWidth: 1200, 
         margin: '0 auto',
         padding: '0 24px 60px 24px',
         transform: 'translateY(-40px)'
       }}>

        {/* Search and Filters */}
        <Card style={{ 
          marginBottom: 32,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: 'none',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm kiếm khách sạn..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} md={4}>
              <Select
                placeholder="Thành phố"
                style={{ width: '100%' }}
                size="large"
                allowClear
                onChange={(value) => handleFilterChange('city', value)}
              >
                {cities.map(city => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={3}>
              <DatePicker
                placeholder="Ngày nhận phòng"
                size="large"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
                onChange={(date) => handleFilterChange('checkIn', date ? date.format('YYYY-MM-DD') : undefined)}
              />
            </Col>
            <Col xs={12} md={3}>
              <DatePicker
                placeholder="Ngày trả phòng"
                size="large"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
                onChange={(date) => handleFilterChange('checkOut', date ? date.format('YYYY-MM-DD') : undefined)}
              />
            </Col>
            <Col xs={12} md={3}>
              <Select
                placeholder="Số khách"
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => handleFilterChange('guests', value)}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <Option key={num} value={num}>{num} khách</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} md={3}>
              <Select
                placeholder="Xếp hạng"
                style={{ width: '100%' }}
                size="large"
                allowClear
                onChange={(value) => handleFilterChange('starRating', value)}
              >
                {[5, 4, 3, 2, 1].map(star => (
                  <Option key={star} value={star}>{star} sao</Option>
                ))}
              </Select>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={12} md={4}>
              <Input
                type="number"
                placeholder="Giá từ (VNĐ)"
                size="large"
                onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
              />
            </Col>
            <Col xs={12} md={4}>
              <Input
                type="number"
                placeholder="Giá đến (VNĐ)"
                size="large"
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
              />
            </Col>
            <Col xs={24} md={16}>
              <Select
                mode="multiple"
                placeholder="Tiện ích"
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => handleFilterChange('amenities', value)}
              >
                {amenitiesList.map(amenity => (
                  <Option key={amenity} value={amenity}>{amenity}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Results */}
        <div style={{ 
          marginBottom: 24,
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <span style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            🔍 Tìm thấy <span style={{
              color: '#667eea',
              fontWeight: '700'
            }}>{total}</span> khách sạn tuyệt vời
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <h3>Không tìm thấy khách sạn nào</h3>
            <p>Vui lòng thử lại với các tiêu chí tìm kiếm khác</p>
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {hotels.map((hotel) => (
                <Col key={hotel._id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                    cover={
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <Image
                          alt={hotel.hotelName}
                          src={hotel.hotelImages?.[0] || '/placeholder-hotel.jpg'}
                          style={{ 
                            height: 220, 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                          preview={false}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {hotel.starRating} ⭐
                        </div>
                      </div>
                    }
                    actions={[
                      <Button
                        type="primary"
                        block
                        size="large"
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          height: '44px'
                        }}
                        onClick={() => handleViewHotel(hotel._id)}
                      >
                        Xem chi tiết & Đặt phòng
                      </Button>
                    ]}
                  >
                    <div style={{ height: 300, padding: '16px' }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '700', 
                        marginBottom: 12,
                        height: 52,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: '#2c3e50',
                        lineHeight: '1.3'
                      }}>
                        {hotel.hotelName}
                      </h3>
                      
                      <div style={{ 
                        marginBottom: 12, 
                        display: 'flex', 
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                        padding: '8px 12px',
                        borderRadius: '8px'
                      }}>
                        <EnvironmentOutlined style={{ 
                          color: '#667eea', 
                          marginRight: 6,
                          fontSize: '16px'
                        }} />
                        <span style={{ 
                          color: '#495057', 
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          📍 {hotel.location.locationName}
                        </span>
                      </div>
                      
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '14px', 
                        marginBottom: 16,
                        height: 42,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5'
                      }}>
                        {hotel.description}
                      </p>
                      
                      <div style={{ marginBottom: 16 }}>
                        {hotel.hotelAmenities?.slice(0, 3).map((amenity, index) => (
                          <Tag 
                            key={index} 
                            style={{ 
                              marginBottom: 6,
                              marginRight: 6,
                              background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                              border: '1px solid #667eea40',
                              borderRadius: '12px',
                              color: '#667eea',
                              fontWeight: '500'
                            }}
                          >
                            {(typeof amenity === 'string' ? amenity : (typeof amenity.name === 'string' ? amenity.name : (amenity.name?.name || amenity || 'Tiện ích'))) === 'WiFi miễn phí' && <WifiOutlined style={{ marginRight: 4 }} />}
                            {typeof amenity === 'string' ? amenity : (typeof amenity.name === 'string' ? amenity.name : (amenity.name?.name || amenity || 'Tiện ích'))}
                          </Tag>
                        ))}
                        {hotel.hotelAmenities?.length > 3 && (
                          <Tag style={{
                            background: 'linear-gradient(135deg, #ffc107, #ff8c00)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            +{hotel.hotelAmenities.length - 3} tiện ích
                          </Tag>
                        )}
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: 'auto',
                        paddingTop: '12px',
                        borderTop: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <div style={{ 
                            fontSize: '1.4rem', 
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            💰 {formatPrice(getMinPrice(hotel.roomTypes))} VNĐ
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: '#6c757d',
                            fontWeight: '500'
                          }}>
                            / đêm
                          </div>
                        </div>
                        
                        {hotel.averageRating > 0 && (
                          <div style={{ 
                            textAlign: 'right',
                            background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <StarOutlined style={{ marginRight: 4, fontSize: '14px' }} />
                              <span style={{ 
                                fontWeight: '700',
                                fontSize: '15px'
                              }}>
                                {hotel.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              opacity: 0.9,
                              marginTop: '2px'
                            }}>
                              ({hotel.totalReviews} đánh giá)
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {total > pageSize && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: 40,
                padding: '24px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} khách sạn`}
                  style={{
                    '& .ant-pagination-item': {
                      borderRadius: '8px'
                    },
                    '& .ant-pagination-item-active': {
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderColor: '#667eea'
                    }
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HotelList;
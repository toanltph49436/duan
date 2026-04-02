import React from 'react';
import { DatePicker, Card, Button, Row, Col, Typography, Space, Tag, Divider } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDateSelection } from '../../hooks/useDateSelection';
import moment from 'moment';
import './EnhancedDatePicker.css';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface EnhancedDatePickerProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  onDateChange?: (checkIn: string, checkOut: string) => void;
  minStay?: number;
  maxStay?: number;
  showQuickSelections?: boolean;
  showPriceHints?: boolean;
  size?: 'small' | 'middle' | 'large';
  className?: string;
}

export const EnhancedDatePicker: React.FC<EnhancedDatePickerProps> = ({
  initialCheckIn,
  initialCheckOut,
  onDateChange,
  minStay = 1,
  maxStay = 30,
  showQuickSelections = true,
  showPriceHints = false,
  size = 'large',
  className = ''
}) => {
  const {
    datePickerValue,
    numberOfNights,
    isValidRange,
    handleDateChange,
    disabledDate,
    getFormattedDates,
    setWeekendStay,
    setWeekStay,
    setTwoWeekStay,
    clearDates
  } = useDateSelection({
    initialCheckIn,
    initialCheckOut,
    minStay,
    maxStay,
    onDateChange
  });

  const { dateRangeText } = getFormattedDates;

  // Quick selection buttons
  const quickSelections = [
    { label: 'Cuối tuần (2 đêm)', action: setWeekendStay, nights: 2 },
    { label: '1 tuần (7 đêm)', action: setWeekStay, nights: 7 },
    { label: '2 tuần (14 đêm)', action: setTwoWeekStay, nights: 14 }
  ];

  // Get price hint based on dates
  const getPriceHint = () => {
    if (!isValidRange || !datePickerValue) return null;
    
    const checkIn = datePickerValue[0];
    const isWeekend = checkIn.day() === 5 || checkIn.day() === 6;
    const isPeakSeason = checkIn.month() >= 5 && checkIn.month() <= 8;
    const isLongStay = numberOfNights >= 7;
    
    let hint = '';
    let color = 'default';
    
    if (isLongStay) {
      hint = 'Có thể được giảm giá lưu trú dài';
      color = 'green';
    } else if (isPeakSeason) {
      hint = 'Mùa cao điểm - giá có thể cao hơn';
      color = 'orange';
    } else if (isWeekend) {
      hint = 'Cuối tuần - giá có thể cao hơn';
      color = 'blue';
    }
    
    return hint ? <Tag color={color}>{hint}</Tag> : null;
  };

  return (
    <Card 
      className={`enhanced-date-picker ${className}`}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          <span>Chọn ngày lưu trú</span>
        </div>
      }
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Main Date Picker */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Ngày nhận phòng - Ngày trả phòng:
          </Text>
          <RangePicker
            value={datePickerValue}
            onChange={handleDateChange}
            disabledDate={disabledDate}
            placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
            format="DD/MM/YYYY"
            size={size}
            style={{ width: '100%' }}
            className="custom-range-picker"
            allowClear={true}
            separator={
              <div style={{ 
                padding: '0 8px', 
                color: '#1890ff',
                fontWeight: 'bold'
              }}>
                →
              </div>
            }
          />
        </div>

        {/* Date Summary */}
        {isValidRange && dateRangeText && (
          <div className="date-summary">
            <Space align="center">
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong style={{ color: '#52c41a' }}>
                {dateRangeText}
              </Text>
              {showPriceHints && getPriceHint()}
            </Space>
          </div>
        )}

        {/* Quick Selection Buttons */}
        {showQuickSelections && (
          <>
            <Divider style={{ margin: '12px 0' }}>Chọn nhanh</Divider>
            <Row gutter={[8, 8]}>
              {quickSelections.map((selection, index) => (
                <Col xs={24} sm={8} key={index}>
                  <Button
                    block
                    size="small"
                    onClick={selection.action}
                    type={numberOfNights === selection.nights ? 'primary' : 'default'}
                    style={{
                      height: 'auto',
                      padding: '8px 12px',
                      whiteSpace: 'normal',
                      textAlign: 'center'
                    }}
                  >
                    {selection.label}
                  </Button>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Clear Button */}
        {isValidRange && (
          <Button 
            type="text" 
            size="small" 
            onClick={clearDates}
            style={{ color: '#999' }}
          >
            Xóa ngày đã chọn
          </Button>
        )}

        {/* Validation Info */}
        <div className="validation-info">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            • Thời gian lưu trú: {minStay} - {maxStay} đêm
            <br />
            • Có thể đặt phòng đến {moment().add(1, 'year').format('DD/MM/YYYY')}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

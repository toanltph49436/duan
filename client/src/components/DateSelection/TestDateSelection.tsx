import React from 'react';
import { EnhancedDatePicker } from './EnhancedDatePicker';
import { Card } from 'antd';

// Simple test component để verify rằng components hoạt động
const TestDateSelection: React.FC = () => {
  const handleDateChange = (checkIn: string, checkOut: string) => {
    console.log('Date changed:', { checkIn, checkOut });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Card title="🧪 Test Enhanced Date Picker">
        <EnhancedDatePicker
          onDateChange={handleDateChange}
          showQuickSelections={true}
          showPriceHints={true}
        />
      </Card>
    </div>
  );
};

export default TestDateSelection;

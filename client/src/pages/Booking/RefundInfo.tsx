import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Radio, Spin, message, Alert } from 'antd';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import instanceClient from '../../../configs/instance';
import { useMutation, useQuery } from '@tanstack/react-query';

const { Option } = Select;

const RefundInfo = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  
  // Lấy thông tin booking từ state hoặc API
  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        if (location.state?.bookingData) {
          setBookingData(location.state.bookingData);
          calculateRefundAmount(location.state.bookingData);
        } else if (bookingId) {
          const response = await instanceClient.get(`/bookingTour/${bookingId}`);
          setBookingData(response.data.booking);
          calculateRefundAmount(response.data.booking);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
        message.error('Không thể tải thông tin đặt tour');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, location.state]);

  // Tính toán số tiền hoàn lại dựa trên chính sách
  const calculateRefundAmount = (booking: any) => {
    if (!booking) return 0;

    const departureDate = new Date(booking.slotId?.dateTour);
    const today = new Date();
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let refundPercentage = 0;
    
    // Áp dụng chính sách hoàn tiền
    if (daysUntilDeparture > 30) {
      refundPercentage = 100;
    } else if (daysUntilDeparture >= 15) {
      refundPercentage = 70;
    } else if (daysUntilDeparture >= 7) {
      refundPercentage = 50;
    } else if (daysUntilDeparture >= 4) {
      refundPercentage = 30;
    } else {
      refundPercentage = 0;
    }
    
    const depositAmount = booking.depositAmount || (booking.totalPriceTour * 0.5);
    const calculatedRefund = (depositAmount * refundPercentage / 100);
    setRefundAmount(calculatedRefund);
    
    return calculatedRefund;
  };

  // Gửi thông tin hoàn tiền
  const { mutate: submitRefundInfo, isLoading: isSubmitting } = useMutation({
    mutationFn: (values: any) => {
      return instanceClient.post('/refund/request', {
        bookingId: bookingData._id,
        refundAmount,
        bankInfo: values
      });
    },
    onSuccess: () => {
      message.success('Yêu cầu hoàn tiền đã được gửi thành công');
      navigate('/infouser');
    },
    onError: (error) => {
      console.error('Error submitting refund request:', error);
      message.error('Có lỗi xảy ra khi gửi yêu cầu hoàn tiền');
    }
  });

  const onFinish = (values: any) => {
    submitRefundInfo(values);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Alert
          type="error"
          message="Lỗi tải thông tin"
          description="Không thể tìm thấy thông tin đặt tour. Vui lòng thử lại sau."
          showIcon
        />
        <div className="mt-6 text-center">
          <Button type="primary" onClick={() => navigate('/infouser')}>
            Quay lại trang thông tin người dùng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thông tin hoàn tiền</h1>
        <p className="mt-2 text-gray-600">
          Vui lòng cung cấp thông tin để chúng tôi hoàn tiền cho bạn
        </p>
      </div>

      {/* Thông tin booking */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Thông tin đặt tour</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Tour:</p>
            <p className="font-medium">{bookingData.slotId?.tour?.nameTour || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Mã đặt tour:</p>
            <p className="font-medium">{bookingData._id?.slice(0, 8).toUpperCase() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Ngày khởi hành:</p>
            <p className="font-medium">{new Date(bookingData.slotId?.dateTour).toLocaleDateString('vi-VN')}</p>
          </div>
          <div>
            <p className="text-gray-600">Tổng tiền:</p>
            <p className="font-medium">{bookingData.totalPriceTour?.toLocaleString()}₫</p>
          </div>
          <div>
            <p className="text-gray-600">Tiền đặt cọc:</p>
            <p className="font-medium">{(bookingData.depositAmount || bookingData.totalPriceTour * 0.5).toLocaleString()}₫</p>
          </div>
          <div>
            <p className="text-gray-600">Số tiền hoàn lại:</p>
            <p className="font-medium text-green-600">{refundAmount.toLocaleString()}₫</p>
          </div>
        </div>
      </div>

      {/* Form thông tin hoàn tiền */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin tài khoản ngân hàng</h2>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            fullName: bookingData.fullNameUser,
            phone: bookingData.phone,
            email: bookingData.email,
            refundMethod: 'bank'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="fullName"
              label="Họ tên chủ tài khoản"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên chủ tài khoản' }]}
            >
              <Input placeholder="Nhập họ tên chủ tài khoản" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="refundMethod"
            label="Phương thức hoàn tiền"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức hoàn tiền' }]}
          >
            <Radio.Group>
              <Radio value="bank">Chuyển khoản ngân hàng</Radio>
              <Radio value="cash">Tiền mặt tại văn phòng</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.refundMethod !== currentValues.refundMethod}
          >
            {({ getFieldValue }) => 
              getFieldValue('refundMethod') === 'bank' ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin tài khoản ngân hàng</h3>
                  
                  <Form.Item
                    name="bankName"
                    label="Tên ngân hàng"
                    rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
                  >
                    <Select placeholder="Chọn ngân hàng">
                      <Option value="Vietcombank">Vietcombank</Option>
                      <Option value="BIDV">BIDV</Option>
                      <Option value="Agribank">Agribank</Option>
                      <Option value="Techcombank">Techcombank</Option>
                      <Option value="VPBank">VPBank</Option>
                      <Option value="MBBank">MBBank</Option>
                      <Option value="ACB">ACB</Option>
                      <Option value="TPBank">TPBank</Option>
                      <Option value="Sacombank">Sacombank</Option>
                      <Option value="VIB">VIB</Option>
                      <Option value="other">Ngân hàng khác</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.bankName !== currentValues.bankName}
                  >
                    {({ getFieldValue }) => 
                      getFieldValue('bankName') === 'other' ? (
                        <Form.Item
                          name="otherBankName"
                          label="Tên ngân hàng khác"
                          rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
                        >
                          <Input placeholder="Nhập tên ngân hàng" />
                        </Form.Item>
                      ) : null
                    }
                  </Form.Item>

                  <Form.Item
                    name="accountNumber"
                    label="Số tài khoản"
                    rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                  >
                    <Input placeholder="Nhập số tài khoản" />
                  </Form.Item>

                  <Form.Item
                    name="branch"
                    label="Chi nhánh"
                  >
                    <Input placeholder="Nhập chi nhánh ngân hàng (nếu có)" />
                  </Form.Item>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Alert
                    type="info"
                    message="Thông tin nhận tiền mặt"
                    description={
                      <div>
                        <p>Địa chỉ: Số 81A ngõ 295 - Phố Bằng Liệt - Phường Lĩnh Nam - Quận Hoàng Mai - Hà Nội</p>
                        <p>Thời gian: 9h00 - 17h30 từ thứ 2 - đến thứ 6 và 9h00 - 12h00 thứ 7</p>
                        <p>Vui lòng mang theo CMND/CCCD và mã đặt tour khi đến nhận tiền</p>
                      </div>
                    }
                    showIcon
                  />
                </div>
              )
            }
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea 
              placeholder="Nhập ghi chú nếu có" 
              rows={3}
            />
          </Form.Item>

          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              onClick={() => navigate('/infouser')}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isSubmitting}
              className="bg-blue-600"
            >
              Gửi yêu cầu hoàn tiền
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RefundInfo; 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Col, ConfigProvider, DatePicker, Form,  InputNumber, message, Row, Select, type FormProps } from 'antd'
import viVN from 'antd/locale/vi_VN';
import instance from '../../configs/axios';
import 'dayjs/locale/vi';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjs from 'dayjs';

// Mở rộng dayjs để sử dụng isSameOrBefore
dayjs.extend(isSameOrBefore);

dayjs.locale('vi');
const AddTSchedule = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const {data:transport} = useQuery({
    queryKey:['transport'],
    queryFn: async() => instance.get('/transport')
  })
  const requiredLabel = (text: string) => (
    <>
      {text} <span className="text-red-500">*</span>
    </>
  );
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      try {
        return await instance.post('/transportSchedule', data)
      } catch (error) {
        throw new Error("Failed to add transport")
      }
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Bạn thêm lịch trình vận chuyển thành công",
      });
      form.resetFields();
    },
    onError: () => {
      messageApi.open({
        type: "error",
        content: "Bạn thêm lịch trình vận chuyển thất bại. Vui lòng thử lại sau!",
      });
    },
  })
  const onFinish: FormProps<any>["onFinish"] = (values) => {
    const newValues = {
      ...values,
    };
    mutate(newValues);
  };
  return (
    <>
    <ConfigProvider locale={viVN}>
     <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">➕ Thêm Lịch Trình Mới</h1>
        </div>
        {contextHolder}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <Form layout="vertical"
            onFinish={onFinish}
            name="add-tour" validateTrigger="onBlur"
            form={form}>
            {/* Cột trái */}
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  required={false}
                  label={requiredLabel("Tên Phương Tiện")}
                  name="transport"
                  rules={[{ required: true, message: "Vui lòng chọn loại Phương Tiện" }]}
                >
                  <Select
                    disabled={isPending}
                    size="large"
                    placeholder="Chọn loại Phương Tiện"
                    options={transport?.data?.transport?.map((tranport:any)=>({
                      label: tranport.transportName,
                      value: tranport._id
                    }))}
                    onChange={(value) => {
                      // Cập nhật giá trị của trường category
                      form.setFieldsValue({
                        tranport: value,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                      required={false}
                  label={requiredLabel('Thời Gian đi')}
                  name="departureTime"
                  rules={[
                    { required: true, message: 'Vui lòng chọn thời gian đi' }
                  ]}
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn thời gian đi"
                    size="large"
                    disabled={isPending}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                    <Form.Item
                      required={false}
                      label={requiredLabel('Thời Gian đến')}
                      name="arrivalTime"
                      dependencies={['departureTime']}
                      rules={[
                        {
                          required: true,
                          message: 'Vui lòng chọn Thời Gian đến',
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const departureTime = getFieldValue('departureTime');

                            if (!value || !departureTime) {
                              return Promise.resolve();
                            }

                            // Log để debug
                            console.log('🕓 departureTime:', departureTime.format('YYYY-MM-DD HH:mm'));
                            console.log('🕕 arrivalTime:', value.format('YYYY-MM-DD HH:mm'));

                            if (value.isSameOrBefore(departureTime, 'minute')) {
                              return Promise.reject('Thời Gian đến phải sau Thời Gian đi');
                            }

                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn Thời Gian đến"
                        size="large"
                        disabled={isPending}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>


              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  required={false}
                  label={requiredLabel("Giá")}
                  name="priceTransport"
                  rules={[
                    { required: true, message: "Vui lòng nhập giá" },
                    {
                      pattern: /^[0-9]+$/,
                      message: "Chỉ được nhập số",
                    },
                  ]}
                >
                      <InputNumber
                        disabled={isPending}
                        placeholder="VD: 2000000"
                        size="large"
                        style={{ width: "100%" }}
                        min={0}
                        formatter={(value) =>
                          value ? `${Number(value).toLocaleString("vi-VN")} ₫` : ""
                        }
                        parser={(value) =>
                          value ? value.replace(/[₫\s,.]/g, "") : ""
                        }
                      />
                </Form.Item>
              </Col>
              <Col span={12}>

                <Form.Item
                  label={requiredLabel("Chỗ Ngồi")}
                  required={false}
                  name="availableSeats"
                  rules={[
                    { required: true, message: "Vui lòng nhập số chỗ ngồi" },
                  ]}
                >
                  <InputNumber
                    disabled={isPending}
                    placeholder="VD: 40"
                    min={1}
                    max={100}
                    style={{ width: "100%" }}
                    size="large"
                  />
                </Form.Item>

              </Col>
            </Row>
            <Col span={24}>
              <Form.Item>
                <Button
                  disabled={isPending}
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 mt-10"
                >
                  ✅ Xác Nhận Thêm Phuơng Tiện
                </Button>
              </Form.Item>
            </Col>
          </Form>
        </div>
      </div>
    </div>
    </ConfigProvider>
    </>
    
  )
}

export default AddTSchedule
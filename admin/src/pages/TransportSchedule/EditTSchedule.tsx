/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Col,
    ConfigProvider,
    DatePicker,
    Form,
    InputNumber,
    message,
    Row,
    Select,
    type FormProps,
} from 'antd';
import viVN from 'antd/locale/vi_VN';
import instance from '../../configs/axios';
import 'dayjs/locale/vi';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

dayjs.extend(isSameOrBefore);
dayjs.locale('vi');

const EditTSchedule = () => {
    const queryClient = useQueryClient();
    const { id } = useParams();
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const { data: transport } = useQuery({
        queryKey: ['transport'],
        queryFn: async () => instance.get('/transport'),
    });

    const { data } = useQuery({
        queryKey: ['transportSchedule', id],
        queryFn: async () => instance.get(`/transportSchedule/${id}`),
        enabled: !!id,
    });

    useEffect(() => {
        if (data?.data?.transportScheduleModel) {
            const model = data.data.transportScheduleModel;
            form.setFieldsValue({
                ...model,
                departureTime: model.departureTime ? dayjs(model.departureTime) : null,
                arrivalTime: model.arrivalTime ? dayjs(model.arrivalTime) : null,
            });
        }
    }, [data, form]);

    const requiredLabel = (text: string) => (
        <>
            {text} <span className="text-red-500">*</span>
        </>
    );

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: any) => {
            return await instance.put(`/transportSchedule/${id}`, formData);
        },
        onSuccess: () => {
            messageApi.success("Cập nhật lịch trình thành công");
            queryClient.invalidateQueries({ queryKey: ['transportSchedule'] });
        },
        onError: () => {
            messageApi.error("Cập nhật lịch trình thất bại. Vui lòng thử lại sau!");
        },
    });

    const onFinish: FormProps<any>['onFinish'] = (values) => {
        mutate(values);
    };

    return (
        <ConfigProvider locale={viVN}>
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-blue-600">✏️ Chỉnh sửa lịch trình</h1>
                    </div>
                    {contextHolder}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <Form
                            layout="vertical"
                            onFinish={onFinish}
                            form={form}
                            name="edit-transport-schedule"
                            validateTrigger="onBlur"
                        >
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
                                            options={transport?.data?.transport?.map((t: any) => ({
                                                label: t.transportName,
                                                value: t._id,
                                            }))}
                                            onChange={(value) => {
                                                form.setFieldsValue({ transport: value });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel('Thời Gian đi')}
                                        name="departureTime"
                                        rules={[{ required: true, message: 'Vui lòng chọn thời gian đi' }]}
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
                                                    if (!value || !departureTime) return Promise.resolve();

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
                                            { pattern: /^[0-9]+$/, message: "Chỉ được nhập số" },
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
                                        required={false}
                                        label={requiredLabel("Chỗ Ngồi")}
                                        name="availableSeats"
                                        rules={[{ required: true, message: "Vui lòng nhập số chỗ ngồi" }]}
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
                                        💾 Cập Nhật Lịch Trình
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Form>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default EditTSchedule;

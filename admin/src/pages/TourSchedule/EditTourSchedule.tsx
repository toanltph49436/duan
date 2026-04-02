/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Form,
    Input,
    Button,
    message,
    notification,
    Select,
    Upload,
    Row,
    Col,
    Image,
    Modal,
} from 'antd';
import {
    PlusOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import instance from '../../configs/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EditTourSchedule = () => {
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileLists, setFileLists] = useState<{ [key: number]: any[] }>({});
    const [initialFormValues, setInitialFormValues] = useState<any>(null);

    const { id } = useParams();
    const queryClient = useQueryClient();

    const openNotification = (pauseOnHover: boolean) =>
        (type: 'success' | 'error', message: string, description: string) => {
            api.open({
                message,
                description,
                type,
                showProgress: true,
                pauseOnHover,
            });
        };

    const requiredLabel = (text: string) => (
        <>
            {text} <span className="text-red-500">*</span>
        </>
    );

    const getBase64 = (file: any): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file: any) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    // Query lấy list tour để chọn
    const { data: tour } = useQuery({
        queryKey: ['tour'],
        queryFn: async () => instance.get('/tour'),
    });

    // Query lấy dữ liệu tourschedule theo id
    const { data } = useQuery({
        queryKey: ['tourschedule', id],
        queryFn: async () => instance.get(`/tourschedule/${id}`),
        enabled: !!id,
    });
    console.log(data?.data?.tourSchedule);
    useEffect(() => {
        if (data?.data?.tourSchedule) {
            const scheduleData = data.data.tourSchedule.schedules.map((item: any) => ({
                activity: item.activity,
                location: item.location,
            }));

            // Set vào state để làm key ép Form render lại (optional)
            setInitialFormValues({
                tourId: data.data.tourSchedule.Tour,
                schedules: scheduleData,
            });

            // Set vào form
            form.setFieldsValue({
                tourId: data.data.tourSchedule.Tour,
                schedules: scheduleData,
            });

            // Khởi tạo fileList ảnh nếu có
            const imageFiles: { [key: number]: any[] } = {};
            data.data.tourSchedule.schedules.forEach((schedule: any, index: number) => {
                imageFiles[index] = (schedule.imageTourSchedule || []).map((url: string, i: number) => ({
                    uid: `${index}-${i}`,
                    name: `image-${i}.jpg`,
                    status: 'done',
                    url,
                }));
            });
            setFileLists(imageFiles);
        }
    }, [data, form]);


    // Mutation cập nhật lịch trình
    const { mutate } = useMutation({
        mutationFn: async (values: any) => {
            return await instance.put(`/tourschedule/${id}`, values);
        },
        onSuccess: () => {
            openNotification(false)('success', 'Sửa lịch trình thành công', 'Lịch trình đã được lưu');
            queryClient.invalidateQueries({ queryKey: ['tourschedule', id] });
        },
        onError: () => {
            openNotification(false)('error', 'Sửa lịch trình thất bại', 'Có lỗi khi lưu lịch trình');
        },
    });

    const onFinish = (values: any) => {
        if (!values.tourId || !values.schedules?.length) {
            message.error('Bạn phải chọn Tour và nhập ít nhất một lịch trình!');
            return;
        }

        const schedules = values.schedules.map((schedule: any, index: number) => ({
            ...schedule,
            dayNumber: `Ngày ${index + 1}`,
            imageTourSchedule: (fileLists[index] || [])
                .filter((file) => file.status === 'done')
                .map((file) => file.response?.secure_url || file.url)
                .filter(Boolean),
        }));

        mutate({ Tour: values.tourId, schedules });
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div className=" min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">Sửa Lịch Trình</h1>
                {contextHolder}
                <Form
                    form={form}
                    name="tour_schedule_form"
                    onFinish={onFinish}
                    layout="vertical"
                    // initialValues={initialFormValues || { schedules: [{ activity: '', location: '' }] }}
                    key={initialFormValues ? 'loaded' : 'empty'} // ép rerender khi dữ liệu tải xong
                >
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                required={false}
                                label={requiredLabel('Tên Tour')}
                                name="tourId"
                                rules={[{ required: true, message: 'Vui lòng chọn tour!' }]}
                            >
                                <Select
                                    size="large"
                                    placeholder="Chọn tour"
                                    options={tour?.data?.tours?.map((tour: any) => ({
                                        label: tour.nameTour,
                                        value: tour._id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.List name="schedules">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div
                                        key={key}
                                        className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="font-semibold text-lg" >Ngày thứ {index + 1}</h3>
                                            </div>

                                            <MinusCircleOutlined
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: 'Bạn chắc chắn muốn xóa ngày này?',
                                                        okText: 'Có',
                                                        cancelText: 'Không',
                                                        onOk() {
                                                            remove(name);

                                                            setFileLists((prev) => {
                                                                const updatedFileLists: { [key: number]: any[] } = {};
                                                                Object.keys(prev)
                                                                    .sort((a, b) => Number(a) - Number(b))
                                                                    .forEach((key:any) => {
                                                                        if (Number(key) !== index) {
                                                                            const newIndex = Number(key) > index ? Number(key) - 1 : Number(key);
                                                                            updatedFileLists[newIndex] = prev[key];
                                                                        }
                                                                    });
                                                                return updatedFileLists;
                                                            });

                                                            // Cập nhật lại dayNumber nếu cần
                                                            const schedules = form.getFieldValue('schedules') || [];
                                                            const updatedSchedules = schedules.map((schedule: any, idx: any) => ({
                                                                ...schedule,
                                                                dayNumber: `Ngày ${idx + 1}`,
                                                            }));
                                                            form.setFieldsValue({ schedules: updatedSchedules });

                                                        }
                                                    });
                                                }} style={{ fontSize: 20, color: 'red', cursor: 'pointer' }}
                                            />

                                        </div>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    label={requiredLabel('Hoạt động')}
                                                    required={false}
                                                    name={[name, 'activity']}
                                                    rules={[{ required: true, message: 'Nhập hoạt động!' }]}
                                                >
                                                    <Input placeholder="Mô tả hoạt động" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    {...restField}
                                                    required={false}
                                                    label={requiredLabel('Địa điểm')}
                                                    name={[name, 'location']}
                                                    rules={[{ required: true, message: 'Nhập địa điểm!' }]}
                                                >
                                                    <Input placeholder="Nhập địa điểm" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item
                                            {...restField}
                                            label="Ảnh Tour"
                                            name={[name, 'imageTourSchedule']}
                                            valuePropName="fileList"
                                            getValueFromEvent={() => fileLists[key] || []} // ✅ dùng key thay vì name
                                            extra="Tối đa 8 ảnh, định dạng JPG/PNG"
                                            key={key}
                                        >
                                            <Upload
                                                listType="picture-card"
                                                action="https://api.cloudinary.com/v1_1/ecommercer2021/image/upload"
                                                data={{ upload_preset: 'demo-upload' }}
                                                onPreview={handlePreview}
                                                onChange={({ fileList }) => {
                                                    setFileLists((prev) => ({
                                                        ...prev,
                                                        [index]: fileList, // ✅ dùng key
                                                    }));
                                                }}
                                                multiple
                                                accept="image/png, image/jpeg"
                                                fileList={fileLists[index] || []} // ✅ dùng key
                                                style={{ width: '120px', height: '120px' }}
                                            >
                                                {(fileLists[key]?.length || 0) >= 8 ? null : uploadButton}
                                            </Upload>


                                            {previewImage && (
                                                <Image
                                                    wrapperStyle={{ display: 'none' }}
                                                    preview={{
                                                        visible: previewOpen,
                                                        onVisibleChange: (visible) => setPreviewOpen(visible),
                                                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                                    }}
                                                    src={previewImage}
                                                />
                                            )}
                                        </Form.Item>
                                    </div>
                                ))}

                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            const schedules = form.getFieldValue('schedules') || [];
                                            const lastDayNumber = schedules.length > 0 ? schedules[schedules.length - 1].dayNumber || 0 : 0;
                                            add({ dayNumber: lastDayNumber + 1, activity: '', location: '', imageTourSchedule: [] });
                                        }}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm ngày mới
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Lưu lịch trình
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default EditTourSchedule;

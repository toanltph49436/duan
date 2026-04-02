/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Checkbox, Col, Empty, Form, Image, Input, InputNumber, message, Row, Select, Upload, type FormProps, type GetProp, type SelectProps, type UploadFile, type UploadProps } from 'antd'
import { useState } from 'react'
import ReactQuill from "react-quill";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import instance from '../../configs/axios';


type LabelRender = SelectProps['labelRender'];
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const AddRoom = () => {
    const [value, setValue] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const {data:location} = useQuery({
        queryKey:['location'],
        queryFn:async () => {
            return await instance.get("/location")
        }
    })
    const { mutate, isPending, isError } = useMutation({
        mutationFn: async (data: any) => {
            try {
                return await instance.post('/room', data)
            } catch (error) {
                throw new Error((error as any).message)
            }
        },
        onSuccess: () => {
            messageApi.open({
                type: "success",
                content: "Bạn thêm phòng thành công",
            });
            form.resetFields();
        },
        onError: () => {
            messageApi.open({
                type: "error",
                content: "Bạn thêm phòng thất bại. Vui lòng thử lại sau!",
            });
        },
    })

    const requiredLabel = (text: string) => (
        <>
            {text} <span className="text-red-500"> *</span>
        </>
    );
    const options = [
        { label: 'Phòng Đơn', value: 'Phòng Đơn' },
        { label: 'Phòng Đôi', value: 'Phòng Đôi' },
        { label: 'Phòng VIP', value: 'Phòng VIP' },
        { label: 'Phòng Tập Thể', value: 'Phòng Tập Thể' },
    ];
    const labelRender: LabelRender = (props) => {
        const { label, value } = props;

        if (label) {
            return value;
        }
        return <span>Chọn loại phòng</span>;
    };
    const toolbarOptions = [
        ["bold", "italic", "underline", "strike"], 
        ["blockquote", "code-block"],
        ["link", "image", "video", "formula"],

        [{ header: 1 }, { header: 2 }], 
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ script: "sub" }, { script: "super" }], 
        [{ indent: "-1" }, { indent: "+1" }], 
        [{ direction: "rtl" }], 

        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], 
        [{ font: [] }],
        [{ align: [] }],

        ["clean"],
    ];
    const modules = {
        toolbar: toolbarOptions,
    };
    const getBase64 = (file: FileType): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };
    const handleChange: UploadProps["onChange"] = ({
        fileList: newFileList,
    }) => {
        setFileList(newFileList);
    };

    const onFinish: FormProps<any>["onFinish"] = (values) => {
        const imageUrls = fileList
            .filter((file) => file.status === "done")
            .map((file) => file.response?.secure_url);

        const newValues = {
            ...values,
            imageRoom: imageUrls,
        };

        console.log("Data being sent:", newValues);
        mutate(newValues);
    };



    const uploadButton = (
        <button style={{ border: 0, background: "none" }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
 
    if (isError)
        return (
            <div>
                {" "}
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
        );
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-semibold text-blue-600">Thêm Phòng</h1>
            </div>
            {contextHolder}
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <Form
                    name="add-hotel"
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    validateTrigger="onBlur"

                >
                    <Row gutter={[24, 24]}>
                        {/* Bên trái - 60% */}
                        <Col xs={24} sm={24} md={16} lg={15}>
                            <Form.Item
                                required={false}
                                label={requiredLabel("Tên Phòng")}
                                name="nameRoom"
                                rules={[{ required: true, message: 'Tên phòng không được để trống' }]}
                            >
                                <Input placeholder="VD: Phòng Deluxe" disabled={isPending} style={{ width: "100%" }}
                                    size="large" />
                            </Form.Item>

                            {/* Dòng chung cho "Sức Chứa" và "Giá mỗi đêm" */}
                            <Row gutter={24}>
                                <Col xs={24} sm={8} md={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Sức Chứa")}
                                        name="capacityRoom"
                                        rules={[
                                            {
                                                type: 'number',
                                                min: 1,

                                                message: 'Sức chứa tối thiểu là 1 người',
                                                transform: (value) => Number(value),  // chuyển giá trị sang number để kiểm tra
                                            },
                                        ]}
                                    >

                                        <Input type="number" placeholder="Phòng chứa được bao nhiêu người" disabled={isPending} style={{ width: "100%" }}
                                            size="large" />
                                    </Form.Item>
                                </Col>


                                <Col xs={24} sm={8} md={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Giá mỗi đêm")}
                                        name="priceRoom"
                                        rules={[
                                            {
                                                validator(_, value) {
                                                    if (value === undefined || value === null || value === '') {
                                                        return Promise.reject('Vui lòng nhập giá');
                                                    }
                                                    const num = Number(value);
                                                    if (isNaN(num)) {
                                                        return Promise.reject('Giá phải là số hợp lệ');
                                                    }
                                                    if (!Number.isInteger(num)) {
                                                        return Promise.reject('Giá phải là số nguyên');
                                                    }
                                                    if (num <= 0) {
                                                        return Promise.reject('Giá phải lớn hơn 0');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
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


                                <Col xs={24} sm={8} md={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Địa Chỉ")}
                                        name="locationId"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn Địa Chỉ' },
                                        
                                        ]}
                                    >
                                        <Select  placeholder="Chọn Địa Chỉ" disabled={isPending} style={{ width: "100%" }}
                                            size="large" options={location?.data?.location?.map((location: any) => ({
                                                label: location.locationName + ' - ' + location.country,
                                                value: location._id
                                            }))}
                                            onChange={(value) => {
                                                // Cập nhật giá trị của trường category
                                                form.setFieldsValue({
                                                    location: value,
                                                });
                                              }}/>
                                    </Form.Item>
                                </Col>

                            </Row>


                            <Form.Item label="Mô tả phòng" name="descriptionRoom" className="mb-16">
                                <ReactQuill
                                    className="h-[300px]"
                                    theme="snow"
                                    value={value}
                                    onChange={setValue}
                                    modules={modules}
                                    

                                />
                            </Form.Item>
                        </Col>

                        {/* Bên phải - 40% */}
                        <Col xs={24} sm={24} md={8} lg={9}>
                            <Form.Item
                                required={false}
                                label={requiredLabel("Loại Phòng")}
                                name="typeRoom"
                                rules={[{ required: true, message: 'Vui lòng nhập loại phòng' }]}
                            >
                                <Select disabled={isPending} labelRender={labelRender} defaultValue="1" style={{ width: "100%" }}
                                    size="large" options={options} />
                            </Form.Item>

                            <Form.Item
                                required={false}
                                label={requiredLabel("Ảnh Phòng")}
                                name="imageRoom"
                                rules={[
                                    {
                                        validator: () => {
                                            if (fileList.length === 0) {
                                                return Promise.reject(new Error('Vui lòng chọn ít nhất 1 ảnh phòng'));
                                            }
                                            // Kiểm tra các file đã upload thành công (status === 'done')
                                            const hasSuccessFile = fileList.some(file => file.status === 'done');
                                            if (!hasSuccessFile) {
                                                return Promise.reject(new Error('Vui lòng đợi ảnh upload xong hoặc chọn ảnh hợp lệ'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/ecommercer2021/image/upload"
                                    data={{ upload_preset: 'demo-upload' }}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    multiple
                                    disabled={isPending}
                                    accept="image/png, image/jpeg"
                                >
                                    {fileList.length >= 8 ? null : uploadButton}
                                </Upload>
                                {previewImage && (
                                    <Image
                                        wrapperStyle={{ display: "none" }}
                                        preview={{
                                            visible: previewOpen,
                                            onVisibleChange: (visible) => setPreviewOpen(visible),
                                            afterOpenChange: (visible) => !visible && setPreviewImage(""),
                                        }}
                                        src={previewImage}
                                    />
                                )}
                            </Form.Item>

                            <Form.Item  required={false} name='amenitiesRoom' label={requiredLabel("Dịch Vụ Phòng")} rules={[{ required: true, message: 'Vui lòng chọn dịch vụ phòng' }]}>
                                <Checkbox.Group style={{ width: "100%" }}
                                     disabled={isPending}>
                                    <Row>
                                        <Col span={8}>
                                            <Checkbox value="WiFi miễn phí">WiFi miễn phí</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Dịch vụ phòng">Dịch vụ phòng</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Hồ bơi">Hồ bơi</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="Miễn phí bữa sáng">Miễn phí bữa sáng</Checkbox>
                                        </Col>
                                        <Col span={8}>
                                            <Checkbox value="View đẹp">View đẹp</Checkbox>
                                        </Col>
                                    </Row>
                                </Checkbox.Group>

                            </Form.Item>
                        </Col>

                        {/* Nút Submit */}
                        <Col span={24}>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={isPending}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white mt-10"
                                >
                                    {isPending ? <LoadingOutlined /> : 'Thêm Phòng'}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    )
}

export default AddRoom
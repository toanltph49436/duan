/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { Button, Col, Form, Image, Input, message, Row, Select, Upload, type FormProps, type GetProp, type UploadProps } from "antd"
import instance from "../../configs/axios";
import { useState } from "react";
import type { UploadFile } from "antd/lib";
import { PlusOutlined } from "@ant-design/icons";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const AddTransport = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [transportType, setTransportType] = useState<string>("");
    const requiredLabel = (text: string) => (
        <>
            {text} <span className="text-red-500">*</span>
        </>
    );
    const { mutate, isPending } = useMutation({
        mutationFn: async (data: any) => {
            try {
                return await instance.post('/transport', data)
            } catch (error) {
                throw new Error("Failed to add transport")
            }
        },
        onSuccess: () => {
            messageApi.open({
                type: "success",
                content: "Bạn thêm phương tiện thành công",
            });
            form.resetFields();
        },
        onError: () => {
            messageApi.open({
                type: "error",
                content: "Bạn thêm phương tiện thất bại. Vui lòng thử lại sau!",
            });
        },
    })
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
            imageTransport: imageUrls,
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

    return (
        <>
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-blue-600">➕ Thêm Phương Tiện Mới</h1>
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
                                        name="transportName"
                                        rules={[{ required: true, message: "Tên Phương Tiện không được để trống" }]}
                                    >
                                        <Input disabled={isPending} placeholder="VD: Phương Tiện Xe Khách" size="large" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Biển Số Phương Tiện")}
                                        name="transportNumber"
                                        rules={[
                                            { required: true, message: "Nhập Biển Số Phương Tiện" },
                                            { min: 2, max: 100, message: "Phải từ 2–100 ký tự" },
                                        ]}
                                    >
                                        <Input disabled={isPending} placeholder="VD: 29B-12345" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Loại Phương Tiện")}
                                        name="transportType"
                                        rules={[{ required: true, message: "Vui lòng chọn loại Phương Tiện" }]}
                                    >
                                        <Select
                                            disabled={isPending}
                                            size="large"
                                            placeholder="Chọn loại Phương Tiện"
                                            onChange={(value) => setTransportType(value)}
                                            options={[
                                                { label: "Máy Bay", value: "Máy Bay" },
                                                { label: "Tàu Hỏa", value: "Tàu Hỏa" },
                                                { label: "Thuyền", value: "Thuyền" },
                                                { label: "Xe Khách", value: "Xe Khách" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>

                            </Row>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Nơi Đón Khách")}
                                        name="departureLocation"
                                        rules={[
                                            { required: true, message: "Nhập Nơi Đón Khách" },
                                            { min: 2, max: 100, message: "Phải từ 2–100 ký tự" },
                                        ]}
                                    >
                                        <Input disabled={isPending} placeholder="VD: 29B-12345" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        required={false}
                                        label={requiredLabel("Nơi Trả Khách")}
                                        name="arrivalLocation"
                                        rules={[
                                            { required: true, message: "Nhập Nơi Trả Khách" },
                                            { min: 2, max: 100, message: "Phải từ 2–100 ký tự" },
                                        ]}
                                    >
                                        <Input disabled={isPending} placeholder="VD: 29B-12345" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            {/* Các trường giá vé máy bay - chỉ hiển thị khi transportType là "Máy Bay" */}
                            {transportType === "Máy Bay" && (
                                <>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-blue-600 mb-4">💰 Thông Tin Giá Vé Máy Bay</h3>
                                    </div>
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Giá vé người lớn (VNĐ)"
                                                name="flightPrice"
                                                rules={[{ required: true, message: "Vui lòng nhập giá vé người lớn" }]}
                                            >
                                                <Input 
                                                    disabled={isPending} 
                                                    placeholder="VD: 2500000" 
                                                    size="large" 
                                                    type="number"
                                                    min={0}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Giá vé trẻ em (VNĐ)"
                                                name="flightPriceChildren"
                                                rules={[{ required: true, message: "Vui lòng nhập giá vé trẻ em" }]}
                                            >
                                                <Input 
                                                    disabled={isPending} 
                                                    placeholder="VD: 2000000" 
                                                    size="large" 
                                                    type="number"
                                                    min={0}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={24}>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Giá vé trẻ nhỏ (VNĐ)"
                                                name="flightPriceLittleBaby"
                                                rules={[{ required: true, message: "Vui lòng nhập giá vé trẻ nhỏ" }]}
                                            >
                                                <Input 
                                                    disabled={isPending} 
                                                    placeholder="VD: 1500000" 
                                                    size="large" 
                                                    type="number"
                                                    min={0}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label="Giá vé em bé (VNĐ)"
                                                name="flightPriceBaby"
                                                rules={[{ required: true, message: "Vui lòng nhập giá vé em bé" }]}
                                            >
                                                <Input 
                                                    disabled={isPending} 
                                                    placeholder="VD: 500000" 
                                                    size="large" 
                                                    type="number"
                                                    min={0}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            )}
                            
                            <Form.Item
                                required={false}
                                label={requiredLabel("Ảnh Phương Tiện")}
                                name="imageTransport"
                                rules={[
                                    {
                                        validator: () => {
                                            if (fileList.length === 0) {
                                                return Promise.reject(new Error('Vui lòng chọn ít nhất 1 ảnh Phương Tiện'));
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
        </>
    )
}

export default AddTransport

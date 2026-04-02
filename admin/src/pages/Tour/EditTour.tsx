/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Upload,
  type GetProp,
  type UploadFile,
  type UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import instance from "../../configs/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const EditTour = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [value, setValue] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const discountPercent = Form.useWatch("discountPercent", form);

  // 🔹 API
  const { data } = useQuery({
    queryKey: ["tour", id],
    queryFn: async () => instance.get(`/tour/${id}`),
    enabled: !!id,
  });

  const { data: location } = useQuery({
    queryKey: ["location"],
    queryFn: async () => instance.get("/location"),
  });

  const { data: transport } = useQuery({
    queryKey: ["transport"],
    queryFn: () => instance.get("/transport"),
  });

  // 🔹 Update
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: any) =>
      await instance.put(`/tour/${id}`, payload),
    onSuccess: () => {
      message.success("Sửa thành công 🎉");
      navigate("/admin/list-tour");
      queryClient.invalidateQueries({ queryKey: ["tour"] });
    },
    onError: () => message.error("Sửa thất bại"),
  });

  // 🔹 Set data
  useEffect(() => {
    if (data?.data?.tour) {
      const tour = data.data.tour;

      if (tour.discountExpiryDate) {
        tour.discountExpiryDate = dayjs(tour.discountExpiryDate);
      }

      setValue(tour.descriptionTour || "");

      if (tour.imageTour) {
        setFileList(
          tour.imageTour.map((url: string, i: number) => ({
            uid: i.toString(),
            name: "image",
            status: "done",
            url,
          }))
        );
      }

      form.setFieldsValue({
        ...tour,
        destination: tour.destination?._id,
        departure_location: tour.departure_location,
        itemTransport: tour.itemTransport?.map(
          (t: any) => t.TransportId?._id
        ),
      });
    }
  }, [data, form]);

  // 🔹 Upload
  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList }) =>
    setFileList(fileList);

  // 🔹 Submit
  const onFinish = (values: any) => {
    const imageUrls = fileList
      .filter((f) => f.status === "done")
      .map((f) => f.url || f.response?.secure_url);

    let finalPrice = values.price;
    if (values.discountPercent && values.discountPercent > 0) {
      finalPrice = Math.round(
        values.price - (values.price * values.discountPercent) / 100
      );
    }

    mutate({
      ...values,
      finalPrice,
      imageTour: imageUrls,
      descriptionTour: value,
      itemTransport: values.itemTransport?.map((id: any) => ({
        TransportId: id,
      })),
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          ✏️ Sửa Tour
        </h1>

        <div className="bg-white p-8 rounded-xl shadow-md">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Row gutter={[24, 24]}>
              {/* LEFT */}
              <Col xs={24} lg={16}>
                {/* TÊN TOUR */}
                <Form.Item
                  label="Tên Tour"
                  name="nameTour"
                  rules={[
                    { required: true, message: "Không để trống" },
                    {
                      validator: async (_, value) => {
                        if (!value) return;
                        const res = await instance.get("/tour");
                        const exists = res.data.tours.some(
                          (t: any) =>
                            t.nameTour.toLowerCase().trim() ===
                              value.toLowerCase().trim() &&
                            t._id !== id
                        );
                        if (exists) {
                          return Promise.reject("Tên tour đã tồn tại");
                        }
                      },
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>

                {/* DEST + DEPART */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="destination" label="Điểm Đến" rules={[{ required: true }]}>
                      <Select
                        size="large"
                        options={location?.data?.location?.map((l: any) => ({
                          label: `${l.locationName} - ${l.country}`,
                          value: l._id,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="departure_location"
                      label="Nơi Xuất Phát"
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (value === getFieldValue("destination")) {
                              return Promise.reject("Không được trùng điểm đến");
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Select
                        size="large"
                        options={location?.data?.location?.map((l: any) => ({
                          label: `${l.locationName} - ${l.country}`,
                          value: l._id,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="duration" label="Số Ngày" rules={[{ required: true }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* GIÁ */}
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item name="price" label="Giá Tour">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="priceChildren" label="Giá Trẻ Em">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="priceLittleBaby" label="Giá Trẻ Nhỏ">
                      <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 🔥 GIẢM GIÁ */}
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item name="discountPercent" label="Phần trăm giảm giá (%)">
                      <InputNumber min={1} max={100} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="discountExpiryDate"
                      label="Ngày hết hạn giảm giá"
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const d = getFieldValue("discountPercent");
                            if (!d || d <= 0) return Promise.resolve();
                            if (!value) return Promise.reject("Chọn ngày hết hạn");
                            if (value.isBefore(dayjs())) {
                              return Promise.reject("Phải lớn hơn hiện tại");
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        showTime
                        style={{ width: "100%" }}
                        disabled={!discountPercent || discountPercent <= 0}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* MÔ TẢ */}
                <Form.Item label="Mô tả">
                  <ReactQuill value={value} onChange={setValue} />
                </Form.Item>
              </Col>

              {/* RIGHT */}
              <Col xs={24} lg={8}>
                <Form.Item name="itemTransport" label="Phương tiện">
                  <Select
                    mode="multiple"
                    options={transport?.data?.transport?.map((t: any) => ({
                      label: t.transportName,
                      value: t._id,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Ảnh Tour"
                  rules={[
                    {
                      validator: () =>
                        fileList.length
                          ? Promise.resolve()
                          : Promise.reject("Chọn ít nhất 1 ảnh"),
                    },
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    onPreview={handlePreview}
                    onChange={handleChange}
                    fileList={fileList}
                  >
                    {fileList.length < 8 && "+ Upload"}
                  </Upload>
                </Form.Item>

                <Form.Item name="featured" valuePropName="checked">
                  <Checkbox>Sản phẩm nổi bật</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Button type="primary" htmlType="submit" block>
              ✅ Cập nhật Tour
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditTour;
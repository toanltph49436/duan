import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, DatePicker, Form, InputNumber, message, Row, Select } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import instance from "../../configs/axios";
import dayjs from "dayjs";
import { useState } from "react";

const AddTimeTour = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch tours for selection
  const { data: tourData, isLoading: isTourLoading } = useQuery({
    queryKey: ["tour"],
    queryFn: async () => instance.get("/tour"),
  });
  const tours = tourData?.data?.tours || [];

  // Mutation for adding slots
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      try {
        return await instance.post("/date", data);
      } catch (error) {
        throw new Error("Failed to add slots");
      }
    },
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Thêm ngày và số chỗ cho Tour thành công!",
      });
      form.resetFields();
    },
    onError: () => {
      messageApi.open({
        type: "error",
        content: "Thêm thất bại. Vui lòng thử lại sau!",
      });
    },
  });

  // Form submit handler
  const onFinish = (values: any) => {
    const { tourId, slots } = values;
    const formattedSlots = slots.map((slot: any) => ({
      date: slot.date.format(),
      seats: slot.seats,
    }));
    mutate({ tourId, slots: formattedSlots });
  };

  // Required label helper
  const requiredLabel = (text: string) => (
    <>
      {text} <span className="text-red-500">*</span>
    </>
  );

  // Prepare options for Select
  const tourOptions = tours.map((tour: any) => ({
    label: `${tour.nameTour} (${tour.destination?.locationName || ''} - ${tour.destination?.country || ''})`,
    value: String(tour._id),
    key: String(tour._id),
  }));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-600">➕ Thêm Ngày & Số Chỗ Cho Tour</h1>
        </div>
        {contextHolder}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <Form
            layout="vertical"
            form={form}
            name="add-time-tour"
            onFinish={onFinish}
            validateTrigger="onBlur"
          >
            <Form.Item
              label={requiredLabel("Chọn Tour")}
              name="tourId"
              rules={[{ required: true, message: "Vui lòng chọn tour" }]}
            >
              <Select
                showSearch
                placeholder="Chọn tour"
                loading={isTourLoading}
                optionFilterProp="label"
                options={tourOptions}
                size="large"
                filterOption={(input, option) =>
                  (option?.label as string).toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.List name="slots" rules={[{ validator: async (_, slots) => {
              if (!slots || slots.length < 1) {
                return Promise.reject(new Error("Thêm ít nhất 1 ngày và số chỗ!"));
              }
            }}]}>
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, idx) => (
                    <Row gutter={16} key={String(field.key ?? field.name)} align="middle" className="mb-2">
                      <Col span={10}>
                        <Form.Item
                          {...field}
                          label={idx === 0 ? requiredLabel("Ngày diễn ra") : ""}
                          name={[field.name, "date"]}
                          fieldKey={[field.fieldKey, "date"]}
                          rules={[{ required: true, message: "Chọn ngày" }]}
                        >
                          <DatePicker
                            size="large"
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            disabledDate={current => current && current < dayjs().startOf("day")}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          label={idx === 0 ? requiredLabel("Số chỗ") : ""}
                          name={[field.name, "seats"]}
                          fieldKey={[field.fieldKey, "seats"]}
                          rules={[
                            { required: true, message: "Nhập số chỗ" },
                            { type: "number", min: 1, max: 200, message: "Từ 1 đến 200 chỗ" },
                          ]}
                        >
                          <InputNumber size="large" min={1} max={200} style={{ width: "100%" }} placeholder="Số chỗ" />
                        </Form.Item>
                      </Col>
                      <Col span={4} className="flex items-center mt-6">
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                    >
                      Thêm ngày & số chỗ
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 mt-6"
                loading={isPending}
              >
                ✅ Xác Nhận Thêm Ngày & Số Chỗ
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddTimeTour;
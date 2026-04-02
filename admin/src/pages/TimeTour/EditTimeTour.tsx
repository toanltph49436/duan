import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, DatePicker, Form, InputNumber, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../configs/axios";
import dayjs from "dayjs";

const EditTimeTour = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Fetch slot info
  const { data: slotData, isLoading } = useQuery({
    queryKey: ["slot", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await instance.get(`/date/slot/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Update slot mutation: sử dụng PUT để cập nhật trực tiếp
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: any) => {
      return await instance.put(`/date/slot/${id}`, {
        date: values.date.format(),
        seats: values.seats,
      });
    },
    onSuccess: () => {
      messageApi.success("Cập nhật slot thành công!");
      navigate(-1);
    },
    onError: () => {
      messageApi.error("Cập nhật thất bại!");
    },
  });

  useEffect(() => {
    if (slotData) {
      form.setFieldsValue({
        date: dayjs(slotData.dateTour),
        seats: slotData.availableSeats,
      });
    }
  }, [slotData, form]);

  const onFinish = (values: any) => {
    mutate(values);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">✏️ Chỉnh Sửa Ngày & Số Chỗ</h1>
        {contextHolder}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="bg-white p-8 rounded-xl shadow-md"
        >
          <Form.Item
            label="Ngày diễn ra"
            name="date"
            rules={[{ required: true, message: "Chọn ngày" }]}
          >
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={current => current && current < dayjs().startOf("day")}
            />
          </Form.Item>
          <Form.Item
            label="Số chỗ"
            name="seats"
            rules={[
              { required: true, message: "Nhập số chỗ" },
              { type: "number", min: 1, max: 200, message: "Từ 1 đến 200 chỗ" },
            ]}
          >
            <InputNumber size="large" min={1} max={200} style={{ width: "100%" }} placeholder="Số chỗ" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full bg-blue-600 hover:bg-blue-700 transition duration-200 mt-6"
              loading={isPending}
              disabled={isLoading}
            >
              ✅ Xác Nhận Cập Nhật
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EditTimeTour;
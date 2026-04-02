// src/pages/admin/AddBlog.tsx
import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Upload,
  message,
  Select,
  Row,
  Col,
} from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { instanceAdmin } from "../../configs/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { UploadFile, UploadProps } from "antd";

const { Option } = Select;

interface BlogFormData {
  title: string;
  content: string;
  image_url: string;
  author_name: string;
  status: "draft" | "published";
}

const AddBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // mutation tạo blog
  const createBlogMutation = useMutation({
    mutationFn: (data: BlogFormData) => instanceAdmin.post("/posts", data), // ✅ đúng BE
    onSuccess: () => {
      message.success("Tạo blog thành công!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] }); // ✅ refresh list
      navigate("/admin/list-blog"); // ✅ chuyển về list đúng
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Có lỗi khi tạo blog!");
    },
  });

  const handleSubmit = (values: any) => {
    const blogData: BlogFormData = {
      title: values.title,
      content,
      image_url: fileList[0]?.response?.secure_url || fileList[0]?.url || "",
      status: values.status,
      author_name: values.author_name,
    };

    createBlogMutation.mutate(blogData);
  };

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  return (
    <div className="p-6">
      <Card
        title="Thêm Blog Mới"
        extra={
          <Button onClick={() => navigate("/admin/list-blog")}>
            Quay lại
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "published",
            author_name: "Admin",
          }}
        >
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card title="Nội dung chính" className="mb-6">
                <Form.Item
                  name="title"
                  label="Tiêu đề blog"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input placeholder="Nhập tiêu đề blog..." size="large" />
                </Form.Item>

                <Form.Item label="Nội dung blog" required>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    style={{ height: "400px", marginBottom: "50px" }}
                  />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Cài đặt xuất bản" className="mb-6">
                <Form.Item name="status" label="Trạng thái">
                  <Select size="large">
                    <Option value="published">Xuất bản ngay</Option>
                    <Option value="draft">Lưu nháp</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="author_name"
                  label="Tác giả"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên tác giả!" },
                  ]}
                >
                  <Input placeholder="Tên tác giả" />
                </Form.Item>
              </Card>

              <Card title="Ảnh đại diện" className="mb-6">
                <Form.Item>
                  <Upload
                    name="file"
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    action="https://api.cloudinary.com/v1_1/ecommercer2021/image/upload"
                    data={{ upload_preset: "demo-upload" }}
                    accept="image/*"
                    maxCount={1}
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={createBlogMutation.isPending}
          >
            Lưu Blog
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AddBlog;

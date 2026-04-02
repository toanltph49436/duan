// src/pages/admin/EditBlog.tsx
import { useEffect, useState } from "react";
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
  Spin,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const EditBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Fetch blog detail
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await instanceAdmin.get(`/posts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // set data vào form khi có blog
  useEffect(() => {
    if (data?.post) {
      const blog = data.post;
      form.setFieldsValue({
        title: blog.title,
        status: blog.status,
        author_name: blog.author_name,
      });
      setContent(blog.content || "");
      if (blog.image_url) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: blog.image_url, // ảnh cũ
          },
        ]);
      }
    } else if (data && !data.post) {
      message.error("Không tìm thấy bài viết!");
      navigate("/admin/list-blog");
    }
  }, [data, form, navigate]);

  // nếu lỗi server
  useEffect(() => {
    if (isError) {
      message.error("Lỗi khi tải dữ liệu bài viết!");
      navigate("/admin/list-blog");
    }
  }, [isError, navigate]);

  // mutation update blog
  const updateBlogMutation = useMutation({
    mutationFn: (formData: BlogFormData) =>
      instanceAdmin.put(`/posts/${id}`, formData),
    onSuccess: () => {
      message.success("Cập nhật blog thành công!");
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      navigate("/admin/list-blog");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Có lỗi khi cập nhật!");
    },
  });

  const handleSubmit = (values: any) => {
    const blogData: BlogFormData = {
      title: values.title,
      content,
      image_url:
        fileList[0]?.response?.secure_url || // ảnh mới upload từ Cloudinary
        fileList[0]?.url || // ảnh cũ từ DB
        "",
      status: values.status,
      author_name: values.author_name,
    };
    updateBlogMutation.mutate(blogData);
  };

  const handleUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title="Chỉnh sửa Blog"
        extra={
          <Button onClick={() => navigate("/admin/list-blog")}>Quay lại</Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={updateBlogMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default EditBlog;

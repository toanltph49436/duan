import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { instanceAdmin } from "../../configs/axios";
import { Card, Button, Spin, message } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import React from "react";

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  // Lấy chi tiết bài viết
  const { data, isLoading } = useQuery({
    queryKey: ["blogDetail", slug],
    queryFn: async () => {
      const res = await instanceAdmin.get(`/blog/${slug}`);
      return res.data.post;
    },
    enabled: !!slug,
  });

  // Mutation like
  const likeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await instanceAdmin.post(`/posts/${id}/like`);
      return res.data;
    },
    onSuccess: () => {
      message.success("Bạn đã thích bài viết!");
      queryClient.invalidateQueries({ queryKey: ["blogDetail", slug] });
    },
    onError: () => {
      message.error("Có lỗi khi like bài viết");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <p>Không tìm thấy bài viết.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
        <p className="text-gray-500 mb-2">
          Tác giả: {data.author_name} | {new Date(data.createdAt).toLocaleDateString()}
        </p>
        {data.image_url && (
          <img src={data.image_url} alt={data.title} className="w-full rounded mb-6" />
        )}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />

        {/* Like button */}
        <div className="mt-6 flex items-center gap-4">
          <Button
            type="primary"
            icon={<LikeOutlined />}
            onClick={() => likeMutation.mutate(data._id)}
            loading={likeMutation.isPending}
          >
            Thích ({data.likes})
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BlogDetail;

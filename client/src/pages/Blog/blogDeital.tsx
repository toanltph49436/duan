import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instanceClient from "../../../configs/instance";
import { Heart } from "lucide-react";

interface Blog {
    _id: string;
    title: string;
    content: string;
    image_url: string;
    author_name: string;
    createdAt: string;
    slug: string;
    likes: number;
}

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const queryClient = useQueryClient();

    // 📌 Fetch blog detail
    const { data, isPending, isError } = useQuery({
        queryKey: ["blog", slug],
        queryFn: async () => {
            const res = await instanceClient.get(`/blog/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });

    const blog: Blog | undefined = data?.post;

    // 📌 Like mutation
    const likeMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await instanceClient.post(`/posts/${id}/like`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blog", slug] });
        },
    });

    // 📌 Loading & Error
    if (isPending) return <p className="text-center py-10">⏳ Đang tải...</p>;
    if (isError || !blog)
        return (
            <p className="text-center text-red-500 py-10">
                ❌ Không tìm thấy bài viết
            </p>
        );

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-6 bg-white rounded-3xl shadow-lg p-8">
                {/* 🔹 Tiêu đề */}
                <h1 className="text-4xl font-extrabold text-gray-900 leading-snug mb-4 text-center">
                    {blog.title}
                </h1>

                {/* 🔹 Meta info */}
                <div className="flex justify-center items-center gap-3 text-sm text-gray-500 mb-6">
                    <span>{new Date(blog.createdAt).toLocaleDateString("vi-VN")}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">
                        {blog.author_name || "Admin"}
                    </span>
                </div>
                <div className="w-20 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-10 rounded-full"></div>

                {/* 🔹 Ảnh minh họa */}
                {blog.image_url && (
                    <div className="flex justify-center mb-10">
                        <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="rounded-2xl shadow-xl max-h-[450px] object-cover w-full"
                        />
                    </div>
                )}

                {/* 🔹 Nội dung */}
                <div
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-12 prose-headings:font-semibold prose-a:text-blue-600 prose-a:underline-offset-2"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* 🔹 Like button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => likeMutation.mutate(blog._id)}
                        disabled={likeMutation.isPending}
                        className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full shadow-lg transition transform hover:-translate-y-1 disabled:opacity-60"
                    >
                        <Heart
                            size={22}
                            className={`transition ${likeMutation.isPending ? "animate-ping" : "fill-white"
                                }`}
                        />
                        <span className="font-medium">
                            {blog.likes || 0} Lượt thích
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
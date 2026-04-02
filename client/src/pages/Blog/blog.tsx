import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import instanceClient from "../../../configs/instance";
import { Link } from "react-router-dom";

interface Blog {
  _id: string;
  title: string;
  content: string;
  image_url: string;
  author_name: string;
  createdAt: string;
  slug: string;
  likes?: number; 
}

export default function Blog() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await instanceClient.get("/blog");
      return res.data;
    },
  });

  const blogs: Blog[] = data?.posts || [];

  //  Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const startIndex = (currentPage - 1) * blogsPerPage;
  const currentBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

  //  Top 5 bài nổi bật theo lượt tim
  const featuredBlogs = useMemo(() => {
    return blogs
      .slice()
      .sort((a, b) => (b.likes || 0) - (a.likes || 0)) // sắp xếp giảm dần theo likes
      .slice(0, 5);
  }, [blogs]);

  if (isLoading) return <p className="text-center">⏳ Đang tải...</p>;
  if (isError) return <p className="text-center text-red-500">❌ Lỗi khi tải dữ liệu</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Hero Banner */}
      <div
        className="relative bg-cover bg-center h-72 md:h-96"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">
            Khám Phá Blog Du Lịch
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-lg text-gray-200">
            Những câu chuyện, kinh nghiệm và cẩm nang du lịch từ khắp mọi miền.
          </p>
        </div>
      </div>

      {/* 🔹 Main Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 🔹 Content */}
        <main className="lg:col-span-3 space-y-10">
          <div className="grid sm:grid-cols-2 gap-8">
            {currentBlogs.map((blog) => (
              <article
                key={blog._id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <Link to={`/blog/${blog.slug}`} className="block relative">
                  <img
                    src={blog.image_url || "https://via.placeholder.com/600x300"}
                    alt={blog.title}
                    className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </Link>
                <div className="p-6">
                  <p className="text-xs uppercase text-gray-500 mb-2">
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")} •{" "}
                    {blog.author_name}
                  </p>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="block text-lg font-bold text-gray-800 hover:text-blue-600 transition"
                  >
                    {blog.title}
                  </Link>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-3">
                    {blog.content.replace(/<[^>]+>/g, "").slice(0, 160)}...
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* 🔹 Pagination */}
          <div className="flex justify-center items-center gap-3 pt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 border rounded-full disabled:opacity-40 hover:bg-gray-100"
            >
              ← Trước
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-10 h-10 flex items-center justify-center border rounded-full transition ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 border rounded-full disabled:opacity-40 hover:bg-gray-100"
            >
              Sau →
            </button>
          </div>
        </main>

        {/* 🔹 Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-3 font-bold text-gray-800 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              Bài viết nổi bật
            </div>
            <ul className="divide-y divide-gray-100">
              {featuredBlogs.map((blog) => (
                <li
                  key={blog._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                >
                  <Link to={`/blog/${blog.slug}`} className="flex items-center gap-4">
                    <img
                      src={blog.image_url || "https://via.placeholder.com/60"}
                      alt={blog.title}
                      className="w-16 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">
                        {blog.title}
                      </p>
                      <span className="text-xs text-gray-500">{blog.likes || 0} ❤️</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

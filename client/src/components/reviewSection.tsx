import { useState } from "react";
import { FaQuoteLeft } from 'react-icons/fa';

const reviews = [
  {
    name: 'Chị Thu Hà',
    title: 'Du thuyền Heritage Bình Chuẩn',
    content: 'Chị rất cảm ơn team đã tư vấn cho chị chọn du thuyền Heritage Bình Chuẩn. Bố mẹ chị rất ưng ý em ạ! Tàu đẹp, mang đậm phong cách Á Đông. Đồ ăn hợp khẩu vị. Các bạn nhân viên trên tàu nhiệt tình và chu đáo.',
  },
  {
    name: 'Anh Khánh',
    title: 'Du thuyền Ambassador',
    content: 'Tôi hài lòng với trải nghiệm sang trọng và dịch vụ đẳng cấp. Không gian cực kỳ ấn tượng, nhân viên rất chu đáo.',
  },
  {
    name: 'Chị Linh',
    title: 'Du thuyền Mon Cheri',
    content: 'Tôi thích cách tổ chức tour và thực đơn các món ăn. Rất phù hợp cho gia đình có trẻ nhỏ.',
  },
  {
    name: 'Bạn Hoàng',
    title: 'Du thuyền Stellar',
    content: 'Mình đã có trải nghiệm tuyệt vời cùng nhóm bạn. Không gian giải trí rất chill!',
  },
  {
    name: 'Cô Thanh Hằng',
    title: 'Du thuyền Orchid',
    content: 'Đội ngũ nhân viên thân thiện, chương trình tour rõ ràng, view đẹp, xứng đáng 5 sao.',
  },
];

const ReviewSection = () => {
  const [current, setCurrent] = useState(0);

  return (
    <section className="bg-white py-16 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề */}
        <h2 className="text-3xl font-bold mb-2">
          Đánh giá từ những<br />người đã trải nghiệm
        </h2>
        <div className="w-36 h-1 bg-teal-400 mb-6 rounded-full" />

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Bên trái: Đánh giá */}
          <div>
            <div className="flex items-center text-teal-500 mb-3">
              <FaQuoteLeft className="text-2xl mr-2" />
              <span className="font-bold text-lg">
                {reviews[current].title}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              {reviews[current].content}
            </p>
            <p className="font-semibold">{reviews[current].name}</p>
          </div>

          {/* Bên phải: Giới thiệu */}
          <div className="text-lg text-gray-800 font-medium leading-relaxed">
            Khách hàng chia sẻ về những kỷ niệm tuyệt vời trên chuyến hành trình
            du lịch với chúng tôi.
          </div>
        </div>

        {/* Danh sách tên người đánh giá */}
        <div className="flex flex-wrap gap-3 mt-10">
          {reviews.map((review, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                index === current
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {review.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;

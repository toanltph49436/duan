import { useState } from "react";

const faqList = [
  {
    question: "Điều kiện đăng ký tour như thế nào?",
    answer:
      "Để đăng ký tour, bạn cần cung cấp thông tin cá nhân và thanh toán trước một khoản đặt cọc. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.",
  },
  {
    question:
      "Cần phải đăng ký tour trước bao lâu? Hồ sơ cần phải chuẩn bị trước bao lâu?",
    answer:
      "Nên đăng ký trước 7–30 ngày. Tour quốc tế cần hộ chiếu, visa (nếu có); tour trong nước cần CMND/CCCD.",
  },
  {
    question:
      "Khách lớn tuổi đi tour cần điều kiện gì? Tôi đăng ký mua tour trực tiếp khách lớn tuổi mà không được?",
    answer:
      "Khách trên 70 tuổi cần có người thân đi kèm và giấy xác nhận đủ sức khỏe từ bác sĩ.",
  },
  {
    question: "Khách dưới 18 tuổi đăng ký tour thì cần điều kiện gì?",
    answer:
      "Cần giấy khai sinh và giấy ủy quyền của phụ huynh nếu không đi cùng cha/mẹ.",
  },
  {
    question: "Tôi có thể thanh toán tiền mặt ở đâu? Có cần phải đến công ty không?",
    answer:
      "Có thể thanh toán tại văn phòng hoặc qua chuyển khoản. Không bắt buộc phải đến công ty.",
  },
  {
    question:
      "Tới công ty thanh toán bằng hình thức cà thẻ được không? Cà thẻ có mất phí cà thẻ không?",
    answer:
      "Có. Thanh toán bằng thẻ tại văn phòng. Phí cà thẻ phụ thuộc vào ngân hàng phát hành.",
  },
  {
    question: "Giá tour đã bao gồm VAT chưa? Tôi muốn xuất hóa đơn được không?",
    answer:
      "Giá đã bao gồm VAT. Công ty có hỗ trợ xuất hóa đơn theo yêu cầu.",
  },
  {
    question: "Điểm tham quan ở nước ngoài có an toàn hay không?",
    answer:
      "Các tour đều đến điểm đến an toàn, đã được kiểm định, có hướng dẫn viên theo đoàn",
  },
  {
    question:
      "Khách sạn có nằm ngay trung tâm không? Khách sạn có đủ tiêu chuẩn như đã báo không?",
    answer:
      "Khách sạn đạt chuẩn, đúng như mô tả, thường nằm gần trung tâm hoặc điểm du lịch chính.",
  },
  {
    question: "Cách tìm và đặt tour online?",
    answer:
      "Truy cập website, chọn tour và điền thông tin. Nhân viên sẽ liên hệ xác nhận và hỗ trợ đặt chỗ.",
  },
];

export const HotelPolicy = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-4 py-12 mx-auto max-w-7xl">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Câu hỏi thường gặp?
        </h2>
        <p className="mt-2 text-gray-500">
          Chúng tôi vinh hạnh vì đã có cơ hội đồng hành với hơn 10.000 khách hàng
          trên khắp thế giới
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {faqList.map((faq, index) => (
          <div
            key={index}
            className="p-4 transition bg-blue-100 shadow rounded-xl hover:bg-blue-200"
          >
            <div
              onClick={() => toggle(index)}
              className="flex items-center justify-between gap-1.5 cursor-pointer rounded-md border border-gray-100 bg-gray-50 p-4 text-gray-900"
            >
              <h2 className="text-lg font-medium">{faq.question}</h2>
              <svg
                className={`size-5 shrink-0 transition-transform duration-300 ${openIndex === index ? "-rotate-180" : ""
                  }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {openIndex === index && (
              <p className="px-4 pt-4 text-gray-900">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
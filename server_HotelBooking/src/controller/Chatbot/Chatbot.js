const express = require("express");

const Chat = express.Router();

// Danh sách câu hỏi và trả lời mẫu
const FAQ = {
  "chính sách hủy tour": `Quy Định Hủy Tour\n\n
  Hủy trước 15 ngày so với ngày khởi hành: Hoàn 100% giá trị tour (trừ phí ngân hàng, phí dịch vụ nếu có).\n\n
  Hủy từ 14 - 7 ngày trước ngày khởi hành: Hoàn 50% giá trị tour.\n\n
  Hủy dưới 7 ngày hoặc không tham gia: Không hoàn tiền.\n\n
  Lưu ý: Thời gian hủy được tính từ lúc nhận được thông báo chính thức của khách hàng qua email hoặc hệ thống đặt tour.`,

  "điều khoản đặt tour": `Điều khoản đặt tour\n\n
  \nĐiều khoản này áp dụng cho tất cả các khách hàng sử dụng dịch vụ đặt tour trực tuyến trên website của chúng tôi. Khi đặt tour, khách hàng được xem như đã đọc, hiểu và đồng ý với các điều khoản sau.\n
  \nKhách hàng lựa chọn tour, điền đầy đủ thông tin cá nhân và thông tin liên hệ chính xác.\n\n
  Hoàn tất thanh toán theo hướng dẫn trên website.
  \n\nXác nhận đặt tour sẽ được gửi qua email trong vòng 24 giờ sau khi thanh toán thành công.\n\n
  Giá tour được niêm yết công khai trên website và có thể thay đổi tùy theo thời điểm đặt.\n\n
  Thanh toán có thể được thực hiện bằng chuyển khoản ngân hàng, ví điện tử hoặc các phương thức được hỗ trợ trên hệ thống.\n\n
  Các khoản phí dịch vụ, phụ thu (nếu có) sẽ được thông báo trước khi khách hàng xác nhận thanh toán.\n`,

  "chính sách hoàn tiền": `Chính sách hoàn tiền: Khách hàng gửi yêu cầu hoàn tiền qua hệ thống hoặc email trong vòng 48 giờ sau khi hủy tour.\n\n
  Thời gian xử lý hoàn tiền: từ 7 - 14 ngày làm việc tùy theo phương thức thanh toán ban đầu.\n\n
  Số tiền hoàn trả sẽ khấu trừ các khoản phí phát sinh (nếu có) như phí ngân hàng, phí visa, vé máy bay đã xuất, v.v.`,

  "quy định đặt phòng ": `Khách hàng phải cung cấp đầy đủ và chính xác các thông tin cần thiết như: họ tên, số điện thoại, email, ngày nhận – trả phòng, số lượng khách và các yêu cầu đặc biệt (nếu có).
  Hệ thống sẽ gửi xác nhận đặt phòng qua email hoặc tin nhắn SMS sau khi đơn đặt phòng được ghi nhận thành công.`,

  "chính sách hủy phòng và hoàn tiền": `Khách hàng có thể hủy phòng miễn phí trước thời hạn quy định được thông báo tại thời điểm đặt phòng (ví dụ: trước 72 giờ so với thời gian nhận phòng).
  Đối với các đơn hủy sau thời hạn quy định hoặc trường hợp khách không đến, khách hàng sẽ bị tính phí theo quy định của khách sạn hoặc đơn vị cung cấp dịch vụ (có thể lên đến 100% tổng chi phí đặt phòng).
  Tiền hoàn (nếu có) sẽ được xử lý trong vòng 3 – 7 ngày làm việc tùy theo phương thức thanh toán.`
};

function findAnswer(message) {
  const lower = message.toLowerCase();
  if (lower.includes("điều khoản")) return FAQ["điều khoản đặt tour"];
  if (lower.includes("hoàn tiền khi hủy tour")) return FAQ["chính sách hoàn tiền"];
  if (lower.includes("hủy tour")) return FAQ["chính sách hủy tour"];
  if (lower.includes("đặt phòng")) return FAQ["quy định đặt phòng "];
  if (lower.includes("hủy phòng") || lower.includes("hoàn tiền khi hủy phòng ")) return FAQ["chính sách hủy phòng và hoàn tiền"];
  for (const key in FAQ) {
    if (lower.includes(key.trim())) return FAQ[key];
  }
  return "Xin lỗi, mình chỉ hỗ trợ thông tin về chính sách, điều khoản, hủy/hoàn tour. Bạn vui lòng hỏi đúng nội dung nhé!";
}

Chat.post("/chat", (req, res) => {
  const { message } = req.body;
  const reply = findAnswer(message || "");
  res.json({ reply });
});

module.exports = Chat;

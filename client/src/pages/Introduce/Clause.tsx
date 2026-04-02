
import React from 'react';
import { Link } from 'react-router-dom';

const Clause = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Điều khoản & Chính sách
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Các điều khoản và chính sách của chúng tôi
        </p>
      </div>

      <div className="space-y-12">
        {/* Chính sách hoàn tiền */}
        <section id="refund-policy" className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách hoàn tiền khi hủy tour</h2>
            
            <div className="prose prose-lg max-w-none">
              <p>
                Chúng tôi hiểu rằng đôi khi kế hoạch của bạn có thể thay đổi. Dưới đây là chính sách hoàn tiền của chúng tôi khi bạn cần hủy tour:
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-4">Đối với tour trong nước:</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian hủy
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mức hoàn tiền
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Trước 30 ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">Hoàn 100% tiền đặt cọc</td>
                      <td className="px-6 py-4">Không phát sinh phí hủy</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Từ 15-29 ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">Hoàn 70% tiền đặt cọc</td>
                      <td className="px-6 py-4">Phí hủy 30% tiền đặt cọc</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Từ 7-14 ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-medium">Hoàn 50% tiền đặt cọc</td>
                      <td className="px-6 py-4">Phí hủy 50% tiền đặt cọc</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Từ 4-6 ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap text-orange-600 font-medium">Hoàn 30% tiền đặt cọc</td>
                      <td className="px-6 py-4">Phí hủy 70% tiền đặt cọc</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Dưới 3 ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">Không hoàn tiền</td>
                      <td className="px-6 py-4">Phí hủy 100% tiền đặt cọc</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">Chính sách hủy vé máy bay:</h3>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Chính sách hủy vé máy bay đặc biệt:</strong>
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                      <li><strong>Trong vòng 24 giờ đầu sau khi đặt vé:</strong> Được phép hủy và hoàn tiền 100% mà không mất phí.</li>
                      <li><strong>Sau 24 giờ:</strong> Vé máy bay sau khi xuất vé thành công sẽ không thể hủy trên website. Khách hàng cần liên hệ với nhân viên tư vấn để được hỗ trợ xử lý vé theo quy định của từng hãng hàng không.</li>
                      <li><strong>Phí hủy vé:</strong> Tùy thuộc vào quy định của từng hãng hàng không và loại vé đã mua.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">Các trường hợp đặc biệt:</h3>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Trường hợp bất khả kháng:</strong> Nếu tour bị hủy do thiên tai, dịch bệnh, hoặc các yếu tố khách quan khác, chúng tôi sẽ hoàn trả 100% tiền đặt cọc hoặc đề xuất chuyển sang tour khác có giá trị tương đương.
                </li>
                <li>
                  <strong>Thay đổi người tham gia:</strong> Khách hàng có thể thay đổi người tham gia tour mà không mất phí, với điều kiện thông báo trước ít nhất 7 ngày đối với tour trong nước.
                </li>
                <li>
                  <strong>Thay đổi lịch tour:</strong> Việc thay đổi lịch tour sẽ được xem xét như hủy tour cũ và đăng ký tour mới, áp dụng chính sách hủy tour tương ứng.
                </li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Lưu ý:</strong> Mọi yêu cầu hủy tour cần được gửi bằng văn bản và được xác nhận bởi công ty du lịch. Thời gian hủy tour được tính dựa trên ngày công ty nhận được yêu cầu hủy chính thức.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="mt-8">
                Để biết thêm thông tin chi tiết hoặc có thắc mắc về chính sách hoàn tiền, vui lòng liên hệ với chúng tôi qua email <a href="mailto:elitebooking.tour@gmail.com" className="text-blue-600 hover:text-blue-800">elitebooking.tour@gmail.com</a> hoặc hotline <a href="tel:0922222016" className="text-blue-600 hover:text-blue-800">0922222016</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Các phần khác của trang điều khoản */}
        {/* ... */}
      </div>

      <div className="mt-12 text-center">
        <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Clause;

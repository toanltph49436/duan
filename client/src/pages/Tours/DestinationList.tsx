import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pagination, Spin, message } from "antd";
import instanceClient from "../../../configs/instance";
import TourList from "../../components/TourList";

// Định nghĩa hoặc import DestinationType phù hợp với dữ liệu
interface DestinationType {
  nameTour: string;
  departure_location: string;
  // ... các trường khác nếu có ...
}

const DestinationList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tour', currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      return instanceClient.get(`/tour?${params}`);
    }
  });

  console.log(data?.data);
  const tours = data?.data?.tours || [];
  const pagination = data?.data?.pagination;

  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    message.error('Không thể tải danh sách tour');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</div>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-4 md:px-8 py-6 max-w-screen-2xl mx-auto mt-8">
      <section className="flex-1">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-center mb-2">Bạn lựa chọn địa điểm du lịch nào?</h2>
          <p className="text-center text-gray-500 mb-4">
            {pagination ? `${pagination.totalTours} điểm đến hấp dẫn đang chờ bạn khám phá` : 'Hơn 100 điểm đến hấp dẫn đang chờ bạn khám phá'}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <input
              type="text"
              placeholder="🔍 Nhập tên địa điểm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border rounded-full px-5 py-2 w-full md:w-96 focus:outline-none"
            />
            <button 
              onClick={handleSearch}
              className="bg-teal-500 text-white font-medium rounded-full px-6 py-2 hover:bg-teal-600 transition"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="mb-8">
          <TourList tours={tours} loading={isLoading} />
        </div>

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={pagination.currentPage}
              total={pagination.totalTours}
              pageSize={pagination.limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} của ${total} tour`
              }
              className="bg-white p-4 rounded-lg shadow"
            />
          </div>
        )}
      </section>
    </main>
  );
};

export default DestinationList;

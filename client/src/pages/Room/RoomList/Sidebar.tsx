

const Sidebar: React.FC = () => {
  return (
    <aside className=" md:w-64 bg-white p-4 border rounded-xl shadow text-sm space-y-6 mt-12">
      {/* Tiêu đề */}
      <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Danh mục Hotels</h2>

      {/* Tour nội địa & quốc tế */}
      <div className="space-y-2">
        <details className="w-full group open:bg-gray-50 px-2 py-1 rounded transition">
          <summary className="cursor-pointer font-medium text-gray-700">Tour trong nước</summary>
        </details>
        <details className="w-full group open:bg-gray-50 px-2 py-1 rounded transition">
          <summary className="cursor-pointer font-medium text-gray-700">Tour nước ngoài</summary>
        </details>
      </div>

      {/* Chọn mức giá */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Chọn mức giá</h3>
        <div className="space-y-1 text-gray-600">
          {[
            "Giá dưới 1.000.000đ",
            "1.000.000đ - 3.000.000đ",
            "3.000.000đ - 5.000.000đ",
            "5.000.000đ - 7.000.000đ",
            "7.000.000đ - 9.000.000đ",
            "Giá trên 9.000.000đ",
          ].map((label, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Điểm khởi hành */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Điểm khởi hành</h3>
        <div className="space-y-1 text-gray-600">
          {["Hà Nội", "TP Hồ Chí Minh", "Huế", "Đà Nẵng", "Bình Dương"].map((city, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              {city}
            </label>
          ))}
          <button className="text-blue-500 text-xs mt-1 hover:underline">Xem thêm ▼</button>
        </div>
      </div>

      {/* Điểm đến */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Điểm đến</h3>
        <div className="space-y-1 text-gray-600">
          {["Úc", "Trung Quốc", "Hàn Quốc", "Nhật Bản", "Singapore"].map((place, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              {place}
            </label>
          ))}
          <button className="text-blue-500 text-xs mt-1 hover:underline">Xem thêm ▼</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

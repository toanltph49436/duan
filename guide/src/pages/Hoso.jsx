import React from "react";

const Hoso = () => {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Hồ sơ cá nhân</h1>
      <div className="p-6 bg-white shadow rounded-xl">
        <div className="flex items-center space-x-6">
          <img
            src="https://i.pravatar.cc/120"
            alt="user"
            className="border rounded-full w-28 h-28"
          />
          <div>
            <h2 className="text-xl font-semibold">Nguyễn Thanh Tùng</h2>
            <p className="text-gray-500">Tư vấn viên</p>
            <button className="px-4 py-2 mt-3 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hoso;

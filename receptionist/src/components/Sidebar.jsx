import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menu = [
    { name: "Phòng được giao", path: "/app", icon: "🏨" },
    { name: "Thông báo", path: "/thongbao", icon: "🔔" },
    { name: "Hồ sơ", path: "/hoso", icon: "👤" },
  ];

  return (
    <div className={`h-full w-64 bg-[#E6F3FA] p-4 flex flex-col shadow-md 
        ${isOpen ? "block" : "hidden"} md:block`}>
      {/* Avatar + Info */}
      <div className="flex flex-col items-center">
        <img
          src="https://i.pravatar.cc/100"
          alt="avatar"
          className="w-20 h-20 border rounded-full"
        />
        <h2 className="mt-2 font-semibold">Nguyễn Văn A</h2>
        <p className="text-sm text-gray-500">Quản trị khách sạn</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-3">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                    active
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

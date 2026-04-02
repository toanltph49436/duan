import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const menu = [
    { name: "Tour được giao", path: "/tour", icon: "📋" },
    { name: "Thông báo", path: "/thongbao", icon: "🔔" },
    { name: "Hồ sơ", path: "/hoso", icon: "👤" },
  ];

  return (
    <aside className="flex flex-col w-64 h-full text-white bg-gray-800 shadow-lg">
      <div className="flex flex-col items-center py-6 border-b border-gray-700">

        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-2 border-gray-600">
          <span className="text-white font-bold text-xl">
            {user?.firstName?.charAt(0).toUpperCase() || 'H'}
            {user?.lastName?.charAt(0).toUpperCase() || 'D'}
          </span>
        </div>
        <h2 className="mt-3 font-semibold">
          {user?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Hướng dẫn viên'}
        </h2>
        <p className="text-sm text-gray-400">
          {user?.position === 'tour_guide' ? 'Hướng dẫn viên' : 
           user?.position === 'customer_service' ? 'Chăm sóc khách hàng' :
           user?.position === 'manager' ? 'Quản lý' : 'Nhân viên'}
        </p>
        {user?.employee_id && (
          <p className="text-xs text-blue-400 mt-1">ID: {user.employee_id}</p>
        )}
      </div>

      <nav className="flex-1 px-4 mt-6">
        <ul className="space-y-2">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    active ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"
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

      <div className="p-4 text-xs text-gray-400 border-t border-gray-700">
        © 2025 Admin Panel
      </div>
    </aside>
  );
};

export default Sidebar;

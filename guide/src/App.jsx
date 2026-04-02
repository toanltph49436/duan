import React, { useState } from "react";

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TourDuocGiao from "./pages/TourDuocGiao";
import Thongbao from "./pages/Thongbao";
import Hoso from "./pages/Hoso";


const MainApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 z-30 transform bg-gray-800 md:bg-transparent 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition-transform duration-200`}
      >
        <Sidebar />
      </div>

      {/* Overlay khi mở sidebar trên mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>

            <Route path="/" element={<Navigate to="/tour" replace />} />
            <Route path="/tour" element={<TourDuocGiao />} />
            <Route path="/thongbao" element={<Thongbao />} />
            <Route path="/hoso" element={<Hoso />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;

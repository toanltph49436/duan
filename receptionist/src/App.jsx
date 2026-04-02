import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import TrangChu from "./pages/Trangchu";
import ThongBao from "./pages/Thongbao";
import HoSo from "./pages/Hoso";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import HotelPicker from "./components/HotelPicker";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<HotelPicker />} />
              <Route path="/:hotelId/login" element={<Login />} />
              <Route path="/app" element={<ProtectedRoute><TrangChu /></ProtectedRoute>} />
              <Route path="/thongbao" element={<ProtectedRoute><ThongBao /></ProtectedRoute>} />
              <Route path="/hoso" element={<ProtectedRoute><HoSo /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login onLogin={(userData) => {
      // Token is already set in Login component, just need to call login
      const token = localStorage.getItem("hdv_token");
      if (token) {
        login(userData, token);
      }
    }} />;
  }

  return children;
};

export default ProtectedRoute;

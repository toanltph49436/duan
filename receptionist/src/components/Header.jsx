import React from "react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { selectedHotel, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg">
      {/* Logo H và tên khách sạn */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-4 shadow-md transform hover:scale-110 transition-transform duration-200">
          <span className="text-blue-600 font-bold text-xl">H</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">Reception</h1>
          {selectedHotel && (
            <p className="text-sm text-blue-100 font-medium">{selectedHotel.hotelName}</p>
          )}
        </div>
      </div>
      
      {/* Logout Button */}
      <button 
        onClick={logout}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 hover:shadow-lg"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;

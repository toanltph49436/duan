import  { useState } from "react";
import Introduce from "./Introduce";
import Clause from "./Clause";
import Privacy from "./Privacy";
import Use from "./Use";

const sections = [
  { title: "Giới thiệu", component: <Introduce /> },
  { title: "Điều khoản & Điều kiện", component: <Clause /> },
  { title: "Chính sách quyền riêng tư", component: <Privacy /> },
  { title: "Hướng dẫn sử dụng", component: <Use /> },
];

const InfoAll = () => {

  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mặc định mở phần đầu tiên (Giới thiệu)

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'transparent',
        padding: '32px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white">Thông tin chung</h1>
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div 
              key={idx} 
              className="border rounded-lg shadow-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: 'none'
              }}
            >
              <button
                className="w-full text-left px-6 py-4 font-semibold text-lg flex justify-between items-center focus:outline-none hover:bg-gray-50 rounded-t-lg"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{sec.title}</span>
                <span>{openIndex === idx ? "▲" : "▼"}</span>
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-6">
                  {sec.component}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoAll;
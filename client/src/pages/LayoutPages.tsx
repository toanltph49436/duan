import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"

import ChatBot from "../components/Chatbot";
const LayoutPages = () => {
  return (
    <div>
      <Header />
      <div className="pt-20">
        <Outlet />
      </div>
      <Footer />
      <ChatBot />
    </div>
  )
}

export default LayoutPages

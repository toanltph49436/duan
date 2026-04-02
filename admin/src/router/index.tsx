import { Route, Routes } from "react-router-dom"
import Layout from "../pages/Layout"
import ListDashboad from "../pages/dashboad/ListDashboad"


import ListBlog from "../pages/Blog/ListBlog"
import AddBlog from "../pages/Blog/AddBlog"
import EditBlog from "../pages/Blog/EditBlog"
import Login from "../components/Login"
import { useUser } from "@clerk/clerk-react"
import AdminRoute from "../components/AdminRouter"
import AddTimeTour from "../pages/TimeTour/AddTimeTour"
import ListTime from "../pages/TimeTour/ListTime"
import EditTimeTour from "../pages/TimeTour/EditTimeTour"
import SlotDetail from "../pages/TimeTour/SlotDetail"
// import TourStats from "../pages/dashboad/TourStats" // Đã bỏ trang thống kê tổng quan
import TourStatusList from "../pages/Tour/TourStatusList"
import RefundManagement from "../pages/Tour/RefundManagement"
import TourParticipants from "../pages/Tour/TourParticipants"
import CustomerAccounts from "../pages/Account/CustomerAccounts"
import EmployeeAccounts from "../pages/Account/EmployeeAccounts"
import EmployeeAssignment from "../pages/Account/EmployeeAssignment"
import ListHotel from "../pages/Hotel/ListHotel"
import AddHotel from "../pages/Hotel/AddHotel"
import EditHotel from "../pages/Hotel/EditHotel"
import HotelDetail from "../pages/Hotel/HotelDetail"
import ListHotelBooking from "../pages/Hotel/ListHotelBooking"
import RoomManagement from "../pages/Hotel/RoomManagement"
import AmenityManagement from "../pages/Hotel/AmenityManagement"
import ListTour from "../pages/Tour/ListTour"
import AddTour from "../pages/Tour/AddTour"
import EditTour from "../pages/Tour/EditTour"
import TourDetail from "../pages/Tour/TourDetail"
import ListBooking from "../pages/Tour/ListBooking"
import ListTSchedule from "../pages/TransportSchedule/ListTSchedule"
import AddTSchedule from "../pages/TransportSchedule/AddTSchedule"
import EditTSchedule from "../pages/TransportSchedule/EditTSchedule"
import ListTourSchedule from "../pages/TourSchedule/ListTourSchedule"
import AddTourSchedule from "../pages/TourSchedule/AddTourSchedule"
import EditTourSchedule from "../pages/TourSchedule/EditTourSchedule"
import Detail from "../pages/Blog/Detail"
import HotelAssignment from "../pages/Account/HotelAssignment"
import ListTransport from "../pages/Transport/ListTransport"
import AddTransport from "../pages/Transport/AddTransport"
import EditTransport from "../pages/Transport/EditTransport"




const Router = () => {
    const { isSignedIn } = useUser();

    // Nếu chưa đăng nhập, luôn chuyển về Login page
    if (!isSignedIn) {
        return (
            <Routes>
                <Route path="/" element={<Login />} />
            </Routes>
        );
    }
    return (
        <>
            <Routes>
                <Route path="/admin"
                    element={
                        <AdminRoute>
                            <Layout />
                        </AdminRoute>
                    }>

                    <Route path="/admin/dashboad" element={<ListDashboad />} />


                     <Route path="/admin/list-tour" element={<ListTour />} />
                    <Route path="/admin/add-tour" element={<AddTour />} />
                    <Route path="/admin/edit-tour/:id" element={<EditTour />} />
                    <Route path="/admin/tour-detail/:id" element={<TourDetail />} />
                    <Route path="/admin/list-booking" element={<ListBooking />} />
                    {/* <Route path="/admin/tour-stats" element={<TourStats />} /> */} {/* Đã bỏ trang thống kê tổng quan */}
                    <Route path="/admin/tour-status/:status" element={<TourStatusList />} />
                    <Route path="/admin/refund-management" element={<RefundManagement />} />
                    <Route path="/admin/tour/participants/:slotId" element={<TourParticipants />} />

                    <Route path="/admin/list-transport" element={<ListTransport />} />
                    <Route path="/admin/add-transport" element={<AddTransport />} />
                    <Route path="/admin/edit-transport/:id" element={<EditTransport />} />


                    <Route path="/admin/list-Transport_Schedule" element={<ListTSchedule />} />
                    <Route path="/admin/add-Transport_Schedule" element={<AddTSchedule />} />
                    <Route path="/admin/edit-Transport_Schedule/:id" element={<EditTSchedule />} />

                    <Route path="/admin/list-tourschedule" element={<ListTourSchedule />} />
                    <Route path="/admin/add-tourschedule" element={<AddTourSchedule />} />
                    <Route path="/admin/edit-tourschedule/:id" element={<EditTourSchedule />} />

                    <Route path="/admin/list-blog" element={<ListBlog />} />
                    <Route path="/admin/add-blog" element={<AddBlog />} />
                    <Route path="/admin/edit-blog/:id" element={<EditBlog />} />
                    <Route path="/admin/detail-blog/:id" element={<Detail />} />

                    <Route path="/admin/list-time" element={<ListTime />} />
                    <Route path="/admin/add-timetour" element={<AddTimeTour />} />
                    <Route path="/admin/edit-time-tour/:id" element={<EditTimeTour />} />
                    <Route path="/admin/slot-detail/:id" element={<SlotDetail />} />

                    <Route path="/admin/customer-accounts" element={<CustomerAccounts />} />
                    <Route path="/admin/employee-accounts" element={<EmployeeAccounts />} />
                    <Route path="/admin/employee-assignment" element={<EmployeeAssignment />} />
                    <Route path="/admin/hotel-assignment" element={<HotelAssignment />} />

                    <Route path="/admin/hotels" element={<ListHotel />} />
                    <Route path="/admin/hotels/add" element={<AddHotel />} />
                    <Route path="/admin/hotels/edit/:id" element={<EditHotel />} />
                    <Route path="/admin/hotels/view/:id" element={<HotelDetail />} />
                    <Route path="/admin/hotel-bookings" element={<ListHotelBooking />} />
                    <Route path="/admin/room-management" element={<RoomManagement />} />
                    <Route path="/admin/amenity-management" element={<AmenityManagement />} />
                </Route>
            </Routes>
        </>
    )
}
export default Router
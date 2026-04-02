import { Route, Routes } from "react-router-dom"
import LayoutPages from "../pages/LayoutPages"
import Home from "../pages/Home/LayoutHome"
import InfoAll from "../pages/Introduce/InfoAll"
import YachtDetailPage from "../pages/Book/yacht"
import Transport from "../pages/Tours/Transport"
import DestinationList from "../pages/Tours/DestinationList"
import TransportDetail from "../pages/Tours/TransportDeatil"
import PaymentPage from "../pages/Payment/payment"
import HotelPaymentPage from "../pages/Payment/HotelPayment"
import CheckOutHotel from "../pages/Hotel/CheckOutHotel"
import PaymentResult from "../pages/Booking/Payment"
import Blog from "../pages/Blog/blog"
import JapanTourPage from "../pages/Tour/detailTour"
import BookingAll from "../pages/Booking/BookingAll"
import InfoUser from "../components/InfoUser"
import Checkout from "../pages/Booking/Checkout"
import CheckOutTour from "../pages/Booking/CheckOutTour"
import Clause from "../pages/Introduce/Clause"
import RefundInfo from "../pages/Booking/RefundInfo"
import HotelList from "../pages/Hotel/HotelList"
import HotelListEnhanced from "../pages/Hotel/HotelListEnhanced"
import HotelDetail from "../pages/Hotel/HotelDetail"
import HotelDetailRefactored from "../pages/Hotel/HotelDetailRefactored"
import HotelBookingConfirmation from "../pages/Hotel/HotelBookingConfirmation"
import HotelBookings from "../pages/Hotel/HotelBookings"
import HotelGuestInfo from "../pages/Booking/HotelGuestInfo"
import TestDateSelection from "../components/DateSelection/TestDateSelection"
import TestCashDepositModal from "../components/Payment/TestCashDepositModal"
import { HotelPolicy } from "../pages/Blog/hotelPolicy"
import BlogDetail from "../pages/Blog/blogDeital"
import BookingSuccess from "../pages/Booking/BookingSuccess"


const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<LayoutPages />}>
                <Route path="/" element={<Home />} />
                <Route path="/introduce" element={<InfoAll />} />
                <Route path="/d" element={<YachtDetailPage />} />
                <Route path="/transport" element={<Transport />} />
                <Route path="/destinations" element={<DestinationList />} />
                <Route path="/transports" element={<TransportDetail />} />
                <Route path="/payment/:bookingId" element={<PaymentPage />} />
                <Route path="/payment/hotel-booking/:bookingId" element={<HotelPaymentPage />} />
                <Route path="/checkout-hotel/:bookingId" element={<CheckOutHotel />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} /> 
                <Route path="/detailtour/:id" element={<JapanTourPage />} />
                <Route path="/hotelPolicy" element={<HotelPolicy />} />
                <Route path="/bookingall/:id" element={<BookingAll />} />
                <Route path="/infouser" element={<InfoUser />} />
                <Route path="/date/slot/:id/" element={<Checkout />} />
                <Route path="/booking/:id" element={<CheckOutTour />} />

                <Route path="/clause" element={<Clause />} />
                <Route path="/refund/:bookingId" element={<RefundInfo />} />

                {/* Hotel Routes */}
                <Route path="/hotels" element={<HotelListEnhanced />} />
                <Route path="/hotels/:id" element={<HotelDetailRefactored />} />
                {/* Fallback routes for old components */}
                <Route path="/hotels-old" element={<HotelList />} />
                <Route path="/hotels-old/:id" element={<HotelDetail />} />
                <Route path="/hotel-booking-confirmation/:id" element={<HotelBookingConfirmation />} />
                <Route path="/my-hotel-bookings" element={<HotelBookings />} />
                <Route path="/hotel-guest-info/:id" element={<HotelGuestInfo />} />
                {/* Test routes */}
                <Route path="/test-date-selection" element={<TestDateSelection />} />
                <Route path="/test-cash-deposit-modal" element={<TestCashDepositModal />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
            </Route>
        </Routes>
    )
}
export default Router
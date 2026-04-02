
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/mongodb");
const Vnpay = require("./router/vnpay/vnpayRouter");
const RouterBookingTour = require('./router/TourRouter/BookingTour');
const AdminRouter = require('./router/PeopleRouter/AdminRouter');
const EmployeeRouter = require('./router/PeopleRouter/EmployeeRouter');
const TourSchedule = require('./router/TourRouter/TourScheduleRouter');
const TransportScheduleRouter = require('./router/TransportRouter/TransportScheduleModel');
const TransportRouter = require('./router/TransportRouter/TransportRouter');
const TourRouter = require('./router/TourRouter/TourRouter');

const UserRouter = require('./router/PeopleRouter/UserRouter');
const RouterChecOutBookingTour = require("./router/TourRouter/checkOutTour");
const RouterCheckOutBookingHotel = require("./router/HotelRouter/checkOutHotel");
const routerLocation = require("./router/Location/locationRouter");
const CmtRouter = require("./router/Cmt/CmtRouter");
const { dateRouter } = require("./router/TourRouter/DateTour");

const autoCancelRouter = require("./router/autoCancel/autoCancelRouter");
const RouterHotel = require('./router/HotelRouter/HotelRouter');
const RouterHotelBooking = require('./router/HotelRouter/HotelBookingRouter');
const HotelAssignmentRouter = require('./router/HotelRouter/HotelAssignmentRouter');
const AmenityRouter = require('./router/amenityRoutes');
const { startAutoCancelJob } = require("./jobs/autoCancelJob");
const BlogRouter = require('./router/Blog/Blog');
const Chat = require('./controller/Chatbot/Chatbot');
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));


// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB connection
connectDB();

app.get('/', (req, res) => res.send("API is working"));

// Employee routes - positioned before other API routes to avoid conflicts

// Employee router - MOVED UP BEFORE OTHER ROUTERS
app.use('/api/employee', EmployeeRouter);

app.use('/api', UserRouter);

app.use('/api/', TourRouter);
app.use('/api/', TransportRouter);
app.use('/api/', TransportScheduleRouter);
app.use('/api/', TourSchedule);
app.use('/api/', AdminRouter);

app.use('/api/vnpay', Vnpay);
app.use('/api/', RouterBookingTour);
app.use('/api/', RouterChecOutBookingTour);
app.use('/api/', RouterCheckOutBookingHotel);
app.use('/api/', routerLocation);
app.use('/api/', CmtRouter);
app.use('/api/', dateRouter);

app.use('/api/auto-cancel', autoCancelRouter);
app.use('/api/', RouterHotel);
app.use('/api/', RouterHotelBooking);
app.use('/api/hotel-assignment', HotelAssignmentRouter);
app.use('/api/admin/amenities', AmenityRouter);
app.use('/api/', BlogRouter);
app.use('/api/', Chat);
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Khởi động cron job tự động hủy booking
  startAutoCancelJob();
});
mongoose.connection.once("open", () => {
  console.log("DB name:", mongoose.connection.name);
  console.log("DB host:", mongoose.connection.host);
});

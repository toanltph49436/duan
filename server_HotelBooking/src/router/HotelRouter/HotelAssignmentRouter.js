const express = require("express");
const router = express.Router();
const ctrl = require("../../controller/HotelController/HotelAssignmentController");
const { verifyClerkTokenAndAdmin, verifyEmployeeToken } = require("../../Middleware/Middleware");

// Admin
router.get("/admin/all", verifyClerkTokenAndAdmin, ctrl.getAllHotelAssignments);
router.get("/admin/hotel/:hotelId", verifyClerkTokenAndAdmin, ctrl.getHotelAssignmentsByHotel);
router.get("/admin/employee/:employeeId", verifyClerkTokenAndAdmin, ctrl.getHotelAssignmentsByEmployee);
router.post("/admin/create", verifyClerkTokenAndAdmin, ctrl.createHotelAssignment);
router.put("/admin/update/:assignmentId", verifyClerkTokenAndAdmin, ctrl.updateHotelAssignment);
router.delete("/admin/delete/:assignmentId", verifyClerkTokenAndAdmin, ctrl.deleteHotelAssignment);

// Employee
router.get("/employee/my-assignments", verifyEmployeeToken, ctrl.getEmployeeHotelAssignments);
router.get("/employee/hotel-info", verifyEmployeeToken, ctrl.getEmployeeHotelInfo);

module.exports = router;

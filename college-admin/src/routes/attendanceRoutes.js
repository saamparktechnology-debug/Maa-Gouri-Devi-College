const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const attendanceFromDeviceController = require("../controllers/attendaneFromDeviceControler");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

router.use(express.text({ type: ["text/*", "application/octet-stream"] }));

router.get("/attendance/daily", attendanceController.getDailyAttendance);
router.post("/attendance/daily", attendanceController.saveDailyAttendance);
// --- Monthly Report ---
router.get("/attendance/monthly", attendanceController.getMonthlyReport);

router.get("/iclock/cdata", attendanceFromDeviceController.handleADMSData);
router.post("/iclock/cdata", attendanceFromDeviceController.handleADMSData);
router.get("/iclock/getrequest", (req, res) => res.send("OK"));

module.exports = router;

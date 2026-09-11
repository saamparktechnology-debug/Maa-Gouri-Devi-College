const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

router.get("/attendance/daily", attendanceController.getDailyAttendance);
router.post("/attendance/daily", attendanceController.saveDailyAttendance);
// --- Monthly Report ---
router.get("/attendance/monthly", attendanceController.getMonthlyReport);
module.exports = router;

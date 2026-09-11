const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // Reusing secure upload
const teacherAttendanceController = require("../controllers/teacherAttendanceController");
router.use(isAuthenticated);

router.get("/teachers", teacherController.getTeachers);
router.get("/teachers/create", teacherController.getAddTeacherForm);

// Allow multi-file upload for credentials
const cpUpload = upload.any();
router.post("/teachers", cpUpload, teacherController.postTeacher);
router.get("/teachers/documents/view/:id", teacherController.viewDocument);
router.get(
  "/teachers/attendance/daily",
  isAuthenticated,
  teacherAttendanceController.getDailyAttendance,
);
router.post(
  "/teachers/attendance/daily",
  isAuthenticated,
  teacherAttendanceController.saveDailyAttendance,
);

router.get(
  "/teachers/attendance/monthly",
  teacherAttendanceController.getMonthlyAttendance,
);

module.exports = router;

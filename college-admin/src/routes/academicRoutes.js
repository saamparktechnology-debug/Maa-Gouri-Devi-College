const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Protect all academic routes
router.use(isAuthenticated);

// --- Session Routes ---
router.get("/sessions", academicController.getSessions);
router.post("/sessions", academicController.addSession);
router.post("/sessions/:id/toggle", academicController.toggleSessionStatus);

// --- Course Routes ---
router.get("/courses", academicController.getCourses);
router.post("/courses", academicController.addCourse);
router.post("/courses/:id/toggle", academicController.toggleCourseStatus);

// --- Semester Routes ---
router.get("/semesters", academicController.getSemesters);
router.post("/semesters", academicController.addSemester);
router.post("/semesters/:id/toggle", academicController.toggleSemesterStatus);

// --- Subject Routes ---
router.get("/subjects", academicController.getSubjects);
router.post("/subjects", academicController.addSubject);
router.post("/subjects/:id/toggle", academicController.toggleSubjectStatus);

module.exports = router;

const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const upload = require("../middleware/uploadMiddleware"); // Your multer config
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

// 1. Static routes MUST come first
router.get("/students", studentController.getStudents);
router.get("/students/create", studentController.getAddStudentForm);
router.post("/students", upload.any(), studentController.postStudent);

// 2. Specific sub-routes with static segments
router.get("/students/document/:id", studentController.viewDocument);

// 3. Dynamic parameter routes MUST come last
router.get("/students/:id", studentController.getStudentProfile);
router.get("/students/:id/edit", studentController.getEditStudentForm);
router.post(
  "/students/:id/edit",
  upload.any(),
  studentController.updateStudent,
); // Added upload.any() here just in case!
router.get("/students/:id/id-card", studentController.getStudentIdCard);

module.exports = router;

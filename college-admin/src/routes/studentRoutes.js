const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const upload = require("../middleware/uploadMiddleware"); // Your multer config
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

router.get("/students", studentController.getStudents);
router.get("/students/create", studentController.getAddStudentForm);
router.post("/students", upload.any(), studentController.postStudent);

router.get("/students/document/:id", studentController.viewDocument);

router.get("/students/:id", studentController.getStudentProfile);
router.get("/students/:id/edit", studentController.getEditStudentForm);
router.post("/students/:id/edit", studentController.updateStudent);
router.get("/students/:id/id-card", studentController.getStudentIdCard);

module.exports = router;

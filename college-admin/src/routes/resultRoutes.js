const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(isAuthenticated);

router.get("/results", resultController.getResultDashboard);
router.get("/results/entry/:studentId", resultController.getMarksEntryForm);
router.post("/results/entry/:studentId", resultController.postMarks);
router.get(
  "/results/marksheet/:studentId/:semesterId",
  resultController.getMarksheet,
);

router.get(
  "/results/completion-certificate/:studentId",
  resultController.getFinalCompletionCertificate,
);

router.get("/results/passed-students", resultController.getPassedStudentsList);
router.get("/results/promote", resultController.getPromotionPage);
router.post("/results/promote", resultController.postPromoteStudents);

router.get("/results/batch-upload", resultController.getBatchUploadPage);
router.post(
  "/results/batch-upload",
  upload.single("batch_pdf"),
  resultController.postBatchUpload,
);
module.exports = router;

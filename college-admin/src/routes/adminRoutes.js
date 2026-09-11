const express = require("express");
const router = express.Router();

const marksheetController = require("../controllers/marksheetController");
const upload = require("../middleware/uploadMiddleware");

// Session Marksheet Routes
router.get("/marksheets", marksheetController.getMarksheets);
router.post(
  "/marksheets",
  upload.single("marksheet_pdf"),
  marksheetController.uploadMarksheet,
);
router.get("/marksheets/view/:id", marksheetController.viewMarksheetFile);

module.exports = router;

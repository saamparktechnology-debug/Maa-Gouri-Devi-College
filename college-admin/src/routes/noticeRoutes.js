const express = require("express");
const router = express.Router();
const noticeController = require("../controllers/noticeController");
const upload = require("../middleware/uploadMiddleware");

router.get("/notices", noticeController.getNotices);
router.post(
  "/notices",
  upload.single("notice_pdf"),
  noticeController.postNotice,
);
router.get("/notices/view/:id", noticeController.viewNoticePdf);
router.post("/notices/delete/:id", noticeController.deleteNotice);

module.exports = router;

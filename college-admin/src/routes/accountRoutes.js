const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { isAuthenticated } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // 1. Import multer middleware

router.use(isAuthenticated);

router.get("/accounts", accountController.getLedger);
router.post("/accounts/category", accountController.addCategory);

// 2. Added upload.single('receipt') to parse text fields and optional file upload
router.post(
  "/accounts/transaction",
  upload.single("receipt"),
  accountController.addTransaction,
);

// 3. Added missing route for viewing uploaded transaction receipts
router.get("/accounts/receipt/:id", accountController.viewReceipt);

module.exports = router;

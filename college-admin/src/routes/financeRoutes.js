const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

// Student Payment Directory
router.get(
  "/finance/student-payments",
  financeController.getStudentPaymentDirectory,
);

// Individual Student Payment History
router.get(
  "/finance/student-payments/:studentId",
  financeController.getStudentPaymentHistory,
);

// Individual Receipt View (using the template you provided)
router.get("/finance/receipt/:paymentId", financeController.viewFeeReceipt);

module.exports = router;

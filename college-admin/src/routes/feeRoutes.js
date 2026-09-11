const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");
const { isAuthenticated } = require("../middleware/authMiddleware");

// Protect all fee routes
router.use(isAuthenticated);

// --- 1. Fee Types ---
router.get("/fees/types", feeController.getFeeTypes);
router.post("/fees/types", feeController.addFeeType);
router.post("/fees/waiver", feeController.applyWaiver);

// --- 2. Fee Structures ---
router.get("/fees/structures", feeController.getFeeStructures);
router.post("/fees/structures", feeController.addFeeStructure);

// --- 3. Academic Fee Payments (Fixed to match Sidebar!) ---
router.get("/fees/payments", feeController.getFeePayments);
router.get("/fees/collection", feeController.getFeePayments); // <-- Catches your sidebar link!

router.get(
  "/fees/payments/student/:studentId",
  feeController.getStudentFeeDetails,
);
router.get("/fees/collection/:studentId", feeController.getStudentFeeDetails);

router.post("/fees/payments/pay", feeController.processFeePayment);

// --- 4. Extra Charges (Dress, Tour, etc.) ---
router.get("/fees/extra", feeController.getExtraCharges);
router.post("/fees/extra", feeController.addExtraCharge);
router.post("/fees/extra/pay/:id", feeController.payExtraCharge);
router.get("/fees/receipt/:id", feeController.getFeeReceipt);
module.exports = router;

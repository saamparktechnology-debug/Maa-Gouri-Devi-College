const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.use(isAuthenticated);

router.get("/salaries", salaryController.getSalaries);
router.post("/salaries/pay", salaryController.paySalary);

module.exports = router;

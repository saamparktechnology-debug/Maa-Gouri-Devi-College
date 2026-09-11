const {
  Student,
  Teacher,
  FeePayment,
  AccountTransaction,
  Result,
  Attendance,
} = require("../models");

exports.getDashboard = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalStudents =
      (await Student.count({ where: { status: "Active" } })) || 0;
    const totalTeachers =
      (await Teacher.count({ where: { status: "Active" } })) || 0;
    const resultsPublished = (await Result.count()) || 0;

    // 2. Financials (Crash-proof math for empty tables)
    const directIncome = await AccountTransaction.sum("amount", {
      where: { transaction_type: "INCOME" },
    });
    const feeIncome = await FeePayment.sum("amount_paid");
    const totalExpenseData = await AccountTransaction.sum("amount", {
      where: { transaction_type: "EXPENSE" },
    });

    const totalIncome =
      (parseFloat(directIncome) || 0) + (parseFloat(feeIncome) || 0);
    const totalExpense = parseFloat(totalExpenseData) || 0;
    const currentBalance = totalIncome - totalExpense;

    // 3. Today's Attendance Quick Stat
    const today = new Date().toISOString().slice(0, 10);
    const presentToday =
      (await Attendance.count({ where: { date: today, status: "PRESENT" } })) ||
      0;

    res.render("dashboard/index", {
      stats: {
        totalStudents,
        totalTeachers,
        totalIncome,
        totalExpense,
        currentBalance,
        resultsPublished,
        presentToday,
      },
      adminName: req.session ? req.session.adminName : "Admin",
    });
  } catch (error) {
    console.error("Real Dashboard Error:", error);
    res
      .status(500)
      .send("Internal Server Error: Check your terminal console for details.");
  }
};

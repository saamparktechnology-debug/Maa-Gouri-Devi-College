const { Teacher, SalaryPayment } = require("../models");

exports.getSalaries = async (req, res) => {
  try {
    // Default to current year if no year is selected in the UI
    const selectedYear = req.query.year || new Date().getFullYear();

    // Fetch active teachers AND their salary payments for the selected year
    const teachers = await Teacher.findAll({
      where: { status: "Active" },
      include: [
        {
          model: SalaryPayment,
          where: { year: selectedYear },
          required: false, // LEFT JOIN: Get teacher even if they have 0 payments this year
        },
      ],
    });

    // Array of months to build our grid
    const months = [
      { val: 1, short: "Jan" },
      { val: 2, short: "Feb" },
      { val: 3, short: "Mar" },
      { val: 4, short: "Apr" },
      { val: 5, short: "May" },
      { val: 6, short: "Jun" },
      { val: 7, short: "Jul" },
      { val: 8, short: "Aug" },
      { val: 9, short: "Sep" },
      { val: 10, short: "Oct" },
      { val: 11, short: "Nov" },
      { val: 12, short: "Dec" },
    ];

    res.render("salaries/index", {
      teachers,
      months,
      selectedYear,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.paySalary = async (req, res) => {
  try {
    const {
      teacher_id,
      month,
      year,
      salary_amount,
      paid_amount,
      payment_date,
      payment_reference,
      remarks,
    } = req.body;

    // Find existing payment or create new
    const [payment, created] = await SalaryPayment.findOrCreate({
      where: { teacher_id, month, year },
      defaults: {
        salary_amount,
        paid_amount,
        payment_date,
        payment_reference,
        remarks,
        status:
          parseFloat(paid_amount) >= parseFloat(salary_amount)
            ? "Paid"
            : "Partial",
      },
    });

    if (!created) {
      // Update existing record
      const newTotal =
        parseFloat(payment.paid_amount) + parseFloat(paid_amount);
      payment.paid_amount = newTotal;
      payment.payment_date = payment_date;
      payment.payment_reference = payment_reference;
      payment.remarks = remarks;
      payment.status =
        newTotal >= parseFloat(payment.salary_amount) ? "Paid" : "Partial";
      await payment.save();
    }

    res.redirect(`/admin/salaries?year=${year}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Salary Payment Error");
  }
};

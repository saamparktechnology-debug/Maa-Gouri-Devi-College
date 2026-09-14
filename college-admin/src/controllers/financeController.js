const {
  Student,
  FeePayment,
  FeeStructure,
  Course,
  Session,
  Semester,
} = require("../models");

// 1. Get List of All Students for the Payment Directory
exports.getStudentPaymentDirectory = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [Course, Semester, { model: Session, as: "AcademicSession" }],
      order: [["first_name", "ASC"]],
    });

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    res.render("finance/student_payments_index", {
      students,
      sessions,
      courses,
      semesters,
      adminName: req.session.adminName,
      currentPath: "/admin/finance/student-payments",
    });
  } catch (error) {
    console.error("Student Payment Directory Error:", error);
    res.status(500).send("Server Error");
  }
};

// 2. Get All Payments Done by a Specific Student
exports.getStudentPaymentHistory = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findByPk(studentId, {
      include: [Course, Semester, { model: Session, as: "AcademicSession" }],
    });

    if (!student) return res.status(404).send("Student not found");

    const payments = await FeePayment.findAll({
      where: { student_id: studentId },
      include: [FeeStructure],
      order: [["created_at", "DESC"]],
    });

    res.render("finance/student_payment_history", {
      student,
      payments,
      adminName: req.session.adminName,
      currentPath: "/admin/finance/student-payments",
    });
  } catch (error) {
    console.error("Student Payment History Error:", error);
    res.status(500).send("Server Error");
  }
};

// 3. View Fee Receipt (Using your custom A5 template)
exports.viewFeeReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findByPk(req.params.paymentId, {
      include: [
        FeeStructure,
        {
          model: Student,
          include: [Course, Semester],
        },
      ],
    });

    if (!payment) return res.status(404).send("Fee Receipt not found");

    res.render("finance/receipt_template", {
      payment,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("View Receipt Error:", error);
    res.status(500).send("Server Error");
  }
};

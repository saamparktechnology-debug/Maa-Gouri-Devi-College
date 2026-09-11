const {
  Student,
  FeePayment,
  ExtraCharge,
  FeeType,
  FeeStructure,
  Course,
  Session,
  Semester,
  FeeWaiver,
  AccountTransaction,
  AccountCategory,
} = require("../models");

// ==========================================
// 1. FEE TYPES
// ==========================================
exports.getFeeTypes = async (req, res) => {
  try {
    const types = await FeeType.findAll();
    res.render("fees/types", { types, adminName: req.session.adminName });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addFeeType = async (req, res) => {
  try {
    const { name } = req.body;
    await FeeType.create({ name });
    res.redirect("/admin/fees/types");
  } catch (error) {
    res.status(500).send("Error adding Fee Type");
  }
};

// ==========================================
// 2. FEE WAIVERS
// ==========================================
exports.applyWaiver = async (req, res) => {
  try {
    const { student_id, fee_structure_id, waiver_amount, reason } = req.body;

    if (!waiver_amount || waiver_amount <= 0) {
      return res.status(400).send("Invalid waiver amount.");
    }

    await FeeWaiver.create({
      student_id: student_id,
      fee_structure_id: fee_structure_id,
      waiver_amount: waiver_amount,
      reason: reason,
      approved_by: req.session.adminName || "System Admin",
    });

    res.redirect(`/admin/fees/collection/${student_id}`);
  } catch (error) {
    console.error("Fee Waiver Error:", error);
    res
      .status(500)
      .send("Error applying fee waiver. Check terminal for details.");
  }
};

// ==========================================
// 3. FEE STRUCTURES
// ==========================================
exports.getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.findAll({
      include: [FeeType, Course, Session, Semester],
    });
    const types = await FeeType.findAll();
    const courses = await Course.findAll({ where: { is_active: true } });
    const sessions = await Session.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    res.render("fees/structures", {
      structures,
      types,
      courses,
      sessions,
      semesters,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.addFeeStructure = async (req, res) => {
  try {
    const {
      fee_type_id,
      session_id,
      course_id,
      semester_id,
      amount,
      due_date,
    } = req.body;

    await FeeStructure.create({
      fee_type_id,
      session_id,
      course_id,
      semester_id,
      amount,
      due_date,
    });
    res.redirect("/admin/fees/structures");
  } catch (error) {
    res.status(500).send("Error adding Fee Structure");
  }
};

// ==========================================
// 4. ACADEMIC FEE PAYMENTS
// ==========================================
exports.getFeePayments = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [Course, Session, Semester],
      where: { status: "Active" },
    });
    res.render("fees/collection", {
      students,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.getStudentFeeDetails = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findByPk(studentId, {
      include: [Course, Session, Semester],
    });

    if (!student) return res.status(404).send("Student not found");

    const structures = await FeeStructure.findAll({
      where: {
        course_id: student.course_id,
        session_id: student.session_id,
        semester_id: student.semester_id,
      },
      include: [FeeType],
    });

    const payments = await FeePayment.findAll({
      where: { student_id: studentId },
      order: [["created_at", "DESC"]], // Ensures latest payment is easy to track
    });

    const waivers = await FeeWaiver.findAll({
      where: { student_id: studentId },
    });

    const feesData = structures.map((structure) => {
      const structurePayments = payments.filter(
        (p) => p.fee_structure_id === structure.id,
      );
      const totalPaid = structurePayments.reduce(
        (sum, p) => sum + (parseFloat(p.amount_paid) || 0),
        0,
      );

      const structureWaivers = waivers.filter(
        (w) => w.fee_structure_id === structure.id,
      );
      const totalWaived = structureWaivers.reduce(
        (sum, w) => sum + (parseFloat(w.waiver_amount) || 0),
        0,
      );

      const baseAmount = parseFloat(structure.amount) || 0;
      const due = baseAmount - totalPaid - totalWaived;

      let status = "Pending";
      if (due <= 0) status = "Paid";
      else if (totalPaid > 0 || totalWaived > 0) status = "Partial";

      // Grab the latest payment ID for this fee structure to activate receipt buttons
      const latestPayment =
        structurePayments.length > 0 ? structurePayments[0] : null;

      return {
        structure,
        totalPaid,
        totalWaived,
        due,
        status,
        latestPaymentId: latestPayment ? latestPayment.id : null, // Added to fix receipt button visibility
      };
    });

    const extraCharges = await ExtraCharge.findAll({
      where: { student_id: studentId },
    });

    res.render("fees/student_fees", {
      student,
      feesData,
      extraCharges,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.processFeePayment = async (req, res) => {
  try {
    const {
      student_id,
      fee_structure_id,
      amount_paid,
      payment_method,
      reference_no,
      payment_date,
    } = req.body;

    // 1. Record the Payment ONLY (No FeeWaiver here!)
    await FeePayment.create({
      student_id,
      fee_structure_id,
      amount_paid,
      payment_method,
      reference_no,
      payment_date,
      status: "Paid",
    });

    // 2. Automate Ledger Sync
    const [category] = await AccountCategory.findOrCreate({
      where: { name: "Academic Fees", type: "INCOME" },
    });

    const student = await Student.findByPk(student_id);

    await AccountTransaction.create({
      category_id: category.id,
      transaction_type: "INCOME",
      amount: amount_paid,
      transaction_date: payment_date,
      payment_method: payment_method,
      reference: reference_no,
      description: `Fee collection from ${student.first_name} ${student.last_name} (Adm: ${student.admission_no})`,
      created_by: req.session.adminId || null,
    });

    res.redirect(`/admin/fees/collection/${student_id}`);
  } catch (error) {
    console.error("Payment Sync Error:", error);
    res.status(500).send("Payment Error");
  }
};

// ==========================================
// 5. EXTRA CHARGES (DRESS/TOUR)
// ==========================================
exports.getExtraCharges = async (req, res) => {
  try {
    const charges = await ExtraCharge.findAll({ include: [Student, Session] });
    const students = await Student.findAll({ where: { status: "Active" } });
    const sessions = await Session.findAll({ where: { is_active: true } });

    res.render("fees/extra", {
      charges,
      students,
      sessions,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addExtraCharge = async (req, res) => {
  try {
    const { student_id, session_id, charge_type, total_amount, due_date } =
      req.body;
    await ExtraCharge.create({
      student_id,
      session_id,
      charge_type,
      total_amount,
      due_date,
      paid_amount: 0,
      status: "Pending",
    });
    res.redirect("/admin/fees/extra");
  } catch (error) {
    res.status(500).send("Error adding extra charge");
  }
};

exports.payExtraCharge = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { charge_type, total_amount, paid_amount, payment_date, remarks } =
      req.body;
    const student = await Student.findByPk(studentId);

    const [charge, created] = await ExtraCharge.findOrCreate({
      where: {
        student_id: studentId,
        charge_type: charge_type,
        session_id: student.session_id,
      },
      defaults: {
        total_amount,
        paid_amount,
        payment_date,
        remarks,
        status:
          parseFloat(paid_amount) >= parseFloat(total_amount)
            ? "Paid"
            : "Partial",
      },
    });

    if (!created) {
      charge.paid_amount =
        parseFloat(charge.paid_amount) + parseFloat(paid_amount);
      charge.status =
        charge.paid_amount >= parseFloat(charge.total_amount)
          ? "Paid"
          : "Partial";
      charge.payment_date = payment_date;
      charge.remarks = remarks;
      await charge.save();
    }

    // Automate Ledger Sync for Extra Charges
    const [category] = await AccountCategory.findOrCreate({
      where: { name: "Other Income", type: "INCOME" },
    });

    await AccountTransaction.create({
      category_id: category.id,
      transaction_type: "INCOME",
      amount: paid_amount,
      transaction_date: payment_date,
      payment_method: "N/A",
      reference: "Extra Charge",
      description: `${charge_type} fee collected from ${student.first_name} ${student.last_name}`,
      created_by: req.session.adminId || null,
    });

    res.redirect(`/admin/fees/collection/${studentId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Extra Charge Error");
  }
};

exports.getFeeReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          include: [Course, Semester],
        },
        FeeStructure,
      ],
    });

    if (!payment) {
      return res.status(404).send("Payment record not found");
    }

    res.render("fees/receipt", {
      payment,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating payment receipt");
  }
};

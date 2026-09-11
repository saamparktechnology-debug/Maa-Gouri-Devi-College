const {
  Student,
  Course,
  Session,
  Semester,
  Subject,
  Result,
  ResultSubjectMark,
  Waiver,
} = require("../models");

// 1. Dashboard for Results
exports.getResultDashboard = async (req, res) => {
  try {
    const { session_id, course_id, semester_id } = req.query;

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    let students = [];
    if (session_id && course_id && semester_id) {
      students = await Student.findAll({
        where: { session_id, course_id, semester_id, status: "Active" },
        include: [{ model: Result, where: { semester_id }, required: false }], // Left Join to see if result exists
      });
    }

    res.render("results/index", {
      sessions,
      courses,
      semesters,
      students,
      filters: req.query,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// 2. Open Marks Entry Form
exports.getMarksEntryForm = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findByPk(studentId, {
      include: [Course, Semester, Session],
    });
    if (!student) return res.status(404).send("Student not found");

    // Fetch subjects for this semester
    const subjects = await Subject.findAll({
      where: { semester_id: student.semester_id, is_active: true },
    });

    // Check if marks already exist to allow editing
    const existingResult = await Result.findOne({
      where: { student_id: studentId, semester_id: student.semester_id },
      include: [ResultSubjectMark],
    });

    res.render("results/entry", {
      student,
      subjects,
      existingResult,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// 3. Save Marks & Calculate
exports.postMarks = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { marks } = req.body;
    console.log("Received marks data:", req.body); // Debugging line

    const student = await Student.findByPk(studentId);
    const subjects = await Subject.findAll({
      where: { semester_id: student.semester_id },
    });

    let total_max = 0;
    let total_obtained = 0;
    let hasFailed = false;
    const subjectMarks = [];

    const calculateGrade = (obtained, max) => {
      const perc = (obtained / max) * 100;
      if (perc >= 90) return "O";
      if (perc >= 80) return "A+";
      if (perc >= 70) return "A";
      if (perc >= 60) return "B+";
      if (perc >= 50) return "B";
      if (perc >= 40) return "C";
      return "F";
    };

    // Loop through subjects using index to match the array format
    subjects.forEach((sub, index) => {
      // marks is an array: index 0 is subject 1, index 1 is subject 2, etc.
      const obtained =
        marks && marks[index] !== undefined ? parseInt(marks[index]) || 0 : 0;

      total_max += sub.max_marks;
      total_obtained += obtained;

      if (obtained < sub.passing_marks) hasFailed = true;

      subjectMarks.push({
        subject_id: sub.id,
        obtained_marks: obtained,
        grade: calculateGrade(obtained, sub.max_marks),
      });
    });

    const percentage = (total_obtained / total_max) * 100;
    const result_status = hasFailed ? "FAIL" : "PASS";

    await Result.destroy({
      where: { student_id: studentId, semester_id: student.semester_id },
    });

    const result = await Result.create({
      student_id: studentId,
      session_id: student.session_id,
      course_id: student.course_id,
      semester_id: student.semester_id,
      total_max_marks: total_max,
      total_obtained_marks: total_obtained,
      percentage: percentage.toFixed(2),
      result_status,
      published_date: new Date(),
    });

    const marksRecords = subjectMarks.map((sm) => ({
      ...sm,
      result_id: result.id,
    }));
    await ResultSubjectMark.bulkCreate(marksRecords);

    res.redirect(
      `/admin/results?session_id=${student.session_id}&course_id=${student.course_id}&semester_id=${student.semester_id}&success=1`,
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving marks");
  }
};

// 4. Generate Marksheet (Print View)
exports.getMarksheet = async (req, res) => {
  try {
    const result = await Result.findOne({
      where: {
        student_id: req.params.studentId,
        semester_id: req.params.semesterId,
      },
      include: [
        { model: Student },
        { model: Course },
        { model: Session },
        { model: Semester },
        { model: ResultSubjectMark, include: [Subject] },
      ],
    });

    if (!result) return res.status(404).send("Result not published yet.");

    // This renders a special A4 print page without the sidebar!
    res.render("results/marksheet", { result });
  } catch (error) {
    res.status(500).send("Error generating marksheet");
  }
};

exports.applyWaiver = async (req, res) => {
  try {
    const { student_id, fee_structure_id, waiver_amount, reason } = req.body;

    // Validation: Prevent negative waivers or zero values
    if (!waiver_amount || waiver_amount <= 0) {
      return res.status(400).send("Invalid waiver amount.");
    }

    await FeeWaiver.create({
      student_id,
      fee_structure_id,
      waiver_amount,
      reason,
      approved_by: req.session.adminName || "System Admin", // Audit trail
    });

    // Redirect back to the specific student's fee dashboard
    res.redirect(`/admin/fees/collection/${student_id}`);
  } catch (error) {
    console.error("Fee Waiver Error:", error);
    res.status(500).send("Error applying fee waiver.");
  }
};

exports.getFinalCompletionCertificate = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const student = await Student.findByPk(studentId, {
      include: [Course, Session, Semester],
    });
    if (!student) return res.status(404).send("Student not found");

    // Dynamically fetch all active semesters belonging to this student's course
    const courseSemesters = await Semester.findAll({
      where: { course_id: student.course_id, is_active: true },
    });

    // Fetch all published results for this student
    const allResults = await Result.findAll({
      where: { student_id: studentId },
      include: [Semester, ResultSubjectMark],
    });

    // Validation: Check if student has results for all semesters of the course dynamically
    if (allResults.length < courseSemesters.length) {
      return res
        .status(400)
        .send(
          `Cannot issue certificate: Student has completed ${allResults.length} out of ${courseSemesters.length} required semesters for this course.`,
        );
    }

    // Check if the student failed any semester
    const hasFailedAny = allResults.some((r) => r.result_status === "FAIL");
    if (hasFailedAny) {
      return res
        .status(400)
        .send(
          "Cannot issue completion certificate: Student has backlogs/failures in one or more semesters.",
        );
    }

    // Calculate Grand Totals across all semesters dynamically
    let grandMaxMarks = 0;
    let grandObtainedMarks = 0;

    allResults.forEach((result) => {
      grandMaxMarks += Number(result.total_max_marks) || 0;
      grandObtainedMarks += Number(result.total_obtained_marks) || 0;
    });

    const aggregatePercentage =
      grandMaxMarks > 0
        ? ((grandObtainedMarks / grandMaxMarks) * 100).toFixed(2)
        : "0.00";

    // Determine Division / Class
    let division = "Second Division";
    if (aggregatePercentage >= 75) division = "First Division with Distinction";
    else if (aggregatePercentage >= 60) division = "First Division";
    else if (aggregatePercentage >= 50) division = "Second Division";
    else division = "Third Division";

    // Render the final dynamic certificate view
    res.render("results/completion_certificate", {
      student,
      allResults,
      courseSemesters,
      grandMaxMarks,
      grandObtainedMarks,
      aggregatePercentage,
      division,
    });
  } catch (error) {
    console.error("Certificate Generation Error:", error);
    res.status(500).send("Error generating completion certificate");
  }
};

// 6. Get List of Passed / Eligible Students for Completion Certificates
exports.getPassedStudentsList = async (req, res) => {
  try {
    const { session_id, course_id } = req.query;

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });

    let eligibleStudents = [];

    if (session_id && course_id) {
      // Fetch all active students in this session and course
      const students = await Student.findAll({
        where: { session_id, course_id, status: "Active" },
        include: [Course, Session, Semester],
      });

      // Fetch active semesters required for this course
      const courseSemesters = await Semester.findAll({
        where: { course_id, is_active: true },
      });

      // Filter students who have passed ALL semesters of the course
      for (const student of students) {
        const allResults = await Result.findAll({
          where: { student_id: student.id },
        });

        // Check if student finished all course semesters and never failed
        const finishedAll =
          allResults.length >= courseSemesters.length &&
          courseSemesters.length > 0;
        const hasFailedAny = allResults.some((r) => r.result_status === "FAIL");

        if (finishedAll && !hasFailedAny) {
          eligibleStudents.push(student);
        }
      }
    }

    res.render("results/passed_students", {
      sessions,
      courses,
      students: eligibleStudents,
      filters: req.query,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Passed Students List Error:", error);
    res.status(500).send("Server Error");
  }
};

// 7. Render Semester Promotion Page
exports.getPromotionPage = async (req, res) => {
  try {
    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    res.render("results/promote", {
      sessions,
      courses,
      semesters,
      adminName: req.session.adminName,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// 8. Execute Bulk Promotion for Passed Students
exports.postPromoteStudents = async (req, res) => {
  try {
    const { session_id, course_id, from_semester_id, to_semester_id } =
      req.body;

    if (from_semester_id === to_semester_id) {
      return res.render("results/promote", {
        sessions: await Session.findAll({ where: { is_active: true } }),
        courses: await Course.findAll({ where: { is_active: true } }),
        semesters: await Semester.findAll({ where: { is_active: true } }),
        adminName: req.session.adminName,
        error: "Source and target semesters cannot be the same.",
        success: null,
      });
    }

    // Find all active students in the current semester
    const students = await Student.findAll({
      where: {
        session_id,
        course_id,
        semester_id: from_semester_id,
        status: "Active",
      },
    });

    let promotedCount = 0;

    for (const student of students) {
      // Check if the student has a PASS result for the 'from_semester'
      const studentResult = await Result.findOne({
        where: {
          student_id: student.id,
          semester_id: from_semester_id,
          result_status: "PASS",
        },
      });

      if (studentResult) {
        // Update student's current semester to the next one
        student.semester_id = to_semester_id;
        await student.save();
        promotedCount++;
      }
    }

    res.render("results/promote", {
      sessions: await Session.findAll({ where: { is_active: true } }),
      courses: await Course.findAll({ where: { is_active: true } }),
      semesters: await Semester.findAll({ where: { is_active: true } }),
      adminName: req.session.adminName,
      error: null,
      success: `Successfully promoted ${promotedCount} passed student(s) to the next semester!`,
    });
  } catch (error) {
    console.error("Promotion Error:", error);
    res.status(500).send("Error promoting students");
  }
};

exports.getBatchUploadPage = async (req, res) => {
  try {
    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });
    const uploads = await SessionMarksheet.findAll({
      include: [Course, Semester, Session],
      order: [["created_at", "DESC"]],
    });

    res.render("results/batch_upload", {
      sessions,
      courses,
      semesters,
      uploads,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// Process Scanned Batch PDF Upload
exports.postBatchUpload = async (req, res) => {
  try {
    const { session_id, course_id, semester_id } = req.body;

    if (!req.file) {
      return res.status(400).send("Please upload a scanned PDF file.");
    }

    await SessionMarksheet.create({
      session_id,
      course_id,
      semester_id,
      file_name: req.file.originalname,
      file_path: req.file.filename,
      uploaded_by: req.session.adminName || "Admin",
    });

    res.redirect("/admin/results/batch-upload");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading batch marksheet: " + error.message);
  }
};

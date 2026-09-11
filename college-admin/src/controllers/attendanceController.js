const { Student, Session, Course, Semester, Attendance } = require("../models");
const { Op } = require("sequelize");

// 1. Load the Filter Page & Fetch Students
exports.getDailyAttendance = async (req, res) => {
  try {
    const { session_id, course_id, semester_id, date } = req.query;

    // Always load dropdown options
    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    let students = undefined;

    // If the user clicked "Filter", fetch the matching students
    if (session_id && course_id && semester_id && date) {
      students = await Student.findAll({
        where: {
          session_id,
          course_id,
          semester_id,
          status: "Active",
        },
        order: [["first_name", "ASC"]], // Sort alphabetically
      });
    }

    res.render("attendance/daily", {
      sessions,
      courses,
      semesters,
      selectedSession: session_id,
      selectedCourse: course_id,
      selectedSemester: semester_id,
      date: date,
      students,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Attendance GET Error:", error);
    res.status(500).send("Server Error");
  }
};

// 2. Process and Save the Attendance
exports.saveDailyAttendance = async (req, res) => {
  try {
    const { session_id, course_id, semester_id, date, attendance } = req.body;

    // Because Express might compact our numeric keys into an array,
    // we extract the values directly and rely on the hidden student_id field.
    const records = Object.values(attendance);

    for (const data of records) {
      const student_id = data.student_id;

      // Skip if somehow empty
      if (!student_id) continue;

      // Removed 'remarks' to fix the Sequelize warning
      const [record, created] = await Attendance.findOrCreate({
        where: { student_id: student_id, date: date },
        defaults: {
          session_id,
          course_id,
          semester_id,
          status: data.status,
        },
      });

      if (!created) {
        record.status = data.status;
        await record.save();
      }
    }

    // Redirect back to the same filtered page to show success
    // At the end of your save attendance controller function:
    res.redirect(
      `/admin/attendance/daily?session_id=${session_id}&course_id=${course_id}&semester_id=${semester_id}&date=${date}&success=1`,
    );
  } catch (error) {
    console.error("Attendance POST Error:", error);
    res.status(500).send("Error saving attendance");
  }
};

// 3. Generate Monthly Report Matrix
exports.getMonthlyReport = async (req, res) => {
  try {
    const { session_id, course_id, semester_id, month } = req.query;

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    let reportData = undefined;
    let daysInMonth = 0;

    if (session_id && course_id && semester_id && month) {
      // Calculate first and last day of the selected month
      const [year, m] = month.split("-");
      const startDate = new Date(year, m - 1, 1);
      daysInMonth = new Date(year, m, 0).getDate(); // Gets exactly 28, 29, 30, or 31
      const endDate = new Date(year, m, 0);

      const students = await Student.findAll({
        where: { session_id, course_id, semester_id, status: "Active" },
        order: [["first_name", "ASC"]],
      });

      const studentIds = students.map((s) => s.id);

      const attendances = await Attendance.findAll({
        where: {
          student_id: studentIds,
          date: {
            [Op.between]: [
              startDate.toISOString().split("T")[0],
              endDate.toISOString().split("T")[0],
            ],
          },
        },
      });

      // Aggregate daily data for each student
      reportData = students.map((student) => {
        const studentRecords = attendances.filter(
          (a) => a.student_id === student.id,
        );

        let present = 0,
          absent = 0,
          leave = 0;
        let dailyStatus = {}; // Tracks status for day 1 to 31

        studentRecords.forEach((record) => {
          // 1. Safe Date Extraction (Prevents Timezone shifting bugs)
          let day;
          if (typeof record.date === "string") {
            day = parseInt(record.date.split("-")[2], 10);
          } else {
            day = new Date(record.date).getDate();
          }

          // 2. THE FIX: Convert DB status to lowercase for a guaranteed match
          const currentStatus = record.status
            ? record.status.toLowerCase()
            : "";
          let statusChar = "";

          if (currentStatus === "present") {
            present++;
            statusChar = "P";
          } else if (currentStatus === "absent") {
            absent++;
            statusChar = "A";
          } else if (currentStatus === "leave") {
            leave++;
            statusChar = "L";
          }

          dailyStatus[day] = statusChar;
        });

        const totalMarked = present + absent + leave;
        const percentage =
          totalMarked > 0 ? ((present / totalMarked) * 100).toFixed(1) : 0;

        return {
          id: student.id,
          admission_no: student.admission_no,
          name: `${student.first_name} ${student.last_name}`,
          dailyStatus,
          present,
          absent,
          leave,
          totalMarked,
          percentage,
        };
      });
    }

    res.render("attendance/monthly", {
      sessions,
      courses,
      semesters,
      selectedSession: session_id,
      selectedCourse: course_id,
      selectedSemester: semester_id,
      month,
      daysInMonth, // Pass this to EJS to render columns
      reportData,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Monthly Report Error:", error);
    res.status(500).send("Server Error");
  }
};

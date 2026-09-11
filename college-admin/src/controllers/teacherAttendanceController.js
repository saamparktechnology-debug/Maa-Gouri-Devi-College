const { Teacher, TeacherAttendance } = require("../models");
const { Op } = require("sequelize");
// 1. Load Daily Attendance Sheet
exports.getDailyAttendance = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split("T")[0];

    // Only pull Active teachers
    const teachers = await Teacher.findAll({
      where: { status: "Active" },
      order: [["name", "ASC"]],
    });

    // Fetch already marked attendance for this date
    const existingRecords = await TeacherAttendance.findAll({
      where: { date },
    });

    // Map existing records to the teachers for the frontend to read
    const mappedTeachers = teachers.map((teacher) => {
      const record = existingRecords.find((r) => r.teacher_id === teacher.id);
      return {
        ...teacher.toJSON(),
        currentStatus: record ? record.status : null,
        remarks: record ? record.remarks : "",
      };
    });

    res.render("teachers/attendance/daily", {
      teachers: mappedTeachers,
      date,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Teacher Attendance Fetch Error:", error);
    res.status(500).send("Server Error");
  }
};

// 2. Save Daily Attendance
exports.saveDailyAttendance = async (req, res) => {
  try {
    const { date, attendance } = req.body;
    const records = Object.values(attendance);

    for (const data of records) {
      const teacher_id = data.teacher_id;
      if (!teacher_id) continue;

      const [record, created] = await TeacherAttendance.findOrCreate({
        where: { teacher_id, date },
        defaults: {
          status: data.status,
          remarks: data.remarks || null,
        },
      });

      if (!created) {
        record.status = data.status;
        record.remarks = data.remarks || record.remarks;
        await record.save();
      }
    }

    res.redirect(`/admin/teachers/attendance/daily?date=${date}`);
  } catch (error) {
    console.error("Teacher Attendance Save Error:", error);
    res.status(500).send("Error saving teacher attendance.");
  }
};

// --- MONTHLY STAFF ATTENDANCE VIEW ---
exports.getMonthlyAttendance = async (req, res) => {
  try {
    // Default to current month/year if not selected
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const month = req.query.month ? parseInt(req.query.month) : currentMonth;
    const year = req.query.year ? parseInt(req.query.year) : currentYear;

    // Calculate days in the selected month
    const daysInMonth = new Date(year, month, 0).getDate();

    // Format dates for Sequelize query (YYYY-MM-DD)
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    // Fetch all active teachers (assuming you have a status or is_active field, if not, just findAll)
    const teachers = await Teacher.findAll();

    // Fetch attendance records for this specific month
    const attendanceRecords = await TeacherAttendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Map the data for easy EJS rendering: attendanceMap[teacherId][day] = status
    const attendanceMap = {};
    teachers.forEach((t) => {
      attendanceMap[t.id] = {
        Present: 0,
        Absent: 0,
        "Half-Day": 0,
        "Paid Leave": 0,
      };
    });

    attendanceRecords.forEach((record) => {
      if (attendanceMap[record.teacher_id]) {
        const day = parseInt(record.date.split("-")[2]); // Extract day from YYYY-MM-DD
        attendanceMap[record.teacher_id][day] = record.status;

        // Keep running totals for the month
        attendanceMap[record.teacher_id][record.status]++;
      }
    });

    res.render("teachers/attendance/monthly", {
      teachers,
      attendanceMap,
      daysInMonth,
      selectedMonth: month,
      selectedYear: year,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Monthly Attendance Error:", error);
    res.status(500).send("Server Error loading monthly attendance");
  }
};

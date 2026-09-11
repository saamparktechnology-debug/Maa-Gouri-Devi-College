const { Session, Course, Semester, Subject } = require("../models");

// --- SESSION MASTER ---
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll();
    res.render("masters/sessions", {
      sessions,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addSession = async (req, res) => {
  try {
    const { session_name, start_date, end_date } = req.body;
    await Session.create({ session_name, start_date, end_date });
    res.redirect("/admin/sessions");
  } catch (error) {
    res.status(500).send("Error creating session");
  }
};

exports.toggleSessionStatus = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (session) {
      session.is_active = !session.is_active;
      await session.save();
    }
    res.redirect("/admin/sessions");
  } catch (error) {
    res.status(500).send("Error");
  }
};

// --- COURSE MASTER ---
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.render("masters/courses", {
      courses,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { course_name, course_code, duration_years } = req.body;
    await Course.create({ course_name, course_code, duration_years });
    res.redirect("/admin/courses");
  } catch (error) {
    res.status(500).send("Error creating course");
  }
};

exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      course.is_active = !course.is_active;
      await course.save();
    }
    res.redirect("/admin/courses");
  } catch (error) {
    res.status(500).send("Error");
  }
};

// --- SEMESTER MASTER ---
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll({ include: Course });
    const courses = await Course.findAll({ where: { is_active: true } });
    res.render("masters/semesters", {
      semesters,
      courses,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addSemester = async (req, res) => {
  try {
    const { course_id, semester_name } = req.body;
    await Semester.create({ course_id, semester_name });
    res.redirect("/admin/semesters");
  } catch (error) {
    res.status(500).send("Error creating semester");
  }
};

exports.toggleSemesterStatus = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (semester) {
      semester.is_active = !semester.is_active;
      await semester.save();
    }
    res.redirect("/admin/semesters");
  } catch (error) {
    res.status(500).send("Error");
  }
};

// --- SUBJECT MASTER ---
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({ include: [Course, Semester] });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });
    res.render("masters/subjects", {
      subjects,
      courses,
      semesters,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.addSubject = async (req, res) => {
  try {
    const {
      course_id,
      semester_id,
      subject_name,
      subject_code,
      max_marks,
      passing_marks,
    } = req.body;
    await Subject.create({
      course_id,
      semester_id,
      subject_name,
      subject_code,
      max_marks,
      passing_marks,
    });
    res.redirect("/admin/subjects");
  } catch (error) {
    res.status(500).send("Error creating subject");
  }
};

exports.toggleSubjectStatus = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (subject) {
      subject.is_active = !subject.is_active;
      await subject.save();
    }
    res.redirect("/admin/subjects");
  } catch (error) {
    res.status(500).send("Error");
  }
};

const { SessionMarksheet, Course, Session, Semester } = require("../models");
const path = require("path");

exports.getMarksheets = async (req, res) => {
  try {
    const marksheets = await SessionMarksheet.findAll({
      include: [
        Course,
        { model: Session, as: "AcademicSession" }, // Explicitly map the AcademicSession model alias
        Semester,
      ],
      order: [["uploaded_at", "DESC"]],
    });

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    res.render("marksheets/index", {
      marksheets,
      sessions,
      courses,
      semesters,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Get Marksheets Error:", error);
    res.status(500).send("Server Error");
  }
};

exports.uploadMarksheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Consolidated PDF file is required.");
    }

    await SessionMarksheet.create({
      title: req.body.title,
      session_id: req.body.session_id,
      course_id: req.body.course_id,
      semester_id: req.body.semester_id,
      file_name: req.file.originalname,
      file_path: req.file.filename,
      mime_type: req.file.mimetype,
    });

    res.redirect("/admin/marksheets");
  } catch (error) {
    console.error("Upload Marksheet Error:", error);
    res.status(500).send("Error uploading marksheet PDF: " + error.message);
  }
};

exports.viewMarksheetFile = async (req, res) => {
  try {
    const marksheet = await SessionMarksheet.findByPk(req.params.id);
    if (!marksheet) return res.status(404).send("Marksheet file not found");

    const safePath = path.resolve(
      __dirname,
      "../../storage/documents",
      marksheet.file_path,
    );
    res.sendFile(safePath);
  } catch (error) {
    console.error("View Marksheet Error:", error);
    res.status(500).send("Error accessing file");
  }
};

const {
  Student,
  StudentDocument,
  Course,
  Session,
  Semester,
} = require("../models");
const path = require("path");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [Course, Session],
      order: [["created_at", "DESC"]],
    });
    res.render("students/index", {
      students,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getAddStudentForm = async (req, res) => {
  try {
    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });
    res.render("students/add", {
      sessions,
      courses,
      semesters,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.postStudent = async (req, res) => {
  try {
    // 1. Create Student
    const student = await Student.create(req.body);

    // 2. Handle Document Uploads if they exist
    if (req.files && req.files.length > 0) {
      const documentPromises = req.files.map((file) => {
        return StudentDocument.create({
          student_id: student.id,
          document_type: file.fieldname, // We will name form fields: photograph, id_proof, etc.
          file_name: file.originalname,
          file_path: file.filename, // our randomized name
          mime_type: file.mimetype,
        });
      });
      await Promise.all(documentPromises);
    }
    res.redirect("/admin/students");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving student: " + error.message);
  }
};

// Secure Document Viewer (Serves files from the protected storage folder)
exports.viewDocument = async (req, res) => {
  try {
    const doc = await StudentDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).send("Document not found");

    const safePath = path.resolve(
      __dirname,
      "../../storage/documents",
      doc.file_path,
    );
    res.sendFile(safePath);
  } catch (error) {
    res.status(500).send("Error accessing document");
  }
};

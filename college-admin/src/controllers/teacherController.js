const { Teacher, TeacherDocument } = require("../models");
const path = require("path");

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({ order: [["created_at", "DESC"]] });
    res.render("teachers/index", {
      teachers,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.getAddTeacherForm = (req, res) => {
  res.render("teachers/add", { adminName: req.session.adminName });
};

exports.postTeacher = async (req, res) => {
  try {
    // If the form sends first_name, combine it into the 'name' field
    if (req.body.first_name && !req.body.name) {
      req.body.name =
        `${req.body.first_name} ${req.body.last_name || ""}`.trim();
    }

    // Create the Teacher (Will now save aadhaar_no from req.body automatically)
    const teacher = await Teacher.create(req.body);

    // Handle Unlimited Document Uploads for Teacher
    if (req.files && req.files.length > 0) {
      const documentPromises = req.files.map((file) => {
        return TeacherDocument.create({
          teacher_id: teacher.id,
          document_type: file.fieldname,
          file_name: file.originalname,
          file_path: file.filename,
          mime_type: file.mimetype,
        });
      });
      await Promise.all(documentPromises);
    }

    res.redirect("/admin/teachers");
  } catch (error) {
    console.error("Teacher POST Error:", error);
    res.status(500).send("Error saving teacher: " + error.message);
  }
};

exports.viewDocument = async (req, res) => {
  try {
    const doc = await TeacherDocument.findByPk(req.params.id);
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

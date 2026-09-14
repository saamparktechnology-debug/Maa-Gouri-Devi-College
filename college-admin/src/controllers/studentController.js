const {
  Student,
  StudentDocument,
  Course,
  Session,
  Semester,
} = require("../models");
const path = require("path");
const fs = require("fs");

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
    // 1. Enforce Mandatory Photograph Check
    const photoFile = req.files
      ? req.files.find((file) => file.fieldname === "photograph")
      : null;

    if (!photoFile) {
      return res.status(400).send("Error: Student photograph is mandatory.");
    }

    // 2. Create Student
    const student = await Student.create(req.body);

    // 3. Handle Document Uploads & Custom Titles mapping
    if (req.files && req.files.length > 0) {
      const docTypes = req.body.document_types || [];

      const documentPromises = req.files.map((file, index) => {
        // Fallback to custom title text input if provided, otherwise use fieldname
        const customTitle = docTypes[index] || file.fieldname || "Document";

        return StudentDocument.create({
          student_id: student.id,
          document_type: customTitle,
          file_name: file.originalname,
          file_path: file.filename,
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

// View Student Profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [Course, Session, Semester],
    });
    const documents = await StudentDocument.findAll({
      where: { student_id: req.params.id },
    });

    if (!student) return res.status(404).send("Student not found");

    res.render("students/profile", {
      student,
      documents,
      adminName: req.session.adminName,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// Get Edit Form
exports.getEditStudentForm = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    // Fetch documents associated with this student so the edit view can render them
    const documents = await StudentDocument.findAll({
      where: { student_id: student.id },
    });

    const sessions = await Session.findAll({ where: { is_active: true } });
    const courses = await Course.findAll({ where: { is_active: true } });
    const semesters = await Semester.findAll({ where: { is_active: true } });

    res.render("students/edit", {
      student,
      documents, // <--- Passing the documents array here solves the ReferenceError
      sessions,
      courses,
      semesters,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error("Get Edit Form Error:", error);
    res.status(500).send("Server Error");
  }
};

// Process Edit Submission
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    // 1. Update basic student information
    await student.update(req.body);

    // 2. Handle Photograph Replacement (Auto-delete old photograph if a new one is uploaded)
    const newPhoto = req.files
      ? req.files.find((file) => file.fieldname === "photograph")
      : null;
    if (newPhoto) {
      const oldPhotoDoc = await StudentDocument.findOne({
        where: { student_id: student.id, document_type: "Photograph" },
      });

      if (oldPhotoDoc) {
        const oldFilePath = path.resolve(
          __dirname,
          "../../storage/documents",
          oldPhotoDoc.file_path,
        );
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        await oldPhotoDoc.destroy();
      }

      await StudentDocument.create({
        student_id: student.id,
        document_type: "Photograph",
        file_name: newPhoto.originalname,
        file_path: newPhoto.filename,
        mime_type: newPhoto.mimetype,
      });
    }

    // 3. Handle Deletion of Selected Existing Documents (Safely checked with optional chaining)
    const deleteDocs = req.body?.delete_documents;
    if (deleteDocs) {
      const docIdsToDelete = Array.isArray(deleteDocs)
        ? deleteDocs
        : [deleteDocs];

      for (let docId of docIdsToDelete) {
        const docRecord = await StudentDocument.findOne({
          where: { id: docId, student_id: student.id },
        });
        if (docRecord) {
          const filePath = path.resolve(
            __dirname,
            "../../storage/documents",
            docRecord.file_path,
          );
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          await docRecord.destroy();
        }
      }
    }

    // 4. Handle Newly Uploaded Additional Documents
    const additionalFiles = req.files
      ? req.files.filter((file) => file.fieldname === "documents")
      : [];
    if (additionalFiles.length > 0) {
      const docTypes = req.body?.document_types || [];

      additionalFiles.forEach((file, index) => {
        const customTitle =
          docTypes[index + 1] || docTypes[index] || "Additional Document";

        StudentDocument.create({
          student_id: student.id,
          document_type: customTitle,
          file_name: file.originalname,
          file_path: file.filename,
          mime_type: file.mimetype,
        });
      });
    }

    res.redirect(`/admin/students/${req.params.id}`);
  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).send("Error updating student: " + error.message);
  }
};

exports.getStudentIdCard = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [Course, Session, Semester],
    });
    if (!student) return res.status(404).send("Student not found");

    const documents = await StudentDocument.findAll({
      where: { student_id: student.id },
    });

    res.render("students/id_card", {
      student,
      documents,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating ID card");
  }
};

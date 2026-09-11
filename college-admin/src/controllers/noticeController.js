const { Notice } = require("../models");
const path = require("path");

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.findAll({ order: [["created_at", "DESC"]] });
    res.render("notices/index", {
      notices,
      adminName: req.session.adminName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.postNotice = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).send("Please upload a PDF notice document.");
    }

    await Notice.create({
      title,
      description,
      file_name: req.file.originalname,
      file_path: req.file.filename,
      uploaded_by: req.session.adminName || "Admin",
    });

    res.redirect("/admin/notices");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving notice: " + error.message);
  }
};

exports.viewNoticePdf = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (!notice) return res.status(404).send("Notice not found");

    const safePath = path.resolve(
      __dirname,
      "../../storage/documents",
      notice.file_path,
    );
    res.sendFile(safePath);
  } catch (error) {
    res.status(500).send("Error accessing notice document");
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByPk(req.params.id);
    if (notice) await notice.destroy();
    res.redirect("/admin/notices");
  } catch (error) {
    res.status(500).send("Error deleting notice");
  }
};

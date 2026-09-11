const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Store outside the public folder for security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/documents/");
  },
  filename: (req, file, cb) => {
    // Generate random string for file name: 17293848-8f7d9a.pdf
    const randomString = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + randomString + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow PDFs and Images
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;

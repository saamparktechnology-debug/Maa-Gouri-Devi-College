const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// 1. Define absolute path relative to this middleware file (src/middleware -> college-admin/storage/documents)
const storagePath = path.resolve(__dirname, "../../storage/documents");

// 2. Auto-create the directory on the live server if it doesn't exist
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// Store outside the public folder for security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 3. Use the absolute path variable here
    cb(null, storagePath);
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

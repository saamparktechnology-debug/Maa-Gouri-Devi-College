const express = require("express");
const path = require("path");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const helmet = require("helmet");
const methodOverride = require("method-override");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const academicRoutes = require("./routes/academicRoutes");
const studentRoutes = require("./routes/studentRoutes");
const feeRoutes = require("./routes/feeRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resultRoutes = require("./routes/resultRoutes");
const accountRoutes = require("./routes/accountRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const financeRoutes = require("./routes/financeRoutes");
require("dotenv").config();

const app = express();

// Security Headers (Helmet) - Adjusted for Bootstrap/FontAwesome CDNs
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "public")));
// app.use(express.static("public"));

// View Engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session Management
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

app.get("/", (req, res) => {
  res.redirect("/admin/login");
});

app.use("/admin", authRoutes);
app.use("/admin", academicRoutes);
app.use("/admin", studentRoutes);
app.use("/admin", feeRoutes);
app.use("/admin", teacherRoutes);
app.use("/admin", salaryRoutes);
app.use("/admin", attendanceRoutes);
app.use("/admin", resultRoutes);
app.use("/admin", accountRoutes);
app.use("/admin", noticeRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", financeRoutes);
app.use("/", attendanceRoutes);
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    adminName: req.session ? req.session.adminName : "Admin",
  });
});

// 500 Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).render("errors/500", {
    adminName: req.session ? req.session.adminName : "Admin",
  });
});
module.exports = { app, sessionStore };

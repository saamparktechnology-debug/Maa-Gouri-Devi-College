const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../config/mailer");

// 1. Handle Login Submission -> Generate & Send OTP
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("1. Attempting login for:", email);

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      console.log("2. Admin not found in DB!");
      return res.render("auth/login", { error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("2. Password match result:", isMatch);

    if (!isMatch) {
      return res.render("auth/login", { error: "Invalid email or password" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    admin.otp = otp;
    admin.otp_expires = otp_expires;
    await admin.save();
    console.log("3. OTP saved to database:", otp);

    // Send email
    console.log("4. Attempting to send email via SMTP...");
    const emailSent = await sendOtpEmail(admin.email, otp);

    if (!emailSent) {
      console.log("4. ERROR: Email failed to send!");
      return res.render("auth/login", {
        error: "Failed to send OTP email. Check SMTP settings.",
      });
    }

    console.log("4. Email sent successfully!");
    req.session.tempAdminId = admin.id;
    res.redirect("/admin/verify-otp");
  } catch (error) {
    console.error("LOGIN CRASH ERROR:", error);
    res.status(500).send("Server Error");
  }
};

// 2. Render OTP Verification Page
exports.getVerifyOtp = (req, res) => {
  if (!req.session.tempAdminId) return res.redirect("/admin/login");
  res.render("auth/verify-otp", { error: null });
};

// 3. Confirm Login OTP
exports.postVerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const adminId = req.session.tempAdminId;

    if (!adminId) return res.redirect("/admin/login");

    const admin = await Admin.findByPk(adminId);
    if (
      !admin ||
      admin.otp !== otp ||
      new Date() > new Date(admin.otp_expires)
    ) {
      return res.render("auth/verify-otp", {
        error: "Invalid or expired OTP.",
      });
    }

    // Clear OTP and log user in fully
    admin.otp = null;
    admin.otp_expires = null;
    await admin.save();

    req.session.adminId = admin.id;
    req.session.adminName = admin.name;
    delete req.session.tempAdminId;

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// 4. Forgot Password - Request Email
exports.getForgotPassword = (req, res) => {
  res.render("auth/forgot-password", { error: null, success: null });
};

exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.render("auth/forgot-password", {
        error: "Email address not found in system.",
        success: null,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.otp = otp;
    admin.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    await sendOtpEmail(admin.email, otp);
    req.session.resetAdminId = admin.id;

    res.redirect("/admin/reset-password-verify");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// 5. Forgot Password - Verify OTP & Set New Password
exports.getResetPasswordVerify = (req, res) => {
  if (!req.session.resetAdminId) return res.redirect("/admin/forgot-password");
  res.render("auth/reset-password", { error: null });
};

exports.postResetPassword = async (req, res) => {
  try {
    const { otp, new_password } = req.body;
    const adminId = req.session.resetAdminId;

    if (!adminId) return res.redirect("/admin/forgot-password");

    const admin = await Admin.findByPk(adminId);
    if (
      !admin ||
      admin.otp !== otp ||
      new Date() > new Date(admin.otp_expires)
    ) {
      return res.render("auth/reset-password", {
        error: "Invalid or expired OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    admin.password = hashedPassword;
    admin.otp = null;
    admin.otp_expires = null;
    await admin.save();

    delete req.session.resetAdminId;
    res.redirect("/admin/login?reset=success");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

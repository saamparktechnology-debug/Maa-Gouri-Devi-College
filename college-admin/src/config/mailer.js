const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendOtpEmail = async (toEmail, otp) => {
  try {
    await transporter.sendMail({
      from: `"MGD College Admin" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">MGD College Admin Portal</h2>
          <p>You requested an OTP verification code. Use the code below to proceed:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 5px; color: #111827;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Email Sending Error:", error);
    return false;
  }
};

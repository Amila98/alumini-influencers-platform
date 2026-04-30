const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Alumni Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("✅ EMAIL SENT:", info.messageId);
  } catch (err) {
    console.error("❌ EMAIL FAILED:", err);
  }
};

module.exports = sendEmail;




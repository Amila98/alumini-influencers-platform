const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.endsWith('@my.eastminster.ac.uk') && !email.endsWith('@my.westminster.ac.uk')) {
      return res.status(400).json({
        message: "Registration restricted to @my.eastminster.ac.uk or @my.westminster.ac.uk domains."
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered. Please log in instead."
      });
    }

    const studentPattern = /^w\d{7}@my\.(eastminster|westminster)\.ac\.uk$/i;
    const role = studentPattern.test(email) ? 'alumni' : 'staff';

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 1000 * 60 * 60;

    await User.create({
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry
    });

    const verifyLink = `http://localhost:3000/api/auth/verify/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Welcome 🎓</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyLink}">Verify Account</a>
      `
    });

    return res.status(201).json({
      message: `Registered as ${role}. Check email to verify.`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Verification token expired. Please register again."
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    return res.json({
      message: "Email verified successfully 🎉"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role, 
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await user.update({ resetToken, resetTokenExpiry });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your Alumni Platform account.</p>
        <p>Click the link below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="
          background:#4F46E5;
          color:white;
          padding:12px 24px;
          border-radius:6px;
          text-decoration:none;
          display:inline-block;
          margin:16px 0;
        ">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p style="color:#999;font-size:12px;">This link expires at ${new Date(resetTokenExpiry).toUTCString()}</p>
      `
    });

    res.json({ message: "If that email exists, a reset link has been sent" });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <h2>Password Changed</h2>
        <p>Your Alumni Platform password has been successfully changed.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    });

    res.json({ message: "Password reset successful. You can now log in." });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

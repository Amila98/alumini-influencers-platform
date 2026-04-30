/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Alumni registration, login, email verification and password reset
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new alumni account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: w1833514@my.eastminster.ac.uk
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */

/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: w1833514@my.westminster.ac.uk
 *               password:
 *                 type: string
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Login successful — returns JWT token
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: w1833514@my.westminster.ac.uk
 *     responses:
 *       200:
 *         description: Reset email sent if address exists
 */

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPass@5678
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

const express = require("express");
const router = express.Router();


const { authLimiter, emailLimiter } = require("../middleware/rateLimiter");
const { registerValidator, loginValidator, resetPasswordValidator, forgotPasswordValidator, validate } = require("../middleware/validator");
const { register, verifyEmail, login, forgotPassword, resetPassword } = require("../controllers/authController");


router.post("/register",              authLimiter,  registerValidator,       validate, register);
router.post("/login",                 authLimiter,  loginValidator,          validate, login);
router.get("/verify/:token",                        verifyEmail);
router.post("/forgot-password",       emailLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password/:token", authLimiter,  resetPasswordValidator,  validate, resetPassword);

module.exports = router;
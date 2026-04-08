const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const authController = require("../controllers/authController");

router.post("/register", authController.register);

router.get("/verify/:token", authController.verifyEmail);

router.post("/login", authController.login);

module.exports = router;
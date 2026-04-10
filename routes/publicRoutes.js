/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public endpoints for AR clients — requires API key
 */

/**
 * @swagger
 * /api/public/alumni-of-the-day:
 *   get:
 *     summary: Get today's featured alumni profile
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Today's featured alumni profile with full details
 *       401:
 *         description: Invalid or missing API key
 *       404:
 *         description: No alumni featured today
 */

const express = require("express");
const router = express.Router();
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const { getAlumniOfTheDay } = require("../controllers/publicController");

router.get("/alumni-of-the-day", apiKeyMiddleware, getAlumniOfTheDay);

module.exports = router;
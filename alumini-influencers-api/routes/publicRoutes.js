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
const { getAlumniOfTheDay } = require("../controllers/publicController");
const analyticsController = require("../controllers/analyticsController");
const apiKeyAuth = require("../middleware/apiKeyMiddleware");


router.get(
  "/alumni-of-the-day",
  apiKeyAuth("read:alumni_of_day"),
  getAlumniOfTheDay
);

router.get(
  "/alumni",
  apiKeyAuth("read:alumni"),
  analyticsController.getAllAlumni
);

router.get(
  "/analytics/skills-gap",
  apiKeyAuth("read:analytics"),
  analyticsController.getSkillsGap
);
router.get(
  "/analytics/employment-sectors",
  apiKeyAuth("read:analytics"),
  analyticsController.getEmploymentSectors
);
router.get(
  "/analytics/job-titles",
  apiKeyAuth("read:analytics"),
  analyticsController.getJobTitles
);
router.get(
  "/analytics/top-employers",
  apiKeyAuth("read:analytics"),
  analyticsController.getTopEmployers
);
router.get(
  "/analytics/geographic",
  apiKeyAuth("read:analytics"),
  analyticsController.getGeographic
);
router.get(
  "/analytics/cert-trends",
  apiKeyAuth("read:analytics"),
  analyticsController.getCertTrends
);
router.get(
  "/analytics/summary",
  apiKeyAuth("read:analytics"),
  analyticsController.getSummary
);

module.exports = router;
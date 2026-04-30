/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Public endpoints for AR clients and Analytics Dashboard — requires API key
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: API_KEY
 *       description: API Key with appropriate permissions (read:alumni_of_day, read:alumni, or read:analytics)
 *   schemas:
 *     FilterParams:
 *       type: object
 *       properties:
 *         programme:
 *           type: string
 *           description: Filter by degree programme (partial match)
 *           example: "BSc Computer Science"
 *         graduationYear:
 *           type: integer
 *           description: Filter by graduation year
 *           example: 2023
 *         sector:
 *           type: string
 *           description: Filter by industry sector (partial match)
 *           example: "Technology"
 */

/**
 * @swagger
 * /api/public/alumni-of-the-day:
 *   get:
 *     summary: Get today's featured alumni profile
 *     description: Returns the alumni who won yesterday's bidding and is featured for the next 24 hours
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Today's featured alumni profile with full details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     bio:
 *                       type: string
 *                     linkedInUrl:
 *                       type: string
 *                     programme:
 *                       type: string
 *                     graduationYear:
 *                       type: integer
 *                     degrees:
 *                       type: array
 *                       items:
 *                         type: object
 *                     certifications:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:alumni_of_day)
 *       404:
 *         description: No alumni featured today
 */

/**
 * @swagger
 * /api/public/alumni:
 *   get:
 *     summary: Get all alumni with optional filters
 *     description: Returns list of all alumni profiles with filtering support
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Filter by degree programme (partial match)
 *         example: "BScComputer Science"
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *         example: 2023
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by industry sector (partial match)
 *         example: "Technology"
 *     responses:
 *       200:
 *         description: List of alumni matching filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of alumni returned
 *                 filters:
 *                   type: object
 *                   description: Applied filters
 *                 alumni:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:alumni)
 */

/**
 * @swagger
 * /api/public/analytics/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     description: Returns aggregate metrics - total alumni, employed, certifications, courses, employment rate
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalAlumni:
 *                       type: integer
 *                       example: 50
 *                     totalCertifications:
 *                       type: integer
 *                       example: 142
 *                     totalEmployed:
 *                       type: integer
 *                       example: 45
 *                     totalCourses:
 *                       type: integer
 *                       example: 87
 *                     avgCertsPerAlumni:
 *                       type: number
 *                       example: 2.8
 *                     employmentRate:
 *                       type: integer
 *                       example: 90
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/skills-gap:
 *   get:
 *     summary: Get curriculum skills gap analysis
 *     description: Returns certifications and courses acquired post-graduation, grouped by title with severity ratings (critical ≥50%, significant 25-49%, emerging <25%)
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skills gap data with severity ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAlumni:
 *                   type: integer
 *                 filters:
 *                   type: object
 *                 certificationGaps:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "AWS Solutions Architect"
 *                       issuingBody:
 *                         type: string
 *                         example: "Amazon Web Services"
 *                       count:
 *                         type: integer
 *                         example: 37
 *                       percentage:
 *                         type: integer
 *                         example: 74
 *                       severity:
 *                         type: string
 *                         enum: [critical, significant, emerging]
 *                         example: "critical"
 *                 courseGaps:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/employment-sectors:
 *   get:
 *     summary: Get employment distribution by industry sector
 *     description: Returns current employment grouped by industrySector with counts and percentages
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employment sector distribution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEmployed:
 *                   type: integer
 *                 filters:
 *                   type: object
 *                 sectors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sector:
 *                         type: string
 *                         example: "Technology"
 *                       count:
 *                         type: integer
 *                         example: 30
 *                       percentage:
 *                         type: integer
 *                         example: 60
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/job-titles:
 *   get:
 *     summary: Get most common job titles
 *     description: Returns top job titles held by alumni with counts
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of titles to return
 *     responses:
 *       200:
 *         description: List of most common job titles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 jobTitles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Software Engineer"
 *                       count:
 *                         type: integer
 *                         example: 12
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/top-employers:
 *   get:
 *     summary: Get top employers of alumni
 *     description: Returns companies employing the most alumni
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of employers to return
 *     responses:
 *       200:
 *         description: List of top employers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 employers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       company:
 *                         type: string
 *                         example: "Google"
 *                       count:
 *                         type: integer
 *                         example: 8
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/geographic:
 *   get:
 *     summary: Get geographic distribution of alumni employment
 *     description: Returns employment locations with counts and percentages
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Geographic distribution data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 totalMapped:
 *                   type: integer
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         example: "London, UK"
 *                       count:
 *                         type: integer
 *                         example: 15
 *                       percentage:
 *                         type: integer
 *                         example: 30
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/cert-trends:
 *   get:
 *     summary: Get certification acquisition trends over time
 *     description: Returns certifications acquired over last 24 months grouped by month and issuing body
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certification trends data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2024-03"
 *                       issuingBody:
 *                         type: string
 *                         example: "Amazon Web Services"
 *                       count:
 *                         type: integer
 *                         example: 5
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/career-progression:
 *   get:
 *     summary: Get career progression analysis by seniority level
 *     description: Returns distribution of alumni across seniority levels (Junior, Mid-Level, Senior, Lead, Manager)
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Career progression data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 totalJobs:
 *                   type: integer
 *                 levels:
 *                   type: object
 *                   properties:
 *                     Junior:
 *                       type: integer
 *                       example: 10
 *                     Mid-Level:
 *                       type: integer
 *                       example: 25
 *                     Senior:
 *                       type: integer
 *                       example: 12
 *                     Lead:
 *                       type: integer
 *                       example: 5
 *                     Manager:
 *                       type: integer
 *                       example: 8
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/employment-timeline:
 *   get:
 *     summary: Get employment rate timeline by graduation year
 *     description: Returns employment percentage for each graduation cohort
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employment timeline data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filters:
 *                   type: object
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2023
 *                       total:
 *                         type: integer
 *                         example: 15
 *                       employed:
 *                         type: integer
 *                         example: 13
 *                       employmentRate:
 *                         type: integer
 *                         example: 87
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/programme-comparison:
 *   get:
 *     summary: Compare outcomes across different degree programmes
 *     description: Returns comparative statistics for all degree programmes
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Programme comparison data
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

/**
 * @swagger
 * /api/public/analytics/filter-options:
 *   get:
 *     summary: Get available filter options
 *     description: Returns all available programmes, graduation years, and sectors for filtering
 *     tags: [Public]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Available filter options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 programmes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["BSc Computer Science", "BSc Business Management"]
 *                 graduationYears:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [2020, 2021, 2022, 2023, 2024]
 *                 sectors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Technology", "Financial Services", "Healthcare"]
 *       401:
 *         description: Invalid or missing API key
 *       403:
 *         description: Insufficient permissions (requires read:analytics)
 */

const express = require("express");
const router = express.Router();
const { getAlumniOfTheDay } = require("../controllers/publicController");
const analyticsController = require("../controllers/analyticsController");
const apiKeyAuth = require("../middleware/apiKeyMiddleware");

router.get("/alumni-of-the-day", apiKeyAuth("read:alumni_of_day"), getAlumniOfTheDay);
router.get("/alumni", apiKeyAuth("read:alumni"), analyticsController.getAllAlumni);
router.get("/analytics/summary", apiKeyAuth("read:analytics"), analyticsController.getSummary);
router.get("/analytics/skills-gap", apiKeyAuth("read:analytics"), analyticsController.getSkillsGap);
router.get("/analytics/employment-sectors", apiKeyAuth("read:analytics"), analyticsController.getEmploymentSectors);
router.get("/analytics/job-titles", apiKeyAuth("read:analytics"), analyticsController.getJobTitles);
router.get("/analytics/top-employers", apiKeyAuth("read:analytics"), analyticsController.getTopEmployers);
router.get("/analytics/geographic", apiKeyAuth("read:analytics"), analyticsController.getGeographic);
router.get("/analytics/cert-trends", apiKeyAuth("read:analytics"), analyticsController.getCertTrends);
router.get("/analytics/career-progression", apiKeyAuth("read:analytics"), analyticsController.getCareerProgression);
router.get("/analytics/employment-timeline", apiKeyAuth("read:analytics"), analyticsController.getEmploymentTimeline);
router.get('/analytics/programme-comparison', apiKeyAuth("read:analytics"), analyticsController.getProgrammeComparison);
router.get('/analytics/filter-options', apiKeyAuth("read:analytics"), analyticsController.getFilterOptions);

module.exports = router;
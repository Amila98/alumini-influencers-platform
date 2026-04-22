/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Alumni profile management
 */

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create or update your profile
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Software engineer passionate about AI
 *               linkedInUrl:
 *                 type: string
 *                 example: https://linkedin.com/in/yourname
 *     responses:
 *       201:
 *         description: Profile created
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get your full profile with all sections
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Full profile returned
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /api/profile/degrees:
 *   post:
 *     summary: Add a degree to your profile
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, institution, completionDate]
 *             properties:
 *               title:
 *                 type: string
 *                 example: BSc Computer Science
 *               institution:
 *                 type: string
 *                 example: Westminster University
 *               completionDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-06-01"
 *               url:
 *                 type: string
 *                 example: https://westminster.ac.uk/degrees/cs
 *     responses:
 *       201:
 *         description: Degree added
 */

/**
 * @swagger
 * /api/profile/degrees/{itemId}:
 *   put:
 *     summary: Update a degree
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               institution:
 *                 type: string
 *               completionDate:
 *                 type: string
 *                 format: date
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Item not found
 *   delete:
 *     summary: Delete a degree
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const pc = require("../controllers/profileController");

const Degree        = require("../models/Degree");
const Certification = require("../models/Certification");
const Licence       = require("../models/Licence");
const Course        = require("../models/Course");
const Employment    = require("../models/Employment");

const {
  profileValidator,
  degreeValidator,
  certificationValidator,
  licenceValidator,
  courseValidator,
  employmentValidator,
  validate
} = require("../middleware/validator");

// ── Core Profile ──────────────────────────────────────────────
router.post("/",   auth, profileValidator, validate, pc.upsertProfile);
router.get("/me",  auth, pc.getMyProfile);

// ── Degrees ───────────────────────────────────────────────────
router.post(  "/degrees",          auth, degreeValidator, validate, pc.addItem(Degree));
router.put(   "/degrees/:itemId",  auth, degreeValidator, validate, pc.updateItem(Degree));
router.delete("/degrees/:itemId",  auth, pc.deleteItem(Degree));

// ── Certifications ────────────────────────────────────────────
router.post(  "/certifications",          auth, certificationValidator, validate, pc.addItem(Certification));
router.put(   "/certifications/:itemId",  auth, certificationValidator, validate, pc.updateItem(Certification));
router.delete("/certifications/:itemId",  auth, pc.deleteItem(Certification));

// ── Licences ──────────────────────────────────────────────────
router.post(  "/licences",          auth, licenceValidator, validate, pc.addItem(Licence));
router.put(   "/licences/:itemId",  auth, licenceValidator, validate, pc.updateItem(Licence));
router.delete("/licences/:itemId",  auth, pc.deleteItem(Licence));

// ── Courses ───────────────────────────────────────────────────
router.post(  "/courses",          auth, courseValidator, validate, pc.addItem(Course));
router.put(   "/courses/:itemId",  auth, courseValidator, validate, pc.updateItem(Course));
router.delete("/courses/:itemId",  auth, pc.deleteItem(Course));

// ── Employment ────────────────────────────────────────────────
router.post(  "/employment",          auth, employmentValidator, validate, pc.addItem(Employment));
router.put(   "/employment/:itemId",  auth, employmentValidator, validate, pc.updateItem(Employment));
router.delete("/employment/:itemId",  auth, pc.deleteItem(Employment));

module.exports = router;
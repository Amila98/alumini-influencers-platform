/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: Manage developer API keys for client access
 */

/**
 * @swagger
 * /api/keys:
 *   post:
 *     summary: Generate a new API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: AR Client
 *               clientType:
 *                 type: string
 *                 example: analytics_dashboard
 *     responses:
 *       201:
 *         description: Key generated — shown only once
 *   get:
 *     summary: List all your API keys
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys (without actual key values)
 */

/**
 * @swagger
 * /api/keys/{keyId}/stats:
 *   get:
 *     summary: View usage statistics for a key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Key stats with access logs
 */

/**
 * @swagger
 * /api/keys/{keyId}/revoke:
 *   delete:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Key revoked successfully
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const kc = require("../controllers/apiKeyController");

router.post("/",                auth, kc.generateKey);   
router.get("/",                 auth, kc.listKeys);      
router.get("/:keyId/stats",     auth, kc.getKeyStats);    
router.delete("/:keyId/revoke", auth, kc.revokeKey);      

module.exports = router;
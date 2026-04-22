/**
 * @swagger
 * tags:
 *   name: Bidding
 *   description: Blind bidding system for alumni featured slots
 */

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Place a bid for tomorrow's featured slot
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 250.00
 *     responses:
 *       201:
 *         description: Bid placed — returns winning/losing status only
 *       400:
 *         description: Already have active bid or bidding closed
 *       403:
 *         description: Monthly limit reached
 */

/**
 * @swagger
 * /api/bids/{bidId}:
 *   put:
 *     summary: Increase your bid (increase only)
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 300.00
 *     responses:
 *       200:
 *         description: Bid updated
 *       400:
 *         description: New amount must be higher
 *   delete:
 *     summary: Cancel your bid
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bid cancelled
 */

/**
 * @swagger
 * /api/bids/status:
 *   get:
 *     summary: Check if your current bid is winning or losing
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns winning/losing status — amount never revealed
 */

/**
 * @swagger
 * /api/bids/history:
 *   get:
 *     summary: View your full bid history
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of past bids
 */

/**
 * @swagger
 * /api/bids/monthly-status:
 *   get:
 *     summary: Check monthly win limit status (X/3 remaining)
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns wins used, wins remaining, max wins
 */

/**
 * @swagger
 * /api/bids/tomorrow:
 *   get:
 *     summary: View tomorrow's available slot info
 *     tags: [Bidding]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tomorrow's slot details
 */


const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const bc = require("../controllers/bidController");

router.get("/tomorrow",        auth, bc.getTomorrowSlot);   
router.post("/",               auth, bc.placeBid);          
router.put("/:bidId",          auth, bc.updateBid);         
router.delete("/:bidId",       auth, bc.cancelBid);         
router.get("/status",          auth, bc.getMyBidStatus);    
router.get("/history",         auth, bc.getBidHistory);     
router.get("/monthly-status",  auth, bc.getMonthlyStatus);  

module.exports = router;
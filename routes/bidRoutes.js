const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const bc = require("../controllers/bidController");

router.get("/tomorrow",        auth, bc.getTomorrowSlot);   // View tomorrow's slot
router.post("/",               auth, bc.placeBid);          // Place bid
router.put("/:bidId",          auth, bc.updateBid);         // Increase bid
router.delete("/:bidId",       auth, bc.cancelBid);         // Cancel bid
router.get("/status",          auth, bc.getMyBidStatus);    // Winning/losing?
router.get("/history",         auth, bc.getBidHistory);     // Past bids
router.get("/monthly-status",  auth, bc.getMonthlyStatus);  // X/3 remaining

module.exports = router;
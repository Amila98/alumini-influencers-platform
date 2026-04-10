const { Op } = require("sequelize");
const sequelize = require("../config/db");
const Bid = require("../models/Bid");
const Profile = require("../models/Profile");
const MonthlyLimit = require("../models/MonthlyLimit");

const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]; 
};

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};


exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;

    const now = new Date();
    if (now.getHours() >= 23) {
      return res.status(400).json({ message: "Bidding closed for today. Opens again tomorrow." });
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid bid amount" });
    }

    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const tomorrow = getTomorrow();
    const currentMonth = getCurrentMonth();

    const [limit] = await MonthlyLimit.findOrCreate({
      where: { profileId: profile.id, month: currentMonth },
      defaults: { winCount: 0, hasAttendedEvent: false }
    });

    const maxWins = limit.hasAttendedEvent ? 4 : 3;
    if (limit.winCount >= maxWins) {
      return res.status(403).json({
        message: `Monthly limit reached (${limit.winCount}/${maxWins} wins this month)`
      });
    }

    const existingBid = await Bid.findOne({
      where: {
        profileId: profile.id,
        bidDate: tomorrow,
        status: { [Op.notIn]: ["cancelled"] }
      }
    });
    if (existingBid) {
      return res.status(400).json({
        message: "You already have an active bid for tomorrow. Use update instead."
      });
    }
    const bid = await Bid.create({
      profileId: profile.id,
      amount,
      bidDate: tomorrow,
      status: "losing"
    });

    await updateBidStatuses(tomorrow);

    const updatedBid = await Bid.findByPk(bid.id);

    res.status(201).json({
      message: "Bid placed successfully",
      bidId: bid.id,
      bidDate: tomorrow,
      status: updatedBid.status,   
      isCurrentlyWinning: updatedBid.status === "winning"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const bid = await Bid.findOne({
      where: {
        id: req.params.bidId,
        profileId: profile.id,
        status: { [Op.notIn]: ["cancelled", "won", "lost"] }
      }
    });

    if (!bid) return res.status(404).json({ message: "Active bid not found" });

    if (parseFloat(amount) <= parseFloat(bid.amount)) {
      return res.status(400).json({ message: "New amount must be higher than current bid" });
    }

    await bid.update({ amount });
    await updateBidStatuses(bid.bidDate);

    const updatedBid = await Bid.findByPk(bid.id);

    res.json({
      message: "Bid updated",
      bidId: bid.id,
      status: updatedBid.status,
      isCurrentlyWinning: updatedBid.status === "winning"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.cancelBid = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const bid = await Bid.findOne({
      where: {
        id: req.params.bidId,
        profileId: profile.id,
        status: { [Op.notIn]: ["cancelled", "won", "lost"] }
      }
    });

    if (!bid) return res.status(404).json({ message: "Active bid not found" });

    await bid.update({ status: "cancelled" });
    await updateBidStatuses(bid.bidDate);

    res.json({ message: "Bid cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getMyBidStatus = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const tomorrow = getTomorrow();
    const bid = await Bid.findOne({
      where: {
        profileId: profile.id,
        bidDate: tomorrow,
        status: { [Op.notIn]: ["cancelled"] }
      }
    });

    if (!bid) return res.json({ message: "No active bid for tomorrow" });


    res.json({
      bidId: bid.id,
      bidDate: bid.bidDate,
      status: bid.status,
      isCurrentlyWinning: bid.status === "winning"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getBidHistory = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const bids = await Bid.findAll({
      where: { profileId: profile.id },
      order: [["bidDate", "DESC"]],
      attributes: ["id", "bidDate", "status", "isWinner", "createdAt"]
    });

    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getMonthlyStatus = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const currentMonth = getCurrentMonth();
    const [limit] = await MonthlyLimit.findOrCreate({
      where: { profileId: profile.id, month: currentMonth },
      defaults: { winCount: 0, hasAttendedEvent: false }
    });

    const maxWins = limit.hasAttendedEvent ? 4 : 3;

    res.json({
      month: currentMonth,
      winsUsed: limit.winCount,
      winsRemaining: maxWins - limit.winCount,
      maxWins,
      hasAttendedEvent: limit.hasAttendedEvent
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getTomorrowSlot = async (req, res) => {
  try {
    const tomorrow = getTomorrow();
    const bidCount = await Bid.count({
      where: { bidDate: tomorrow, status: { [Op.notIn]: ["cancelled"] } }
    });

    res.json({
      date: tomorrow,
      totalActiveBids: bidCount,
      slotAvailable: bidCount < 1
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


async function updateBidStatuses(bidDate) {
  await sequelize.transaction(async (t) => {
    const activeBids = await Bid.findAll({
      where: { bidDate, status: { [Op.notIn]: ["cancelled", "won", "lost"] } },
      order: [["amount", "DESC"]],
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    for (let i = 0; i < activeBids.length; i++) {
      await activeBids[i].update(
        { status: i === 0 ? "winning" : "losing" },
        { transaction: t }
      );
    }
  });
}
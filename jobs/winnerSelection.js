const cron = require("node-cron");
const { Op } = require("sequelize");
const Bid = require("../models/Bid");
const Profile = require("../models/Profile");
const MonthlyLimit = require("../models/MonthlyLimit");

const getCurrentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const selectDailyWinner = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];


    const winningBid = await Bid.findOne({
      where: { bidDate: tomorrowStr, status: { [Op.notIn]: ["cancelled"] } },
      order: [["amount", "DESC"]]
    });

    if (!winningBid) {
      console.log(`[${new Date().toISOString()}] No bids for ${tomorrowStr}`);
      return;
    }

  
    await winningBid.update({ status: "won", isWinner: true });


    await Bid.update(
      { status: "lost" },
      {
        where: {
          bidDate: tomorrowStr,
          id: { [Op.ne]: winningBid.id },
          status: { [Op.notIn]: ["cancelled"] }
        }
      }
    );


    await Profile.update(
      { isActiveToday: false },
      { where: { isActiveToday: true } }
    );
    await Profile.update(
      { isActiveToday: true },
      { where: { id: winningBid.profileId } }
    );


    const currentMonth = getCurrentMonth();
    const [limit] = await MonthlyLimit.findOrCreate({
      where: { profileId: winningBid.profileId, month: currentMonth },
      defaults: { winCount: 0 }
    });
    await limit.increment("winCount");

    console.log(`[${new Date().toISOString()}] Winner selected: Profile ${winningBid.profileId} for ${tomorrowStr}`);

  } catch (err) {
    console.error("Winner selection error:", err.message);
  }
};


cron.schedule("0 18 * * *", selectDailyWinner);

module.exports = { selectDailyWinner };
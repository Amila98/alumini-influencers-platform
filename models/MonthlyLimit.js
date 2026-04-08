const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const MonthlyLimit = sequelize.define("MonthlyLimit", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  month: {
    // Format: "2026-04"
    type: DataTypes.STRING,
    allowNull: false
  },
  winCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hasAttendedEvent: {
    // Grants 4th bid slot
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });

MonthlyLimit.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(MonthlyLimit, { foreignKey: "profileId" });

module.exports = MonthlyLimit;
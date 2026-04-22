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
    type: DataTypes.STRING,
    allowNull: false
  },
  winCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hasAttendedEvent: {
  
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });

MonthlyLimit.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(MonthlyLimit, { foreignKey: "profileId" });

module.exports = MonthlyLimit;
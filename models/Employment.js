const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Employment = sequelize.define("Employment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  jobTitle:    { type: DataTypes.STRING, allowNull: false },
  company:     { type: DataTypes.STRING, allowNull: false },
  startDate:   { type: DataTypes.DATEONLY, allowNull: false },
  endDate:     { type: DataTypes.DATEONLY },   // null = current job
  description: { type: DataTypes.TEXT }
}, { timestamps: true });

Employment.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Employment, { foreignKey: "profileId" });

module.exports = Employment;
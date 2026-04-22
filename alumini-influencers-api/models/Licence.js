const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Licence = sequelize.define("Licence", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  title:          { type: DataTypes.STRING, allowNull: false },
  awardingBody:   { type: DataTypes.STRING, allowNull: false },
  completionDate: { type: DataTypes.DATEONLY, allowNull: false },
  url:            { type: DataTypes.STRING, validate: { isUrl: true } }
}, { timestamps: true });

Licence.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Licence, { foreignKey: "profileId" });

module.exports = Licence;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Certification = sequelize.define("Certification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  title:          { type: DataTypes.STRING, allowNull: false },
  issuingBody:    { type: DataTypes.STRING, allowNull: false },
  completionDate: { type: DataTypes.DATEONLY, allowNull: false },
  url:            { type: DataTypes.STRING, validate: { isUrl: true } }
}, { timestamps: true });

Certification.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Certification, { foreignKey: "profileId" });

module.exports = Certification;
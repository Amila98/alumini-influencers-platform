const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Degree = sequelize.define("Degree", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  title:          { type: DataTypes.STRING, allowNull: false },
  institution:    { type: DataTypes.STRING, allowNull: false },
  completionDate: { type: DataTypes.DATEONLY, allowNull: false },
  url:            { type: DataTypes.STRING, validate: { isUrl: true } }
}, { timestamps: true });

Degree.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Degree, { foreignKey: "profileId" });

module.exports = Degree;
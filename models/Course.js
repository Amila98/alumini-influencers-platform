const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Course = sequelize.define("Course", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Profile, key: "id" }
  },
  title:          { type: DataTypes.STRING, allowNull: false },
  provider:       { type: DataTypes.STRING, allowNull: false },
  completionDate: { type: DataTypes.DATEONLY, allowNull: false },
  url:            { type: DataTypes.STRING, validate: { isUrl: true } }
}, { timestamps: true });

Course.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Course, { foreignKey: "profileId" });

module.exports = Course;
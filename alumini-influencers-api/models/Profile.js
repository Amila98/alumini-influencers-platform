const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Profile = sequelize.define("Profile", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: User, key: "id" }
  },
  bio: {
    type: DataTypes.TEXT
  },
  linkedInUrl: {
    type: DataTypes.STRING,
    validate: { isUrl: true }
  },
  profileImage: {
    type: DataTypes.STRING
  },
  appearanceCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActiveToday: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  programme: {
    type: DataTypes.STRING  
  },
  graduationYear: {
    type: DataTypes.INTEGER 
  },
}, { timestamps: true });

Profile.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Profile, { foreignKey: "userId" });

module.exports = Profile;

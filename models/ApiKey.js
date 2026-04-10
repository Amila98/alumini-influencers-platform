const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const ApiKey = sequelize.define("ApiKey", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" }
  },
  key: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUsedAt: {
    type: DataTypes.DATE
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { timestamps: true });

ApiKey.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ApiKey, { foreignKey: "userId" });

module.exports = ApiKey;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const ApiKey = require("./ApiKey");

const ApiKeyLog = sequelize.define("ApiKeyLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  apiKeyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: ApiKey, key: "id" }
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  accessedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });

ApiKeyLog.belongsTo(ApiKey, { foreignKey: "apiKeyId" });
ApiKey.hasMany(ApiKeyLog, { foreignKey: "apiKeyId" });

module.exports = ApiKeyLog;
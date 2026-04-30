const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const ApiKey = sequelize.define(
  "ApiKey",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    key: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const raw = this.getDataValue("permissions");

        if (Array.isArray(raw)) {
          return raw;
        }

        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch (err) {
            return [];
          }
        }

        return [];
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "other"
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["key"],
      },
    ],
  },
);

ApiKey.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ApiKey, { foreignKey: "userId" });

module.exports = ApiKey;
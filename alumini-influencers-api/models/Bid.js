const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Profile = require("./Profile");

const Bid = sequelize.define("Bid", {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0.01 }
  },
  bidDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("winning", "losing", "cancelled", "won", "lost"),
    defaultValue: "losing"
  },
  isWinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { timestamps: true });

Bid.belongsTo(Profile, { foreignKey: "profileId" });
Profile.hasMany(Bid, { foreignKey: "profileId" });

module.exports = Bid;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeeWaiver = sequelize.define(
  "FeeWaiver",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    waiver_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    approved_by: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "fee_waivers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = FeeWaiver;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ExtraCharge = sequelize.define(
  "ExtraCharge",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    charge_type: { type: DataTypes.ENUM("DRESS", "TOUR"), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paid_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    status: {
      type: DataTypes.ENUM("Paid", "Partial", "Pending"),
      defaultValue: "Pending",
    },
    payment_date: { type: DataTypes.DATEONLY },
    remarks: { type: DataTypes.TEXT },
  },
  {
    tableName: "extra_charges",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = ExtraCharge;

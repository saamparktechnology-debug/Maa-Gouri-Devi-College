const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeeStructure = sequelize.define(
  "FeeStructure",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  {
    tableName: "fee_structures",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = FeeStructure;

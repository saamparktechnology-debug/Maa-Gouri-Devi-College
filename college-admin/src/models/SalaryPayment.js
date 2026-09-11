const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalaryPayment = sequelize.define(
  "SalaryPayment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    month: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    salary_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paid_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    payment_reference: { type: DataTypes.STRING(100) },
    status: {
      type: DataTypes.ENUM("Paid", "Partial", "Pending"),
      defaultValue: "Paid",
    },
    remarks: { type: DataTypes.TEXT },
  },
  {
    tableName: "salary_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = SalaryPayment;

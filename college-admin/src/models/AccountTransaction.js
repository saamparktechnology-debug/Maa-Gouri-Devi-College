const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AccountTransaction = sequelize.define(
  "AccountTransaction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transaction_type: {
      type: DataTypes.ENUM("INCOME", "EXPENSE"),
      allowNull: false,
    },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    payment_method: {
      type: DataTypes.ENUM("Cash", "Bank Transfer", "UPI", "Cheque"),
      defaultValue: "Cash",
    },
    reference: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    receipt_file_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receipt_file_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "account_transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = AccountTransaction;

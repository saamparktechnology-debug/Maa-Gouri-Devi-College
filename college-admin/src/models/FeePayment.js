const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeePayment = sequelize.define(
  "FeePayment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // The foreign keys (student_id, fee_structure_id) are mapped automatically in index.js,
    // but defining them here makes sure Sequelize knows exactly what to expect.
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fee_structure_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reference_no: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Paid", "Pending", "Failed"),
      defaultValue: "Paid",
    },
  },
  {
    tableName: "fee_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = FeePayment;

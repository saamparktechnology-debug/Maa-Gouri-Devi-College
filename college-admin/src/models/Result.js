const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Result = sequelize.define(
  "Result",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    total_max_marks: { type: DataTypes.INTEGER, allowNull: false },
    total_obtained_marks: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    result_status: {
      type: DataTypes.ENUM("PASS", "FAIL", "ABSENT"),
      allowNull: false,
    },
    published_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: "results",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["student_id", "semester_id"] }, // One result per student per semester
    ],
  },
);

module.exports = Result;

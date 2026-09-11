const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ResultSubjectMark = sequelize.define(
  "ResultSubjectMark",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    obtained_marks: { type: DataTypes.INTEGER, allowNull: false },
    grade: { type: DataTypes.STRING(5) }, // e.g., 'A+', 'B', 'F'
  },
  { tableName: "result_subject_marks", timestamps: false },
);

module.exports = ResultSubjectMark;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define(
  "Course",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_name: { type: DataTypes.STRING(100), allowNull: false }, // e.g., 'B.Ed'
    course_code: { type: DataTypes.STRING(20), allowNull: true },
    duration_years: { type: DataTypes.INTEGER, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "courses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Course;

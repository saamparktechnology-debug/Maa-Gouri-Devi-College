const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Semester = sequelize.define(
  "Semester",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    semester_name: { type: DataTypes.STRING(50), allowNull: false }, // e.g., 'Semester 1'
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "semesters",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Semester;

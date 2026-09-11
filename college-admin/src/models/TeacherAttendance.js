const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TeacherAttendance = sequelize.define(
  "TeacherAttendance",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Half-Day", "Paid Leave"),
      allowNull: false,
    },
    remarks: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "teacher_attendance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = TeacherAttendance;

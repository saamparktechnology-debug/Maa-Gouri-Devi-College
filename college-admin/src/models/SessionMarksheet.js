const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SessionMarksheet = sequelize.define(
  "SessionMarksheet",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    session_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    semester_id: { type: DataTypes.INTEGER, allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    tableName: "session_marksheets",
    timestamps: true,
    createdAt: "uploaded_at",
    updatedAt: false,
  },
);

module.exports = SessionMarksheet;

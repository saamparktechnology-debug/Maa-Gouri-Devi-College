const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TeacherDocument = sequelize.define(
  "TeacherDocument",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    document_type: { type: DataTypes.STRING(100), allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_path: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    tableName: "teacher_documents",
    timestamps: true,
    createdAt: "uploaded_at",
    updatedAt: false,
  },
);

module.exports = TeacherDocument;

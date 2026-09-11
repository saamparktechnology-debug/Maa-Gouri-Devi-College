const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Subject = sequelize.define(
  "Subject",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subject_name: { type: DataTypes.STRING(150), allowNull: false },
    subject_code: { type: DataTypes.STRING(50), allowNull: false },
    max_marks: { type: DataTypes.INTEGER, allowNull: false },
    passing_marks: { type: DataTypes.INTEGER, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "subjects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Subject;

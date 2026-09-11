const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notice = sequelize.define(
  "Notice",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    file_name: { type: DataTypes.STRING, allowNull: false },
    file_path: { type: DataTypes.STRING, allowNull: false },
    uploaded_by: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "notices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Notice;

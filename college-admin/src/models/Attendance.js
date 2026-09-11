const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attendance = sequelize.define(
  "Attendance",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("PRESENT", "ABSENT"), allowNull: false },
  },
  {
    tableName: "attendance",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["student_id", "date"] }, // A student can only have 1 record per day
    ],
  },
);

module.exports = Attendance;

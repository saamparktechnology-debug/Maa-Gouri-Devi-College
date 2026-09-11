const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Change the internal name to 'AcademicSession' to prevent cookie collision!
const Session = sequelize.define(
  "AcademicSession",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    session_name: { type: DataTypes.STRING(50), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: "academic_sessions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

// We still export it as 'Session', so none of your other files break!
module.exports = Session;

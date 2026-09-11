const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeeType = sequelize.define(
  "FeeType",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true }, // e.g., 'Tuition Fee', 'Admission Fee'
  },
  { tableName: "fee_types", timestamps: false },
);

module.exports = FeeType;

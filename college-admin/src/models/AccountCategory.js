const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AccountCategory = sequelize.define(
  "AccountCategory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.ENUM("INCOME", "EXPENSE"), allowNull: false },
  },
  { tableName: "account_categories", timestamps: false },
);

module.exports = AccountCategory;

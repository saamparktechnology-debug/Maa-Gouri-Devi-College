const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    emp_id: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    father_name: { type: DataTypes.STRING(150) },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },
    mobile: { type: DataTypes.STRING(15), allowNull: false },
    email: { type: DataTypes.STRING(150) },
    address: { type: DataTypes.TEXT },
    aadhaar_no: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    designation: { type: DataTypes.STRING(100), allowNull: false }, // e.g., 'Assistant Professor'
    department: { type: DataTypes.STRING(100) }, // e.g., 'B.Ed Faculty'
    qualification: { type: DataTypes.STRING(150) },
    joining_date: { type: DataTypes.DATEONLY, allowNull: false },
    employment_type: {
      type: DataTypes.ENUM("Full-time", "Part-time", "Contract"),
      defaultValue: "Full-time",
    },
    salary_package: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    tableName: "teachers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Teacher;

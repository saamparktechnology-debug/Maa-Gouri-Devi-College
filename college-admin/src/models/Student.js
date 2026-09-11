const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    admission_no: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    roll_no: { type: DataTypes.STRING(50) },
    registration_no: { type: DataTypes.STRING(50) },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    father_name: { type: DataTypes.STRING(150) },
    mother_name: { type: DataTypes.STRING(150) },
    dob: { type: DataTypes.DATEONLY, allowNull: false },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },
    mobile: { type: DataTypes.STRING(15) },
    email: { type: DataTypes.STRING(150) },
    aadhaar_no: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING(100) },
    state: { type: DataTypes.STRING(100) },
    pincode: { type: DataTypes.STRING(10) },
    admission_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("Active", "Inactive", "Alumni"),
      defaultValue: "Active",
    },
  },
  {
    tableName: "students",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Student;

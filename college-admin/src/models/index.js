const sequelize = require("../config/database");
const Admin = require("./Admin");
const Session = require("./Session");
const Course = require("./Course");
const Semester = require("./Semester");
const Subject = require("./Subject");
const Student = require("./Student");
const StudentDocument = require("./StudentDocument");
const FeeType = require("./FeeType");
const FeeStructure = require("./FeeStructure");
const FeePayment = require("./FeePayment");
const ExtraCharge = require("./ExtraCharge");
const Teacher = require("./Teacher");
const TeacherDocument = require("./TeacherDocument");
const SalaryPayment = require("./SalaryPayment");
const Attendance = require("./Attendance");
const Result = require("./Result");
const ResultSubjectMark = require("./ResultSubjectMark");
const AccountCategory = require("./AccountCategory");
const AccountTransaction = require("./AccountTransaction");
const FeeWaiver = require("./FeeWaiver");
const TeacherAttendance = require("./TeacherAttendance");
const Notice = require("./Notice");
const SessionMarksheet = require("./SessionMarksheet");

// --- ACADEMIC RELATIONSHIPS ---
Course.hasMany(Semester, { foreignKey: "course_id", onDelete: "CASCADE" });
Semester.belongsTo(Course, { foreignKey: "course_id" });

Course.hasMany(Subject, { foreignKey: "course_id", onDelete: "CASCADE" });
Subject.belongsTo(Course, { foreignKey: "course_id" });

Semester.hasMany(Subject, { foreignKey: "semester_id", onDelete: "CASCADE" });
Subject.belongsTo(Semester, { foreignKey: "semester_id" });

// --- STUDENT RELATIONSHIPS ---
Student.belongsTo(Session, { foreignKey: "session_id" });
Session.hasMany(Student, { foreignKey: "session_id" });

Student.belongsTo(Course, { foreignKey: "course_id" });
Course.hasMany(Student, { foreignKey: "course_id" });

Student.belongsTo(Semester, { foreignKey: "semester_id" });
Semester.hasMany(Student, { foreignKey: "semester_id" });

Student.hasMany(StudentDocument, {
  foreignKey: "student_id",
  onDelete: "CASCADE",
});
StudentDocument.belongsTo(Student, { foreignKey: "student_id" });

// --- FEE RELATIONSHIPS ---
FeeStructure.belongsTo(FeeType, { foreignKey: "fee_type_id" });
FeeType.hasMany(FeeStructure, { foreignKey: "fee_type_id" });

FeeStructure.belongsTo(Course, { foreignKey: "course_id" });
Course.hasMany(FeeStructure, { foreignKey: "course_id" });

FeeStructure.belongsTo(Session, { foreignKey: "session_id" });
Session.hasMany(FeeStructure, { foreignKey: "session_id" });

FeeStructure.belongsTo(Semester, { foreignKey: "semester_id" });
Semester.hasMany(FeeStructure, { foreignKey: "semester_id" });

FeePayment.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(FeePayment, { foreignKey: "student_id" });

FeePayment.belongsTo(FeeStructure, { foreignKey: "fee_structure_id" });
FeeStructure.hasMany(FeePayment, { foreignKey: "fee_structure_id" });

ExtraCharge.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(ExtraCharge, { foreignKey: "student_id" });

ExtraCharge.belongsTo(Session, { foreignKey: "session_id" });
Session.hasMany(ExtraCharge, { foreignKey: "session_id" });

// Fee Waiver Relationships
FeeWaiver.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(FeeWaiver, { foreignKey: "student_id" });

FeeWaiver.belongsTo(FeeStructure, { foreignKey: "fee_structure_id" });
FeeStructure.hasMany(FeeWaiver, { foreignKey: "fee_structure_id" });

// --- TEACHER & SALARY RELATIONSHIPS ---
Teacher.hasMany(TeacherDocument, {
  foreignKey: "teacher_id",
  onDelete: "CASCADE",
});
TeacherDocument.belongsTo(Teacher, { foreignKey: "teacher_id" });

Teacher.hasMany(SalaryPayment, {
  foreignKey: "teacher_id",
  onDelete: "CASCADE",
});
SalaryPayment.belongsTo(Teacher, { foreignKey: "teacher_id" });

// Teacher Attendance Relationships
TeacherAttendance.belongsTo(Teacher, { foreignKey: "teacher_id" });
Teacher.hasMany(TeacherAttendance, {
  foreignKey: "teacher_id",
  onDelete: "CASCADE",
});

// --- STUDENT ATTENDANCE RELATIONSHIPS ---
Attendance.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(Attendance, { foreignKey: "student_id" });

Attendance.belongsTo(Session, { foreignKey: "session_id" });
Attendance.belongsTo(Course, { foreignKey: "course_id" });
Attendance.belongsTo(Semester, { foreignKey: "semester_id" });
Attendance.belongsTo(Admin, { foreignKey: "marked_by" });

// --- RESULT RELATIONSHIPS ---
Result.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(Result, { foreignKey: "student_id" });

Result.belongsTo(Session, { foreignKey: "session_id" });
Result.belongsTo(Course, { foreignKey: "course_id" });
Result.belongsTo(Semester, { foreignKey: "semester_id" });

Result.hasMany(ResultSubjectMark, {
  foreignKey: "result_id",
  onDelete: "CASCADE",
});
ResultSubjectMark.belongsTo(Result, { foreignKey: "result_id" });
ResultSubjectMark.belongsTo(Subject, { foreignKey: "subject_id" });

// --- ACCOUNTS RELATIONSHIPS ---
AccountTransaction.belongsTo(AccountCategory, { foreignKey: "category_id" });
AccountCategory.hasMany(AccountTransaction, { foreignKey: "category_id" });

AccountTransaction.belongsTo(Admin, { foreignKey: "created_by" });

SessionMarksheet.belongsTo(Session, { foreignKey: "session_id" });
Session.hasMany(SessionMarksheet, {
  foreignKey: "session_id",
  onDelete: "CASCADE",
});

SessionMarksheet.belongsTo(Course, { foreignKey: "course_id" });
Course.hasMany(SessionMarksheet, {
  foreignKey: "course_id",
  onDelete: "CASCADE",
});

SessionMarksheet.belongsTo(Semester, { foreignKey: "semester_id" });
Semester.hasMany(SessionMarksheet, {
  foreignKey: "semester_id",
  onDelete: "CASCADE",
});

// --- EXPORT ALL MODELS ---
module.exports = {
  sequelize,
  Admin,
  Session,
  Course,
  Semester,
  Subject,
  Student,
  StudentDocument,
  FeeType,
  FeeStructure,
  FeePayment,
  ExtraCharge,
  FeeWaiver,
  Teacher,
  TeacherDocument,
  SalaryPayment,
  TeacherAttendance,
  Attendance,
  Result,
  ResultSubjectMark,
  AccountCategory,
  AccountTransaction,
  Notice,
  SessionMarksheet,
};

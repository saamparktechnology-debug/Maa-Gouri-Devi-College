const { Student, Attendance } = require("../models");

// Handle ADMS Push data sent by Realtime C121TA device
exports.handleADMSData = async (req, res) => {
  try {
    console.log("");
    console.log("==============================================");
    console.log("=== BIOMETRIC ATTENDANCE REQUEST RECEIVED ===");
    console.log("==============================================");
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Query:", req.query);
    console.log("Headers:", req.headers);
    console.log("Raw Body:", req.body);

    const queryParams = req.query;
    const rawBody = req.body;

    if (req.path.includes("/ping") || queryParams.option === "check") {
      console.log(">>> Device ping/check request");
      return res.send("OK");
    }

    if (!rawBody || typeof rawBody !== "string") {
      console.log(">>> NO TEXT BODY RECEIVED");
      console.log(">>> Returning OK:0");
      return res.send("OK:0");
    }

    const lines = rawBody.split(/\r?\n/);

    console.log(">>> Total lines received:", lines.length);

    for (const line of lines) {
      if (!line.trim()) continue;

      console.log("");
      console.log("---------- ATTENDANCE RECORD ----------");
      console.log("Raw line:", JSON.stringify(line));

      const parts = line.split("\t");

      console.log("Parsed parts:", parts);

      const enrollId = parts[0]?.trim();
      const punchTime = parts[1]?.trim();

      console.log("Enroll ID:", enrollId);
      console.log("Punch Time:", punchTime);

      if (!enrollId || !punchTime) {
        console.log(">>> INVALID RECORD: missing enroll ID or punch time");
        continue;
      }

      console.log(">>> Looking for student with admission_no:", enrollId);

      const student = await Student.findOne({
        where: { admission_no: enrollId },
      });

      if (!student) {
        console.log(">>> STUDENT NOT FOUND:", enrollId);
        continue;
      }

      console.log(
        ">>> STUDENT FOUND:",
        JSON.stringify(student.toJSON())
      );

      const punchDate = punchTime.split(" ")[0];

      console.log(">>> Punch date:", punchDate);

      const existingAttendance = await Attendance.findOne({
        where: {
          student_id: student.id,
          date: punchDate,
        },
      });

      if (existingAttendance) {
        console.log(
          ">>> ATTENDANCE ALREADY EXISTS:",
          JSON.stringify(existingAttendance.toJSON())
        );
        continue;
      }

      console.log(">>> Creating attendance...");

      const attendance = await Attendance.create({
        student_id: student.id,
        date: punchDate,
        status: "PRESENT",
      });

      console.log(
        ">>> ATTENDANCE CREATED:",
        JSON.stringify(attendance.toJSON())
      );
    }

    console.log("");
    console.log(">>> Finished processing biometric request");
    console.log("==============================================");

    return res.send("OK:0");
  } catch (error) {
    console.error("==============================================");
    console.error("!!! BIOMETRIC PROCESSING ERROR !!!");
    console.error(error);
    console.error("==============================================");

    return res.status(500).send("ERROR");
  }
};

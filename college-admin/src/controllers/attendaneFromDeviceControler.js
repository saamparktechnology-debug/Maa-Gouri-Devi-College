const { Student, Attendance } = require("../models"); // Adjust according to your Sequelize models

// Handle ADMS Push data sent by Realtime C121ta device
exports.handleADMSData = async (req, res) => {
  try {
    const queryParams = req.query;
    const rawBody = req.body;

    // If the device is hitting the ping/handshake endpoint
    if (req.path.includes("/ping") || queryParams.option === "check") {
      return res.send("OK");
    }

    // Attendance punch logs are usually pushed under table 'rtlog' or sent in the body
    // Realtime/ZKTeco push payloads are usually plain text lines formatted as: EnrollNo \t Time \t State \t VerifyMode
    if (rawBody && typeof rawBody === "string") {
      const lines = rawBody.split("\n");
      for (let line of lines) {
        if (!line.trim()) continue;

        // Example line format: "1001\t2026-09-13 15:30:00\t0\t1"
        const parts = line.split("\t");
        const enrollId = parts[0]; // This corresponds to student admission_no
        const punchTime = parts[1];

        if (enrollId && punchTime) {
          // Find student by admission_no matching the device's Enroll ID
          const student = await Student.findOne({
            where: { admission_no: enrollId },
          });

          if (student) {
            const punchDate = punchTime.split(" ")[0]; // YYYY-MM-DD

            // Check if an attendance entry for today already exists to prevent duplicates
            const existingAttendance = await Attendance.findOne({
              where: {
                student_id: student.id,
                attendance_date: punchDate,
              },
            });

            if (!existingAttendance) {
              await Attendance.create({
                student_id: student.id,
                admission_no: student.admission_no,
                attendance_date: punchDate,
                check_in_time: punchTime,
                status: "Present",
                source: "Biometric - C121ta",
              });
            }
          }
        }
      }
    }

    // Always return 'OK' or count so the device clears the log queue from its local memory
    return res.send("OK:0");
  } catch (error) {
    // Fixed missing opening parenthesis here
    console.error("Error processing biometric ADMS log:", error);
    return res.status(500).send("ERROR");
  }
};

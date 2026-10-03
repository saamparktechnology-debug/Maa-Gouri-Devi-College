const { Student, Attendance } = require("../models");

// ============================================================
// ZKTeco / C121TA ADMS PUSH
// POST /iclock/cdata
// GET  /iclock/cdata
// ============================================================

exports.handleADMSData = async (req, res) => {
  try {
    const { SN, table, Stamp, options, pushver } = req.query;

    console.log("\n========================================");
    console.log("C121TA ADMS REQUEST");
    console.log("Method :", req.method);
    console.log("SN     :", SN);
    console.log("Table  :", table);
    console.log("Stamp  :", Stamp);
    console.log("PushVer:", pushver);
    console.log("Query  :", req.query);
    console.log("========================================");

    // ---------------------------------------------------------
    // GET /iclock/cdata
    // Device handshake / heartbeat
    // ---------------------------------------------------------
    if (req.method === "GET") {
      console.log("C121TA handshake received");

      // ADMS handshake response
      const response = [
        `GET OPTION FROM: ${SN || ""}`,
        "Stamp=9999",
        "ATTLOGSTAMP=0",
        "OPERLOGStamp=0",
        "ATTPHOTOStamp=0",
        "ErrorDelay=30",
        "Delay=10",
        "TransTimes=00:00;23:59",
        "TransInterval=1",
        "TransFlag=TransData AttLog OpLog EnrollUser ChgUser EnrollFP ChgFP FPImag",
        "TimeZone=5.5",
        "Realtime=1",
        "Encrypt=None",
      ].join("\n");

      console.log("Handshake response:\n", response);

      return res.status(200).type("text/plain").send(response);
    }

    // ---------------------------------------------------------
    // POST /iclock/cdata
    // Attendance / device data
    // ---------------------------------------------------------

    const rawBody =
      typeof req.body === "string"
        ? req.body
        : req.body
          ? JSON.stringify(req.body)
          : "";

    console.log("RAW BODY:");
    console.log(rawBody);

    if (!rawBody.trim()) {
      console.log("Empty body received");
      return res.status(200).type("text/plain").send("OK: 0");
    }

    // =========================================================
    // REALTIME FORMAT
    //
    // Example:
    //
    // time=2026-09-29 09:15:22
    // pin=1001
    // cardno=0
    // event=0
    // inoutstatus=0
    // verifytype=1
    // =========================================================

    if (table && table.toLowerCase() === "rtlog") {
      const records = rawBody
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      let savedCount = 0;

      for (const line of records) {
        console.log("RTLOG LINE:", line);

        const fields = {};

        // Handle tab-separated key=value fields
        line.split("\t").forEach((part) => {
          const separator = part.indexOf("=");

          if (separator === -1) return;

          const key = part.substring(0, separator).trim();
          const value = part.substring(separator + 1).trim();

          fields[key.toLowerCase()] = value;
        });

        // Also support key=value separated by spaces
        // when tabs are not present.
        if (!fields.time || !fields.pin) {
          const matches = line.match(
            /(?:^|\s)(time|pin|cardno|event|inoutstatus|verifytype)=([^\s]+(?:\s[0-9:-]+)?)/gi,
          );

          if (matches) {
            for (const item of matches) {
              const index = item.indexOf("=");

              const key = item.substring(0, index).trim().toLowerCase();

              const value = item.substring(index + 1).trim();

              fields[key] = value;
            }
          }
        }

        const enrollId = fields.pin;
        const punchTime = fields.time;

        console.log("Parsed RTLOG:", {
          enrollId,
          punchTime,
          verifytype: fields.verifytype,
          inoutstatus: fields.inoutstatus,
          event: fields.event,
        });

        if (!enrollId || !punchTime) {
          console.log("Could not parse RTLOG record");
          continue;
        }

        await saveAttendance(
          enrollId,
          punchTime,
          fields.inoutstatus,
          fields.verifytype,
        );

        savedCount++;
      }

      return res.status(200).type("text/plain").send(`OK: ${savedCount}`);
    }

    // =========================================================
    // STANDARD ATTLOG FORMAT
    //
    // Example:
    //
    // 1001    2026-09-29 09:15:22    0    1    0    0    0
    //
    // PIN
    // TIME
    // STATUS
    // VERIFY
    // WORKCODE
    // =========================================================

    if (!table || table.toUpperCase() === "ATTLOG") {
      const lines = rawBody
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      let savedCount = 0;

      for (const line of lines) {
        console.log("ATTLOG LINE:", line);

        const parts = line.split("\t");

        const enrollId = parts[0]?.trim();
        const punchTime = parts[1]?.trim();
        const status = parts[2]?.trim();
        const verifyMode = parts[3]?.trim();
        const workCode = parts[4]?.trim();

        console.log("Parsed ATTLOG:", {
          enrollId,
          punchTime,
          status,
          verifyMode,
          workCode,
        });

        if (!enrollId || !punchTime) {
          console.log("Invalid ATTLOG row");
          continue;
        }

        await saveAttendance(enrollId, punchTime, status, verifyMode);

        savedCount++;
      }

      return res.status(200).type("text/plain").send(`OK: ${savedCount}`);
    }

    // =========================================================
    // OTHER TABLES
    // =========================================================

    console.log("Unhandled ADMS table:", table);

    // Still acknowledge the device so it doesn't keep retrying.
    return res.status(200).type("text/plain").send("OK: 0");
  } catch (error) {
    console.error("ADMS processing error:", error);

    // During testing, return 500 so we know something failed.
    return res.status(500).type("text/plain").send("ERROR");
  }
};

// ============================================================
// SAVE ATTENDANCE
// ============================================================

async function saveAttendance(enrollId, punchTime, inOutStatus, verifyType) {
  try {
    console.log("Looking for student:", enrollId);

    const student = await Student.findOne({
      where: {
        admission_no: enrollId,
      },
    });

    if (!student) {
      console.warn(`No student found for biometric PIN: ${enrollId}`);

      return;
    }

    const punchDate = punchTime.substring(0, 10);

    // ---------------------------------------------------------
    // Prevent duplicate attendance
    // ---------------------------------------------------------

    const existingAttendance = await Attendance.findOne({
      where: {
        student_id: student.id,
        attendance_date: punchDate,
      },
    });

    if (existingAttendance) {
      console.log(`Attendance already exists: ${enrollId} ${punchDate}`);

      return;
    }

    // ---------------------------------------------------------
    // Create attendance
    // ---------------------------------------------------------

    await Attendance.create({
      student_id: student.id,
      admission_no: student.admission_no,
      attendance_date: punchDate,
      check_in_time: punchTime,
      status: "Present",
      source: "Biometric - C121TA",
    });

    console.log(`ATTENDANCE SAVED: ${enrollId} - ${punchTime}`);
  } catch (error) {
    console.error(`Failed to save attendance for ${enrollId}:`, error);

    throw error;
  }
}

// ============================================================
// ZKTeco / C121TA ADMS
//
// GET  /iclock/cdata     -> device handshake
// POST /iclock/cdata     -> attendance data
// ============================================================

exports.handleADMSData = async (req, res) => {
  try {
    const { SN, table, Stamp, options, pushver } = req.query;

    console.log("\n========================================");
    console.log("C121TA REQUEST");
    console.log("Method :", req.method);
    console.log("Path   :", req.path);
    console.log("SN     :", SN);
    console.log("Table  :", table);
    console.log("Stamp  :", Stamp);
    console.log("Options:", options);
    console.log("PushVer:", pushver);
    console.log("========================================");

    // ==========================================================
    // DEVICE HANDSHAKE
    // ==========================================================

    if (req.method === "GET") {
      const response = [
        `GET OPTION FROM: ${SN || ""}`,
        "Stamp=9999",
        "ATTLOGSTAMP=0",
        "OPERLOGStamp=0",
        "ATTPHOTOStamp=0",
        "ErrorDelay=30",
        "Delay=10",
        "TransTimes=00:00;23:59",
        "TransInterval=1",
        "TransFlag=TransData AttLog OpLog EnrollUser ChgUser EnrollFP ChgFP FPImag",
        "TimeZone=5.5",
        "Realtime=1",
        "Encrypt=None",
      ].join("\n");

      console.log("Sending C121TA handshake:");
      console.log(response);

      return res.status(200).type("text/plain").send(response);
    }

    // ==========================================================
    // POST DATA
    // ==========================================================

    const rawBody =
      typeof req.body === "string"
        ? req.body
        : req.body
          ? JSON.stringify(req.body)
          : "";

    console.log("RAW BODY:");
    console.log(rawBody);

    if (!rawBody.trim()) {
      console.log("Empty body received");
      return res.status(200).type("text/plain").send("OK: 0");
    }

    // ==========================================================
    // ATTLOG / RTLOG
    // ==========================================================

    const normalizedTable = (table || "ATTLOG").toUpperCase();

    if (normalizedTable === "ATTLOG" || normalizedTable === "RTLOG") {
      const lines = rawBody
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      let savedCount = 0;
      let duplicateCount = 0;
      let unknownStudentCount = 0;

      for (const line of lines) {
        console.log("\nATTENDANCE LINE:");
        console.log(line);

        // ------------------------------------------------------
        // C121TA standard format:
        //
        // PIN    TIME                  STATUS VERIFY WORKCODE
        //
        // Example:
        // 1001   2026-09-29 09:15:22   0      1      0
        //
        // Usually fields are TAB separated.
        // ------------------------------------------------------

        let parts = line.split(/\t+/);

        // Some devices/requests may contain multiple spaces
        // instead of tabs.
        if (parts.length < 2) {
          parts = line.split(/\s{2,}/);
        }

        const enrollId = parts[0]?.trim();
        const punchTime = parts[1]?.trim();
        const status = parts[2]?.trim();
        const verifyMode = parts[3]?.trim();
        const workCode = parts[4]?.trim();

        console.log("PARSED:");
        console.log({
          enrollId,
          punchTime,
          status,
          verifyMode,
          workCode,
        });

        if (!enrollId || !punchTime) {
          console.log("INVALID ATTENDANCE LINE");
          continue;
        }

        // ------------------------------------------------------
        // Find student
        // ------------------------------------------------------

        const student = await Student.findOne({
          where: {
            admission_no: enrollId,
          },
        });

        if (!student) {
          console.log(`STUDENT NOT FOUND: admission_no=${enrollId}`);

          unknownStudentCount++;
          continue;
        }

        console.log(
          `STUDENT FOUND: ID=${student.id}, admission_no=${student.admission_no}`,
        );

        // ------------------------------------------------------
        // Date
        // ------------------------------------------------------

        const punchDate = punchTime.substring(0, 10);

        // ------------------------------------------------------
        // Prevent duplicate attendance
        // ------------------------------------------------------

        const existingAttendance = await Attendance.findOne({
          where: {
            student_id: student.id,
            attendance_date: punchDate,
          },
        });

        if (existingAttendance) {
          console.log(`DUPLICATE ATTENDANCE: ${enrollId} ${punchDate}`);

          duplicateCount++;
          continue;
        }

        // ------------------------------------------------------
        // Save attendance
        // ------------------------------------------------------

        await Attendance.create({
          student_id: student.id,
          admission_no: student.admission_no,
          attendance_date: punchDate,
          check_in_time: punchTime,
          status: "Present",
          source: "Biometric - C121TA",
        });

        console.log(`ATTENDANCE SAVED: ${enrollId} - ${punchTime}`);

        savedCount++;
      }

      console.log("\n========================================");
      console.log("C121TA PROCESSING RESULT");
      console.log("Saved:", savedCount);
      console.log("Duplicates:", duplicateCount);
      console.log("Unknown students:", unknownStudentCount);
      console.log("========================================\n");

      // Tell device how many records were processed.
      return res.status(200).type("text/plain").send(`OK: ${savedCount}`);
    }

    // ==========================================================
    // OTHER ADMS DATA
    // ==========================================================

    console.log(`Unhandled C121TA table: ${table}`);

    return res.status(200).type("text/plain").send("OK: 0");
  } catch (error) {
    console.error("C121TA PROCESSING ERROR:", error);

    return res.status(500).type("text/plain").send("ERROR");
  }
};

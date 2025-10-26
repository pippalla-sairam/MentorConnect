const express = require("express");
const { supabase } = require("../supabaseClient");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Middleware to ensure the user is a mentor
const verifyMentor = (req, res, next) => {
  if (!req.user || req.user.role !== "mentor") {
    return res.status(403).json({ error: "Access denied. Mentor privileges required." });
  }
  next();
};

// GET all students assigned to logged-in mentor
router.get("/students", verifyToken, verifyMentor, async (req, res) => {
  try {
    const mentorId = req.user.id;

    // Get assigned students
    const { data: assignedStudents, error: assignedError } = await supabase
      .from("assigned_mentors")
      .select("student_id, score")
      .eq("mentor_id", mentorId);

    if (assignedError) throw assignedError;
    if (!assignedStudents || assignedStudents.length === 0) return res.json([]);

    const studentIds = assignedStudents.map((s) => s.student_id);

    // Get student details
    const { data: students, error: studentError } = await supabase
      .from("student_details")
      .select("id, enrollment_number, full_name, email, major")
      .in("id", studentIds);

    if (studentError) throw studentError;

    // Merge score
    const studentsWithScores = students.map((stu) => {
      const match = assignedStudents.find((s) => s.student_id === stu.id);
      return { ...stu, score: match ? match.score : 0 };
    });

    res.json(studentsWithScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET student details including personal info, grades, and attendance
router.get("/student-details/:studentId", verifyToken, verifyMentor, async (req, res) => {
  const { studentId } = req.params;

  try {
    // 1️⃣ Fetch student personal details
    const { data: student, error: studentError } = await supabase
      .from("student_details")
      .select("*")
      .eq("id", studentId)
      .single(); // single returns one row

    if (studentError) throw studentError;

    // 2️⃣ Fetch grades
    const { data: grades, error: gradesError } = await supabase
      .from("grades")
      .select("subject_id, grade")
      .eq("student_id", studentId);

    if (gradesError) throw gradesError;

    // 3️⃣ Fetch attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from("student_subjects")
      .select("subject_id, semester, attendance_percentage")
      .eq("student_id", studentId);

    if (attendanceError) throw attendanceError;

    res.json({ student, grades, attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /mentors/subjects
router.get("/subjects", verifyToken, async (req, res) => {
  try {
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("id, name");

    if (error) throw error;
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { v4: uuidv4 } = require("uuid");

// GET /mentors/schedule
router.get("/schedule", verifyToken, verifyMentor, async (req, res) => {
  try {
    const mentorId = req.user.id;
    console.log("Mentor ID from token:", mentorId);

    const { data: sessions, error } = await supabase
      .from("mentor_schedule")
      .select("id, day_of_week, start_time, end_time, type")
      .eq("mentor_id", mentorId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(sessions || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /mentors/schedule
router.post("/schedule", verifyToken, verifyMentor, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { day_of_week, start_time, end_time, type } = req.body;

    if (!day_of_week || !start_time || !end_time || !type)
      return res.status(400).json({ error: "All fields are required" });

    const { data, error } = await supabase
      .from("mentor_schedule")
      .insert([
        {
          id: uuidv4(),
          mentor_id: mentorId,
          day_of_week,
          start_time,
          end_time,
          type,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Schedule added", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /mentors/schedule/:id
router.put("/schedule/:id", verifyToken, verifyMentor, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const scheduleId = req.params.id;
    const { day_of_week, start_time, end_time, type } = req.body;

    const { data, error } = await supabase
      .from("mentor_schedule")
      .update({ day_of_week, start_time, end_time, type })
      .eq("id", scheduleId)
      .eq("mentor_id", mentorId);

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Schedule updated", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /mentors/schedule/:id
router.delete("/schedule/:id", verifyToken, verifyMentor, async (req, res) => {
  try {
    const mentorId = req.user.id;
    const scheduleId = req.params.id;

    const { data, error } = await supabase
      .from("mentor_schedule")
      .delete()
      .eq("id", scheduleId)
      .eq("mentor_id", mentorId);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Schedule deleted", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;

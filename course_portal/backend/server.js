const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const app = express();


// ---------------------------------------------------------
// Auth helpers (admins see everything, students only themselves)
// ---------------------------------------------------------

function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Please log in" });

    try {
        const d = jwt.verify(token, JWT_SECRET);
        // Tokens issued before roles existed only carry adminId.
        const role = d.role || (d.adminId ? "admin" : null);
        if (!role) throw new Error("Invalid token");
        req.user = { role, email: d.email, studentId: d.studentId };
        next();
    } catch (err) {
        res.status(401).json({ error: "Session expired. Please log in again." });
    }
}

function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admins only" });
    }
    next();
}

function canAccessStudent(req, studentId) {
    return (
        req.user.role === "admin" ||
        String(req.user.studentId) === String(studentId)
    );
}

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}


// ---------------------------------------------------------
// Middleware
// ---------------------------------------------------------

app.use(cors());
app.use(express.json());


// ---------------------------------------------------------
// Test Route
// ---------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Course Recommendation API is running");
});


// ---------------------------------------------------------
// Get All Students
// ---------------------------------------------------------

app.get("/students", auth, async (req, res) => {
    try {
        const result =
            req.user.role === "admin"
                ? await pool.query("SELECT * FROM students ORDER BY student_id")
                : await pool.query(
                      "SELECT * FROM students WHERE student_id = $1",
                      [req.user.studentId]
                  );
        // never send password hashes to the browser
        res.json(result.rows.map(({ password_hash, ...student }) => student));
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).json({ error: "Failed to fetch students" });
    }
});


// ---------------------------------------------------------
// Get All Courses
// ---------------------------------------------------------

app.get("/courses", auth, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM courses ORDER BY course_id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});


// ---------------------------------------------------------
// Get Recommendations for a Student
// ---------------------------------------------------------

app.get("/recommendations/:studentId", auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!canAccessStudent(req, studentId)) {
            return res.status(403).json({ error: "You can only view your own recommendations" });
        }
        const result = await pool.query(
            `SELECT *
             FROM recommendations
             WHERE student_id = $1
             ORDER BY recommendation_id DESC`,
            [studentId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching recommendations:", error.message);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});


// ---------------------------------------------------------
// Test Recommendation (hardcoded values, hits FastAPI)
// ---------------------------------------------------------

app.post("/api/test-recommendation", auth, requireAdmin, async (req, res) => {
    try {
        const payload = {
            python: 3, sql: 1, math: 2, java_oop: 1, networking: 1, stats: 2,
            ai_interest: 1, web_interest: 0, data_interest: 0, cloud_interest: 0,
            security_interest: 0, dl_interest: 0, db_interest: 0, se_interest: 0,
        };

        const mlResponse = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const mlData = await mlResponse.json();
        res.json(mlData);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to reach ML API" });
    }
});


// ---------------------------------------------------------
// Generate Real Recommendation for a Student (pulls from DB)
// ---------------------------------------------------------

app.post("/api/generate-recommendation/:studentId", auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (!canAccessStudent(req, studentId)) {
            return res.status(403).json({ error: "You can only generate your own recommendations" });
        }

        // 1. Get student profile from DB
        const studentResult = await pool.query(
            "SELECT * FROM students WHERE student_id = $1",
            [studentId]
        );
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        const student = studentResult.rows[0];

        // 2. Build the feature payload from real DB values
        const interests = student.interests || [];
        const payload = {
            python: student.python_level,
            sql: student.sql_level,
            math: student.math_level,
            java_oop: student.java_oop_level,
            networking: student.networking_level,
            stats: student.stats_level,
            ai_interest: interests.includes("AI") ? 1 : 0,
            web_interest: interests.includes("Web Dev") ? 1 : 0,
            data_interest: interests.includes("Data") ? 1 : 0,
            cloud_interest: interests.includes("Cloud") ? 1 : 0,
            security_interest: interests.includes("Security") ? 1 : 0,
            dl_interest: interests.includes("Deep Learning") ? 1 : 0,
            db_interest: interests.includes("Database") ? 1 : 0,
            se_interest: interests.includes("Software Engineering") ? 1 : 0,
        };

        // 3. Call the FastAPI ML service
        const mlResponse = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const mlData = await mlResponse.json();

        // 4. Format and save into recommendations table
        const recommendedCourses = mlData.recommendations.map(r => r.course);
        const scores = mlData.recommendations.map(r => r.confidence);
        const skillGaps = mlData.recommendations.flatMap(r =>
            r.skill_gaps.map(g => `${r.course} - ${g.skill}: ${g.your_level}/3 -> ${g.typical_level}/3`)
        );

        const insertResult = await pool.query(
            `INSERT INTO recommendations (student_id, recommended_courses, recommendation_score, skill_gaps)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [studentId, recommendedCourses, scores, skillGaps]
        );

        res.status(201).json({
            student: student.name,
            saved_recommendation: insertResult.rows[0],
            full_ml_response: mlData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to generate recommendation" });
    }
});


// ---------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------

app.get("/api/stats", auth, requireAdmin, async (req, res) => {
    try {
        const studentsResult = await pool.query("SELECT COUNT(*) FROM students");
        const recommendationsResult = await pool.query("SELECT COUNT(*) FROM recommendations");

        res.json({
            total_students: parseInt(studentsResult.rows[0].count, 10),
            total_recommendations: parseInt(recommendationsResult.rows[0].count, 10),
        });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});


// ---------------------------------------------------------
// Admin Signup
// ---------------------------------------------------------

app.post("/api/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const existing = await pool.query(
            "SELECT admin_id FROM admins WHERE email = $1",
            [email]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING admin_id, email, created_at",
            [email, passwordHash]
        );

        const admin = result.rows[0];
        const token = signToken({ role: "admin", adminId: admin.admin_id, email: admin.email });

        res.status(201).json({ token, user: { role: "admin", email: admin.email } });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ error: "Failed to create account" });
    }
});


// ---------------------------------------------------------
// Admin Login
// ---------------------------------------------------------

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const badLogin = { error: "That email and password don't match our records" };

        // 1. Admin account?
        const adminResult = await pool.query(
            "SELECT admin_id, email, password_hash FROM admins WHERE email = $1",
            [email]
        );
        if (adminResult.rows.length > 0) {
            const admin = adminResult.rows[0];
            if (!(await bcrypt.compare(password, admin.password_hash))) {
                return res.status(401).json(badLogin);
            }
            const token = signToken({ role: "admin", adminId: admin.admin_id, email: admin.email });
            return res.json({ token, user: { role: "admin", email: admin.email } });
        }

        // 2. Student account?
        const studentResult = await pool.query(
            `SELECT student_id, name, email, password_hash FROM students
             WHERE LOWER(email) = LOWER($1) AND password_hash IS NOT NULL`,
            [email]
        );
        if (studentResult.rows.length === 0) {
            return res.status(401).json(badLogin);
        }
        const student = studentResult.rows[0];
        if (!(await bcrypt.compare(password, student.password_hash))) {
            return res.status(401).json(badLogin);
        }
        const token = signToken({
            role: "student",
            studentId: student.student_id,
            email: student.email,
        });
        res.json({
            token,
            user: {
                role: "student",
                email: student.email,
                name: student.name,
                studentId: student.student_id,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ error: "Failed to log in" });
    }
});


// ---------------------------------------------------------
// Student Signup (creates a new student record + login)
// ---------------------------------------------------------

const LEVEL_KEYS = ["python", "sql", "math", "java_oop", "networking", "stats"];

app.post("/api/signup/student", async (req, res) => {
    try {
        const {
            name, rollNo, department, year, careerGoal,
            interests, levels, email, password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const taken = await pool.query(
            "SELECT 1 FROM students WHERE LOWER(email) = LOWER($1) UNION SELECT 1 FROM admins WHERE LOWER(email) = LOWER($1)",
            [email]
        );
        if (taken.rows.length > 0) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const cleanName = name.trim();
        let student;

        // If an admin-added student with this exact name has no login yet,
        // attach the login to that record instead of creating a duplicate.
        const existing = await pool.query(
            `SELECT student_id, name FROM students
             WHERE LOWER(TRIM(name)) = LOWER($1) AND password_hash IS NULL AND email IS NULL
             LIMIT 1`,
            [cleanName]
        );

        if (existing.rows.length > 0) {
            const updated = await pool.query(
                `UPDATE students SET email = $1, password_hash = $2, roll_no = $3
                 WHERE student_id = $4 RETURNING student_id, name`,
                [email, passwordHash, rollNo || null, existing.rows[0].student_id]
            );
            student = updated.rows[0];
        } else {
            const lv = (k) => Math.min(3, Math.max(0, parseInt(levels?.[k], 10) || 0));
            const inserted = await pool.query(
                `INSERT INTO students
                   (name, roll_no, department, year, career_goal, interests,
                    python_level, sql_level, math_level, java_oop_level,
                    networking_level, stats_level, email, password_hash)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                 RETURNING student_id, name`,
                [
                    cleanName, rollNo || null, department || null, year || null,
                    careerGoal || null, Array.isArray(interests) ? interests : [],
                    ...LEVEL_KEYS.map(lv), email, passwordHash,
                ]
            );
            student = inserted.rows[0];
        }

        const token = signToken({ role: "student", studentId: student.student_id, email });
        res.status(201).json({
            token,
            user: { role: "student", email, name: student.name, studentId: student.student_id },
        });
    } catch (error) {
        console.error("Student signup error:", error.message);
        res.status(500).json({ error: "Failed to create account: " + error.message });
    }
});


// ---------------------------------------------------------
// Update own profile (students) - recommendations use the saved values
// ---------------------------------------------------------

app.put("/api/profile", auth, async (req, res) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ error: "Only students have a profile to edit" });
    }
    try {
        const { name, rollNo, department, year, careerGoal, interests, levels } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }
        const lv = (k) => Math.min(3, Math.max(0, parseInt(levels?.[k], 10) || 0));

        const result = await pool.query(
            `UPDATE students SET
               name = $1, roll_no = $2, department = $3, year = $4, career_goal = $5,
               interests = $6, python_level = $7, sql_level = $8, math_level = $9,
               java_oop_level = $10, networking_level = $11, stats_level = $12
             WHERE student_id = $13
             RETURNING *`,
            [
                name.trim(), rollNo || null, department || null, year || null,
                careerGoal || null, Array.isArray(interests) ? interests : [],
                ...LEVEL_KEYS.map(lv), req.user.studentId,
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        const { password_hash, ...student } = result.rows[0];
        res.json(student);
    } catch (error) {
        console.error("Profile update error:", error.message);
        res.status(500).json({ error: "Failed to update profile: " + error.message });
    }
});


// ---------------------------------------------------------
// Start Server
// ---------------------------------------------------------

// Adds login columns to the students table the first time the server starts.
pool
    .query("ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT, ADD COLUMN IF NOT EXISTS password_hash TEXT, ADD COLUMN IF NOT EXISTS roll_no TEXT")
    .then(() => pool.query("CREATE UNIQUE INDEX IF NOT EXISTS students_email_key ON students (LOWER(email))"))
    .catch((err) => console.error("Student auth schema setup failed:", err.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
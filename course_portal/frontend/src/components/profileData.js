export const INTERESTS = ["AI", "Web Dev", "Data", "Cloud", "Security", "Deep Learning", "Database", "Software Engineering"];
export const SKILLS = [["python", "Python"], ["sql", "SQL"], ["math", "Math"], ["java_oop", "Java / OOP"], ["networking", "Networking"], ["stats", "Statistics"]];
export const LEVELS = ["None", "Beginner", "Intermediate", "Advanced"];

export const emptyProfile = {
  name: "", rollNo: "", department: "", year: "", careerGoal: "",
  interests: [],
  levels: { python: 0, sql: 0, math: 0, java_oop: 0, networking: 0, stats: 0 },
};

// Converts a row from the students table into the form's shape.
export function profileFromStudent(s) {
  return {
    name: s.name || "",
    rollNo: s.roll_no || "",
    department: s.department || "",
    year: s.year != null ? String(s.year) : "",
    careerGoal: s.career_goal || "",
    interests: s.interests || [],
    levels: {
      python: s.python_level ?? 0, sql: s.sql_level ?? 0, math: s.math_level ?? 0,
      java_oop: s.java_oop_level ?? 0, networking: s.networking_level ?? 0, stats: s.stats_level ?? 0,
    },
  };
}


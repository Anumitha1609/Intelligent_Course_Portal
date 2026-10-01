import pythonImg from "../assets/courses/python-data-science.png";
import reactImg from "../assets/courses/web-development-react.png";
import uiuxImg from "../assets/courses/uiux-design.png";
import sqlImg from "../assets/courses/data-analytics-sql.png";

// Courses with a supplied image use `image`. Courses without one fall back
// to a plain gradient tile (see `accent`) rather than a stock photo.
export const courseCatalog = [
  {
    id: "web-dev-react",
    name: "Web Development with React",
    category: "Programming",
    description: "Learn modern web development using React, components and hooks.",
    duration: "6 weeks",
    level: "Beginner",
    image: reactImg,
  },
  {
    id: "python-data-science",
    name: "Python for Data Science",
    category: "Programming",
    description: "Explore data analysis, visualization and machine learning with Python.",
    duration: "8 weeks",
    level: "Intermediate",
    image: pythonImg,
  },
  {
    id: "uiux-design",
    name: "UI/UX Design Fundamentals",
    category: "Design",
    description: "Build user-friendly and accessible interfaces with modern design tools.",
    duration: "5 weeks",
    level: "Beginner",
    image: uiuxImg,
  },
  {
    id: "data-analytics-sql",
    name: "Data Analytics with SQL",
    category: "Data Analytics",
    description: "Query data, build reports and uncover insights using SQL.",
    duration: "6 weeks",
    level: "Intermediate",
    image: sqlImg,
  },
  {
    id: "machine-learning",
    name: "Machine Learning Foundations",
    category: "AI & ML",
    description: "Cover supervised and unsupervised learning, and model evaluation.",
    duration: "8 weeks",
    level: "Intermediate",
    accent: "linear-gradient(135deg, #2f7a6a, #5fb59a)",
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing Basics",
    category: "Cloud",
    description: "Learn the fundamentals of cloud platforms and deployment.",
    duration: "4 weeks",
    level: "Beginner",
    accent: "linear-gradient(135deg, #2f6f8f, #6fb3d2)",
  },
  {
    id: "cyber-security",
    name: "Cyber Security Essentials",
    category: "Security",
    description: "Understand networking, threats, and how to defend real systems.",
    duration: "7 weeks",
    level: "Intermediate",
    accent: "linear-gradient(135deg, #b9832f, #f0c766)",
  },
  {
    id: "software-engineering",
    name: "Software Engineering Practices",
    category: "Programming",
    description: "Design patterns, testing and collaborative engineering workflows.",
    duration: "6 weeks",
    level: "Intermediate",
    accent: "linear-gradient(135deg, #5a4fa0, #9a90d8)",
  },
];

export const courseCategories = [
  "All Categories",
  ...Array.from(new Set(courseCatalog.map((c) => c.category))),
];

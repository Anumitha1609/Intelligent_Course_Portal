import { useState } from "react";
import CourseCard from "../components/CourseCard";
import { courseCatalog, courseCategories } from "../data/courseCatalog";

function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filtered = courseCatalog.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "All Categories" || course.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <h1 className="rec-title">Courses</h1>
      <p className="rec-subtitle">Browse everything in the course catalog.</p>

      <div className="rec-controls">
        <input
          type="text"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="course-search"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {courseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rec-subtitle">No courses match that search.</p>
      ) : (
        <div className="course-grid">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CoursesPage;

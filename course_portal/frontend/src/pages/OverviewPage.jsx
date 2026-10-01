import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { courseCatalog, courseCategories } from "../data/courseCatalog";
import "./OverviewPage.css";

import { apiFetch } from "../api";

const ic = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

function Banner() {
  return (
    <svg viewBox="0 0 300 130" aria-hidden="true">
      <circle cx="60" cy="70" r="40" fill="#cde7db" opacity=".7" />
      <rect x="70" y="118" width="120" height="8" rx="3" fill="#3f8863" />
      <rect x="80" y="108" width="110" height="10" rx="3" fill="#8cc9a6" />
      <rect x="95" y="14" width="120" height="82" rx="6" fill="#fff" stroke="#2f7a55" strokeWidth="5" />
      <path d="M155 34l-26 11 26 11 26-11z" fill="#1f6a47" />
      <path d="M141 51v10c8 6 22 6 30 0V51l-15 6z" fill="#2f7a55" />
      <rect x="150" y="96" width="10" height="10" fill="#2f7a55" />
      <rect x="135" y="104" width="40" height="5" rx="2" fill="#2f7a55" />
      <path d="M262 100c-18-2-26-14-24-30 16 2 26 12 24 30z" fill="#5fae82" />
      <path d="M264 100c2-18 12-28 30-30 2 16-8 28-30 30z" fill="#8cc9a6" />
      <path d="M248 100h30l-3 20h-24z" fill="#2f7a55" />
    </svg>
  );
}

function OverviewPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    apiFetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStatsError(true));
  }, []);

  const val = (v) => (statsError ? "—" : stats ? v : "…");
  const note = (t) => (statsError ? "backend unreachable" : t);

  const filtered = courseCatalog.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All Categories" || c.category === category)
  );

  const counts = courseCatalog.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="ov-grid">
      <div>
        <div className="ov-banner">
          <div>
            <h1>Welcome, Admin</h1>
            <p>Manage courses, track student progress and provide personalized learning recommendations.</p>
          </div>
          <Banner />
        </div>

        <div className="ov-stats">
          <div className="ov-stat">
            <span className="ov-stat-icon">
              <svg {...ic}><path d="M2 5.5c3-1.2 6-1.2 10 1v13c-4-2.2-7-2.2-10-1zM22 5.5c-3-1.2-6-1.2-10 1v13c4-2.2 7-2.2 10-1z" /></svg>
            </span>
            <div>
              <span className="ov-stat-label">Total Courses</span>
              <span className="ov-stat-value">{courseCatalog.length}</span>
              <span className="ov-stat-note">in the catalog</span>
            </div>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-icon">
              <svg {...ic}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6M17 5.5a3 3 0 0 1 0 5.5M19 14c2 .7 3 2.5 3 5" /></svg>
            </span>
            <div>
              <span className="ov-stat-label">Total Students</span>
              <span className="ov-stat-value">{val(stats?.total_students)}</span>
              <span className="ov-stat-note">{note("registered")}</span>
            </div>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-icon gold">
              <svg {...ic}><path d="M12 2a6.5 6.5 0 0 0-3.7 11.8c.5.4.7.9.7 1.5V16h6v-.7c0-.6.2-1.1.7-1.5A6.5 6.5 0 0 0 12 2zM9.5 19.5h5M10.5 22h3" /></svg>
            </span>
            <div>
              <span className="ov-stat-label">Recommendations</span>
              <span className="ov-stat-value">{val(stats?.total_recommendations)}</span>
              <span className="ov-stat-note">{note("saved to database")}</span>
            </div>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-icon blue">
              <svg {...ic}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            </span>
            <div>
              <span className="ov-stat-label">Categories</span>
              <span className="ov-stat-value">{Object.keys(counts).length}</span>
              <span className="ov-stat-note">across the catalog</span>
            </div>
          </div>
        </div>

        <div className="ov-head">
          <div>
            <h2>Available Courses</h2>
            <p>Manage and explore all courses in the system.</p>
          </div>
          <div className="ov-filters">
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {courseCategories.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rec-subtitle">No courses match that search.</p>
        ) : (
          <div className="ov-courses">
            {filtered.map((course) => (<CourseCard key={course.id} course={course} />))}
          </div>
        )}
      </div>

      <aside className="ov-side">
        <div className="ov-panel">
          <h3>Quick Actions</h3>
          <button className="ov-action primary" onClick={() => onNavigate("courses")}>
            <svg {...ic} width="18" height="18"><path d="M2 5.5c3-1.2 6-1.2 10 1v13c-4-2.2-7-2.2-10-1zM22 5.5c-3-1.2-6-1.2-10 1v13c4-2.2 7-2.2 10-1z" /></svg>
            Browse All Courses
          </button>
          <button className="ov-action" onClick={() => onNavigate("students")}>
            <svg {...ic} width="18" height="18"><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg>
            Manage Students
          </button>
          <button className="ov-action" onClick={() => onNavigate("recommendations")}>
            <svg {...ic} width="18" height="18"><path d="M12 2a6.5 6.5 0 0 0-3.7 11.8c.5.4.7.9.7 1.5V16h6v-.7c0-.6.2-1.1.7-1.5A6.5 6.5 0 0 0 12 2z" /></svg>
            View Recommendations
          </button>
        </div>

        <div className="ov-panel">
          <h3>Course Categories</h3>
          <div className="ov-chips">
            {Object.entries(counts).map(([name, n]) => (
              <span className="ov-chip" key={name}>{name}<b>{n}</b></span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default OverviewPage;

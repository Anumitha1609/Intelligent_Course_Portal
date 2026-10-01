import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "./OverviewPage.css";

// What a logged-in student sees: only their own record and recommendations.
function StudentHome({ user, onNavigate }) {
  const [student, setStudent] = useState(null);
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/students")
      .then((r) => r.json())
      .then((rows) => setStudent(rows[0] || null))
      .catch(() => setError("Could not load your profile. Is the backend running?"));
    apiFetch(`/recommendations/${user.studentId}`)
      .then((r) => r.json())
      .then((rows) => setRecs(Array.isArray(rows) ? rows : []))
      .catch(() => setError("Could not load your recommendations. Is the backend running?"));
  }, [user.studentId]);

  const latest = recs && recs[0];

  return (
    <div>
      <div className="ov-banner">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p>Here is your profile and the course recommendations saved for you.</p>
        </div>
      </div>

      {error && <p className="rec-error">{error}</p>}

      <div className="ov-grid">
        <div className="ov-panel">
          <h3>My profile</h3>
          {!student ? (
            <p className="panel-note">Loading…</p>
          ) : (
            <dl className="sh-list">
              <dt>Department</dt><dd>{student.department || "—"}</dd>
              <dt>Year</dt><dd>{student.year || "—"}</dd>
              <dt>Career goal</dt><dd>{student.career_goal || "—"}</dd>
              <dt>Interests</dt><dd>{(student.interests || []).join(", ") || "—"}</dd>
            </dl>
          )}
          <button className="ov-action" style={{ marginTop: "1rem" }} onClick={() => onNavigate("profile")}>
            Update my profile
          </button>
        </div>

        <div className="ov-panel">
          <h3>My latest recommendations</h3>
          {recs === null ? (
            <p className="panel-note">Loading…</p>
          ) : !latest ? (
            <p className="panel-note">Nothing saved yet — generate your first set.</p>
          ) : (
            <>
              <ol className="sh-recs">
                {(latest.recommended_courses || []).map((course, i) => (
                  <li key={course}>
                    <span>{course}</span>
                    {latest.recommendation_score?.[i] != null && (
                      <b>{latest.recommendation_score[i]}% match</b>
                    )}
                  </li>
                ))}
              </ol>
              {(latest.skill_gaps || []).length > 0 && (
                <>
                  <h4 className="sh-sub">Skill gaps</h4>
                  <ul className="sh-gaps">
                    {latest.skill_gaps.map((g, i) => (<li key={i}>{g}</li>))}
                  </ul>
                </>
              )}
            </>
          )}
          <button className="ov-action primary" style={{ marginTop: "1rem" }} onClick={() => onNavigate("recommendations")}>
            Generate new recommendations
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;

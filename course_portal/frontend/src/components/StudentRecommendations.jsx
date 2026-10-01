import { useState, useEffect } from "react";

import { apiFetch } from "../api";

function StudentRecommendations({ studentId }) {
  const ownMode = studentId !== undefined; // student logged in: only their own
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(ownMode ? String(studentId) : "");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ownMode) return;
    apiFetch("/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() =>
        setError("Could not load students. Is the backend running?")
      );
  }, [ownMode]);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      const res = await apiFetch(
        `/api/generate-recommendation/${selectedId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setRecommendations(data.full_ml_response.recommendations);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to generate recommendation. Check both servers are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="rec-title">{ownMode ? "My recommendations" : "Course recommendations"}</h1>
      <p className="rec-subtitle">
        {ownMode
          ? "Generate a fresh, explainable set of course matches based on your profile."
          : "Pick a student to generate a fresh, explainable set of course matches."}
      </p>

      <div className="rec-controls">
        {!ownMode && (
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a student</option>
          {students.map((s) => (
            <option key={s.student_id} value={s.student_id}>
              {s.name} &middot; {s.department}
            </option>
          ))}
        </select>
        )}

        <button onClick={handleGenerate} disabled={!selectedId || loading}>
          {loading ? "Generating…" : "Get recommendations"}
        </button>
      </div>

      {error && <p className="rec-error">{error}</p>}

      {recommendations && (
        <div className="rec-grid">
          {recommendations.map((rec, i) => (
            <div key={i} className="rec-card">
              <div className="rec-card-head">
                <h3>
                  #{i + 1} &middot; {rec.course}
                </h3>
                <span className="rec-confidence">{rec.confidence}% match</span>
              </div>

              <h4>Why this course</h4>
              <ul>
                {rec.reasons.map((r, j) => (
                  <li key={j}>{r}</li>
                ))}
              </ul>

              {rec.skill_gaps.length > 0 && (
                <>
                  <h4>Skill gaps</h4>
                  <ul>
                    {rec.skill_gaps.map((g, k) => (
                      <li key={k}>
                        {g.skill}: {g.your_level}/3 → typical{" "}
                        {g.typical_level}/3
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentRecommendations;

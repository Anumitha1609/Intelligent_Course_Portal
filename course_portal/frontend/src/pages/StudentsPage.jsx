import { useEffect, useState } from "react";

import { apiFetch } from "../api";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch(() => setError("Could not load students. Is the backend running?"));
  }, []);

  return (
    <div>
      <h1 className="rec-title">Students</h1>
      <p className="rec-subtitle">Everyone currently registered in the system.</p>

      {error && <p className="rec-error">{error}</p>}

      {!error && (
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll no</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Career goal</th>
                <th>Interests</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td>{s.roll_no}</td>
                  <td>{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.year}</td>
                  <td>{s.career_goal}</td>
                  <td>{(s.interests || []).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;

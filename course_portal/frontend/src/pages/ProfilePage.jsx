import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import ProfileFields from "../components/ProfileFields";
import { emptyProfile, profileFromStudent } from "../components/profileData";
import "./OverviewPage.css";

// Students update their details here; new recommendations use the saved values.
function ProfilePage({ onNavigate, onUserChange }) {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/students")
      .then((r) => r.json())
      .then((rows) => setProfile(rows[0] ? profileFromStudent(rows[0]) : emptyProfile))
      .catch(() => setError("Could not load your profile. Is the backend running?"));
  }, []);

  const handleChange = (p) => {
    setProfile(p);
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save your profile");
      onUserChange({ name: data.name });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="rec-title">My profile</h1>
      <p className="rec-subtitle">
        Keep this up to date as you learn. Your recommendations are based on what is saved here.
      </p>

      {error && <p className="rec-error">{error}</p>}

      {!profile ? (
        !error && <p className="panel-note">Loading…</p>
      ) : (
        <form className="ov-panel" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
          <ProfileFields profile={profile} onChange={handleChange} />

          <div style={{ display: "flex", gap: "0.7rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
            <button type="submit" className="ov-action primary" style={{ width: "auto", marginBottom: 0 }} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <button type="button" className="ov-action" style={{ width: "auto", marginBottom: 0 }} onClick={() => onNavigate("recommendations")}>
                Profile saved — get updated recommendations
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;

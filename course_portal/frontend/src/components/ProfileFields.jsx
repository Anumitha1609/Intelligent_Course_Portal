import "./ProfileFields.css";
import { INTERESTS, SKILLS, LEVELS } from "./profileData";

// Shared by the student sign-up form and the "My Profile" page.
function ProfileFields({ profile, onChange }) {
  const set = (k, v) => onChange({ ...profile, [k]: v });
  const toggle = (i) =>
    set(
      "interests",
      profile.interests.includes(i)
        ? profile.interests.filter((x) => x !== i)
        : [...profile.interests, i]
    );

  return (
    <div className="pf">
      <label>Full name
        <input value={profile.name} onChange={(e) => set("name", e.target.value)} required />
      </label>
      <label>Roll number
        <input value={profile.rollNo} onChange={(e) => set("rollNo", e.target.value)} placeholder="e.g. 711524bcs137" />
      </label>
      <label>Department
        <input value={profile.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. CSE" required />
      </label>
      <label>Year
        <select value={profile.year} onChange={(e) => set("year", e.target.value)} required>
          <option value="">Select year</option>
          {[1, 2, 3, 4].map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
      </label>
      <label>Career goal
        <input value={profile.careerGoal} onChange={(e) => set("careerGoal", e.target.value)} placeholder="e.g. Data Scientist" />
      </label>

      <fieldset>
        <legend>Interests</legend>
        {INTERESTS.map((i) => (
          <label key={i} className="pf-check">
            <input type="checkbox" checked={profile.interests.includes(i)} onChange={() => toggle(i)} />
            {i}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Skill levels (used for recommendations)</legend>
        {SKILLS.map(([key, label]) => (
          <label key={key} className="pf-skill">{label}
            <select value={profile.levels[key]} onChange={(e) => set("levels", { ...profile.levels, [key]: Number(e.target.value) })}>
              {LEVELS.map((l, n) => (<option key={n} value={n}>{l}</option>))}
            </select>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export default ProfileFields;

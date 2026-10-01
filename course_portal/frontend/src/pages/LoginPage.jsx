import ProfileFields from "../components/ProfileFields";
import { emptyProfile } from "../components/profileData";
import { useState } from "react";
import "./LoginPage.css";

const API_BASE = "http://localhost:5000";

function GradCapMark() {
  return (
    <svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true">
      <path
        d="M32 10 L60 24 L32 38 L4 24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M18 30 V44 C18 48 25 52 32 52 C39 52 46 48 46 44 V30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="56"
        y1="26"
        x2="56"
        y2="42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("admin"); // signup only: 'admin' | 'student'
  const [profile, setProfile] = useState(emptyProfile);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint =
        mode === "login"
          ? "/api/login"
          : role === "student"
          ? "/api/signup/student"
          : "/api/signup";
      const body =
        mode === "signup" && role === "student"
          ? { ...profile, email, password }
          : { email, password };
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Persist the token so a page refresh doesn't sign the user out.
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <aside className="auth-panel">
        <div className="auth-panel-mark">
          <GradCapMark />
          <span>Coursework</span>
        </div>

        <div className="auth-panel-copy">
          <h1>
            Guidance that
            <br />
            grows with each student.
          </h1>
          <p>
            Sign in to review student profiles, generate course
            recommendations, and track where every learner stands.
          </p>
        </div>

        <p className="auth-panel-foot">Course Portal</p>
      </aside>

      <main className="auth-form-side">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              Sign up
            </button>
          </div>

          <h2>
            {mode === "login"
              ? "Welcome back"
              : role === "student"
              ? "Create a student account"
              : "Create an admin account"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Admins and students log in here with their email."
              : role === "student"
              ? "Tell us about yourself so we can recommend the right courses."
              : "Set up access to the course recommendation dashboard."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <div className="auth-tabs" role="tablist">
                {["admin", "student"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={role === r ? "active" : ""}
                    onClick={() => setRole(r)}
                  >
                    {r === "admin" ? "Admin" : "Student"}
                  </button>
                ))}
              </div>
            )}

            {mode === "signup" && role === "student" && (
              <ProfileFields profile={profile} onChange={setProfile} />
            )}

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>

            {mode === "signup" && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            {mode === "login" && (
              <a className="auth-forgot" href="#">
                Forgot password?
              </a>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting
                ? mode === "login"
                  ? "Logging in…"
                  : "Signing up…"
                : mode === "login"
                ? "Log in"
                : "Sign up"}
            </button>
          </form>

          {mode === "login" ? (
            <p className="auth-switch">
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </p>
          ) : (
            <p className="auth-switch">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")}>
                Log in
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

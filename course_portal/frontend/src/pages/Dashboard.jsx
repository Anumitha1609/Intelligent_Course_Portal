import { useState } from "react";
import Sidebar from "../components/Sidebar";
import OverviewPage from "./OverviewPage";
import CoursesPage from "./CoursesPage";
import StudentsPage from "./StudentsPage";
import StudentRecommendations from "../components/StudentRecommendations";
import StudentHome from "./StudentHome";
import ProfilePage from "./ProfilePage";
import "./Dashboard.css";

function ComingSoon({ title }) {
  return (
    <div>
      <h1 className="rec-title">{title}</h1>
      <p className="rec-subtitle">This section is coming soon.</p>
    </div>
  );
}

function Dashboard({ user, onLogout, onUserChange }) {
  const isStudent = user.role === "student";
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "courses":
        return <CoursesPage />;
      case "students":
        return isStudent ? null : <StudentsPage />;
      case "recommendations":
        return <StudentRecommendations studentId={isStudent ? user.studentId : undefined} />;
      case "profile":
        return isStudent ? <ProfilePage onNavigate={setActiveTab} onUserChange={onUserChange} /> : null;
      case "analytics":
        return <ComingSoon title="Analytics" />;
      case "settings":
        return <ComingSoon title="Settings" />;
      case "overview":
      default:
        return isStudent ? (
          <StudentHome user={user} onNavigate={setActiveTab} />
        ) : (
          <OverviewPage onNavigate={setActiveTab} />
        );
    }
  };

  return (
    <div className="dash-screen">
      <header className="dash-header">
        <div className="dash-brand">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M12 3 1 9l11 6 9-4.9V16h2V9zM5 13.2v3.5c0 1.4 3.1 3.3 7 3.3s7-1.9 7-3.3v-3.5l-7 3.8z" />
          </svg>
          <span>Intelligent Course Portal</span>
        </div>

        <div className="dash-user">
          <span className="dash-bell" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zM19 16v-5a7 7 0 0 0-5-6.7V3a2 2 0 0 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1z" /></svg>
            <i />
          </span>
          <div className="dash-menu">
            <button type="button" className="dash-avatar-btn" onClick={() => setMenuOpen((o) => !o)}>
              <span className="dash-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1f6a47"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6z" /></svg>
              </span>
              {isStudent ? user.name : "Admin"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {menuOpen && (
              <div className="dash-dropdown">
                <span>{user.email}</span>
                <button type="button" onClick={onLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dash-layout">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} role={user.role} />
        <main className="dash-body">{renderTab()}</main>
      </div>
    </div>
  );
}

export default Dashboard;

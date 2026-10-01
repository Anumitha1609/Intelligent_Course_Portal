import "./Sidebar.css";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

const ICONS = {
  overview: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  courses: (
    <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M2 5.5c3-1.2 6-1.2 10 1v13c-4-2.2-7-2.2-10-1z" />
      <path d="M22 5.5c-3-1.2-6-1.2-10 1v13c4-2.2 7-2.2 10-1z" />
    </svg>
  ),
  students: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 19c0-3.6 3.1-6 7-6s7 2.4 7 6z" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M17.5 13.2c2.8.2 4.5 2 4.5 4.8h-4c0-1.9-.2-3.4-.5-4.8z" />
    </svg>
  ),
  recommendations: (
    <svg {...iconProps}>
      <path d="M12 2a6.5 6.5 0 0 0-3.7 11.8c.5.4.7.9.7 1.5V16h6v-.7c0-.6.2-1.1.7-1.5A6.5 6.5 0 0 0 12 2z" />
      <rect x="9" y="17.5" width="6" height="2" rx="1" />
      <rect x="10" y="20.5" width="4" height="1.6" rx=".8" />
    </svg>
  ),
  profile: (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5z" />
    </svg>
  ),
  analytics: (
    <svg {...iconProps}>
      <rect x="3" y="12" width="4.5" height="9" rx="1" />
      <rect x="9.75" y="3" width="4.5" height="18" rx="1" />
      <rect x="16.5" y="8" width="4.5" height="13" rx="1" />
    </svg>
  ),
  settings: (
    <svg {...iconProps}>
      <path
        fillRule="evenodd"
        d="M10.3 2h3.4l.5 2.6 1.6.7 2.2-1.5 2.4 2.4-1.5 2.2.7 1.6 2.6.5v3.4l-2.6.5-.7 1.6 1.5 2.2-2.4 2.4-2.2-1.5-1.6.7-.5 2.6h-3.4l-.5-2.6-1.6-.7-2.2 1.5-2.4-2.4 1.5-2.2-.7-1.6L2 13.7v-3.4l2.6-.5.7-1.6-1.5-2.2 2.4-2.4 2.2 1.5 1.6-.7zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"
      />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard" },
  { id: "courses", label: "Courses" },
  { id: "students", label: "Students" },
  { id: "recommendations", label: "Recommendations" },
  { id: "profile", label: "My Profile" },
  { id: "analytics", label: "Analytics" },
  { id: "settings", label: "Settings" },
];

function SidebarIllustration() {
  return (
    <svg
      className="sidebar-illustration"
      viewBox="0 0 180 170"
      aria-hidden="true"
    >
      <circle cx="62" cy="36" r="15" fill="#cfe5d8" />
      <circle cx="26" cy="92" r="14" fill="#cfe5d8" />
      {/* plant */}
      <path d="M118 88c-24-2-34-18-32-40 22 2 34 16 32 40z" fill="#5fae82" />
      <path d="M120 88c2-24 16-38 40-40 2 22-12 38-40 40z" fill="#8cc9a6" />
      <path d="M120 60c0-14 4-26 10-34 6 8 6 22-2 40z" fill="#4c9a72" />
      <path d="M119 90V70" stroke="#3f8863" strokeWidth="3" strokeLinecap="round" />
      {/* pot */}
      <path d="M104 96h32l-4 24h-24z" fill="#2f7a55" />
      <rect x="102" y="92" width="36" height="8" rx="3" fill="#3f8863" />
      {/* books */}
      <rect x="18" y="120" width="140" height="16" rx="4" fill="#2f7a55" />
      <rect x="26" y="136" width="136" height="14" rx="4" fill="#9fcfb3" />
      <rect x="14" y="150" width="140" height="16" rx="4" fill="#4c9a72" />
      <rect x="22" y="124" width="60" height="3" rx="1.5" fill="#5fae82" />
      <rect x="30" y="140" width="60" height="3" rx="1.5" fill="#c7e3d3" />
      <rect x="20" y="155" width="60" height="3" rx="1.5" fill="#7fbb98" />
    </svg>
  );
}

const STUDENT_TABS = ["overview", "courses", "recommendations", "profile"];

function Sidebar({ activeTab, onSelectTab, role = "admin" }) {
  const items =
    role === "student"
      ? NAV_ITEMS.filter((i) => STUDENT_TABS.includes(i.id))
      : NAV_ITEMS.filter((i) => i.id !== "profile");

  return (
    <nav className="sidebar">
      <ul className="sidebar-nav">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={activeTab === item.id ? "active" : ""}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="sidebar-icon">{ICONS[item.id]}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <SidebarIllustration />
    </nav>
  );
}

export default Sidebar;

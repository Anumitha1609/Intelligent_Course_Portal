import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

function loadUser() {
  try {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved && localStorage.getItem("token")) return saved;
  } catch {
    /* ignore corrupt value */
  }
  // sessions saved before student logins existed were admin-only
  const email = localStorage.getItem("adminEmail");
  return email && localStorage.getItem("token") ? { role: "admin", email } : null;
}

function App() {
  const [user, setUser] = useState(loadUser);

  const handleLogin = (u) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const handleUserChange = (changes) => {
    setUser((prev) => {
      const next = { ...prev, ...changes };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminEmail");
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} onUserChange={handleUserChange} />;
}

export default App;

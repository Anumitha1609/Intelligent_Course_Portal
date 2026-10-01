export const API_BASE = "http://localhost:5000";

// fetch() wrapper that sends the login token. If the server says the
// session is invalid, clear it and go back to the login screen.
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminEmail");
    window.location.reload();
  }
  return res;
}

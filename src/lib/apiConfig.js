// Set either variable to the PHP server origin, without an /api suffix.
export const API_BASE = (process.env.REACT_APP_API_BASE ?? process.env.REACT_APP_API_URL ?? "http://localhost:4000").trim().replace(/\/+$/, "");
export const publicMediaURL = (value) => {
  if (!value) return "";
  if (value.startsWith("/uploads/") || value.startsWith("/api/uploads/")) return `${API_BASE}${value}`;
  return value;
};

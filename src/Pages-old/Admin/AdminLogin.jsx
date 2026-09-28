import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminToken, login, me } from "../../lib/adminApi";
import "./admin-shell.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  // If already logged in (token or cookie), go inside
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        if (AdminToken.get()) {
          if (!dead) nav("/admin/tours", { replace: true });
          return;
        }
        const who = await me();
        if (!dead && who) nav("/admin/tours", { replace: true });
      } catch {}
    })();
    return () => { dead = true; };
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password); // stores token if present, cookie otherwise
      const params = new URLSearchParams(loc.search);
      const next = params.get("next") || "/admin/tours";
      nav(next, { replace: true }); // ✅ renders AdminLayout + child
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-admin-shell" style={{ gridTemplateColumns: "1fr" }}>
      <div className="mt-admin-main" style={{ maxWidth: 420, margin: "70px auto" }}>
        <div className="mt-admin-card">
          <h2 style={{ marginBottom: 12 }}>Admin Login</h2>
          <form className="mt-admin-form" onSubmit={submit}>
            <input
              className="mt-admin-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <input
              className="mt-admin-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {err && <div style={{ color: "#fca5a5" }}>{err}</div>}
            <button className="mt-admin-btn mt-admin-btn--accent" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

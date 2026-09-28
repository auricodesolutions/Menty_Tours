import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminToken, me, logout } from "../../lib/adminApi";
import "./admin-shell.css";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const nav = useNavigate();
  const loc = useLocation();

  // Close drawer on route change (mobile)
  useEffect(() => setOpen(false), [loc.pathname]);

  // Guard: accept token or cookie session (/me). Skip on /admin/login
  useEffect(() => {
    let dead = false;
    (async () => {
      const isLogin = loc.pathname.startsWith("/admin/login");
      if (isLogin) {
        if (!dead) setChecking(false);
        return;
      }

      // 1) Fast path if token exists
      if (AdminToken.get()) {
        if (!dead) setChecking(false);
        return;
      }

      // 2) Cookie session fallback
      try {
        const who = await me();
        if (!dead && who) {
          setChecking(false);
          return;
        }
      } catch {}

      if (!dead) {
        const next = encodeURIComponent(loc.pathname + loc.search);
        nav(`/admin/login?next=${next}`, { replace: true });
      }
    })();
    return () => { dead = true; };
  }, [loc.pathname, loc.search, nav]);

  const doLogout = async () => {
    await logout();
    nav("/admin/login", { replace: true });
  };

  const linkCls = ({ isActive }) => `mt-admin-link${isActive ? " is-active" : ""}`;

  if (checking) {
    return (
      <div className="mt-admin-shell">
        <div className="mt-admin-main" style={{ padding: 40, textAlign: "center" }}>
          Checking session…
        </div>
      </div>
    );
  }

  return (
    <div className="mt-admin-shell">
      {/* Sidebar */}
      <aside className={`mt-admin-drawer ${open ? "is-open" : ""}`}>
        <div className="mt-admin-brand">Menty Admin</div>
        <nav className="mt-admin-nav">
          <NavLink to="/admin/tours" className={linkCls}>🧭 Tours</NavLink>
          <NavLink to="/admin/memories" className={linkCls}>🖼️ Memories</NavLink>
          <NavLink to="/admin/testimonials" className={linkCls}>💬 Testimonials</NavLink>
          <NavLink to="/admin/quotes" className={linkCls}>🧾 Quotes</NavLink>
        </nav>
        <button className="mt-admin-logout" onClick={doLogout}>Logout</button>
      </aside>

      {/* Main content */}
      <div className="mt-admin-content">
        <header className="mt-admin-header">
          <button
            className="mt-admin-burger"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <h1 className="mt-admin-title">Dashboard</h1>
        </header>
        <main className="mt-admin-main">
          <Outlet />
        </main>
      </div>

      {/* Click-away overlay for mobile */}
      {open && <div className="mt-admin-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
}

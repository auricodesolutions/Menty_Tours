import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Images, MapPin, BookOpen, Package, FolderOpen, Menu, X, LogOut, ExternalLink, MessageSquare } from "lucide-react";
import { me, logout } from "../../lib/adminApi";
import { useSiteContent } from "../../lib/SiteContent";
import logo from "../../assets/menty-tours-logo.png";
import "./admin-shell.css";
import "./cms.css";

const links = [
  ["/admin/media", "Page photos & video", Images],
  ["/admin/tours", "Tour packages", Package], ["/admin/destinations", "Destinations", MapPin],
  ["/admin/stories", "Travel stories", BookOpen], ["/admin/library", "Uploaded files", FolderOpen],
  ["/admin/reviews", "Guest reviews", MessageSquare],
];
export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const nav = useNavigate();
  const location = useLocation();
  const { connected, loading, refresh } = useSiteContent();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    let alive = true;
    me().then((result) => {
      if (!alive) return;
      if (result?.ok && result.user) { setUser(result.user); setChecking(false); }
      else nav(`/admin/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    });
    const expired = () => nav("/admin/login", { replace: true });
    window.addEventListener("menty-session-expired", expired);
    return () => { alive = false; window.removeEventListener("menty-session-expired", expired); };
    // Validate once on mounting the protected layout; every API mutation also checks the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const escape = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", escape); };
  }, [open]);
  const signOut = async () => { await logout(); nav("/admin/login", { replace: true }); };
  if (checking) return <div className="cms-session-check" role="status">Opening your Menty workspace…</div>;
  const current = links.find(([path]) => path === location.pathname)?.[1] || "Content editor";
  return <div className="mt-admin-shell cms-shell">
    {open && <button className="cms-drawer-shade" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`mt-admin-drawer cms-sidebar${open ? " is-open" : ""}`}>
      <a className="cms-brand" href="/admin"><img src={logo} alt="Menty Tours" /><span>Menty Studio<small>WEBSITE MANAGEMENT</small></span></a>
      <button className="cms-sidebar-close cms-icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={20} /></button>
      <span className="cms-sidebar-label">YOUR WORKSPACE</span>
      <nav aria-label="Admin navigation">{links.map(([to,label,Icon]) => <NavLink key={to} end={to === "/admin"} to={to} className={({ isActive }) => `cms-nav-link${isActive ? " is-active" : ""}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="cms-sidebar-bottom"><a className="cms-nav-link" href="/" target="_blank" rel="noreferrer"><ExternalLink size={18} />Open public website</a><button className="cms-nav-link" onClick={signOut}><LogOut size={18} />Sign out</button><div className="cms-user"><span>{(user?.name || "M").charAt(0)}</span><div><strong>{user?.name || "Menty Tours"}</strong><small>Administrator</small></div></div></div>
    </aside>
    <div className="mt-admin-content cms-content"><header className="cms-topbar"><button className="cms-mobile-menu cms-icon-button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} /></button><span>Workspace <span className="cms-topbar-divider">/</span><strong>{current}</strong></span><span className="cms-topbar-status"><i className={`cms-connection-dot${connected ? " is-online" : ""}`} />{connected ? "Connected" : "Offline"}</span></header><main className="mt-admin-main cms-main">
      {!loading && !connected && <div className="cms-server-notice" role="alert"><strong>Connect your content server</strong><p>Start the PHP backend and configure its MySQL database. Preview content is shown below; publishing becomes available once connected.</p><button className="cms-button cms-button--outline" onClick={() => refresh()}>Try again</button></div>}
      <Outlet />
    </main><div className="cms-admin-footer">Menty Tours · Website management</div></div>
  </div>;
}

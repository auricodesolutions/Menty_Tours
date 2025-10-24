import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminToken, listQuotes } from "../../lib/adminApi";
import "./admin-shell.css";

const STATUS_COLORS = {
  new: "#2563eb",
  read: "#6b7280",
  quoted: "#0ea5e9",
  won: "#16a34a",
  lost: "#ef4444",
  spam: "#a855f7",
};

function Badge({ s }) {
  return (
    <span
      className="mt-admin-chip"
      style={{ background: `${STATUS_COLORS[s] || "#64748b"}22`, color: STATUS_COLORS[s] || "#334155" }}
    >
      {String(s || "").toUpperCase()}
    </span>
  );
}

export default function QuotesList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      try {
        setLoading(true);
        const r = await listQuotes({ page, pageSize });
        const body = r.data || r; // API returns { page, pageSize, total, data }
        setRows(body.data || []);
        setTotal(body.total || 0);
        setErr("");
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav, page, pageSize]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row">
        <h2>Quotes</h2>
        <div style={{ opacity:.7 }}>Total: {total}</div>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "#fca5a5" }}>{err}</div>}

      {!loading && !err && (
        <>
          <table className="mt-admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Trip Window</th>
                <th>Pax</th>
                <th>Package</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>
                    <div style={{ display:"flex", flexDirection:"column" }}>
                      <strong>{q.name}</strong>
                      <span style={{ opacity:.7, fontSize:12 }}>{q.email}{q.phone ? ` • ${q.phone}` : ""}</span>
                    </div>
                  </td>
                  <td>
                    {q.checkin || "-"} {q.nights ? ` → ${q.checkout} (${q.nights} nights)` : ""}
                  </td>
                  <td>{q.adults} {q.children ? `+ ${q.children} ch` : ""}</td>
                  <td style={{ maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {q.tour_title || q.package || "-"}
                  </td>
                  <td>{q.budget || "-"}</td>
                  <td><Badge s={q.status} /></td>
                  <td style={{ display:"flex", gap:8 }}>
                    <Link className="mt-admin-btn" to={`/admin/quotes/${q.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan="8" style={{ opacity:.7 }}>No quotes yet.</td></tr>
              )}
            </tbody>
          </table>

          <div className="mt-admin-row" style={{ justifyContent:"flex-end", gap:8, marginTop:10 }}>
            <button className="mt-admin-btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <span style={{ alignSelf:"center" }}>Page {page} / {pages}</span>
            <button className="mt-admin-btn" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

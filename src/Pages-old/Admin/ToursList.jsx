// src/Pages/admin/ToursList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminToken, listTours, deleteTour } from "../../lib/adminApi";

export default function ToursList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      try {
        const r = await listTours();
        setRows(r.data || r);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const del = async (key) => {
    if (!window.confirm("Delete this tour? This cannot be undone.")) return;
    try {
      await deleteTour(key);
      setRows((s) => s.filter((t) => String(t.tourId) !== String(key) && t.id !== key));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="mt-admin-card">Loading…</div>;
  if (err) return <div className="mt-admin-card" style={{ color: "#fca5a5" }}>{err}</div>;

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row">
        <h2>Tours</h2>
        <button className="mt-admin-btn mt-admin-btn--success" onClick={()=>nav("/admin/tours/new")}>
          + New tour
        </button>
      </div>

      <table className="mt-admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Slug</th>
            <th>Category</th>
            <th>Best</th>
            <th>Price From</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.tourId}-${r.id}`}>
              <td>{r.tourId}</td>
              <td>{r.title}</td>
              <td><span className="mt-admin-chip">{r.id}</span></td>
              <td>{r.category || "-"}</td>
              <td>{r.best ? "⭐" : ""}</td>
              <td>{r.priceFrom ?? "-"}</td>
              <td style={{ display:"flex", gap:8 }}>
                <button className="mt-admin-btn" onClick={()=>nav(`/admin/tours/${r.id || r.tourId}`)}>Edit</button>
                <button className="mt-admin-btn mt-admin-btn--danger" onClick={()=>del(r.id || r.tourId)}>Delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan="7" style={{ opacity:.7 }}>No tours yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

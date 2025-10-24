import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminToken, listTestimonials, deleteTestimonial } from "../../lib/adminApi";

export default function TestimonialsList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      try {
        const r = await listTestimonials({ limit: 200, sort: "recent" });
        setRows(r.data || r || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const del = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteTestimonial(id);
      setRows((s) => s.filter((t) => String(t.id) !== String(id)));
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="mt-admin-card">Loading…</div>;
  if (err) return <div className="mt-admin-card" style={{ color: "#fca5a5" }}>{err}</div>;

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row">
        <h2>Testimonials</h2>
        <button className="mt-admin-btn mt-admin-btn--success" onClick={() => nav("/admin/testimonials/new")}>
          + New testimonial
        </button>
      </div>

      <table className="mt-admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name / Country</th>
            <th>Trip</th>
            <th>Rating</th>
            <th>Source</th>
            <th>Pinned</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  {r.avatar && <img src={r.avatar} alt="" style={{width:24, height:24, borderRadius:"50%"}}/>}
                  <div><strong>{r.name}</strong><div style={{opacity:.7,fontSize:12}}>{r.country}</div></div>
                </div>
              </td>
              <td>{r.trip || "-"}</td>
              <td>{Number(r.rating).toFixed(1)}</td>
              <td style={{textTransform:"capitalize"}}>{r.source || "site"}</td>
              <td>{r.pinned ? "⭐" : ""}</td>
              <td>{r.date || "-"}</td>
              <td style={{ display:"flex", gap:8 }}>
                <button className="mt-admin-btn" onClick={() => nav(`/admin/testimonials/${r.id}`)}>Edit</button>
                <button className="mt-admin-btn mt-admin-btn--danger" onClick={() => del(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan="8" style={{ opacity:.7 }}>No testimonials yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

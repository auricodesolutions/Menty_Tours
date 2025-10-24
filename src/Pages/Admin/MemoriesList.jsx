// src/Pages/admin/MemoriesList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminToken,
  listMemories,
  listMemoryTags,
  deleteMemory,
  viewURL,
} from "../../lib/adminApi";

const previewURL = (p) => {
  if (!p) return "";
  // pass through public assets
  if (/^https?:\/\//i.test(p) || /^\/(images|assets|static)\//i.test(p)) return p;
  // uploaded filename or uploads/* -> backend static
  const clean = String(p).replace(/^\/?(api\/uploads\/|uploads\/)/i, "");
  return viewURL(clean);
};

export default function MemoriesList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [tags, setTags] = useState([]);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [tagRes, memRes] = await Promise.all([
          listMemoryTags(),
          listMemories({ q, tag, pinned: true, limit: 100 }),
        ]);
        setTags(tagRes.data || tagRes || []);
        setRows(memRes.data || memRes || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, tag, nav]);

  const del = async (id) => {
    if (!window.confirm("Delete this memory? This cannot be undone.")) return;
    try {
      await deleteMemory(id);
      setRows((s) => s.filter((r) => String(r.id) !== String(id)));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row">
        <h2>Memories</h2>
        <button
          className="mt-admin-btn mt-admin-btn--success"
          onClick={() => nav("/admin/memories/new")}
        >
          + New memory
        </button>
      </div>

      <div className="mt-admin-row" style={{ gap: 8 }}>
        <input
          className="mt-admin-input"
          placeholder="Search title/place/caption…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <select
          className="mt-admin-input"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="">All tags</option>
          {(tags || []).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "#fca5a5" }}>{err}</div>}

      {!loading && !err && (
        <table className="mt-admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Preview</th>
              <th>Title</th>
              <th>Place</th>
              <th>Tag</th>
              <th>Pin</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  {r.img ? (
                    <img
                      alt=""
                      src={previewURL(r.img)}
                      style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{r.title}</td>
                <td>{r.place || "-"}</td>
                <td>{r.tag || "-"}</td>
                <td>{r.pin ?? "-"}</td>
                <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="mt-admin-btn" onClick={() => nav(`/admin/memories/${r.id}`)}>
                    Edit
                  </button>
                  <button className="mt-admin-btn mt-admin-btn--danger" onClick={() => del(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="8" style={{ opacity: 0.7 }}>
                  No memories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

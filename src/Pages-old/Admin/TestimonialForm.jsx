import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminToken, getTestimonial, createTestimonial, updateTestimonial } from "../../lib/adminApi";

const empty = {
  name: "",
  country: "",
  trip: "",
  rating: "",
  text: "",
  date: "",
  avatar: "",
  source: "site",
  pinned: false,
  photoURL: "",
};

export default function TestimonialForm() {
  const { id } = useParams();                // numeric id or "new"
  const editing = !!id && id !== "new";
  const nav = useNavigate();

  const [m, setM] = useState(empty);
  const [file, setFile] = useState(null);    // selected photo
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      if (!editing) return;
      try {
        const r = await getTestimonial(id);
        const t = r.data || r;
        setM({
          name: t.name || "",
          country: t.country || "",
          trip: t.trip || "",
          rating: t.rating ?? "",
          text: t.text || "",
          date: t.date || "",
          avatar: t.avatar || "",
          source: t.source || "site",
          pinned: !!t.pinned,
          photoURL: t.photo || "",
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [editing, id, nav]);

  const setField = (k, v) => setM((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const payload = {
        name: m.name,
        country: m.country,
        trip: m.trip || null,
        rating: m.rating ? Number(m.rating) : null,
        text: m.text,
        date: m.date || null,
        avatar: m.avatar || null,
        source: m.source || "site",
        pinned: m.pinned ? 1 : 0,
      };
      if (editing) {
        await updateTestimonial(id, payload, file || undefined);
      } else {
        await createTestimonial(payload, file || undefined);
      }
      nav("/admin/testimonials");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row" style={{ marginBottom: 10 }}>
        <h2>{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
      </div>

      {err && <div style={{ color: "#fca5a5", marginBottom: 10 }}>{err}</div>}

      <form className="mt-admin-form" onSubmit={onSubmit}>
        <div className="mt-admin-grid">
          <div>
            <label>Name *</label>
            <input className="mt-admin-input" value={m.name} required onChange={(e)=>setField("name", e.target.value)} />
          </div>
          <div>
            <label>Country *</label>
            <input className="mt-admin-input" value={m.country} required onChange={(e)=>setField("country", e.target.value)} />
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Trip</label>
            <input className="mt-admin-input" value={m.trip} onChange={(e)=>setField("trip", e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label>Rating (0-5) *</label>
            <input className="mt-admin-input" type="number" min="0" max="5" step="0.1" required
                   value={m.rating} onChange={(e)=>setField("rating", e.target.value)} />
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Date</label>
            <input className="mt-admin-input" type="date" value={m.date} onChange={(e)=>setField("date", e.target.value)} />
          </div>
          <div>
            <label>Source</label>
            <select className="mt-admin-input" value={m.source} onChange={(e)=>setField("source", e.target.value)}>
              <option value="site">Site</option>
              <option value="google">Google</option>
              <option value="tripadvisor">Tripadvisor</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Avatar (URL)</label>
            <input className="mt-admin-input" value={m.avatar} onChange={(e)=>setField("avatar", e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label>Photo (upload)</label>
            { (file || m.photoURL) && (
              <div style={{ marginBottom: 8 }}>
                <img
                  src={file ? URL.createObjectURL(file) : m.photoURL}
                  alt="" style={{ maxWidth: 180, borderRadius: 10 }}
                />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div>
          <label>Review Text *</label>
          <textarea className="mt-admin-textarea" value={m.text} required minLength={20}
                    onChange={(e)=>setField("text", e.target.value)} placeholder="What did the guest say?" />
        </div>

        <label style={{ marginTop: 6, display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={m.pinned} onChange={(e)=>setField("pinned", e.target.checked)} />
          Pin (show near the top)
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="mt-admin-btn mt-admin-btn--success" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
          <button type="button" className="mt-admin-btn" onClick={() => nav("/admin/testimonials")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// src/Pages/admin/MemoryForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminToken,
  getMemory,
  saveMemory,
  uploadFile,
  viewURL,
} from "../../lib/adminApi";

const previewURL = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p) || /^\/(images|assets|static)\//i.test(p)) return p;
  const clean = String(p).replace(/^\/?(api\/uploads\/|uploads\/)/i, "");
  return viewURL(clean);
};

export default function MemoryForm() {
  const { id } = useParams(); // numeric id or "new"
  const editing = !!id && id !== "new";
  const nav = useNavigate();

  const [model, setModel] = useState({
    id: null,
    title: "",
    place: "",
    tag: "",
    img: "",
    caption: "",
    pin: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      if (!editing) return;
      try {
        const r = await getMemory(id);
        const m = r.data || r;
        setModel({
          id: m.id,
          title: m.title || "",
          place: m.place || "",
          tag: m.tag || "",
          img: m.img || "",
          caption: m.caption || "",
          pin: m.pin ?? "",
        });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [editing, id, nav]);

  const setField = (k, v) => setModel((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      // keep public assets as-is; for uploaded file names ensure relative path only
      const imgClean = /^https?:\/\//i.test(model.img) || /^\/(images|assets|static)\//i.test(model.img)
        ? model.img
        : String(model.img).replace(/^\/?(api\/uploads\/|uploads\/)/i, "");

      await saveMemory({
        id: editing ? model.id : undefined,
        title: model.title,
        place: model.place || null,
        tag: model.tag || null,
        img: imgClean,
        caption: model.caption || null,
        pin: model.pin,
      });
      nav("/admin/memories");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doUpload = async (file) => {
    if (!file) return;
    try {
      setBusy(true);
      const { path } = await uploadFile(file); // returns filename
      setField("img", path);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row" style={{ marginBottom: 10 }}>
        <h2>{editing ? "Edit Memory" : "New Memory"}</h2>
      </div>

      {err && <div style={{ color: "#fca5a5", marginBottom: 10 }}>{err}</div>}

      <form className="mt-admin-form" onSubmit={onSubmit}>
        <div className="mt-admin-grid">
          <div>
            <label>Title *</label>
            <input
              className="mt-admin-input"
              required
              value={model.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Boat day — smiles all round"
              autoComplete="off"
            />
          </div>
          <div>
            <label>Place</label>
            <input
              className="mt-admin-input"
              value={model.place}
              onChange={(e) => setField("place", e.target.value)}
              placeholder="e.g. Pigeon Island"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Tag</label>
            <input
              className="mt-admin-input"
              value={model.tag}
              onChange={(e) => setField("tag", e.target.value)}
              placeholder="e.g. Beach, Family, Adventure"
              autoComplete="off"
            />
          </div>
          <div>
            <label>Pin (sort priority)</label>
            <input
              className="mt-admin-input"
              type="number"
              value={model.pin}
              onChange={(e) => setField("pin", e.target.value)}
              placeholder="Higher appears first, leave blank for default"
            />
          </div>
        </div>

        <div>
          <label>Image *</label>
          {model.img && (
            <div style={{ marginBottom: 8 }}>
              <img src={previewURL(model.img)} alt="" style={{ maxWidth: 220, borderRadius: 10 }} />
            </div>
          )}
          <input
            className="mt-admin-input"
            value={model.img}
            onChange={(e) => setField("img", e.target.value)}
            placeholder="Paste absolute URL, /images/... or upload below"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => doUpload(e.target.files?.[0])}
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <label>Caption</label>
          <textarea
            className="mt-admin-textarea"
            value={model.caption}
            onChange={(e) => setField("caption", e.target.value)}
            placeholder="Short caption that appears under the image"
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="mt-admin-btn mt-admin-btn--success" disabled={busy}>
            {busy ? "Saving..." : "Save memory"}
          </button>
          <button type="button" className="mt-admin-btn" onClick={() => nav("/admin/memories")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

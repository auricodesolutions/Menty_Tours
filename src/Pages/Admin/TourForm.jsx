// src/Pages/admin/TourForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminToken, getTour, saveTour, uploadFile, viewURL } from "../../lib/adminApi";

const toCSV = (arr) => (arr || []).join(", ");
const fromCSV = (str) =>
  (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function TourForm() {
  const { key } = useParams();      // slug or id
  const editing = !!key && key !== "new";
  const nav = useNavigate();

  const [model, setModel] = useState({
    tourId: null,            // keep real id for updates
    slug: "",
    title: "",
    description: "",
    duration: "",
    rating: "",
    img: "",
    hero: "",
    priceFrom: "",
    person: "",
    category: "",
    best: false,
    placesCSV: "",
    tagsCSV: "",
    itinerary: [{ title: "", img: "", desc: "" }],
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      if (!editing) return;
      try {
        const r = await getTour(key);
        const t = r.data || r;
        setModel((m) => ({
          ...m,
          tourId: t.tourId ?? null,
          slug: t.id || "",
          title: t.title || "",
          description: t.description || "",
          duration: t.duration || "",
          rating: t.rating || "",
          img: t.img || "",
          hero: t.hero || "",
          priceFrom: t.priceFrom ?? "",
          person: t.person || "",
          category: t.category || "",
          best: !!t.best,
          placesCSV: toCSV(t.places),
          tagsCSV: toCSV(t.tags),
          itinerary: (t.itinerary || []).length ? t.itinerary : [{ title: "", img: "", desc: "" }],
        }));
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [editing, key, nav]);

  const setField = (k, v) => setModel((m) => ({ ...m, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const payload = {
        id: model.tourId || undefined,               // <<— update by id if present
        slug: model.slug || undefined,
        title: model.title,
        description: model.description || null,
        duration: model.duration || null,
        rating: model.rating ? Number(model.rating) : null,
        img: model.img || null,
        hero: model.hero || null,
        priceFrom: model.priceFrom ? Number(model.priceFrom) : null,
        person: model.person || null,
        category: model.category || null,
        best: !!model.best,
        places: fromCSV(model.placesCSV),
        tags: fromCSV(model.tagsCSV),
        itinerary: (model.itinerary || []).map((d) => ({
          title: d.title || "",
          img: d.img || null,
          desc: d.desc || null,
        })),
      };

      await saveTour(payload);
      nav("/admin/tours");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addDay = () =>
    setModel((m) => ({ ...m, itinerary: [...(m.itinerary || []), { title: "", img: "", desc: "" }] }));
  const removeDay = (idx) =>
    setModel((m) => ({ ...m, itinerary: (m.itinerary || []).filter((_, i) => i !== idx) }));
  const setDay = (idx, key2, value) =>
    setModel((m) => {
      const it = [...(m.itinerary || [])];
      it[idx] = { ...it[idx], [key2]: value };
      return { ...m, itinerary: it };
    });

  const doUpload = async (file, field) => {
    if (!file) return;
    try {
      setBusy(true);
      const { path } = await uploadFile(file); // store relative path
      setField(field, path);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const doUploadDay = async (file, dayIdx) => {
    if (!file) return;
    try {
      setBusy(true);
      const { path } = await uploadFile(file);
      setDay(dayIdx, "img", path);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row" style={{ marginBottom: 10 }}>
        <h2>{editing ? "Edit Tour" : "New Tour"}</h2>
      </div>

      {err && <div style={{ color: "#fca5a5", marginBottom: 10 }}>{err}</div>}

      <form className="mt-admin-form" onSubmit={onSubmit}>
        <div className="mt-admin-grid">
          <div>
            <label>Slug</label>
            <input
              className="mt-admin-input"
              value={model.slug}
              onChange={(e) => setField("slug", e.target.value)}
              placeholder="e.g. cultural-triangle-classic"
              autoComplete="off"
            />
          </div>
          <div>
            <label>Title *</label>
            <input
              className="mt-admin-input"
              value={model.title}
              required
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Tour display title"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Category</label>
            <input
              className="mt-admin-input"
              value={model.category}
              onChange={(e) => setField("category", e.target.value)}
              placeholder="Culture, Honeymoon, Adventure…"
              autoComplete="off"
            />
          </div>
          <div>
            <label>Duration (days)</label>
            <input
              className="mt-admin-input"
              value={model.duration}
              onChange={(e) => setField("duration", e.target.value)}
              placeholder="e.g. 6D / 5N"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Rating</label>
            <input
              className="mt-admin-input"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={model.rating}
              onChange={(e) => setField("rating", e.target.value)}
              placeholder="4.8"
            />
          </div>
          <div>
            <label>Price From</label>
            <input
              className="mt-admin-input"
              type="number"
              step="0.01"
              value={model.priceFrom}
              onChange={(e) => setField("priceFrom", e.target.value)}
              placeholder="449.00"
            />
          </div>
        </div>

        {/* Images with upload + preview */}
        <div className="mt-admin-grid">
          <div>
            <label>Thumbnail Image</label>
            {model.img && (
              <div style={{ marginBottom: 8 }}>
                <img src={viewURL(model.img)} alt="" style={{ maxWidth: 180, borderRadius: 10 }} />
              </div>
            )}
            <input
              className="mt-admin-input"
              value={model.img}
              onChange={(e) => setField("img", e.target.value)}
              placeholder="Paste URL or upload below"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => doUpload(e.target.files?.[0], "img")}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <label>Hero Image</label>
            {model.hero && (
              <div style={{ marginBottom: 8 }}>
                <img src={viewURL(model.hero)} alt="" style={{ maxWidth: 180, borderRadius: 10 }} />
              </div>
            )}
            <input
              className="mt-admin-input"
              value={model.hero}
              onChange={(e) => setField("hero", e.target.value)}
              placeholder="Paste URL or upload below"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => doUpload(e.target.files?.[0], "hero")}
              style={{ marginTop: 8 }}
            />
          </div>
        </div>

        <div>
          <label>Description</label>
          <textarea
            className="mt-admin-textarea"
            value={model.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Short description shown on the card and details page"
          />
        </div>

        <div className="mt-admin-grid">
          <div>
            <label>Places (comma separated)</label>
            <input
              className="mt-admin-input"
              value={model.placesCSV}
              onChange={(e) => setField("placesCSV", e.target.value)}
              placeholder="Kandy, Sigiriya, Ella"
            />
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input
              className="mt-admin-input"
              value={model.tagsCSV}
              onChange={(e) => setField("tagsCSV", e.target.value)}
              placeholder="heritage, local guide"
            />
          </div>
        </div>

        <label style={{ marginTop: 6, display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={model.best}
            onChange={(e) => setField("best", e.target.checked)}
          />
          Mark as “Best”
        </label>

        {/* Itinerary days */}
        <div style={{ marginTop: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Itinerary</h3>
          <div className="mt-admin-form" style={{ gap: 8 }}>
            {(model.itinerary || []).map((d, i) => (
              <div key={i} className="mt-admin-card" style={{ padding: 12 }}>
                <div className="mt-admin-grid">
                  <div>
                    <label>Day {i + 1} — Title</label>
                    <input
                      className="mt-admin-input"
                      value={d.title}
                      onChange={(e) => setDay(i, "title", e.target.value)}
                      placeholder="Arrival in Kandy"
                    />
                  </div>
                  <div>
                    <label>Image</label>
                    {d.img && (
                      <div style={{ marginBottom: 8 }}>
                        <img src={viewURL(d.img)} alt="" style={{ maxWidth: 160, borderRadius: 10 }} />
                      </div>
                    )}
                    <input
                      className="mt-admin-input"
                      value={d.img || ""}
                      onChange={(e) => setDay(i, "img", e.target.value)}
                      placeholder="Paste URL or upload below"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => doUploadDay(e.target.files?.[0], i)}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>Description</label>
                  <textarea
                    className="mt-admin-textarea"
                    value={d.desc || ""}
                    onChange={(e) => setDay(i, "desc", e.target.value)}
                    placeholder="Activities and highlights for the day"
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    type="button"
                    className="mt-admin-btn mt-admin-btn--danger"
                    onClick={() => removeDay(i)}
                  >
                    Remove day
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-admin-btn mt-admin-btn--accent"
            onClick={addDay}
            style={{ marginTop: 8 }}
          >
            + Add day
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="mt-admin-btn mt-admin-btn--success" disabled={busy}>
            {busy ? "Saving..." : "Save tour"}
          </button>
          <button type="button" className="mt-admin-btn" onClick={() => nav("/admin/tours")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

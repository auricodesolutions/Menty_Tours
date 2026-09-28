// src/components/MemoriesExplore/MemoriesExplore.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./MemoriesExplore.css";
import { viewURL } from "../../lib/adminApi";
import SEO from "../../Components/Seo/SEO";

/* -------------------------
   Env / helpers / icons
------------------------- */
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
       <rect width='100%' height='100%' fill='#eaeaea'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             fill='#9a9a9a' font-family='Arial' font-size='20'>Image unavailable</text>
     </svg>`
  );

const resolveImg = (src) => {
  const s = String(src || "").trim();
  if (!s) return FALLBACK_IMG;
  if (/^(https?:|data:)/i.test(s)) return s;
  if (/^\/(images|assets|static)\//i.test(s)) return s;
  const clean = s.replace(/^\/?(api\/uploads\/|uploads\/)/i, "");
  return viewURL(clean) || FALLBACK_IMG;
};

const Icon = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M14 6l-6 6 6 6" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M10 6l6 6-6 6" />
    </svg>
  ),
  Back: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
};

/* -------------------------
   Hooks
------------------------- */
function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
function useReveal(selector = ".mexp-reveal", threshold = 0.14) {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    const show = () => els.forEach((el) => el.classList.add("show"));
    if (!("IntersectionObserver" in window)) return show();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("show");
            io.unobserve(e.target);
          }
        }),
      { threshold }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [selector, threshold]);
}

/* -------------------------
   Component
------------------------- */
export default function MemoriesExplore() {
  useReveal();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const qDeb = useDebounced(q, 350);

  const [place, setPlace] = useState("All");
  const [sort, setSort] = useState("latest");
  const [hasMore, setHasMore] = useState(true);
  const [viewer, setViewer] = useState({ open: false, index: 0 });

  const gridRef = useRef(null);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/#memories");
  };

  const resetAndFetch = () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    resetAndFetch();
  }, [qDeb, place, sort]);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      if (!hasMore && page !== 1) return;
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        params.set("page", String(page));
        if (qDeb) params.set("q", qDeb);
        if (place && place !== "All") params.set("place", place);
        params.set("sort", sort);

        const res = await fetch(`${API_BASE}/api/memories?` + params.toString(), { signal: ctrl.signal });
        const json = await res.json().catch(() => ({}));
        if (!alive) return;

        if (json?.ok !== false) {
          const rows = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json?.data?.data)
            ? json.data.data
            : Array.isArray(json)
            ? json
            : [];

          const mapped = rows.map((m) => ({
            id: m.id ?? m.memId ?? m._id ?? Math.random().toString(36).slice(2),
            img: resolveImg(m.img ?? m.photo ?? m.src),
            title: String(m.title || "Untitled memory"),
            place: String(m.place || ""),
            createdAt: m.created_at || m.createdAt || 0,
          }));

          const sorted = [...mapped].sort((a, b) => {
            if (sort === "title") return a.title.localeCompare(b.title);
            if (sort === "oldest") return (a.createdAt || a.id) - (b.createdAt || b.id);
            return (b.createdAt || b.id) - (a.createdAt || a.id);
          });

          setItems((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            return [...prev, ...sorted.filter((s) => !seen.has(s.id))];
          });

          setHasMore(rows.length >= limit);
          setErr("");
        } else {
          setErr(json?.error || "Could not load memories.");
        }
      } catch (e) {
        if (alive && e.name !== "AbortError") setErr(e.message || "Network error");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [page, qDeb, place, sort, limit, hasMore]);

  const places = useMemo(() => {
    const s = new Set();
    items.forEach((m) => m.place && s.add(m.place));
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = items;

  const openViewer = (i) => setViewer({ open: true, index: i });
  const closeViewer = () => setViewer({ open: false, index: 0 });
  const next = () => setViewer((v) => ({ open: true, index: (v.index + 1) % filtered.length }));
  const prev = () => setViewer((v) => ({ open: true, index: (v.index - 1 + filtered.length) % filtered.length }));

  useEffect(() => {
    if (!viewer.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer.open, filtered.length]);

  /* ---------- SEO Metadata ---------- */
  const seo = {
    title: "Sri Lanka Travel Memories Gallery | Menty Tours",
    description:
      "Explore real travel memories from Sri Lanka — photos from safaris, tea trails, beaches, and cultural tours shared by Menty Tours travellers. Discover authentic experiences across Sigiriya, Kandy, Ella, Mirissa, and more.",
    canonical: "https://www.mentytours.com/memories",
    ogImage: "https://www.mentytours.com/og-cover.jpg",
  };

  return (
    <section className="mexp mexp--compact" ref={gridRef} aria-label="Sri Lanka travel memories gallery">
      <SEO {...seo} />

      {/* Topbar */}
      <div className="mexp-topbar mexp-reveal" role="navigation" aria-label="Back to memories">
        <button className="mexp-back" onClick={goBack}>
          <Icon.Back />
          <span>Back to home</span>
        </button>
        <span className="mexp-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "memory" : "memories"}
        </span>
      </div>

      {/* Header */}
      <header className="mexp-head mexp-reveal">
        <div className="mexp-badge">Sri Lanka Travel Gallery</div>
        <h1>Explore Real Moments from Our Travellers</h1>
        <p className="mexp-sub">
          Discover photos shared by our guests — from Yala safaris to the Ella train ride, tropical beaches, and city
          walks. Experience authentic Sri Lanka memories captured through real journeys.
        </p>
      </header>

      {/* Controls */}
      <div className="mexp-controls mexp-reveal" role="region" aria-label="Filters and search">
        <div className="mexp-search">
          <Icon.Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or place..."
            aria-label="Search travel memories"
          />
          {q && (
            <button className="mexp-clear" onClick={() => setQ("")} aria-label="Clear search">
              <Icon.Close />
            </button>
          )}
        </div>

        <div className="mexp-selects">
          <label className="mexp-select">
            <span>Place</span>
            <select value={place} onChange={(e) => setPlace(e.target.value)}>
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="mexp-select">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="mexp-error mexp-reveal" role="alert">
          {err}
        </div>
      )}

      {/* Grid */}
      <div className="mexp-grid mexp-reveal">
        {!loading && !err && filtered.length === 0 && (
          <p className="mexp-empty">No memories found{qDeb ? ` for “${qDeb}”` : ""}.</p>
        )}

        {filtered.map((m, i) => (
          <figure className="mexp-card" key={m.id} onClick={() => openViewer(i)}>
            <div className="art">
              <img
                src={m.img}
                alt={`${m.title} — ${m.place || "Sri Lanka"} travel memory`}
                loading="lazy"
                decoding="async"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </div>
            <figcaption>
              <strong>{m.title}</strong>
              {m.place ? <span>{m.place}</span> : null}
            </figcaption>
          </figure>
        ))}

        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div className="mexp-card mexp-skel" key={`sk-${i}`}>
              <div className="art skeleton-block" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
          ))}
      </div>

      {!loading && hasMore && !err && (
        <div className="mexp-more mexp-reveal">
          <button className="mexp-btn" onClick={() => setPage((p) => p + 1)}>
            Load more
          </button>
        </div>
      )}

      {/* Footer CTAs */}
      <div className="mexp-cta mexp-reveal mexp-cta--row">
        <button className="mexp-btn mexp-btn--ghost" onClick={goBack}>
          ← Back to memories
        </button>
        <Link to="/#packages" className="mexp-btn mexp-btn--ghost">
          Browse tour packages
        </Link>
        <Link to="/quote" className="mexp-btn mexp-btn--gold">
          Plan my trip
        </Link>
      </div>

      {/* Viewer */}
      {viewer.open && filtered[viewer.index] && (
        <div className="mexp-viewer" role="dialog" aria-modal="true" onClick={closeViewer}>
          <div className="mexp-viewer__inner" onClick={(e) => e.stopPropagation()}>
            <button className="nav left" onClick={prev} aria-label="Previous photo">
              <Icon.ArrowLeft />
            </button>
            <img
              src={filtered[viewer.index].img}
              alt={`${filtered[viewer.index].title} — ${filtered[viewer.index].place || "Sri Lanka"} travel memory`}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />
            <figcaption>
              <strong>{filtered[viewer.index].title}</strong>
              {filtered[viewer.index].place ? <span> · {filtered[viewer.index].place}</span> : null}
            </figcaption>
            <button className="nav right" onClick={next} aria-label="Next photo">
              <Icon.ArrowRight />
            </button>
            <button className="close" onClick={closeViewer} aria-label="Close viewer">
              <Icon.Close />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Testominals.css";

/* ===== API base ===== */
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

/* ===== tiny reveal (re-scan on deps) ===== */
function useReveal(selector = ".tm-reveal", threshold = 0.16, deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;
    const showAll = () => els.forEach((el) => el.classList.add("show"));

    if (!("IntersectionObserver" in window)) {
      showAll();
      return;
    }
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
  }, [selector, threshold, ...deps]);
}

/* ===== media query hook ===== */
function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia(query).matches
      : false;
  const [ok, setOk] = useState(get);
  useEffect(() => {
    if (!("matchMedia" in window)) return;
    const m = window.matchMedia(query);
    const on = () => setOk(m.matches);
    on();
    m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () =>
      m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on);
  }, [query]);
  return ok;
}

/* ===== stars (display only) ===== */
function Stars({ value = 5, outOf = 5 }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  return (
    <div className="tm-stars" aria-label={`${v} out of ${outOf} stars`}>
      {"★".repeat(full)}
      {half ? "☆" : ""}
      {"☆".repeat(Math.max(0, empty))}
    </div>
  );
}

/* ===== Featured slider ===== */
function FeaturedSlider({ items = [], interval = 5200 }) {
  const [i, setI] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (i > items.length - 1) setI(0);
  }, [items.length, i]);

  useEffect(() => {
    if (items.length <= 1) return;
    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (rm?.matches) return;
    const t = setInterval(
      () => !paused.current && setI((v) => (v + 1) % items.length),
      interval
    );
    return () => clearInterval(t);
  }, [items.length, interval]);

  if (!items.length) return null;
  const cur = items[i] || items[0] || {};

  return (
    <section
      className="tm-featured tm-reveal"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="tm-featured-card">
        <div className="tm-featured-top">
          <img
            className="tm-avatar"
            src={cur.photo || cur.avatar || ""}
            alt={`${cur?.name || "Guest"} trip`}
          />
          <div className="tm-nameRow">
            <strong>{cur.name || "Guest"}</strong>
            <span className="tm-meta">
              {(cur.country || "—")} • {(cur.trip || "Custom Trip")}
            </span>
          </div>
          <Stars value={cur.rating} />
        </div>
        <blockquote className="tm-quote">
          <span className="tm-quote-mark">“</span>
          {cur.text || ""}
          <span className="tm-quote-mark end">”</span>
        </blockquote>
        <div className="tm-foot">
          <span className="tm-date">{cur.date || ""}</span>
          <button
            className="tm-next"
            onClick={() => setI((v) => (v + 1) % items.length)}
            aria-label="Next featured review"
          >
            Next
          </button>
        </div>
      </div>

      <div className="tm-dots" role="tablist" aria-label="Featured testimonials">
        {items.map((_, idx) => (
          <button
            key={idx}
            className={`tm-dot ${idx === i ? "active" : ""}`}
            onClick={() => setI(idx)}
            role="tab"
            aria-selected={idx === i}
          />
        ))}
      </div>
    </section>
  );
}

/* ===== helpers ===== */
function clampText(s = "", max = 220) {
  const text = s || "";
  if (text.length <= max) return [text, false];
  const cut = text.slice(0, max).lastIndexOf(" ");
  return [text.slice(0, cut > 0 ? cut : max) + "…", true];
}

/* ===== Card ===== */
function ReviewCard({ t = {} }) {
  const [expanded, setExpanded] = useState(false);
  const [short, clipped] = clampText(t.text, 220);

  return (
    <article className="tm-card" itemScope itemType="https://schema.org/Review">
      <div className="tm-card-top">
        <img
          className="tm-avatar"
          src={t.photo || t.avatar || ""}
          alt={`${t.name || "Guest"} trip`}
        />
        <div className="tm-nameRow">
          <strong itemProp="author">{t.name || "Guest"}</strong>
          <span className="tm-meta">
            {(t.country || "—")} • {(t.trip || "Custom Trip")}
          </span>
        </div>
        <Stars value={t.rating} />
      </div>

      <blockquote className={`tm-card-quote ${expanded ? "expanded" : ""}`} itemProp="reviewBody">
        {expanded ? (t.text || "") : short}
      </blockquote>

      <div className="tm-card-foot">
        <time className="tm-date" itemProp="datePublished" dateTime={t.date || ""}>
          {t.date || ""}
        </time>
        {clipped && (
          <button className="tm-link" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  );
}

/* ===== Write Review form + toggle ===== */
function StarInput({ value, onChange }) {
  const set = (n) => onChange(n);
  const inc = () => onChange(Math.min(5, (value || 0) + 1));
  const dec = () => onChange(Math.max(1, (value || 0) - 1));
  return (
    <div className="tm-rate" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`tm-star ${value >= n ? "active" : ""}`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={value >= n}
          onClick={() => set(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") inc();
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") dec();
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function WriteReviewForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [trip, setTrip] = useState("Custom Trip");
  const [tripOptions, setTripOptions] = useState(["Custom Trip"]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tours`);
        const json = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.ok && json?.ok && Array.isArray(json.data)) {
          const titles = Array.from(
            new Set(json.data.map((t) => (t.title || "").trim()).filter(Boolean))
          ).sort((a, b) => a.localeCompare(b));
          setTripOptions(["Custom Trip", ...titles]);
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  const max = 1000;
  const left = Math.max(0, max - text.length);

  // ✅ Only rating + agree are required
  const valid = rating > 0 && agree && !website;

  // Clear error as soon as user picks a rating or toggles consent
  useEffect(() => { setError(""); }, [rating, agree]);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); setPreview(""); return; }
    if (!/^image\//i.test(f.type)) { setError("Please choose an image file."); return; }
    if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!valid) { setError("Please select a star rating."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());                 // optional
      fd.append("country", country.trim());           // optional
      fd.append("trip", trip || "Custom Trip");       // optional
      fd.append("rating", String(rating));            // required
      fd.append("text", (text || "").trim());         // optional
      fd.append("date", new Date().toISOString().slice(0, 10));
      if (file) fd.append("photo", file);             // optional

      const res = await fetch(`${API_BASE}/api/testimonials`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok !== true) throw new Error(json?.error || "Server error");

      onSubmit?.({
        name: json.data.name,
        country: json.data.country,
        trip: json.data.trip || trip,
        rating: Number(json.data.rating) || rating,
        text: json.data.text,
        date: json.data.date,
        avatar: json.data.avatar || "",
        photo: json.data.photo || preview || "",
      });

      setDone(true);
      setName("");
      setCountry("");
      setTrip("Custom Trip");
      setText("");
      setRating(0);
      setFile(null);
      setPreview("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="tm-form" onSubmit={handleSubmit} noValidate>
      <div className="tm-row">
        <label className="tm-field">
          <span>Name (optional)</span>
          <input
            className="tm-inp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <label className="tm-field">
          <span>Country (optional)</span>
          <input
            className="tm-inp"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., Russia"
          />
        </label>
      </div>

      <label className="tm-field">
        <span>Trip (optional)</span>
        <select
          value={trip}
          onChange={(e) => setTrip(e.target.value)}
          className="tm-select"
          aria-label="Select your trip"
        >
          {tripOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="tm-field">
        <span>Your review (optional)</span>
        <textarea
          className="tm-textarea"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, max))}
          placeholder="Share anything you’d like (optional)…"
          rows={5}
        />
        <span className="tm-count" aria-live="polite">{left} characters left</span>
      </label>

      <div className="tm-field">
        <span>Rating *</span>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <label className="tm-field">
        <span>Best trip photo (optional)</span>
        <input type="file" accept="image/*" onChange={onPick} />
        {preview && (
          <div className="tm-photo-preview">
            <img src={preview} alt="Selected trip preview" />
          </div>
        )}
      </label>

      {/* Honeypot */}
      <label className="tm-hidden">
        Website
        <input value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>

      <label className="tm-check">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>I agree to have my review published on this site.</span>
      </label>

      {error && <p className="tm-error" role="alert">{error}</p>}
      {done && <p className="tm-success" role="status">Thanks! Your review has been submitted.</p>}

      <div className="tm-actions">
        <button className="tm-btn" disabled={!valid || loading}>
          {loading ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}


function WriteReview({ onSubmit }) {
  const [open, setOpen] = useState(false);
  return (
    <section id="write-review" className="tm-write tm-reveal">
      <h2 className="tm-write-title">Write a review</h2>
      <p className="tm-write-sub">
        Share your trip highlights—help other travelers choose confidently.
      </p>
      <button
        className="tm-btn tm-btn--ghost"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Hide form" : "Start writing"}
      </button>
      {open && <WriteReviewForm onSubmit={onSubmit} />}
    </section>
  );
}

/* ===== Mobile carousel ===== */
function MobileCarousel({ items = [] }) {
  if (!items.length) return null;
  return (
    <section className="tm-carousel tm-reveal" aria-label="Guest reviews">
      <div className="tm-hscroll">
        {items.map((t, i) => (
          <div className="tm-slide" key={i}>
            <ReviewCard t={t} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===== PAGE ===== */
export default function TestimonialsPage({ testimonials = DEFAULT_TESTIMONIALS }) {
  const [data, setData] = useState(testimonials);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/testimonials?limit=60&sort=recent`, {
          signal: ctrl.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.ok && json?.ok && Array.isArray(json.data)) {
          setData(
            json.data.map((r) => ({
              name: r.name,
              country: r.country,
              trip: r.trip || "",
              rating: Number(r.rating) || 0,
              text: r.text || "",
              date: r.date || "",
              avatar: r.avatar || "",
              photo: r.photo || null,
            }))
          );
        } else if (!res.ok) {
          setErr(json?.error || `Failed to load reviews (${res.status})`);
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
  }, []);

  const { avg, count } = useMemo(() => {
    if (!data.length) return { avg: 0, count: 0 };
    const sum = data.reduce((a, b) => a + (Number(b.rating) || 0), 0);
    return { avg: Math.round((sum / data.length) * 10) / 10, count: data.length };
  }, [data]);

  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recent");

  const filtered = useMemo(() => {
    let rows = data
      .filter((t) => (Number(t.rating) || 0) >= minRating)
      .filter((t) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        const hay = `${t.name} ${t.country} ${t.trip} ${t.text}`.toLowerCase();
        return hay.includes(needle);
      });
    if (sortBy === "top") rows = [...rows].sort((a, b) => (a.rating < b.rating ? 1 : -1));
    else rows = [...rows].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return rows;
  }, [data, q, minRating, sortBy]);

  useReveal(".tm-reveal", 0.16, [loading, filtered.length]);
  const isMobile = useMediaQuery("(max-width: 720px)");

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Menty Tours Sri Lanka",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avg || 0,
        reviewCount: count || 0,
      },
      review: data.slice(0, 10).map((t) => ({
        "@type": "Review",
        author: t.name,
        reviewBody: t.text,
        reviewRating: { "@type": "Rating", ratingValue: t.rating },
        datePublished: t.date,
      })),
    }),
    [avg, count, data]
  );

  return (
    <main className="tm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="tm-hero tm-reveal">
        <div className="tm-hero-badge">Trusted by travelers worldwide</div>
        <h1>What our guests say</h1>
        <p className="tm-sub">
          Rated <strong>{avg}/5</strong> from <strong>{count}</strong> verified reviews.
        </p>
        <div className="tm-hero-stats">
          <div className="tm-chip">Friendly guides</div>
          <div className="tm-chip">Clean vehicles</div>
          <div className="tm-chip">On-time pickups</div>
          <div className="tm-chip">Safe & comfy</div>
        </div>
      </header>

      {err && <p style={{ textAlign: "center", color: "#c00" }}>{err}</p>}

      {/* Filters + actions */}
      <section className="tm-controls tm-reveal">
        <input
          className="tm-input"
          type="search"
          placeholder="Search by name, country, or trip…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="tm-selects">
          <label className="tm-field">
            <span>Min rating</span>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              <option value={0}>All</option>
              <option value={5}>5 ★</option>
              <option value={4.5}>4.5 ★</option>
              <option value={4}>4 ★</option>
              <option value={3.5}>3.5 ★</option>
            </select>
          </label>
          <label className="tm-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most recent</option>
              <option value="top">Top rated</option>
            </select>
          </label>

          <div className="tm-actions-inline">
            <Link to="/testimonialsPage" className="tm-btn tm-btn--ghost">
              All reviews
            </Link>
            <button
              type="button"
              className="tm-btn tm-btn--ghost"
              onClick={() => {
                setQ("");
                setMinRating(0);
                setSortBy("recent");
              }}
              style={{ marginLeft: 8 }}
            >
              Reset filters
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      {loading ? (
        <p className="tm-empty">Loading…</p>
      ) : filtered.length ? (
        <>
          <FeaturedSlider items={filtered.slice(0, 5)} />
          {isMobile ? <MobileCarousel items={filtered} /> : null}
        </>
      ) : (
        <p className="tm-empty">
          No reviews match your search — try <strong>Reset filters</strong>.
        </p>
      )}

      <WriteReview onSubmit={(review) => setData((prev) => [review, ...prev])} />
    </main>
  );
}

/* ===== Demo data (fallback) ===== */
const DEFAULT_TESTIMONIALS = [
  {
    name: "Emma W.",
    country: "United Kingdom",
    trip: "10D / 9N Classic Sri Lanka",
    rating: 5,
    text:
      "From the first WhatsApp message to our airport drop-off, everything was seamless. Our guide Kasun felt like family—patient, funny, and so knowledgeable. We loved Sigiriya sunrise, Ella train, and a surprise coconut! Highly recommend.",
    date: "2025-08-14",
    avatar: "https://i.pravatar.cc/80?img=11",
    photo: null,
  },
  {
    name: "Luca B.",
    country: "Italy",
    trip: "7D Beaches & Wildlife",
    rating: 4.8,
    text:
      "Clean car, smooth driving, and flexible planning. We added Yala at the last minute and they handled it perfectly. The hotel picks were spot on for our budget.",
    date: "2025-07-02",
    avatar: "https://i.pravatar.cc/80?img=12",
    photo: null,
  },
];

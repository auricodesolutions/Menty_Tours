// src/components/TourPackages/TourPackages.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./TourPackages.css";
import { viewURL } from "../../lib/adminApi"; // shared URL resolver

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

/* icons */
const Clock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);
const MapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.8" aria-hidden="true">
    <path d="M20.8 10.5c0 5.5-8.8 11-8.8 11S3.2 16 3.2 10.5a8.8 8.8 0 1 1 17.6 0z"></path>
    <circle cx="12" cy="10.5" r="3"></circle>
  </svg>
);
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
  </svg>
);
const Chevron = ({ dir = "left" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" aria-hidden="true">
    {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
  </svg>
);

/* helpers */
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
      <rect width='100%' height='100%' fill='#eaeaea'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            fill='#9a9a9a' font-family='Arial' font-size='20'>Image unavailable</text>
    </svg>`
  );

// Resolve image URLs (uploaded or absolute)
const resolveImg = (src) => {
  const s = String(src || "").trim();
  if (!s) return FALLBACK_IMG;
  if (/^(https?:|data:)/i.test(s)) return s;
  if (/^\/(images|assets|static)\//i.test(s)) return s;
  const clean = s.replace(/^\/?(api\/uploads\/|uploads\/)/i, ""); // normalize
  return viewURL(clean) || FALLBACK_IMG;
};

/* media query hook */
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

/* card component (shared by grid + carousel) */
function PackageCard({ p }) {
  return (
    <article className="tp-card">
      {p.best ? <span className="tp-badge">Top pick</span> : null}

      <div className="tp-media">
        <img
          src={resolveImg(p.img || p.hero)}
          alt={p.title}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          loading="lazy"
        />
        {p.duration && (
          <span className="tp-duration">
            <Clock /> {p.duration}
          </span>
        )}
      </div>

      <div className="tp-body">
        <h3>{p.title}</h3>

        {Array.isArray(p.places) && p.places.length > 0 && (
          <div className="tp-places">
            <MapPin /> {p.places.join(" • ")}
          </div>
        )}

        {Array.isArray(p.tags) && p.tags.length > 0 && (
          <p className="tp-card__desc">{p.tags.join(" · ")}</p>
        )}

        <div className="tp-footer">
          <div className="tp-price">
            From <strong>USD {p.priceFrom}</strong> / {p.person} person
          </div>

          <div className="tp-actions">
            <Link className="tp-btn tp-btn--ghost" to={`/trip/${p.id || p.tourId}`}>
              View details
            </Link>

            <Link
              className="tp-btn tp-btn--gold"
              to="/quote"
              state={{
                pkg: {
                  id: p.id || p.tourId,
                  title: p.title,
                  duration: p.duration,
                  priceFrom: p.priceFrom,
                  person: p.person,
                  img: resolveImg(p.img || p.hero),
                  places: p.places,
                  tags: p.tags,
                },
              }}
            >
              Get quote <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* main */
export default function TourPackages() {
  const [cat, setCat] = useState("All");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    const cleanUnique = (arr) => Array.from(new Set((arr || []).map((v) => String(v))));
    const cleanItinerary = (arr) => {
      const out = []; const seen = new Set();
      for (const it of arr || []) {
        const key = `${it?.title || ""}|${it?.img || ""}|${it?.desc || ""}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ title: it?.title || "", img: it?.img || "", desc: it?.desc || "" });
        }
      }
      return out;
    };

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/tours`, { signal: ctrl.signal });
        const json = await res.json().catch(() => ({}));
        if (!alive) return;

        if (json?.ok !== true || !Array.isArray(json?.data)) {
          setError(json?.error || "Failed to load tour packages.");
          setData([]);
        } else {
          const cleaned = json.data.map((p) => ({
            ...p,
            places: cleanUnique(p.places),
            tags: cleanUnique(p.tags),
            itinerary: cleanItinerary(p.itinerary),
          }));
          setData(cleaned);
          setError("");
        }
      } catch (e) {
        if (alive && e.name !== "AbortError") {
          setError(e.message || "Network error");
          setData([]);
        }
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => { alive = false; ctrl.abort(); };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    data.forEach((d) => d?.category && set.add(d.category));
    return ["All", ...Array.from(set)];
  }, [data]);

  const filtered = useMemo(
    () => data.filter((p) => (cat === "All" ? true : p.category === cat)),
    [cat, data]
  );

  const topEight = useMemo(() => filtered.slice(0, 8), [filtered]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  /* --- Carousel (mobile) --- */
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="tp-section" id="packages">
      <div className="tp-container">
        <header className="tp-head">
          <p className="tp-eyebrow">Most Famous Tour Packages</p>
          <h2 className="tp-title">Top Sri Lanka itineraries travellers love</h2>
          <p className="tp-sub">Handpicked routes that blend iconic sights with authentic local experiences.</p>
        </header>

        <div className="tp-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`tp-chip ${cat === c ? "is-active" : ""}`}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="tp-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <article className="tp-card tp-card--skeleton" key={`sk-${i}`}>
                <div className="tp-media skeleton-block" />
                <div className="tp-body">
                  <h3 className="skeleton-line" />
                  <div className="skeleton-line" />
                  <p className="skeleton-line" />
                  <div className="tp-footer">
                    <div className="skeleton-line short" />
                    <div className="tp-actions">
                      <span className="skeleton-btn" />
                      <span className="skeleton-btn" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && error && <div className="tp-error" role="alert">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="tp-empty">No packages found{cat !== "All" ? ` in “${cat}”` : ""}.</div>
        )}

        {/* Content: Mobile = carousel, Desktop = grid (8) */}
        {!loading && !error && filtered.length > 0 && (
          <>
            {isMobile ? (
              <div className="tp-carousel">
                <div className="tp-hscroll" ref={scrollRef}>
                  {filtered.map((p) => (
                    <div className="tp-slide" key={p.tourId ?? p.id}>
                      <PackageCard p={p} />
                    </div>
                  ))}
                </div>

                <div className="tp-nav">
                  <button className="tp-nav-btn" onClick={() => scrollBy("left")} aria-label="Previous">
                    <Chevron dir="left" />
                  </button>
                  <button className="tp-nav-btn" onClick={() => scrollBy("right")} aria-label="Next">
                    <Chevron dir="right" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="tp-grid">
                {topEight.map((p) => (
                  <PackageCard key={p.tourId ?? p.id} p={p} />
                ))}
              </div>
            )}

            {/* View all tours CTA */}
            <div className="tp-cta-all">
              <Link className="tp-btn tp-btn--ghost tp-btn--xl" to="/tours">
                View all tours
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

import { API_BASE } from "../../lib/apiConfig";
// src/Pages/ViewAllTours/ViewAllTours.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./ViewAllTours.css";
import { viewURL } from "../../lib/adminApi";
import SEO from "../../Components/Seo/SEO";
import Navbar from "../../Components/Navbar/Navbar";
import { FEATURED_PACKAGE } from "../../data/featuredTour";

/* ===== API base ===== */


/* ===== Icons ===== */
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
/* ===== Helpers ===== */
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
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

const parseDays = (d) => {
  if (!d) return 0;
  const m = String(d).match(/(\d+)\s*(d|day|days)/i) || String(d).match(/(\d+)\s*D/i);
  return m ? Number(m[1]) : 0;
};
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Extract currency/amount from “USD 899”, “899”, “LKR 250000”
const parsePrice = (val) => {
  if (val == null) return null;
  const s = String(val).trim();
  const m = s.match(/^\s*([A-Za-z]{3})?\s*([\d,]+(?:\.\d+)?)/);
  if (!m) return null;
  const currency = (m[1] || "USD").toUpperCase();
  const price = Number((m[2] || "0").replace(/,/g, ""));
  if (!isFinite(price) || price <= 0) return null;
  return { price, currency };
};

/* ===== Card ===== */
function TourCard({ p }) {
  const placesShort = Array.isArray(p.places) ? p.places.slice(0, 3).join(" • ") : "";
  const alt = p.title + (p.duration ? ` — ${p.duration}` : "") + (placesShort ? ` — ${placesShort}` : "");
  return (
    <article className={`tp-card ${p.local ? "tp-card--featured" : ""}`} itemScope itemType="https://schema.org/TouristTrip">
      <div className="tp-media">
        <img
          src={resolveImg(p.img || p.hero)}
          alt={alt}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          loading="lazy"
          decoding="async"
        />
        {p.duration && (
          <span className="tp-duration">
            <Clock /> {p.duration}
          </span>
        )}
        {p.priceFrom && <span className="vt-price-seal"><small>FROM</small><strong>USD {p.priceFrom}</strong><small>{p.person === "2" ? "for 2 persons" : `per ${p.person || 1} person`}</small></span>}
      </div>

      <div className="tp-body">
        {p.best ? <span className="tp-badge">Featured journey</span> : null}
        <h3 itemProp="name">{p.title}</h3>

        {Array.isArray(p.places) && p.places.length > 0 && (
          <div className="tp-places">
            <MapPin /> <span itemProp="touristType">{p.places.slice(0, 3).join(" • ")}{p.places.length > 3 ? ` +${p.places.length - 3} more` : ""}</span>
          </div>
        )}

        {Array.isArray(p.tags) && p.tags.length > 0 && (
          <p className="tp-card__desc">{p.tags.slice(0, 3).join(" · ")}</p>
        )}

        <div className="tp-footer">
          <div className="tp-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <strong>{p.priceLabel || `From USD ${p.priceFrom} / ${p.person || 1} person`}</strong>
            <meta itemProp="priceCurrency" content="USD" />
            <meta itemProp="price" content={p.priceFrom} />
            <meta itemProp="availability" content="https://schema.org/InStock" />
          </div>

          <div className="tp-actions">
            <Link className="tp-btn tp-btn--ghost" to={`/trip/${p.id || p.tourId}`} aria-label={`View ${p.title} details`}>
              {p.local ? "View itinerary" : "View details"}
            </Link>

            <Link
              className="tp-btn tp-btn--gold"
              to="/quote"
              aria-label={`Get a quote for ${p.title}`}
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

/* ===== Page ===== */
export default function ViewAllTours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const catParam = searchParams.get("cat") || "All";
  const sortParam = searchParams.get("sort") || "popular";

  const [data, setData] = useState([FEATURED_PACKAGE]);
  const [q, setQ] = useState(qParam);
  const [cat, setCat] = useState(catParam);
  const [sort, setSort] = useState(sortParam);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    const uniq = (arr) => Array.from(new Set((arr || []).map((v) => String(v))));
    const cleanItinerary = (arr) => {
      const out = [];
      const seen = new Set();
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
        const res = await fetch(`${API_BASE}/api/tours`, { signal: ctrl.signal });
        const json = await res.json().catch(() => ({}));
        if (!alive) return;

        if (json?.ok !== true || !Array.isArray(json?.data)) {
          setErr("");
          setData([FEATURED_PACKAGE]);
        } else {
          const cleaned = json.data.map((p) => ({
            ...p,
            places: uniq(p.places),
            tags: uniq(p.tags),
            itinerary: cleanItinerary(p.itinerary),
          }));
          setErr("");
          setData(cleaned);
        }
      } catch (e) {
        if (alive && e.name !== "AbortError") {
          setErr("");
          setData([FEATURED_PACKAGE]);
        }
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    data.forEach((d) => d?.category && set.add(d.category));
    return ["All", ...Array.from(set)];
  }, [data]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (cat && cat !== "All") next.set("cat", cat);
    if (sort && sort !== "popular") next.set("sort", sort);
    setSearchParams(next, { replace: true });
  }, [q, cat, sort, setSearchParams]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = data.filter((p) => (cat === "All" ? true : p.category === cat));
    if (needle) {
      rows = rows.filter((p) => {
        const hay = `${p.title} ${p.places?.join(" ")} ${p.tags?.join(" ")} ${p.category}`.toLowerCase();
        return hay.includes(needle);
      });
    }

    const byPriceAsc = (a, b) => toNumber(a.priceFrom) - toNumber(b.priceFrom);
    const byPriceDesc = (a, b) => toNumber(b.priceFrom) - toNumber(a.priceFrom);
    const byDurationAsc = (a, b) => parseDays(a.duration) - parseDays(b.duration);

    if (sort === "price-asc") rows = [...rows].sort(byPriceAsc);
    else if (sort === "price-desc") rows = [...rows].sort(byPriceDesc);
    else if (sort === "duration-asc") rows = [...rows].sort(byDurationAsc);
    return rows;
  }, [data, q, cat, sort]);

  const shown = filtered.slice(0, visible);
  const canLoadMore = shown.length < filtered.length;
  const showToolbar = data.length > 1 || Boolean(q) || cat !== "All" || sort !== "popular";

  useEffect(() => setVisible(12), [q, cat, sort]);

  const barRef = useRef(null);
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const onScroll = () => el.classList.toggle("vt-toolbar--shadow", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ====== Page-level SEO ====== */
  // Canonical should ignore filters to avoid duplicate content.
  const CANONICAL = "https://www.mentytours.com/packages";
  const titleBase = "All Sri Lanka Tours & Holiday Packages | Menty Tours";
  const title =
    filtered.length > 0
      ? `Sri Lanka Tours (${filtered.length} packages) | Menty Tours`
      : titleBase;

  const descParts = [
    "Browse tailor-made Sri Lanka tour packages with local driver-guides.",
    cat !== "All" ? `Category: ${cat}.` : null,
    q ? `Search: “${q}”.` : null,
    "Top spots: Sigiriya, Kandy, Ella, Yala, Galle, Mirissa."
  ].filter(Boolean);
  const description = descParts.join(" ");

  const ogImage = "https://www.mentytours.com/og-cover.jpg";

  // ----- JSON-LD: ItemList of tours (top 20 from current results) -----
  const itemListJSON = useMemo(() => {
    const items = shown.slice(0, 20).map((p, idx) => {
      const priceObj = parsePrice(p.priceFrom);
      const url = `https://www.mentytours.com/trip/${encodeURIComponent(p.id || p.tourId)}`;
      return {
        "@type": "ListItem",
        position: idx + 1,
        url,
        name: p.title,
        item: {
          "@type": "TouristTrip",
          name: p.title,
          description: Array.isArray(p.tags) && p.tags.length ? p.tags.join(", ") : undefined,
          image: resolveImg(p.img || p.hero),
          url,
          offers: priceObj
            ? {
                "@type": "Offer",
                price: priceObj.price,
                priceCurrency: priceObj.currency,
                availability: "https://schema.org/InStock"
              }
            : undefined
        }
      };
    });
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items
    };
  }, [shown]);

  const webPageJSON = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${CANONICAL}#webpage`,
    url: CANONICAL,
    name: "All Sri Lanka Tours & Holiday Packages",
    description,
    isPartOf: { "@type": "WebSite", name: "Menty Tours Sri Lanka", url: "https://www.mentytours.com/" },
    primaryImageOfPage: { "@type": "ImageObject", contentUrl: ogImage }
  }), [description]);

  const breadcrumbJSON = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mentytours.com/" },
      { "@type": "ListItem", position: 2, name: "Packages", item: CANONICAL }
    ]
  };

  return (
    <>
      <Navbar forceDark />
      <SEO
        title={title}
        description={description}
        canonical={CANONICAL}
        ogImage={ogImage}
      />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJSON) }} />

      <main className="vt">
        <header className="vt-page-intro">
          <h1>Tour packages</h1>
          <p>Thoughtfully planned Sri Lanka journeys.</p>
        </header>
        {showToolbar && <section className="vt-toolbar" ref={barRef}>
          <div className="vt-row">
            <input
              className="vt-input"
              type="search"
              placeholder="Search tours, places, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search tours"
            />
            <label className="vt-field">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tours">
                <option value="popular">Most popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Short to Long</option>
              </select>
            </label>
          </div>

          <div className="vt-chips" role="tablist" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                className={`vt-chip ${cat === c ? "is-active" : ""}`}
                onClick={() => setCat(c)}
                role="tab"
                aria-selected={cat === c}
              >
                {c}
              </button>
            ))}
          </div>
        </section>}

        {loading && (
          <section className="vt-grid" aria-busy="true" aria-live="polite">
            {Array.from({ length: 8 }).map((_, i) => (
              <article className="tp-card tp-card--skeleton" key={`sk-${i}`}>
                <div className="tp-media skeleton-block" />
                <div className="tp-body">
                  <div className="skeleton-line" />
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
          </section>
        )}

        {!loading && err && <p className="vt-error" role="alert">{err}</p>}

        {!loading && !err && filtered.length === 0 && (
          <p className="vt-empty">
            No tours match your filters. Try clearing the search or picking a different category.
          </p>
        )}

        {!loading && !err && filtered.length > 0 && (
          <>
            <section className={`vt-grid ${data.length === 1 ? "vt-grid--single" : ""}`} aria-label="Tour packages">
              {shown.map((p) => (
                <TourCard key={p.tourId ?? p.id} p={p} />
              ))}
            </section>

            {canLoadMore && (
              <div className="vt-actions">
                <button className="tp-btn tp-btn--ghost tp-btn--xl" onClick={() => setVisible((v) => v + 12)}>
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

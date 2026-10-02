// src/components/Testimonials/Testominals.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./Testominals.css";
import SEO from "../../Components/Seo/SEO.jsx";
import Navbar from "../../Components/Navbar/Navbar";
import JourneyIntro from "../../Components/JourneyIntro/JourneyIntro";

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

    els.forEach((el) => {
      if (!el.classList.contains("show")) io.observe(el);
    });

    return () => io.disconnect();
  }, [selector, threshold, ...deps]);
}

/* ===== stars (display only) ===== */
function Stars({ value = 5, outOf = 5 }) {
  const v = Math.max(0, Math.min(outOf, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  return (
    <div className="tm-stars" aria-label={`${v} out of ${outOf} stars`} role="img">
      {"★".repeat(full)}
      {half ? "☆" : ""}
      {"☆".repeat(Math.max(0, empty))}
    </div>
  );
}

/* ===== helpers ===== */
function clampText(s = "", max = 220) {
  if (s.length <= max) return [s, false];
  const cut = s.slice(0, max).lastIndexOf(" ");
  return [s.slice(0, cut > 0 ? cut : max) + "…", true];
}

/* ===== Card ===== */
function ReviewCard({ t }) {
  const [expanded, setExpanded] = useState(false);
  const [short, clipped] = clampText(t.text || "", 220);
  const imgSrc = t.photo || t.avatar || "";
  const imgAlt = t.photo
    ? `${t.name} trip photo${t.trip ? ` — ${t.trip}` : ""}`
    : `${t.name} profile photo`;

  return (
    <article className="tm-card tm-reveal" itemScope itemType="https://schema.org/Review">
      <div className="tm-card-top">
        {imgSrc ? (
          <img
            className="tm-avatar"
            src={imgSrc}
            alt={imgAlt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="tm-avatar tm-avatar--placeholder" aria-hidden="true">{t.name?.charAt(0) || "G"}</div>
        )}
        <div className="tm-nameRow">
          <strong itemProp="author">{t.name}</strong>
          <span className="tm-meta">
            {t.country} • {t.trip}
          </span>
        </div>
        <meta itemProp="itemReviewed" content="Menty Tours Sri Lanka" />
        <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating" className="tm-stars-wrap">
          <Stars value={t.rating} />
          <meta itemProp="ratingValue" content={String(t.rating || 0)} />
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="worstRating" content="1" />
        </div>
      </div>

      <blockquote className={`tm-card-quote ${expanded ? "expanded" : ""}`} itemProp="reviewBody">
        {expanded ? (t.text || "") : short}
      </blockquote>

      <div className="tm-card-foot">
        <time className="tm-date" itemProp="datePublished" dateTime={t.date}>
          {t.date}
        </time>
        {clipped && (
          <button className="tm-link" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </article>
  );
}

/* ===== Rating input ===== */
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

/* ===== Write Review (form) ===== */
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
    return () => {
      alive = false;
    };
  }, []);

  const max = 1000;
  const left = Math.max(0, max - text.length);
  const valid =
    rating > 0 && name.trim() && country.trim() && text.trim().length >= 20 && agree && !website;

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreview("");
      return;
    }
    if (!/^image\//i.test(f.type)) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!valid) {
      setError("Please fill all required fields (min 20 characters review).");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("country", country.trim());
      fd.append("trip", trip || "Custom Trip");
      fd.append("rating", String(rating));
      fd.append("text", text.trim());
      fd.append("date", new Date().toISOString().slice(0, 10));
      if (file) fd.append("photo", file);

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
          <span>Name *</span>
          <input className="tm-inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </label>
        <label className="tm-field">
          <span>Country *</span>
          <input className="tm-inp" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., United Kingdom" required />
        </label>
      </div>

      <label className="tm-field">
        <span>Trip</span>
        <select value={trip} onChange={(e) => setTrip(e.target.value)} className="tm-select" aria-label="Select your trip">
          {tripOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="tm-field">
        <span>Your review *</span>
        <textarea
          className="tm-textarea"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, max))}
          placeholder="Tell future travelers about your experience…"
          rows={5}
          required
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
            <img src={preview} alt="Selected trip photo preview" loading="lazy" decoding="async" />
          </div>
        )}
      </label>

      {/* Honeypot */}
      <label className="tm-hidden">
        Website
        <input value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>

      <label className="tm-check">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>I agree to have my review published on this site.</span>
      </label>

      {error && <p className="tm-error" role="alert">{error}</p>}
      {done && <p className="tm-success" role="status">Thanks! Your review has been submitted.</p>}

      <div className="tm-actions">
        <button className="tm-btn" disabled={!valid || loading}>{loading ? "Submitting…" : "Submit review"}</button>
      </div>
    </form>
  );
}

function WriteReview({ onSubmit }) {
  const [open, setOpen] = useState(false);
  return (
    <section id="write-review" className="tm-write tm-reveal">
      <h2 className="tm-write-title">Write a review</h2>
      <p className="tm-write-sub">Share your trip highlights—help other travelers choose confidently.</p>
      <button className="tm-btn tm-btn--ghost" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? "Hide form" : "Start writing"}
      </button>
      {open && <WriteReviewForm onSubmit={onSubmit} />}
    </section>
  );
}

/* ===== All Reviews grid ===== */
function AllReviewsGrid({ items = [] }) {
  const [visible, setVisible] = useState(12);
  const shown = items.slice(0, visible);

  return (
    <section id="all-reviews" className="tm-all tm-reveal">
      <div className="tm-all-head">
        <h2>Sri Lanka tour reviews</h2>
        <span className="tm-all-meta">{items.length} total</span>
      </div>

      {items.length === 0 ? (
        <p className="tm-empty">No guest stories are available yet. Be the first to share your journey.</p>
      ) : (
        <>
          <div className="tm-grid">
            {shown.map((t, i) => (
              <ReviewCard key={i} t={t} />
            ))}
          </div>
          {visible < items.length && (
            <div className="tm-actions center">
              <button
                className="tm-btn tm-btn--ghost"
                onClick={() => setVisible((v) => Math.min(items.length, v + 12))}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ===== PAGE ===== */
export default function TestimonialsPage({ testimonials = DEFAULT_TESTIMONIALS }) {
  const [data, setData] = useState(testimonials);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load from API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/testimonials?limit=200&sort=recent`);
        const json = await res.json().catch(() => ({}));
        if (!alive) return;
        if (res.ok && json?.ok && Array.isArray(json.data)) {
          setApiLoaded(true);
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
        }
      } catch (e) {
        // Keep the guest stories already on the page when the API is unavailable.
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const { avg, count } = useMemo(() => {
    if (!data.length) return { avg: 0, count: 0 };
    const sum = data.reduce((a, b) => a + (Number(b.rating) || 0), 0);
    return { avg: Math.round((sum / data.length) * 10) / 10, count: data.length };
  }, [data]);

  useReveal(".tm-reveal", 0.16, [data.length]);

  // ======== Page-level SEO ========
  const pageUrl = "https://www.mentytours.com/testimonials";
  const seo = {
    title: "Menty Tours Reviews & Testimonials | Sri Lanka Tour Reviews",
    description:
      apiLoaded && count > 0
        ? `Read ${count} Menty Tours guest reviews — rated ${avg}/5 for private drivers and tailor-made Sri Lanka journeys.`
        : "Read Menty Tours guest stories and discover personal Sri Lanka journeys, friendly guides, and tailor-made itineraries.",
    canonical: pageUrl,
    ogImage: "https://www.mentytours.com/og-cover.jpg",
  };

  // JSON-LD (Organization + AggregateRating + recent Review samples)
  const orgJSON = {
    "@context": "https://schema.org",
    "@type": ["Organization", "TravelAgency", "LocalBusiness"],
    "@id": "https://www.mentytours.com/#organization",
    "name": "Menty Tours Sri Lanka",
    "url": "https://www.mentytours.com/",
    "logo": "https://www.mentytours.com/logo-mark.png",
    "image": "https://www.mentytours.com/og-cover.jpg",
    ...(apiLoaded && count > 0 ? { "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avg || 0,
      "reviewCount": count || 0,
      "bestRating": 5,
      "worstRating": 1
    }} : {}),
    "review": (apiLoaded ? data : []).slice(0, 20).map((t, i) => ({
      "@type": "Review",
      "author": t.name,
      "reviewBody": t.text,
      "reviewRating": { "@type": "Rating", "ratingValue": t.rating, "bestRating": 5, "worstRating": 1 },
      "datePublished": t.date,
      "name": `Traveler review #${i + 1}`
    }))
  };

  const webPageJSON = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    "url": pageUrl,
    "name": "Menty Tours Reviews & Testimonials",
    "description": seo.description,
    "isPartOf": { "@type": "WebSite", "name": "Menty Tours Sri Lanka", "url": "https://www.mentytours.com/" },
    "primaryImageOfPage": { "@type": "ImageObject", "contentUrl": "https://www.mentytours.com/og-cover.jpg" }
  };

  const breadcrumbJSON = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mentytours.com/" },
      { "@type": "ListItem", "position": 2, "name": "Testimonials", "item": pageUrl }
    ]
  };

  return (
    <>
    <Navbar forceDark />
    <main className="tm">
      <SEO {...seo} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJSON) }} />

      <JourneyIntro />

      {/* All reviews */}
      <div id="guest-reviews"><AllReviewsGrid items={data} /></div>

      <section className="tm-write-page-cta tm-reveal">
        <div>
          <span>Traveled with Menty Tours?</span>
          <h2>Share your Sri Lanka story</h2>
          <p>Your honest experience helps future guests travel with confidence.</p>
        </div>
        <a className="tm-btn" href="/write-review">Write a review →</a>
      </section>
    </main>
    </>
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
    avatar: "",
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
    avatar: "",
    photo: null,
  },
];


import { API_BASE } from "../../lib/apiConfig";
// src/Pages/TripDetails/TripDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TripDetails.css";
import { Landmark, Plane, Car, Sun } from "lucide-react";
import { viewURL } from "../../lib/adminApi";
import SEO from "../../Components/Seo/SEO.jsx";
import { FEATURED_PACKAGE } from "../../data/featuredTour";
import { useSiteContent } from "../../lib/SiteContent";

// --- API base (Vite or CRA env); fallback to backend port ---


const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'>
      <rect width='100%' height='100%' fill='#eaeaea'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            fill='#9a9a9a' font-family='Arial' font-size='20'>Image unavailable</text>
    </svg>`
  );

// Resolve images
const resolveImg = (src) => {
  const s = String(src || "").trim();
  if (!s) return FALLBACK_IMG;
  if (/^(https?:|data:)/i.test(s)) return s;
  if (/^\/(images|assets|static)\//i.test(s)) return s;
  const clean = s.replace(/^\/?(api\/uploads\/|uploads\/)/i, "");
  return viewURL(clean) || FALLBACK_IMG;
};

// Parse "priceFrom" like "USD 899" / "LKR 250000" / 899
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

export default function TripDetails() {
  const { collections, versions, loading: contentLoading } = useSiteContent();
  const { id } = useParams(); // slug or numeric id
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (contentLoading) return undefined;
    if (versions.tours !== undefined) {
      const managedTrip = collections.tours.find((tour) => tour.id === id);
      setTrip(managedTrip || null);
      setErr(managedTrip ? "" : "This package is no longer available.");
      setLoading(false);
      window.scrollTo(0, 0);
      return undefined;
    }
    if (id === FEATURED_PACKAGE.id) {
      setTrip(FEATURED_PACKAGE);
      setLoading(false);
      setErr("");
      window.scrollTo(0, 0);
      return undefined;
    }
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const url = `${API_BASE}/api/tours/${encodeURIComponent(id)}`;
        const res = await fetch(url, { signal: ctrl.signal });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = null; }

        if (!alive) return;

        if (!res.ok || !json || json.ok !== true || !json.data) {
          setErr((json && (json.error || json.message)) || `Failed to load tour (${res.status})`);
          setTrip(null);
        } else {
          const t = json.data;
          t.places = Array.isArray(t.places) ? t.places : [];
          t.tags = Array.isArray(t.tags) ? t.tags : [];
          t.itinerary = Array.isArray(t.itinerary) ? t.itinerary : [];
          setTrip(t);
        }
      } catch (e) {
        if (alive && e.name !== "AbortError") {
          setErr(e.message || "Network error");
          setTrip(null);
        }
      } finally {
        alive && setLoading(false);
      }
    })();

    window.scrollTo(0, 0);
    return () => { alive = false; ctrl.abort(); };
  }, [id, contentLoading, versions.tours, collections.tours]);

  // simple reveal
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [trip, loading]);

  const placesList = useMemo(() => (trip?.places || []).filter(Boolean).join(", "), [trip]);

  const overviewText = useMemo(() => {
    if (!trip) return "";
    if (trip.description && String(trip.description).trim().length > 0) return trip.description;
    return `Explore Sri Lanka on a ${trip.duration || "multi-day"} journey covering ${placesList || "top highlights"}. Experience nature, history, culture, and coastal beauty with local experts.`;
  }, [trip, placesList]);

  // ---------- Page SEO ----------
  const canonical = useMemo(
    () => `https://www.mentytours.com/packages/${encodeURIComponent(id)}`,
    [id]
  );

  const seoTitle = useMemo(() => {
    if (!trip?.title) return "Sri Lanka Tour | Menty Tours";
    const dur = trip.duration ? ` | ${trip.duration}` : "";
    return `${trip.title}${dur} — Sri Lanka Tour Package | Menty Tours`;
  }, [trip]);

  const seoDescription = useMemo(() => {
    const bits = [
      trip?.title,
      trip?.duration,
      (trip?.places?.length ? `Destinations: ${trip.places.slice(0, 6).join(", ")}` : null),
      (trip?.tags?.length ? `Themes: ${trip.tags.slice(0, 4).join(", ")}` : null),
      "Private driver, curated stays, airport pickup.",
    ].filter(Boolean);
    return bits.join(" · ");
  }, [trip]);

  const ogImage = useMemo(
    () => resolveImg(trip?.hero || trip?.img),
    [trip]
  );

  // ---------- JSON-LD ----------
  const ldTrip = useMemo(() => {
    if (!trip) return null;
    const priceObj = parsePrice(trip.priceFrom);
    const itineraryItems = (trip.itinerary || []).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d?.title || `Day ${i + 1}`,
      item: d?.place
        ? { "@type": "Place", name: d.place }
        : undefined,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: trip.title,
      description: overviewText,
      image: resolveImg(trip.hero || trip.img),
      itinerary: itineraryItems.length
        ? { "@type": "ItemList", itemListElement: itineraryItems }
        : undefined,
      offers: priceObj
        ? {
            "@type": "Offer",
            price: priceObj.price,
            priceCurrency: priceObj.currency,
            url: canonical,
            availability: "https://schema.org/InStock",
            validFrom: new Date().toISOString().split("T")[0]
          }
        : undefined,
      provider: {
        "@type": "Organization",
        name: "Menty Tours Sri Lanka",
        url: "https://www.mentytours.com/"
      },
      areaServed: "LK"
    };
  }, [trip, canonical, overviewText]);

  const ldWebPage = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: seoTitle,
    description: seoDescription,
    isPartOf: { "@type": "WebSite", name: "Menty Tours Sri Lanka", url: "https://www.mentytours.com/" },
    primaryImageOfPage: { "@type": "ImageObject", contentUrl: ogImage }
  }), [canonical, seoTitle, seoDescription, ogImage]);

  const ldBreadcrumbs = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mentytours.com/" },
      { "@type": "ListItem", position: 2, name: "Packages", item: "https://www.mentytours.com/packages" },
      { "@type": "ListItem", position: 3, name: trip?.title || "Trip", item: canonical }
    ]
  }), [trip, canonical]);

  if (loading) {
    return (
      <section className="trip-modern" aria-busy="true" aria-live="polite">
        <SEO title="Loading tour… | Menty Tours" description="Fetching tour details…" canonical={canonical} />
        <div className="trip-hero skeleton-hero" />
        <div className="trip-intro skeleton-block" />
        <div className="trip-itinerary skeleton-block tall" />
      </section>
    );
  }

  if (err || !trip) {
    return (
      <section className="trip-modern">
        <SEO
          title="Tour not found | Menty Tours"
          description="This Sri Lanka tour could not be found. Browse our best packages instead."
          canonical={canonical}
        />
        <div className="trip-error" role="alert">
          <p>❌ {err || "Tour not found"}</p>
          <button className="btn-outline" onClick={() => navigate("/packages")}>Back to packages</button>
        </div>
      </section>
    );
  }

  const goToQuote = () => {
    const pkg = {
      id: trip.id ?? trip.tourId ?? id,
      title: trip.title,
      duration: trip.duration,
      priceFrom: trip.priceFrom,
      person: trip.person ?? 2,
      img: resolveImg(trip.hero || trip.img),
      places: Array.isArray(trip.places) ? trip.places : [],
      tags: Array.isArray(trip.tags) ? trip.tags : [],
    };
    navigate(`/quote?pkg=${encodeURIComponent(pkg.title || "")}`, { state: { pkg } });
  };

  return (
    <section className="trip-modern">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        ogImage={ogImage}
      />
      {/* Structured Data */}
      {ldTrip && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldTrip) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldWebPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumbs) }} />

      {/* Hero */}
      <div className="trip-hero">
        <img
          src={resolveImg(trip.hero || trip.img)}
          alt={`${trip.title} — hero image`}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          loading="eager"
          fetchpriority="high"
        />
        <div className="trip-hero-overlay">
          <h1>{trip.title}</h1>
          <p>
            {trip.duration}
            {trip.places?.length ? ` | ${trip.places.join(" · ")}` : ""}
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="trip-intro reveal">
        <h2>Your Sri Lanka journey</h2>
        <p className="trip-description">{overviewText}</p>
        {trip.priceLabel && <p className="trip-package-price">{trip.priceLabel}</p>}

        <ul className="trip-tags" aria-label="Trip themes">
          {(trip.tags?.length ? trip.tags : ["Heritage", "Local Experiences", "Private Transport", "Scenic Views"])
            .slice(0, 6)
            .map((t, i) => (
              <li key={`${t}-${i}`} title={t}>
                {i === 0 && <Landmark size={18} aria-hidden="true" />}
                {i === 1 && <Plane size={18} aria-hidden="true" />}
                {i === 2 && <Car size={18} aria-hidden="true" />}
                {i >= 3 && <Sun size={18} aria-hidden="true" />}
                <span>{t}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Itinerary */}
      <div className="trip-itinerary reveal">
        <h2>Itinerary Highlights</h2>
        <div className="itinerary-list">
          {trip.itinerary.map((d, i) => (
            <div className="day-card" key={`${d.title || "Day"}-${i}`}>
              <img
                src={resolveImg(d.img)}
                alt={`Day ${i + 1}: ${d.title || "Highlight"} — ${trip.title}`}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                loading="lazy"
                decoding="async"
              />
              <div className="day-content">
                <h3>{d.title || `Day ${i + 1}`}</h3>
                {Array.isArray(d.activities) && d.activities.length > 0 ? (
                  <ul className="trip-day-activities">{d.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul>
                ) : <p>{d.desc}</p>}
              </div>
            </div>
          ))}
          {trip.itinerary.length === 0 && (
            <div className="day-card empty">
              <div className="day-content">
                <h3>Itinerary coming soon</h3>
                <p>We’re preparing day-by-day highlights for this tour.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {Array.isArray(trip.inclusions) && trip.inclusions.length > 0 && (
        <div className="trip-includes reveal">
          <p className="trip-section-kicker">ALL THE ESSENTIALS</p>
          <h2>What's included</h2>
          <ul className="trip-includes-list">
            {trip.inclusions.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="trip-cta reveal">
        <h2>Start Your Journey Today</h2>
        <p>Let’s plan your dream trip to Sri Lanka — tailored just for you.</p>
        <div className="cta-buttons">
          <button className="btn-outline" onClick={() => navigate("/tours")}>
            Back to packages
          </button>
          <button className="btn-primary" onClick={goToQuote}>
            Request a Quote
          </button>
        </div>
      </div>
    </section>
  );
}

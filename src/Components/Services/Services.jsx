import React, { useEffect, useRef, useState } from "react";
import "./Services.css";

/* ---- Robust scroll reveal (with guaranteed fallback) ---- */
const useReveal = () => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".sv-reveal"));
    if (!els.length) return;

    // Show immediately on mount (prevents "empty section" if IO fails)
    requestAnimationFrame(() => els.forEach(el => el.classList.add("show")));

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("show");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
      );
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }
  }, []);
};

/* ---- Inline SVG icon set ---- */
const Icon = ({ name }) => {
  const common = {
    width: 26, height: 26, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.8,
    strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true,
  };
  switch (name) {
    case "route":
      return (
        <svg {...common}>
          <circle cx="5" cy="17" r="2" />
          <circle cx="19" cy="7" r="2" />
          <path d="M7 17h6a4 4 0 0 0 4-4V7" />
          <path d="M9 17v-1.5" />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path d="M3 12l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5" />
          <path d="M5 12h14" />
          <rect x="2.5" y="12" width="19" height="5" rx="1.5" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </svg>
      );
    case "bed":
      return (
        <svg {...common}>
          <path d="M3 18v-8" />
          <path d="M3 12h18v6" />
          <rect x="5" y="10" width="5.5" height="2.5" rx="1" />
          <path d="M14 11h6" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="M10 13L2 9l1-2 9 3 7-7 2 2-7 7 3 9-2 1-4-8-3 3v3l-2 1v-5l3-3z" />
        </svg>
      );
    case "castle":
      return (
        <svg {...common}>
          <path d="M3 21V8l3-2 3 2 3-2 3 2 3-2v13" />
          <path d="M6 21v-6h4v6" />
          <path d="M14 21v-8h4v8" />
          <rect x="10" y="11" width="2" height="2" />
        </svg>
      );
    case "binocs":
      return (
        <svg {...common}>
          <circle cx="7" cy="15.5" r="3.5" />
          <circle cx="17" cy="15.5" r="3.5" />
          <path d="M10.5 6l-2 6" />
          <path d="M13.5 6l2 6" />
          <path d="M9 6h6l1 2H8z" />
        </svg>
      );
    case "train":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="12" rx="2" />
          <path d="M5 12h14" />
          <circle cx="9" cy="16.5" r="1.4" />
          <circle cx="15" cy="16.5" r="1.4" />
          <path d="M8 20l2-2h4l2 2" />
        </svg>
      );
    case "beach":
      return (
        <svg {...common}>
          <path d="M3 20h18" />
          <path d="M5 18s2-2 6-2 6 2 6 2" />
          <path d="M9 12c0-3.5 2.5-6 6-6" />
          <path d="M13 6l3-1 1 3" />
          <path d="M13 6l-1 4" />
        </svg>
      );
    case "guide":
      return <svg {...common}><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3l7 3v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6" /></svg>;
    case "headset":
      return <svg {...common}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="6" rx="2" /><rect x="17" y="13" width="4" height="6" rx="2" /><path d="M17 19c0 1-1 2-3 2h-2" /></svg>;
    default:
      return null;
  }
};

/* ---- Data ---- */
const SERVICES = [
  { icon: "plane", title: "Airport Transfers", desc: "Friendly meet-and-greet service with reliable pickup and drop-off.", tags: [] },
  { icon: "bed", title: "Handpicked Stays", desc: "Hotels and villas selected for comfort, location and warm hospitality.", tags: [] },
  { icon: "guide", title: "Expert Local Guides", desc: "Licensed English-speaking guides who bring every destination to life.", tags: [] },
  { icon: "shield", title: "Safe & Secure", desc: "Insured vehicles and professional drivers for complete peace of mind.", tags: [] },
  { icon: "route", title: "Custom Itineraries", desc: "Personal routes shaped around your interests, pace and budget.", tags: [] },
  { icon: "calendar", title: "Easy Booking", desc: "Simple planning, quick replies and clear pricing without surprises.", tags: [] },
  { icon: "headset", title: "24/7 Support", desc: "Helpful WhatsApp assistance before, during and after your journey.", tags: [] },
];

export default function Services({ onQuoteClick }) {
  useReveal();

  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  const slides = () => Array.from(trackRef.current?.querySelectorAll(".sv-slide") || []);

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  const scrollToIndex = (i) => {
    const s = slides();
    if (!s.length) return;
    const target = s[clamp(i, 0, s.length - 1)];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setIdx(Array.from(s).indexOf(target));
    }
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const s = slides();
    if (!s.length) return;

    // Find the slide whose left edge is closest to the current scrollLeft
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < s.length; i++) {
      const dist = Math.abs(s[i].offsetLeft - el.scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    }
    setIdx(closest);
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollToIndex(idx + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollToIndex(idx - 1); }
  };

  const prev = () => scrollToIndex(idx - 1);
  const next = () => scrollToIndex(idx + 1);

  return (
    <section className="sv-section" id="services" aria-label="Menty Tours Services">
      <div className="sv-container">
        <header className="sv-head sv-reveal">
          <p className="sv-eyebrow">Our Services</p>
          <h2 className="sv-title">Travel Sri Lanka, Made Easy</h2>
          <p className="sv-sub">
            From custom itineraries and trusted drivers to stays and transfers, we take care of the details.
          </p>
        </header>

        {/* Carousel wrapper (acts as grid on desktop) */}
        <div className="sv-carousel sv-reveal" role="region" aria-label="Services carousel">
          <button
            className="sv-nav sv-nav--prev"
            onClick={prev}
            aria-label="Previous service"
            disabled={idx === 0}
          >
            ‹
          </button>

          <div
            className="sv-track"
            ref={trackRef}
            onScroll={onScroll}
            onKeyDown={onKey}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Scrollable list of services"
          >
            {SERVICES.map(({ icon, title, desc, tags }, i) => (
              <article
                className="sv-card sv-slide"
                key={title}
                style={{ "--d": `${i * 0.06}s` }}
                aria-label={title}
              >
                <div className="sv-icon" aria-hidden="true">
                  <span className="sv-icon__ring" />
                  <Icon name={icon} />
                </div>

                <h3 className="sv-card__title">{title}</h3>
                <p className="sv-card__desc">{desc}</p>

                <div className="sv-tags">
                  {tags.map((t) => <span className="sv-tag" key={t}>{t}</span>)}
                </div>
              </article>
            ))}
          </div>

          <button
            className="sv-nav sv-nav--next"
            onClick={next}
            aria-label="Next service"
            disabled={idx >= SERVICES.length - 1}
          >
            ›
          </button>

          <div className="sv-dots" role="tablist" aria-label="Carousel pagination">
            {SERVICES.map((_, i) => (
              <button
                key={i}
                className={`sv-dot ${i === idx ? "is-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === idx}
                role="tab"
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        </div>

        
      </div>
    </section>
  );
}

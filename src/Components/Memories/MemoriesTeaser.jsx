// src/Components/Memories/MemoriesTeaser.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MemoriesTeaser.css";
import { viewURL } from "../../lib/adminApi";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function useReveal(selector = ".mem9-reveal", threshold = 0.14) {
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

/* ---- NEW: decide how many cards to show based on viewport ---- */
function useVisibleCount() {
  const get = () => {
    if (typeof window === "undefined") return 4; // SSR-safe default
    const w = window.innerWidth;
    if (w < 700) return 4;      // mobile
    if (w >= 980) return 4;     // desktop
    return 4;                   // tablet (nice middle value)
  };
  const [count, setCount] = useState(get);

  useEffect(() => {
    const onResize = () => setCount(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return count;
}

export default function MemoriesTeaserTrio() {
  useReveal();
  const [cards, setCards] = useState([]);
  const [err, setErr] = useState("");
  const visibleCount = useVisibleCount();

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();

    (async () => {
      try {
        // fetch more than we might show; we'll slice by viewport
        const res = await fetch(`${API_BASE}/api/memories?pinned=1&limit=12`, {
          signal: ctrl.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!alive) return;

        if (json?.ok === true) {
          const rows = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json?.data?.data)
            ? json.data.data
            : Array.isArray(json)
            ? json
            : [];
          setCards(
            rows.map((m) => ({
              id: m.id,
              src: resolveImg(m.img),
              title: m.title,
              place: m.place || "",
            }))
          );
          setErr("");
        } else {
          setErr(json?.error || "Could not load memories.");
        }
      } catch (e) {
        if (alive && e.name !== "AbortError") setErr(e.message || "Network error");
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
  }, []);

  const visibleCards = cards.slice(0, visibleCount);

  return (
    <section id="memories" className="mem9" aria-label="Tour memories">
      <header className="mem9-head mem9-reveal">
        <div className="mem9-badge">Tour Memories</div>
        <h2>Little moments. Big smiles.</h2>
        <p className="mem9-sub">
          From beach coconuts to mangrove safaris — a few highlights our guests keep talking about.
        </p>
      </header>

      {err && <div className="mem9-reveal" style={{ color: "#c00", padding: "0 8%" }}>{err}</div>}

      <div className="mem9-grid mem9-reveal">
        {visibleCards.map((c) => (
          <figure className="mem9-card" key={c.id}>
            <div className="art">
              <img
                src={c.src}
                alt={c.title}
                loading="lazy"
                decoding="async"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </div>
            <figcaption>
              <strong>{c.title}</strong>
              {c.place ? <span>{c.place}</span> : null}
            </figcaption>
          </figure>
        ))}
        {!visibleCards.length && !err && <p className="mem9-empty">No memories yet.</p>}
      </div>

      <div className="mem9-cta mem9-reveal">
        <Link to="/memories" className="tm-btn mem9-btn">Explore more</Link>
      </div>
    </section>
  );
}

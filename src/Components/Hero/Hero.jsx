import React, { useEffect, useRef, useState } from "react";
import "./Hero.css";
import heroVideo from "../../assets/hero.mp4";
import flagLK from "../../assets/sri-lanka-flag.svg";
import Loader from "../Loader/Loader";

export default function Hero() {
  const root = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = root.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const v = Math.min(1, Math.max(0, 1 - r.top / (window.innerHeight || 1)));
      el.style.setProperty("--scroll", v.toFixed(3));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);

    const rm = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const tryPlay = async () => {
      if (rm?.matches) { vid.pause(); return; }
      try { await vid.play(); el.classList.add("video-ready"); }
      catch { el.classList.remove("video-ready"); }
    };

    const vio = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? tryPlay() : vid.pause()),
      { threshold: 0.1 }
    );
    vio.observe(vid);

    return () => {
      io.disconnect(); vio.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="hero" ref={root} className="hero" aria-label="Sri Lanka hero">
      {loading && <Loader />}

      <video
        ref={videoRef}
        className="hero__video"
        muted playsInline loop preload="auto" autoPlay aria-hidden="true"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="hero__shade-left" aria-hidden="true" />
      <div className="hero__shade-bottom" aria-hidden="true" />

      <div className="container hero__frame">
        <div className="hero__content">
          <p
            className="eyebrow"
            aria-label="Authentic, tailor-made Sri Lanka journeys"
          >
            <img src={flagLK} alt="" className="flag-mini" aria-hidden="true" />
            <span className="eyebrow__text">
              Authentic journeys, made for you
            </span>
          </p>

          <h1 className="hero__title">
            <span className="hero__title-script">Explore</span>
            <span className="hero__title-main">SRI LANKA <em>YOUR WAY</em></span>
          </h1>
          <p className="hero__subtitle">
            Private journeys, local guides, and unforgettable places—all designed around you.
          </p>

          <div className="cta">
            <a className="btn btn--gold" href="/tours">Explore Tours →</a>
            <a className="btn btn--ghost" href="/quote">Request a Quote</a>
          </div>


        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useRef, useState } from "react";
import "./Hero.css";
import { useSiteContent } from "../../lib/SiteContent";
import flagLK from "../../assets/sri-lanka-flag.svg";
import Loader from "../Loader/Loader";

export default function Hero() {
  const { media } = useSiteContent();
  const videoSource = media("heroVideo")?.url || "";
  const poster = media("heroPoster")?.url || "";
  const root = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const el = root.current;
    const vid = videoRef.current;
    if (!el) return;
    el.classList.remove("video-ready");

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
      if (!vid) return;
      if (rm?.matches) { vid.pause(); return; }
      try { await vid.play(); el.classList.add("video-ready"); }
      catch { el.classList.remove("video-ready"); }
    };

    const vio = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? tryPlay() : vid?.pause()),
      { threshold: 0.1 }
    );
    if (vid) vio.observe(vid);

    return () => {
      io.disconnect(); vio.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [videoSource]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [videoSource]);

  return (
    <section id="hero" ref={root} className="hero" aria-label="Sri Lanka hero">
      {loading && <Loader />}

      {poster && <img className="hero__bg" src={poster} alt="" aria-hidden="true" />}
      {videoSource && <video key={videoSource} src={videoSource} poster={poster} onError={() => root.current?.classList.remove("video-ready")}
        ref={videoRef}
        className="hero__video"
        muted playsInline loop preload="auto" autoPlay aria-hidden="true"
      >

      </video>}

      <div className="hero__shade-left" aria-hidden="true" />
      <div className="hero__shade-bottom" aria-hidden="true" />

      <div className="container hero__frame">
        <div className="hero__content">
         
          <h1 className="hero__title">
            <span className="hero__title-script">Explore</span>
            <span className="hero__title-main">SRI LANKA <em>YOUR WAY</em></span>
          </h1>
          <p className="hero__subtitle">
            Private journeys, local guides, and unforgettable places all designed around you.
          </p>

          <div className="cta">
            <a className="btn btn--gold" href="/tours">Explore Tours →</a>
            <a className="btn btn--ghost" href="/quote">Request a Quote</a>
          </div>
          <ul className="hero__details" aria-label="Your Menty journey">
            <li><span>01</span>Private journeys</li>
            <li><span>02</span>Local expertise</li>
            <li><span>03</span>Your own pace</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

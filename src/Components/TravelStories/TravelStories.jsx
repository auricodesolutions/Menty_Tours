import React, { useEffect, useRef, useState } from "react";
import "./TravelStories.css";

import { useSiteContent } from "../../lib/SiteContent";

export default function TravelStories() {
  const { collections } = useSiteContent();
  const stories = collections.stories;
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const visible = useRef(false);
  const paused = useRef(false);
  const pauseUntil = useRef(0);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (!("IntersectionObserver" in window)) { visible.current = true; return undefined; }
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; });
    observer.observe(section);
    return () => observer.disconnect();
  }, [stories.length]);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!stories.length) return;
      if (!visible.current || paused.current || document.hidden || reducedMotion.matches || Date.now() < pauseUntil.current) return;
      setActive((current) => (current + 1) % stories.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [stories.length]);
  const selected = stories.length ? active % stories.length : 0;
  const orderedStories = stories.length ? [stories[selected], ...stories.filter((_, index) => index !== selected)] : [];
  if (!stories.length) return null;
  return (
    <section className="travel-stories" ref={sectionRef} aria-labelledby="travel-stories-title"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false; }}
      onTouchStart={() => { pauseUntil.current = Date.now() + 8000; }}>
      <div className="travel-stories__inner">
        <header className="travel-stories__heading">
          <span>Inspired by the island</span>
          <h2 id="travel-stories-title">Travel stories</h2>
          <p>A little inspiration for your Sri Lanka journey, from timeless heritage to life by the ocean.</p>
        </header>
        <div className="travel-stories__grid">
          {orderedStories.map((story, index) => (
            <article className={`travel-story${index === 0 ? " travel-story--featured" : ""}`} key={index === 0 ? "featured-story" : story.title} tabIndex={index === 0 ? 0 : undefined}>
              <div className="travel-story__image"><img key={story.title} src={story.image} alt={story.alt} loading="lazy" decoding="async" /></div>
              <div className="travel-story__copy" key={story.title}>
                <span>{story.category}</span>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

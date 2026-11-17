import React, { useCallback, useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import "./PopularDestinations.css";


import { useSiteContent } from "../../lib/SiteContent";

export default function PopularDestinations() {
  const { collections } = useSiteContent();
  const destinations = collections.destinations;
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const isVisible = useRef(false);
  const isPaused = useRef(false);
  const pauseUntil = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      isVisible.current = true;
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const move = useCallback((direction) => {
    const slider = sliderRef.current;
    const cards = slider?.querySelectorAll(".destination-card");
    if (!slider || !cards?.length) return;
    const positions = Array.from(cards, (card) => card.offsetLeft - cards[0].offsetLeft);
    const current = positions.reduce((closest, position, index) =>
      Math.abs(position - slider.scrollLeft) < Math.abs(positions[closest] - slider.scrollLeft) ? index : closest, 0);
    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const atEnd = slider.scrollLeft >= maxScroll - 2;
    const next = (current + direction + cards.length) % cards.length;
    slider.scrollTo({
      left: direction > 0 && atEnd ? 0 : direction < 0 && slider.scrollLeft <= 2 ? maxScroll : Math.min(positions[next], maxScroll),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden || !isVisible.current || isPaused.current || Date.now() < pauseUntil.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      move(1);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [move]);

  const slide = (direction) => {
    pauseUntil.current = Date.now() + 8000;
    move(direction);
  };

  return (
    <section
      className="popular-destinations"
      ref={sectionRef}
      aria-labelledby="popular-destinations-title"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onFocusCapture={() => { isPaused.current = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) isPaused.current = false;
      }}
      onTouchStart={() => { pauseUntil.current = Date.now() + 8000; }}
    >
      <div className="popular-destinations__inner">
        <div className="popular-destinations__intro">
          <p className="popular-destinations__eyebrow">Explore Sri Lanka</p>
          <h2 id="popular-destinations-title">Popular Destinations</h2>
          <p className="popular-destinations__copy">
            Slide through the island&apos;s ancient cities, misty hills, vibrant streets, and tropical coasts.
          </p>

          <a className="popular-destinations__link" href="/tours">
            Explore all places <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div
          className="popular-destinations__slider"
          ref={sliderRef}
          tabIndex="0"
          aria-label="Sri Lanka destinations"
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            slide(event.key === "ArrowRight" ? 1 : -1);
          }}
        >
          {destinations.map((destination) => (
            <a
              className={`destination-card${destination.featured ? " destination-card--featured" : ""}`}
              href="/tours"
              key={destination.name}
              aria-label={`Explore ${destination.name}, ${destination.region}`}
            >
              <img src={destination.image} alt={`${destination.name}, Sri Lanka`} loading="lazy" />
              <span className="destination-card__shade" aria-hidden="true" />
              <span className="destination-card__arrow" aria-hidden="true">
                <ArrowUpRight size={17} strokeWidth={2} />
              </span>
              <span className="destination-card__content">
                <strong>{destination.name}</strong>
                <span>{destination.region}</span>
                <small>{destination.description}</small>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

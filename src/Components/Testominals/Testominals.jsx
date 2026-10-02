import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Testominals.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const FALLBACK_REVIEWS = [
  { name: "Emma W.", country: "United Kingdom", trip: "Classic Sri Lanka", rating: 5, text: "Every detail felt effortless. Our guide was warm, patient and incredibly knowledgeable, and the journey from Sigiriya to Ella was unforgettable." },
  { name: "Luca B.", country: "Italy", trip: "Beaches & Wildlife", rating: 5, text: "A beautifully planned holiday with a clean vehicle, thoughtful hotel choices and the flexibility to add Yala at the last minute." },
  { name: "Sofia M.", country: "Spain", trip: "Sri Lanka Highlights", rating: 5, text: "Menty Tours made us feel looked after from the airport welcome to our final beach stay. Professional, friendly and genuinely personal." },
  { name: "Daniel K.", country: "Germany", trip: "Hill Country Escape", rating: 5, text: "The route was perfectly paced and our driver always knew the best viewpoints and local stops. We would travel with Menty again." },
];

function Stars({ value = 5 }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < rating ? "filled" : ""}>★</span>)}</span>;
}

function PreviewCard({ review, position, onClick }) {
  return (
    <button type="button" className={`review-card review-card--${position}`} onClick={onClick} aria-label={`${position === "active" ? "Current" : "Show"} review by ${review.name}`}>
      <span className="review-card__quote" aria-hidden="true">“</span>
      <Stars value={review.rating} />
      <p>{review.text}</p>
      <span className="review-card__person">{review.name}</span>
      <span className="review-card__meta">{review.country} · {review.trip}</span>
    </button>
  );
}

export default function Testominals() {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const sectionRef = useRef(null);
  const isVisible = useRef(false);
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

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/testimonials?limit=12&sort=recent`, { signal: controller.signal })
      .then((response) => response.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json.data) && json.data.length) {
          setReviews(json.data.map((item) => ({ name: item.name || "Menty Tours guest", country: item.country || "Traveler", trip: item.trip || "Tailor-made tour", rating: Number(item.rating) || 5, text: item.text || "A wonderful Sri Lankan journey with Menty Tours." })));
        }
      }).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (reviews.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden && isVisible.current && !paused.current && Date.now() >= pauseUntil.current) {
        setActive((value) => (value + 1) % reviews.length);
      }
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  const visible = useMemo(() => ({ previous: (active - 1 + reviews.length) % reviews.length, next: (active + 1) % reviews.length }), [active, reviews.length]);
  const select = (index) => {
    pauseUntil.current = Date.now() + 8000;
    setActive(index);
  };
  const move = (direction) => {
    pauseUntil.current = Date.now() + 8000;
    setActive((value) => (value + direction + reviews.length) % reviews.length);
  };

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="reviews-section"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onFocusCapture={() => { paused.current = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false;
      }}
      onTouchStart={() => { pauseUntil.current = Date.now() + 8000; }}
    >
      <div className="reviews-heading">
        <span className="reviews-eyebrow">Guest stories</span>
        <h2>Journeys worth remembering</h2>
        <p>Real experiences from travelers who explored Sri Lanka with Menty Tours.</p>
      </div>
      <div className="reviews-carousel" aria-live="polite">
        <button className="reviews-arrow reviews-arrow--left" onClick={() => move(-1)} aria-label="Previous review">←</button>
        <PreviewCard review={reviews[visible.previous]} position="side" onClick={() => select(visible.previous)} />
        <PreviewCard key={active} review={reviews[active]} position="active" onClick={() => {}} />
        <PreviewCard review={reviews[visible.next]} position="side" onClick={() => select(visible.next)} />
        <button className="reviews-arrow reviews-arrow--right" onClick={() => move(1)} aria-label="Next review">→</button>
      </div>
      <div className="reviews-dots" aria-label="Choose a review">
        {reviews.map((review, index) => <button key={`${review.name}-${index}`} className={index === active ? "is-active" : ""} onClick={() => select(index)} aria-label={`Review ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}
      </div>
      <div className="reviews-actions">
        <Link className="reviews-button reviews-button--primary" to="/testimonialsPage">Read all reviews <span>→</span></Link>
        <Link className="reviews-button reviews-button--secondary" to="/write-review">Write a review</Link>
      </div>
    </section>
  );
}

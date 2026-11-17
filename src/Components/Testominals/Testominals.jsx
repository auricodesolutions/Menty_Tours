import { API_BASE } from "../../lib/apiConfig";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { useSiteContent } from "../../lib/SiteContent";
import "./Testominals.css";


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
  const featured = position === "active";
  const Card = featured ? "article" : "button";
  return (
    <Card type={featured ? undefined : "button"} className={`review-card review-card--${position}`} onClick={featured ? undefined : onClick} aria-label={`${featured ? "Current" : "Show"} review by ${review.name}`}>
      <span className="review-card__story">
        <span className="review-card__trip">{review.trip}</span>
        <span className="review-card__quote" aria-hidden="true">“</span>
        <span className="review-card__text">{review.text}</span>
      </span>
      <span className="review-card__traveler">
        <span className="review-card__avatar" aria-hidden="true"><UserRound size={30} strokeWidth={1.8} /></span>
        <Stars value={review.rating} />
        <span className="review-card__person">{review.name}</span>
        <span className="review-card__meta">{review.country}</span>
      </span>
    </Card>
  );
}

export default function Testominals() {
  const { media } = useSiteContent();
  const reviewsBackground = media("reviewsBackground");
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const sectionRef = useRef(null);
  const isVisible = useRef(false);
  const pauseUntil = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      if (reducedMotion.matches) {
        section.style.setProperty("--reviews-parallax", "0px");
        return;
      }
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const offset = (window.innerHeight / 2 - bounds.top - bounds.height / 2) * .2;
      section.style.setProperty("--reviews-parallax", `${Math.max(-80, Math.min(80, offset))}px`);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, []);

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
        if (json?.ok && Array.isArray(json.data)) {
          setReviews(json.data.map((item) => ({ name: item.name || "Menty Tours guest", country: item.country || "Traveler", trip: item.trip || "Tailor-made tour", rating: Number(item.rating) || 5, text: item.text || "A wonderful Sri Lankan journey with Menty Tours." })));
          setActive(0);
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
      <div className="reviews-backdrop" aria-hidden="true">
        {reviewsBackground && <img src={reviewsBackground.url} alt="" loading="lazy" decoding="async" />}
      </div>
      <div className="reviews-heading">
        <span className="reviews-eyebrow">Guest stories</span>
        <h2>Journeys worth remembering</h2>
        <p>Real experiences from travelers who explored Sri Lanka with Menty Tours.</p>
      </div>
      {reviews.length > 0 ? <div className="reviews-carousel" aria-live="polite">
        <PreviewCard review={reviews[visible.previous]} position="side" onClick={() => select(visible.previous)} />
        <PreviewCard key={active} review={reviews[active]} position="active" onClick={() => {}} />
        <PreviewCard review={reviews[visible.next]} position="side" onClick={() => select(visible.next)} />
      </div> : <p className="reviews-empty">Your journey could inspire the next guest. Share your experience with Menty Tours.</p>}
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

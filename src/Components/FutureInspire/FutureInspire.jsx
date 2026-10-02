import React, { useEffect, useRef } from "react";
import "./FutureInspire.css";
import bg from "../../assets/srilanka.jpg";

export default function FutureInspire() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = null;
    let currentPosition = null;
    let targetPosition = 0;
    let lastFrameTime = null;
    let needsMeasure = true;

    const animateImage = (time) => {
      frame = null;
      if (reducedMotion.matches) {
        currentPosition = 0;
        lastFrameTime = null;
        image.style.transform = "translate3d(0, 0, 0)";
        return;
      }

      if (needsMeasure) {
        const bounds = section.getBoundingClientRect();
        const travel = window.innerHeight + bounds.height;
        const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / travel));
        targetPosition = 80 - progress * 160;
        needsMeasure = false;
      }

      if (currentPosition === null) currentPosition = targetPosition;
      const elapsed = lastFrameTime === null ? 16 : Math.min(time - lastFrameTime, 64);
      lastFrameTime = time;
      const easing = 1 - Math.exp(-elapsed / 90);
      currentPosition += (targetPosition - currentPosition) * easing;

      if (Math.abs(targetPosition - currentPosition) < 0.1) {
        currentPosition = targetPosition;
        lastFrameTime = null;
      }

      image.style.transform = `translate3d(0, ${currentPosition}px, 0)`;
      if (currentPosition !== targetPosition) frame = window.requestAnimationFrame(animateImage);
    };

    const requestUpdate = () => {
      needsMeasure = true;
      if (frame === null) frame = window.requestAnimationFrame(animateImage);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="divider" id="travel-divider" ref={sectionRef} aria-labelledby="divider-title">
      <div className="divider-image" ref={imageRef} style={{ backgroundImage: `url(${bg})` }} aria-hidden="true" />
      <div className="divider-overlay" aria-hidden="true" />
      <div className="divider-content">
        <h2 id="divider-title">Protect Nature. Inspire Future Generations.</h2>
        <p>
          We invest in Sri Lanka’s youth and the environment — from school workshops to reforestation,
          beach cleanups, and wildlife stewardship — so every journey today protects nature and creates
          brighter paths for tomorrow.
        </p>
        
      </div>
    </section>
  );
}

import React, { useEffect, useRef } from "react";
import "./Footer.css";

import fbIcon from "../../assets/icons/facebook-icon.svg";
import waIcon from "../../assets/icons/whatsapp-icon.svg";
import tripIcon from "../../assets/icons/tripadvisor-icon.svg";

export default function Footer() {
  const ref = useRef(null);

  // Reveal on scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && el.classList.add("mf-show"),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Business constants (edit for your site)
  const BRAND = "Menty Tours Sri Lanka";
  const TAGLINE =
    "Where professionalism meets paradise — travel Sri Lanka with us.";
  const PHONE_DISPLAY = "+94 777 174 175";
  const PHONE_INTL = "94777174175";
  const EMAIL = "mentytours.sl@gmail.com";
  const ADDRESS = "47/9, Thissa Road, Wadduwa, Sri Lanka.";
  const FB_URL = "https://www.facebook.com/profile.php?id=61581019313465";
  const TRIP_URL = "https://www.tripadvisor.com/Profile/mentytours";

  // Footer bottom links
  const AURI_URL = "https://www.auricodesolutions.com/";            // ← your company site
  const TERMS_URL = "/terms-and-conditions";         // ← adjust to your route

  return (
    <footer className="mf-footer" ref={ref} aria-labelledby="footer-title">
      {/* Decorative wave top */}
      <div className="mf-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 84" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wf" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.20" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C240,120 420,0 720,40 C1020,80 1200,10 1440,40 L1440,84 L0,84 Z"
            fill="url(#wf)"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="mf-wrap">
        <section className="mf-col">
          <h2 id="footer-title" className="mf-brand">
            {BRAND}
          </h2>
          <p className="mf-tag">{TAGLINE}</p>

          <ul className="mf-contact">
            <li>
              <span className="mf-ic" aria-hidden="true">
                {/* phone */}
                <svg viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.89.3 1.76.57 2.6a2 2 0 0 1-.45 2.11L9.1 10.9a16 16 0 0 0 4 4l1.47-1.12a2 2 0 0 1 2.11-.45c.84.27 1.71.45 2.6.57A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href={`tel:${PHONE_INTL}`}>{PHONE_DISPLAY}</a>
            </li>
            <li>
              <span className="mf-ic" aria-hidden="true">
                {/* email */}
                <svg viewBox="0 0 24 24">
                  <path d="M22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2l10 7L22 6z" />
                  <path d="M22 6l-10 7L2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z" />
                </svg>
              </span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <span className="mf-ic" aria-hidden="true">
                {/* map pin */}
                <svg viewBox="0 0 24 24">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
              </span>
              <span>{ADDRESS}</span>
            </li>
          </ul>

          <div className="mf-social">
            {/* Facebook */}
            <a
              className="mf-sc mf-sc--fb"
              href={FB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <img src={fbIcon} alt="" width="22" height="22" loading="lazy" />
            </a>

            {/* WhatsApp */}
            <a
              className="mf-sc mf-sc--wa"
              href={`https://wa.me/${PHONE_INTL}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
            >
              <img src={waIcon} alt="" width="22" height="22" loading="lazy" />
            </a>

            {/* TripAdvisor */}
            <a
              className="mf-sc mf-sc--trip"
              href={TRIP_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="TripAdvisor"
            >
              <img src={tripIcon} alt="" width="22" height="22" loading="lazy" />
              <span className="mf-badge">TripAdvisor</span>
            </a>
          </div>
        </section>

        <nav className="mf-col mf-links" aria-label="Footer">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/tours">See Tours</a></li>
            <li><a href="/packages">Packages</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>

        <section className="mf-col mf-hours">
          <h3>Support</h3>
          <ul>
            <li>Licensed guides & insured vehicles</li>
            <li>24/7 WhatsApp assistance</li>
            <li>Custom itineraries & family-friendly planning</li>
            <li>Secure advance payments</li>
          </ul>

          <div className="mf-counter" aria-label="Visitor highlights">
            <div className="mf-pill">
              <span className="mf-dot" /> 12+ Years of Expertise
            </div>
            <div className="mf-pill">
              <span className="mf-dot mf-dot--gold" /> 2300+ Happy Travellers
            </div>
          </div>
        </section>
      </div>

      {/* Bottom bar with centered Auricode pill */}
      <div className="mf-bottom">
        <span className="mf-copy">
          © {new Date().getFullYear()} {BRAND} — All rights reserved.
        </span>

        <a
          href={AURI_URL}
          className="mf-credit"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Crafted by Auricode Solutions"
        >
          <span className="mf-credit-dot" aria-hidden="true" />
          <span className="mf-credit-text">
            Crafted by <strong>Auricode Solutions</strong>
          </span>
        </a>

        {/* <a href={TERMS_URL} className="mf-terms">
          Terms &amp; Conditions
        </a> */}
      </div>
    </footer>
  );
}

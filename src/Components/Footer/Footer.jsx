import React, { useEffect, useRef } from "react";
import { Instagram } from "lucide-react";
import "./Footer.css";
import logo from "../../assets/menty-tours-logo.png";
import fbIcon from "../../assets/icons/facebook-icon.svg";
import waIcon from "../../assets/icons/whatsapp-mark.svg";

const PHONE_DISPLAY = "+94 777 174 175";
const PHONE_INTL = "94777174175";
const EMAIL = "mentytours.sl@gmail.com";
const ADDRESS = "47/9, Thissa Road, Wadduwa, Sri Lanka";

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const element = footerRef.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) { element.classList.add("mf-show"); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.classList.add("mf-show"); observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="mf-footer" id="contact" ref={footerRef} aria-labelledby="footer-title">
      <div className="mf-main">
        <section className="mf-brand-column">
          <a className="mf-brand" href="/" aria-label="Menty Tours home">
            <img src={logo} alt="Menty Tours" />
            <div><h2 id="footer-title">MENTY TOURS</h2><span>Sri Lanka</span></div>
          </a>
          <p>Where professionalism meets paradise. Discover Sri Lanka through thoughtfully planned, tailor-made journeys.</p>
          <div className="mf-social" aria-label="Menty Tours social media">
            <a className="mf-social__link--facebook" href="https://www.facebook.com/profile.php?id=61581019313465" target="_blank" rel="noopener noreferrer" aria-label="Menty Tours on Facebook (opens in a new tab)"><span className="mf-social__icon"><img src={fbIcon} alt="" /></span><span>Facebook</span></a>
            <a className="mf-social__link--whatsapp" href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with Menty Tours on WhatsApp (opens in a new tab)"><span className="mf-social__icon"><img src={waIcon} alt="" /></span><span>WhatsApp</span></a>
            <a className="mf-social__link--instagram" href="https://www.instagram.com/mentytours/" target="_blank" rel="noopener noreferrer" aria-label="Menty Tours on Instagram (opens in a new tab)"><span className="mf-social__icon"><Instagram size={27} strokeWidth={2.2} aria-hidden="true" /></span><span>Instagram</span></a>
          </div>
        </section>

        <nav className="mf-links" aria-label="Footer navigation">
          <p className="mf-label">Explore</p>
          <a href="/">Home</a>
          <a href="/tours">Tour packages</a>
          <a href="/about-us">About Us</a>
          <a href="/about-sri-lanka">About Sri Lanka</a>
          <a href="/testimonialsPage">Guest reviews</a>
        </nav>

        <section className="mf-journey">
          <p className="mf-label">Start your journey</p>
          <h3>Let’s plan your Sri Lanka story</h3>
          <p>Tell us your dates and travel style. We’ll create a personal route around what matters to you.</p>
          <a className="mf-plan" href="/quote">Plan my trip <span>↗</span></a>
        </section>

        <section className="mf-contact">
          <p className="mf-label">Contact us</p>
          <a className="mf-contact__lead" href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noreferrer">Send us a message <span>→</span></a>
          <dl>
            <div><dt>Call or WhatsApp</dt><dd><a href={`tel:${PHONE_INTL}`}>{PHONE_DISPLAY}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${EMAIL}`}>{EMAIL}</a></dd></div>
            <div><dt>Visit</dt><dd>{ADDRESS}</dd></div>
          </dl>
          <ul className="mf-support">
            <li>Licensed guides & insured vehicles</li>
            <li>24/7 WhatsApp assistance</li>
          </ul>
        </section>
      </div>

      <div className="mf-bottom">
        <span>© {new Date().getFullYear()} Menty Tours Sri Lanka. All rights reserved.</span>
        <span>Custom itineraries · Family-friendly planning · Secure payments</span>
        <a href="https://www.auricodesolutions.com/" target="_blank" rel="noopener noreferrer">Crafted by <strong>Auricode Solutions</strong></a>
      </div>
    </footer>
  );
}

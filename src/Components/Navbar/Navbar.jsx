import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/menty-tours-logo.png";

export default function Navbar({ forceDark = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const root = document.getElementById("root");
      const heroTop = document.getElementById("hero")?.getBoundingClientRect().top ?? 0;
      const scrollTop = Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0,
        root?.scrollTop || 0
      );
      setScrolled(scrollTop > 20 || heroTop < -20);
    };

    const scrollTargets = [window, document, document.documentElement, document.body];
    onScroll();
    scrollTargets.forEach((target) =>
      target.addEventListener("scroll", onScroll, { passive: true, capture: true })
    );
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      scrollTargets.forEach((target) =>
        target.removeEventListener("scroll", onScroll, { capture: true })
      );
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled || forceDark ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <a href="/" className="nav-logo">
          <span className="nav-logo__mark" aria-hidden="true">
            <img src={logo} alt="" />
          </span>
          <span className="nav-logo__name">MENTY TOURS</span>
        </a>

        {/* Desktop links */}
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/tours">Packages</a>
          <a href="/about-us">About Us</a>
          <a href="/#contact">Contact Us</a>
          <a href="/quote" className="nav-btn">
            <span>Plan My Trip</span>
            <span className="nav-btn__icon" aria-hidden="true">↗</span>
          </a>
        </nav>

        

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        {/* Overlay */}
        <div
          className={`overlay ${menuOpen ? "show" : ""}`}
          onClick={() => setMenuOpen(false)}
        ></div>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <a href="/" className="drawer-logo" onClick={() => setMenuOpen(false)}>
              <img src={logo} alt="" aria-hidden="true" />
              <span>MENTY TOURS</span>
            </a>
            <button
              className="close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <nav className="drawer-links">
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="/tours" onClick={() => setMenuOpen(false)}>Packages</a>
            <a href="/about-us" onClick={() => setMenuOpen(false)}>About Us</a>
            <a href="/#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
            <a href="/quote" className="drawer-btn" onClick={() => setMenuOpen(false)}>
              Plan My Trip
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

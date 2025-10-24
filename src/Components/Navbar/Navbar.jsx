import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import flagLK from "../../assets/sri-lanka-flag.svg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
  }, [menuOpen]);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <a href="/" className="nav-logo">
          <img src={logo} alt="Menty Tours" />
          <span>MENTY TOURS</span>
        </a>

        {/* Desktop links */}
        <nav className="nav-links">
          <a href="#hero">Home</a>
          <a href="#packages">Packages</a>
          <a href="#memories">Memories</a>
          <a href="#contact">Contact Us</a>
          <a href="/quote" className="nav-btn">Plan My Trip</a>
        </nav>

        {/* 3D Sri Lankan Flag — DESKTOP (fixed to viewport right) */}
        <a
          className="flag-3d flag-3d--desktop animate"
          href="https://www.srilanka.travel/"
          title="Sri Lanka"
          aria-label="Sri Lankan flag"
          target="_blank"
          rel="noreferrer"
        >
          <span className="flag-face">
            <img src={flagLK} alt="Sri Lankan flag" />
          </span>
        </a>

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
              <img src={logo} alt="Menty Tours" />
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
            <a href="#hero" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#packages" onClick={() => setMenuOpen(false)}>Packages</a>
            <a href="#memories" onClick={() => setMenuOpen(false)}>Memories</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
            <a href="/quote" className="drawer-btn" onClick={() => setMenuOpen(false)}>
              Plan My Trip
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

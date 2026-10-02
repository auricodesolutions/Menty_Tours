import React, { useEffect } from "react";
import "./OurPartners.css";
import tripadvisor from "../../assets/Partners/Tripadvisor.png";
import resplendent from "../../assets/Partners/logo-resplendent.png";
import cinnamon from "../../assets/Partners/logo-cinnamon.png";
import view360 from "../../assets/Partners/logo-view360.png";
import sltda from "../../assets/Partners/sltda_logo.png";
import hilton from "../../assets/Partners/logo-hilton.png";

const DEFAULT_PARTNERS = [
  { name: "Sri Lanka Tourism Development Authority", short: "SLTDA", logo: sltda, href: "https://www.sltda.gov.lk/", type: "Tourism authority" },
  { name: "Tripadvisor", short: "Tripadvisor", logo: tripadvisor, href: "https://www.tripadvisor.com/Profile/mentytours", type: "Traveler reviews" },
  { name: "Cinnamon Hotels & Resorts", short: "Cinnamon", logo: cinnamon, href: "https://www.cinnamonhotels.com/", type: "Hotel partner" },
  { name: "Hilton Hotels & Resorts", short: "Hilton", logo: hilton, href: "https://www.hilton.com/", type: "Hotel partner" },
  { name: "Resplendent Ceylon", short: "Resplendent", logo: resplendent, href: "https://www.resplendentceylon.com/", type: "Luxury stays" },
  { name: "View 360 Kandy", short: "View 360", logo: view360, href: "https://www.view360kandy.com/", type: "Accommodation" },
];

export default function OurPartners({ items = DEFAULT_PARTNERS }) {
  useEffect(() => {
    const element = document.querySelector(".partners-shell");
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) { element.classList.add("show"); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.classList.add("show"); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="partners-section" id="partners" aria-labelledby="partners-title">
      <div className="partners-shell">
        <header className="partners-intro">
          <span>Our network</span>
          <h2 id="partners-title">Trusted by our travelers &amp; partners</h2>
          <p>Working with trusted names across Sri Lanka.</p>
          <div className="partners-proof"><strong>Licensed</strong><i /><strong>Verified</strong><i /><strong>Local</strong></div>
        </header>

        <ul className="partners-grid">
          {items.map((partner, index) => (
            <li key={partner.name} style={{ "--partner-delay": `${index * 70}ms` }}>
              <a href={partner.href} target="_blank" rel="noreferrer" aria-label={`Visit ${partner.name}`}>
                <div className="partner-logo"><img src={partner.logo} alt={partner.name} loading="lazy" /></div>
                <div className="partner-meta"><strong>{partner.short}</strong><span>{partner.type}</span></div>
                <span className="partner-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

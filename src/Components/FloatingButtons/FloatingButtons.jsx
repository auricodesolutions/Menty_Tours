import React from "react";
import "./FloatingButtons.css";

import tripIcon from "../../assets/icons/tripadvisor-icon.svg";
import waIcon from "../../assets/icons/whatsapp-mark.svg";

export default function FloatingButtons() {
  const whatsappURL = `https://wa.me/94777174175?text=${encodeURIComponent(
    "Hello! I'm interested in your Sri Lanka tour packages. Can I get more information?"
  )}`;

  return (
    <nav className="floating-container" aria-label="Quick contact links">
      <a
        className="floating-btn floating-btn--tripadvisor"
        href="https://www.tripadvisor.com/Profile/mentytours"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Read Menty Tours reviews on Tripadvisor (opens in a new tab)"
      >
        <img src={tripIcon} alt="" width="30" height="30" />
        <span className="floating-btn__label" aria-hidden="true">Tripadvisor reviews</span>
      </a>
      <a
        className="floating-btn floating-btn--whatsapp"
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Menty Tours on WhatsApp (opens in a new tab)"
      >
        <img src={waIcon} alt="" width="30" height="30" />
        <span className="floating-btn__label" aria-hidden="true">Chat on WhatsApp</span>
      </a>
    </nav>
  );
}

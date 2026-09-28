import React from "react";
import "./FloatingButtons.css";

/* ⬇️ Add icon imports (as URLs to avoid SVGR issues) */
import tripIcon from "../../assets/icons/tripadvisor-icon.svg?url";
import waIcon from "../../assets/icons/whatsapp-icon.svg?url";

export default function FloatingButtons() {
  const phoneNumber = "94777174175"; // <-- your WhatsApp number
  const message = "Hello! I'm interested in your Sri Lanka tour packages. Can I get moe information?"; // <-- default message
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const tripAdvisorURL = "https://www.tripadvisor.com/Profile/mentytours"; // <-- replace with your TripAdvisor page

  return (
    <div className="floating-container">
      {/* TripAdvisor Button */}
      <button
        className="floating-btn tripadvisor"
        onClick={() => window.open(tripAdvisorURL, "_blank")}
        aria-label="Visit us on TripAdvisor"
      >
        <img src={tripIcon} alt="" width="26" height="26" loading="lazy" />
      </button>

      {/* WhatsApp Button */}
      <button
        className="floating-btn whatsapp"
        onClick={() => window.open(whatsappURL, "_blank")}
        aria-label="Chat on WhatsApp"
      >
        <img src={waIcon} alt="" width="26" height="26" loading="lazy" />
      </button>
    </div>
  );
}

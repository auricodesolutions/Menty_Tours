import React from "react";
import "./FloatingButtons.css";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          width="26"
          height="26"
        >
          <path d="M256 112C155.6 112 82.4 184.7 32 256c50.4 71.3 123.6 144 224 144s173.6-72.7 224-144C429.6 184.7 356.4 112 256 112zm-97 160c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64 64 28.7 64 64zm226.3 64c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64zM256 304c-13.3 0-24-10.7-24-24v-56c0-13.3 10.7-24 24-24s24 10.7 24 24v56c0 13.3-10.7 24-24 24z"/>
        </svg>
      </button>

      {/* WhatsApp Button */}
      <button
        className="floating-btn whatsapp"
        onClick={() => window.open(whatsappURL, "_blank")}
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          width="26"
          height="26"
        >
          <path d="M12.04 2.002c-5.523 0-10 4.477-10 10 0 1.766.467 3.498 1.355 5.026L2 22l5.144-1.35a9.957 9.957 0 004.895 1.252h.001c5.523 0 10-4.477 10-10a9.93 9.93 0 00-2.928-7.072A9.94 9.94 0 0012.04 2zm0 2a7.944 7.944 0 015.657 2.343A7.94 7.94 0 0120 12c0 4.411-3.589 8-8 8a7.952 7.952 0 01-3.957-1.055l-.283-.16-3.04.797.812-2.962-.184-.302A7.949 7.949 0 014 12c0-4.411 3.589-8 8.04-8zm3.935 10.635c-.206-.103-1.219-.6-1.409-.667-.19-.07-.329-.103-.468.103-.137.206-.537.667-.658.804-.12.137-.243.154-.45.052-.206-.103-.872-.321-1.661-1.022-.614-.547-1.028-1.222-1.148-1.428-.12-.206-.013-.318.09-.42.092-.09.206-.235.309-.352.103-.12.137-.206.206-.343.068-.137.034-.257-.017-.353-.051-.094-.468-1.127-.642-1.545-.168-.403-.34-.35-.468-.355-.12-.006-.257-.007-.395-.007a.758.758 0 00-.546.255c-.19.206-.72.703-.72 1.715s.737 1.987.84 2.122c.103.137 1.451 2.222 3.517 3.116.492.212.875.338 1.173.435.492.157.94.135 1.292.082.394-.058 1.219-.498 1.392-.979.171-.48.171-.89.12-.978-.051-.085-.189-.137-.395-.24z" />
        </svg>
      </button>
    </div>
  );
}

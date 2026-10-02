import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Heart, Map, MessageSquare, Sparkles } from "lucide-react";
import "./JourneyIntro.css";

export default function JourneyIntro({ review = false }) {
  return (
    <section className="journey-intro" aria-labelledby="journey-intro-title">
      <div className="journey-intro__copy">
        <span className="journey-intro__eyebrow">{review ? "Share your journey" : "Guest stories"}</span>
        <h1 id="journey-intro-title">{review ? <>Your story inspires<br />the next journey.</> : <>Journeys worth<br />sharing.</>}</h1>
        <p>{review ? "Tell us about your Sri Lanka adventure. Your honest feedback helps us improve and gives future guests the confidence to explore." : "Discover Sri Lanka through the experiences of guests who traveled with Menty Tours. Personal journeys, local discoveries, and memories to keep."}</p>
        <div className="journey-intro__actions">
          <a className="journey-intro__primary" href={review ? "#review-form" : "#guest-reviews"}>{review ? "Share my experience" : "Read guest stories"}<ArrowRight size={18} aria-hidden="true" /></a>
          <Link className="journey-intro__secondary" to={review ? "/testimonialsPage" : "/write-review"}>{review ? "Explore guest stories" : "Write a review"}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        {!review && <ul className="journey-intro__benefits">
          <li><Compass size={17} aria-hidden="true" />Local knowledge</li>
          <li><Map size={17} aria-hidden="true" />Personal itineraries</li>
          <li><Heart size={17} aria-hidden="true" />Memorable moments</li>
        </ul>}
      </div>
      <aside className="journey-intro__note">
        <span className="journey-intro__icon"><Sparkles size={26} aria-hidden="true" /></span>
        <span className="journey-intro__note-label">{review ? "A little note from Menty" : "Every journey is personal"}</span>
        <h2>{review ? "Thank you for traveling with us." : "The best stories start with you."}</h2>
        <p>{review ? "From your favorite stop to the little details that made a difference, we’d love to hear it all." : "A scenic train ride. A warm welcome. A place you never expected to love. Explore the moments our guests remember."}</p>
        <div className="journey-intro__footnote"><MessageSquare size={18} aria-hidden="true" /><span>{review ? "Reviews are checked before publishing to protect guest privacy." : "Already traveled with us? Your experience could inspire someone’s next adventure."}</span></div>
      </aside>
    </section>
  );
}

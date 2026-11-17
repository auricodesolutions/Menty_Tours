import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CarFront, Compass, MessageCircleMore, Route } from "lucide-react";
import Navbar from "../../Components/Navbar/Navbar";
import SEO from "../../Components/Seo/SEO";
import { useSiteContent } from "../../lib/SiteContent";
import boatSelfie from "../../assets/Memories/Memories-with torism couple (4).jpeg";
import wildlifeMoment from "../../assets/Memories/Memories-with torism couple (5).jpeg";
import fishSpa from "../../assets/Memories/Memories-with torism couple (7).jpeg";
import "./AboutUs.css";

const moments = [
  { src: boatSelfie, alt: "Guests and their local host enjoying a boat journey in Sri Lanka", label: "The people you meet" },
  { src: wildlifeMoment, alt: "Guest on a river excursion in Sri Lanka", label: "The unexpected moments" },
  { src: fishSpa, alt: "Guests relaxing during a stop on their Sri Lanka trip", label: "The time to slow down" },
];

const reasons = [
  { icon: Route, title: "A route made for you", copy: "We build around your interests, dates and travel style, with space for spontaneous discoveries." },
  { icon: Compass, title: "People who know the island", copy: "Local insight helps turn famous sights and lesser-known stops into a journey that feels connected." },
  { icon: CarFront, title: "Comfort along the way", copy: "Private transport and thoughtful planning make moving between Sri Lanka’s regions feel easy." },
  { icon: MessageCircleMore, title: "A team within reach", copy: "Ask questions before you leave and stay in touch while you travel through WhatsApp." },
];

export default function AboutUs() {
  const { media } = useSiteContent();
  const mainImage = media("aboutMain");
  const secondaryImage = media("aboutSecondary");
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !window.IntersectionObserver || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    page.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    page.classList.add("about-us--motion-ready");
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar forceDark />
      <SEO
        title="About Menty Tours | Personal Sri Lanka Journeys"
        description="Meet Menty Tours and discover our personal approach to exploring Sri Lanka, from thoughtful planning to memorable local experiences."
        canonical="https://www.mentytours.com/about-us"
        ogImage="https://www.mentytours.com/og-cover.jpg"
      />
      <main className="about-us" ref={pageRef}>
        <section className="about-us__hero" aria-labelledby="about-us-title">
          <div className="about-us__intro" data-reveal>
            <span className="about-us__eyebrow">ABOUT MENTY TOURS · SRI LANKA</span>
            <h1 id="about-us-title">The best journeys feel personal.</h1>
            <p className="about-us__lead">We bring you closer to Sri Lanka through thoughtful planning, local insight and room for the moments you didn’t see coming.</p>
            <p>From your first airport welcome to the last stop on your route, we want you to feel at ease, curious and free to enjoy the island at your own pace.</p>
            <div className="about-us__actions">
              <Link className="about-us__button about-us__button--gold" to="/quote">Plan your trip <span aria-hidden="true">↗</span></Link>
              <Link className="about-us__button about-us__button--outline" to="/tours">Explore tours <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <div className="about-us__hero-photos" data-reveal>
            {mainImage && <figure className="about-us__photo about-us__photo--main">
              {mainImage && <img src={mainImage.url} alt={mainImage.alt} loading="eager" />}
              <figcaption>Real moments, shared together.</figcaption>
            </figure>}
            {secondaryImage && <figure className="about-us__photo about-us__photo--small">
              {secondaryImage && <img src={secondaryImage.url} alt={secondaryImage.alt} loading="eager" />}
            </figure>}
          </div>
        </section>

        <section className="about-us__approach" aria-labelledby="approach-title">
          <div className="about-us__section-heading" data-reveal>
            <span className="about-us__eyebrow">OUR APPROACH</span>
            <h2 id="approach-title">Your trip, thoughtfully looked after.</h2>
            <p>We pair the places you’ve dreamed of seeing with the flexibility to make each day your own.</p>
          </div>
          <div className="about-us__values">
            <article data-reveal style={{ "--reveal-delay": "0ms" }}><span>01</span><h3>Made around you</h3><p>Tell us what you love, how you travel and the pace that feels right. We’ll shape a route that fits.</p></article>
            <article data-reveal style={{ "--reveal-delay": "90ms" }}><span>02</span><h3>Local knowledge</h3><p>Discover celebrated sights and meaningful stops with people who know the island.</p></article>
            <article data-reveal style={{ "--reveal-delay": "180ms" }}><span>03</span><h3>Easy from start to finish</h3><p>We help coordinate the practical details so you can focus on being present for the journey.</p></article>
          </div>
        </section>



        <section className="about-us__journey" aria-labelledby="journey-title">
          <div className="about-us__journey-heading" data-reveal>
            <span className="about-us__eyebrow">HOW WE TRAVEL TOGETHER</span>
            <h2 id="journey-title">Simple from the first hello.</h2>
          </div>
          <div className="about-us__journey-steps">
            <article data-reveal><span>01</span><h3>Tell us your ideas</h3><p>Share your dates, interests and what a great holiday looks like to you.</p></article>
            <article data-reveal style={{ "--reveal-delay": "90ms" }}><span>02</span><h3>Shape your route</h3><p>We’ll help you choose experiences and a pace that suits your group.</p></article>
            <article data-reveal style={{ "--reveal-delay": "180ms" }}><span>03</span><h3>Enjoy the journey</h3><p>Travel with your plans taken care of and the freedom to enjoy each day.</p></article>
          </div>
        </section>

       
      </main>
    </>
  );
}

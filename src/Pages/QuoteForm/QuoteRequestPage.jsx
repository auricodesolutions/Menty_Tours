import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import SEO from "../../Components/Seo/SEO";
import { useSiteContent } from "../../lib/SiteContent";
import "./QuoteRequestPage.css";

const WHATSAPP_NUMBER = "94777174175";
const PHONE_DISPLAY = "+94 777 174 175";
const EMAIL = "mentytours.sl@gmail.com";
const ADDRESS = "47/9, Thissa Road, Wadduwa, Sri Lanka";

function makeWhatsAppMessage(form) {
  return [
    "Hello Menty Tours! I would like a Sri Lanka tour quote.",
    "",
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim() || "Not provided"}`,
    `Phone / WhatsApp: ${form.phone.trim() || "Not provided"}`,
    `Package: ${form.package.trim() || "Please help me choose"}`,
    `Travel dates: ${form.startDate || "Flexible"}${form.endDate ? ` to ${form.endDate}` : ""}`,
    `Travellers: ${form.travellers}`,
    `Message: ${form.message.trim() || "Please contact me with options."}`,
  ].join("\n");
}

export default function QuoteRequestPage() {
  const { media } = useSiteContent();
  const contactHero = media("contactHero");
  const pageRef = useRef(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const chosen = useMemo(() => location.state?.pkg?.title || searchParams.get("pkg") || "", [location.state, searchParams]);
  const initialForm = () => ({ name: "", email: "", phone: "", package: chosen, startDate: "", endDate: "", travellers: "2", message: "" });
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

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
    }, { threshold: 0.08, rootMargin: "0px 0px -35px 0px" });
    page.querySelectorAll("[data-quote-reveal]").forEach((element) => observer.observe(element));
    page.classList.add("quote-contact--motion-ready");
    return () => observer.disconnect();
  }, []);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) { setError("Please add your name."); return; }
    if (!form.email.trim() && !form.phone.trim()) { setError("Please add an email address or phone number so we can reply."); return; }
    if (form.startDate && form.endDate && form.endDate < form.startDate) { setError("The end date must be after the start date."); return; }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(makeWhatsAppMessage(form))}`;
    setWhatsAppUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar forceDark />
      <SEO
        title="Request a Sri Lanka Tour Quote | Menty Tours"
        description="Tell Menty Tours about your Sri Lanka travel plans and start a personal quote request through WhatsApp."
        canonical="https://www.mentytours.com/quote"
        ogImage="https://www.mentytours.com/og-cover.jpg"
      />
      <main className="quote-contact" ref={pageRef}>
        <header className="quote-contact__hero">
          {contactHero && <img src={contactHero.url} alt={contactHero.alt} loading="eager" />}
          <div className="quote-contact__hero-shade" />
          <div className="quote-contact__hero-content" data-quote-reveal>
            <span>PLAN YOUR SRI LANKA JOURNEY</span>
            <h1>Let’s make it yours.</h1>
            <p>Share your ideas. We’ll help shape the trip.</p>
          </div>
        </header>

        <div className="quote-contact__layout">
          <section className="quote-contact__details" aria-labelledby="quote-contact-title" data-quote-reveal>
            <span className="quote-contact__eyebrow">GET IN TOUCH</span>
            <h2 id="quote-contact-title">We’re here to help you plan.</h2>
            <p>Whether you have a route in mind or need a place to start, tell us what matters to you. Our local team will help with the next steps.</p>
            <div className="quote-contact__info">
              <div><span>CALL OR WHATSAPP</span><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">{PHONE_DISPLAY}</a></div>
              <div><span>EMAIL</span><a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
              <div><span>VISIT</span><address>{ADDRESS}</address></div>
            </div>
            <Link to="/tours" className="quote-contact__tours-link">Explore tour packages <span aria-hidden="true">↗</span></Link>
          </section>

          <section className="quote-contact__form-card" aria-labelledby="quote-form-title" data-quote-reveal>
            {whatsAppUrl ? (
              <div className="quote-contact__thanks" role="status">
                <span className="quote-contact__thanks-icon" aria-hidden="true">✓</span>
                <span className="quote-contact__eyebrow">THANK YOU</span>
                <h2 id="quote-form-title">Your request is ready.</h2>
                <p>We opened WhatsApp with your details. Please press <strong>Send</strong> there to deliver your request to the Menty Tours team.</p>
                <a className="quote-contact__submit" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">Open WhatsApp again <span aria-hidden="true">↗</span></a>
                <button className="quote-contact__reset" type="button" onClick={() => { setForm(initialForm()); setWhatsAppUrl(""); setError(""); }}>Start another request</button>
              </div>
            ) : (
              <>
                <span className="quote-contact__eyebrow">REQUEST A QUOTE</span>
                <h2 id="quote-form-title">Tell us about your trip.</h2>
                <p className="quote-contact__form-intro">We’ll prepare your message for WhatsApp, where you can send it directly to our team.</p>
                <form onSubmit={submit} className="quote-contact__form">
                  <div className="quote-contact__field-row">
                    <label>Full name <span>*</span><input name="name" value={form.name} onChange={update} autoComplete="name" required placeholder="Your name" /></label>
                    <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" placeholder="you@example.com" /></label>
                  </div>
                  <label>Phone / WhatsApp<input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" placeholder="Include your country code" /></label>
                  <p className="quote-contact__hint">Add an email or phone number so we can reply.</p>
                  <label>Package or destination<input name="package" value={form.package} onChange={update} placeholder="A tour, place, or ‘help me choose’" /></label>
                  <div className="quote-contact__field-row">
                    <label>Travel from<input name="startDate" type="date" value={form.startDate} onChange={update} /></label>
                    <label>Travel until<input name="endDate" type="date" min={form.startDate || undefined} value={form.endDate} onChange={update} /></label>
                  </div>
                  <label>Number of travellers<input name="travellers" type="number" min="1" max="30" value={form.travellers} onChange={update} required /></label>
                  <label>What would make this trip special?<textarea name="message" rows="4" value={form.message} onChange={update} placeholder="Tell us about your interests, pace, and any questions…" /></label>
                  {error && <p className="quote-contact__error" role="alert">{error}</p>}
                  <button className="quote-contact__submit" type="submit">Continue to WhatsApp <span aria-hidden="true">↗</span></button>
                  <p className="quote-contact__privacy">Nothing is sent until you confirm the message in WhatsApp.</p>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

import { API_BASE } from "../../lib/apiConfig";
// src/components/QuoteForm/QuoteForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import "./QuoteForm.css";
import sriLankaImg from "../../assets/image2.png";
import SEO from "../../Components/Seo/SEO.jsx";

/* ===== API base ===== */


/* ---- tiny inline icons ---- */
const Icon = {
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16v12H4z"/><path d="M22 6l-10 7L2 6"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M22 16.9V21a1 1 0 0 1-1.1 1 19 19 0 0 1-8.3-3.1 18.6 18.6 0 0 1-5.7-5.7A19 19 0 0 1 3 3.1 1 1 0 0 1 4 2h4.1a1 1 0 0 1 1 .8l.9 4.2a1 1 0 0 1-.3 1l-2 2a15 15 0 0 0 5.7 5.7l2-2a1 1 0 0 1 1-.3l4.2.9a1 1 0 0 1 .8 1z"/>
    </svg>
  ),
  Map: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 10.5c0 5.5-8.8 11-8.8 11S3.2 16 3.2 10.5a8.8 8.8 0 1 1 17.6 0z"/>
      <circle cx="12" cy="10.5" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>
    </svg>
  ),
  Chevron: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
};

/* ---- helpers ---- */
const todayStr = () => new Date().toISOString().split("T")[0];
const addDays = (dateISO, days = 1) => {
  if (!dateISO) return "";
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};
const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const d1 = new Date(a), d2 = new Date(b);
  const ms = d2.getTime() - d1.getTime();
  return ms > 0 ? Math.round(ms / 86400000) : 0;
};

/* ---- tiny people counter ---- */
function Counter({ label, name, value, min = 0, max = 12, onChange }) {
  const dec = () => onChange({ target: { name, value: Math.max(min, (Number(value) || 0) - 1) } });
  const inc = () => onChange({ target: { name, value: Math.min(max, (Number(value) || 0) + 1) } });
  return (
    <div className="q2-counter" data-field={name}>
      <span className="q2-counter__label">{label}</span>
      <div className="q2-counter__ctrl">
        <button type="button" className="q2-ghost" onClick={dec} aria-label={`Decrease ${label}`}>−</button>
        <input aria-label={label} inputMode="numeric" pattern="[0-9]*" name={name} value={value} onChange={onChange} />
        <button type="button" className="q2-ghost" onClick={inc} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

export default function QuotePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pkgFromState = location.state?.pkg || null;
  const pkgFromQueryTitle = searchParams.get("pkg") || "";

  const chosen = useMemo(() => {
    if (pkgFromState) return pkgFromState;
    if (pkgFromQueryTitle) return { title: pkgFromQueryTitle };
    return null;
  }, [pkgFromState, pkgFromQueryTitle]);

  const [formData, setFormData] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    country: "",
    checkin: "",
    checkout: "",
    adults: 2,
    children: 0,
    budget: "",
    package: chosen?.title || "",
    requests: "",
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState({ type: "", msg: "", id: null });
  const bannerRef = useRef(null);
  const mainBtnRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Contact, 2: Trip, 3: Review
  const totalSteps = 3;

  const nights = nightsBetween(formData.checkin, formData.checkout);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => {
      if (name === "checkin") {
        const next = { ...s, checkin: value };
        if (!s.checkout || new Date(s.checkout) <= new Date(value)) {
          next.checkout = addDays(value, 1);
        }
        return next;
      }
      return { ...s, [name]: value };
    });
  };

  const validateStep = (st) => {
    const e = {};
    if (st === 1) {
      if (!formData.name?.trim()) e.name = "Please enter your name";
      if (!/^\S+@\S+\.\S+$/.test(formData.email || "")) e.email = "Enter a valid email";
    }
    if (st === 2) {
      if (!formData.package) e.package = "Please choose a package";
      if (formData.checkin && formData.checkout && nights <= 0) e.checkout = "Checkout must be after check-in";
      if (Number(formData.adults) < 1) e.adults = "At least 1 adult is required";
    }
    return e;
  };

  const scrollToFirstError = (eObj) => {
    const first = Object.keys(eObj)[0];
    if (!first) return;
    const node =
      document.querySelector(`[data-field="${first}"]`) ||
      document.querySelector(`[name="${first}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = node?.querySelector("input, select, textarea") || node;
    input?.focus();
  };

  const nextStep = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) return scrollToFirstError(e);
    setStep((s) => Math.min(totalSteps, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    const e = validateStep(2);
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(2);
      return scrollToFirstError(e);
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      package: formData.package,
      budget: formData.budget,
      checkin: formData.checkin,
      checkout: formData.checkout,
      adults: Number(formData.adults) || 1,
      children: Number(formData.children) || 0,
      requests: formData.requests,
      selected: chosen || null,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Failed to submit");

      setBanner({
        type: "ok",
        msg: "Thank you! We received your request and will contact you soon.",
        id: json?.data?.id || json?.id || null,
      });
      setStep(1);
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      setFormData((s) => ({
        ...s,
        name: "",
        email: "",
        phone: "",
        country: "",
        checkin: "",
        checkout: "",
        adults: 2,
        children: 0,
        budget: "",
        requests: "",
      }));
    } catch (err) {
      setBanner({ type: "err", msg: err.message || "Could not submit your request.", id: null });
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.querySelector(".q2-hero__inner")?.classList.add("show");
  }, []);

  const minIn = todayStr();
  const minOut = formData.checkin || minIn;

  const countries = [
    "Sri Lanka","India","Maldives","United Kingdom","United States","Canada","Australia","New Zealand",
    "Germany","France","Italy","Spain","Netherlands","Sweden","Norway","Denmark","Finland",
    "UAE","Qatar","Saudi Arabia","China","Japan","South Korea","Singapore","Malaysia","Thailand","Indonesia"
  ];

  const goBackToPackages = (e) => {
    e.preventDefault();
    window.location.href = "/tours";
  };

  const progress = (step / totalSteps) * 100;
  const triggerMain = () => mainBtnRef.current?.click();

  /* ====== Page-level SEO ====== */
  const pageUrl = "https://www.mentytours.com/quote";
  const seo = {
    title: "Request a Sri Lanka Tour Quote | Menty Tours",
    description:
      "Get a custom Sri Lanka tour quote from local experts. Tailor-made packages, family holidays, private drivers, and airport pickup — plan your trip with Menty Tours.",
    canonical: pageUrl,
    ogImage: "https://www.mentytours.com/og-cover.jpg",
  };

  const breadcrumbJSON = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mentytours.com/" },
      { "@type": "ListItem", "position": 2, "name": "Request Quote", "item": pageUrl }
    ]
  };

  const webPageJSON = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": pageUrl,
    "name": "Request a Sri Lanka Tour Quote | Menty Tours",
    "description": seo.description,
    "isPartOf": { "@type": "WebSite", "name": "Menty Tours Sri Lanka", "url": "https://www.mentytours.com/" },
    "primaryImageOfPage": { "@type": "ImageObject", "contentUrl": "https://www.mentytours.com/og-cover.jpg" }
  };

  const faqJSON = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long will it take to receive my tour quote?",
        "acceptedAnswer": { "@type": "Answer", "text": "We usually reply within 24 hours with a custom itinerary and price options tailored to your interests and dates." }
      },
      {
        "@type": "Question",
        "name": "What’s included in a typical Sri Lanka tour package?",
        "acceptedAnswer": { "@type": "Answer", "text": "Packages commonly include a private driver-guide, hotels, daily breakfast, airport pickup/drop, entrance fees (as per itinerary), and 24/7 support." }
      },
      {
        "@type": "Question",
        "name": "Can you arrange airport pickup from Colombo?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. We provide airport pickup and drop services from Colombo (CMB) and can begin your tour immediately or transfer you to your hotel." }
      }
    ]
  };

  return (
    <section className="quote-v2">
      <SEO {...seo} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJSON) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJSON) }} />

      {/* HERO (short top banner) */}
      <header className="q2-hero">
        <img
          src={chosen?.img || sriLankaImg}
          alt={chosen?.title ? `${chosen.title} — Sri Lanka tour` : "Sri Lanka tour planning with Menty Tours"}
          className="q2-hero__bg"
          loading="eager"
          fetchpriority="high"
        />
        <div className="q2-hero__scrim" />
        <div className="q2-hero__inner">
          <a href="/tours" className="q2-back" onClick={goBackToPackages}>
            ← Back to tours
          </a>
          <h1>Request Your Custom Quote</h1>
          <p>Share a few details and our travel expert will get back within a day.</p>
          {chosen?.title && (
            <div className="q2-chip" aria-label="Selected package">
              <span className="dot" /> {chosen.title}
              {chosen.duration && <em> · {chosen.duration}</em>}
            </div>
          )}
        </div>
      </header>

      {/* PROGRESS */}
      <div className="q2-progress" aria-label="Form progress">
        <div className="q2-progress__bar" style={{ width: `${progress}%` }} />
        <div className="q2-steps" aria-hidden="true">
          <span className={step >= 1 ? "is-active" : ""}>1. Contact</span>
          <span className={step >= 2 ? "is-active" : ""}>2. Trip</span>
          <span className={step >= 3 ? "is-active" : ""}>3. Review</span>
        </div>
      </div>

      {/* BODY */}
      <div className="q2-body">
        {/* Left: Form */}
        <div className="q2-main">
          {banner.msg && (
            <div
              ref={bannerRef}
              className={`q2-banner ${banner.type === "ok" ? "q2-banner--ok" : "q2-banner--err"}`}
              role={banner.type === "ok" ? "status" : "alert"}
            >
              <div className="q2-banner__icon">
                {banner.type === "ok" ? <Icon.Check /> : <Icon.Close />}
              </div>
              <div>
                <div className="q2-banner__title">
                  {banner.type === "ok" ? "Request received" : "Something went wrong"}
                </div>
                <div className="q2-banner__msg">
                  {banner.msg} {banner.id ? <strong>(Ref #{banner.id})</strong> : null}
                </div>
              </div>
              <button className="q2-banner__close" onClick={() => setBanner({ type: "", msg: "", id: null })} aria-label="Dismiss">
                <Icon.Close />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="q2-form" noValidate>
            {/* STEP 1: Contact */}
            {step === 1 && (
              <fieldset className="q2-card">
                <legend>Contact</legend>
                <div className="q2-grid">
                  <div className={`q2-field ${errors.name ? "has-error" : ""}`} data-field="name">
                    <label className="q2-label" htmlFor="q-name">Name</label>
                    <div className="q2-input">
                      <Icon.User />
                      <input
                        id="q-name"
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && <span className="q2-error">{errors.name}</span>}
                  </div>

                  <div className={`q2-field ${errors.email ? "has-error" : ""}`} data-field="email">
                    <label className="q2-label" htmlFor="q-email">Email</label>
                    <div className="q2-input">
                      <Icon.Mail />
                      <input
                        id="q-email"
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <span className="q2-error">{errors.email}</span>}
                  </div>

                  <div className="q2-field" data-field="phone">
                    <label className="q2-label" htmlFor="q-phone">Phone (optional)</label>
                    <div className="q2-input">
                      <Icon.Phone />
                      <input
                        id="q-phone"
                        type="tel"
                        name="phone"
                        inputMode="tel"
                        placeholder="+94 7X XXX XXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </div>
                    <small className="q2-hint">WhatsApp preferred if available.</small>
                  </div>

                  <div className="q2-field" data-field="country">
                    <label className="q2-label" htmlFor="q-country">Country of Residence</label>
                    <div className="q2-input">
                      <Icon.Map />
                      <input
                        id="q-country"
                        list="country-list"
                        name="country"
                        placeholder="Select or type…"
                        value={formData.country}
                        onChange={handleChange}
                        autoComplete="country-name"
                      />
                      <datalist id="country-list">
                        {countries.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 2: Trip */}
            {step === 2 && (
              <fieldset className="q2-card">
                <legend>Trip</legend>
                <div className="q2-grid">
                  <div className={`q2-field ${errors.package ? "has-error" : ""}`} data-field="package">
                    <label className="q2-label" htmlFor="q-package">Preferred Package</label>
                    <div className="q2-select">
                      <select id="q-package" name="package" value={formData.package} onChange={handleChange} required>
                        {!formData.package && <option value="" disabled>Select your package</option>}
                        {chosen?.title && <option value={chosen.title}>{chosen.title} (selected)</option>}
                        <option value="Cultural Heritage Tour">Cultural Heritage Tour</option>
                        <option value="Adventure & Nature Tour">Adventure & Nature Tour</option>
                        <option value="Beach Relaxation Package">Beach Relaxation Package</option>
                        <option value="Luxury Experience">Luxury Experience</option>
                        <option value="Honeymoon Special">Honeymoon Special</option>
                        <option value="Custom Package">Custom Package</option>
                      </select>
                      <Icon.Chevron />
                    </div>
                    {errors.package && <span className="q2-error">{errors.package}</span>}
                  </div>

                  <div className="q2-field" data-field="budget">
                    <label className="q2-label" htmlFor="q-budget">Budget (optional)</label>
                    <div className="q2-select">
                      <select id="q-budget" name="budget" value={formData.budget} onChange={handleChange}>
                        <option value="">Choose a range</option>
                        <option value="USD 500–800">USD 500–800</option>
                        <option value="USD 800–1200">USD 800–1200</option>
                        <option value="USD 1200–2000">USD 1200–2000</option>
                        <option value="USD 2000+">USD 2000+</option>
                      </select>
                      <Icon.Chevron />
                    </div>
                  </div>

                  <div className="q2-field" data-field="checkin">
                    <label className="q2-label" htmlFor="q-checkin">Check-in</label>
                    <div className="q2-input">
                      <Icon.Calendar />
                      <input id="q-checkin" type="date" name="checkin" min={minIn} value={formData.checkin} onChange={handleChange} />
                    </div>
                  </div>

                  <div className={`q2-field ${errors.checkout ? "has-error" : ""}`} data-field="checkout">
                    <label className="q2-label" htmlFor="q-checkout">Check-out</label>
                    <div className="q2-input">
                      <Icon.Calendar />
                      <input id="q-checkout" type="date" name="checkout" min={minOut} value={formData.checkout} onChange={handleChange} />
                    </div>
                    {errors.checkout && <span className="q2-error">{errors.checkout}</span>}
                    {!!nights && <small className="q2-hint" aria-live="polite">{nights} night{nights > 1 ? "s" : ""}</small>}
                  </div>

                  <div className={`q2-field ${errors.adults ? "has-error" : ""}`} data-field="adults">
                    <label className="q2-label">Guests</label>
                    <div className="q2-guestgrid">
                      <Counter label="Adults" name="adults" value={formData.adults} min={1} onChange={handleChange} />
                      <Counter label="Children" name="children" value={formData.children} min={0} onChange={handleChange} />
                    </div>
                    {errors.adults && <span className="q2-error">{errors.adults}</span>}
                  </div>

                  <div className="q2-field q2-span2" data-field="requests">
                    <label className="q2-label" htmlFor="q-requests">Special Requests</label>
                    <textarea
                      id="q-requests"
                      name="requests"
                      rows="3"
                      placeholder="Interests, dietary needs, preferred pace, must-see spots…"
                      value={formData.requests}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <fieldset className="q2-card">
                <legend>Review</legend>
                <div className="q2-review">
                  <ul>
                    <li><strong>Name:</strong> {formData.name || "—"}</li>
                    <li><strong>Email:</strong> {formData.email || "—"}</li>
                    <li><strong>Phone:</strong> {formData.phone || "—"}</li>
                    <li><strong>Country:</strong> {formData.country || "—"}</li>
                    <li><strong>Package:</strong> {formData.package || "—"}</li>
                    <li><strong>Budget:</strong> {formData.budget || "—"}</li>
                    <li><strong>Check-in:</strong> {formData.checkin || "—"}</li>
                    <li><strong>Check-out:</strong> {formData.checkout || "—"} {nights ? `(${nights} nights)` : ""}</li>
                    <li><strong>Guests:</strong> {formData.adults} adult(s){formData.children ? `, ${formData.children} child(ren)` : ""}</li>
                    <li><strong>Requests:</strong> {formData.requests || "—"}</li>
                  </ul>
                  <p className="q2-privacy">We respect your privacy. Your details are used only to prepare this quote.</p>
                </div>
              </fieldset>
            )}

            {/* in-form actions */}
            <div className="q2-actions">
              <button type="button" className="q2-btn q2-btn--ghost" onClick={prevStep} disabled={step === 1}>Back</button>
              {step < 3 ? (
                <button type="button" className="q2-btn" onClick={nextStep}>Next</button>
              ) : (
                <button ref={mainBtnRef} type="submit" className={`q2-btn ${submitting ? "is-loading" : ""}`} disabled={submitting}>
                  {submitting ? "Sending…" : "Submit"}
                  {submitting && <span className="q2-spinner" aria-hidden="true" />}
                </button>
              )}
            </div>
          </form>

          {/* === SEO-visible FAQ (matches faqJSON) === */}
          <section className="q2-faq" aria-labelledby="q2-faq-title">
            <h2 id="q2-faq-title">Quote FAQs</h2>
            <details>
              <summary>How long will it take to receive my tour quote?</summary>
              <p>We usually reply within 24 hours with a custom itinerary and price options tailored to your interests and dates.</p>
            </details>
            <details>
              <summary>What’s included in a typical Sri Lanka tour package?</summary>
              <p>Packages commonly include a private driver-guide, hotels, daily breakfast, airport pickup/drop, entrance fees (as per itinerary), and 24/7 support.</p>
            </details>
            <details>
              <summary>Can you arrange airport pickup from Colombo?</summary>
              <p>Yes. We provide airport pickup and drop services from Colombo (CMB) and can start your tour immediately or transfer you to your hotel.</p>
            </details>
          </section>
        </div>

        {/* Right: Aside */}
        <aside className="q2-aside" aria-label="Why book with us">
          {chosen && (
            <div className="q2-asidecard">
              <div className="q2-aside__title">Selected package</div>
              <div className="q2-aside__name">{chosen.title}</div>
              {chosen.duration && <div className="q2-aside__chip">{chosen.duration}</div>}
              {(chosen.places?.length || chosen.tags?.length) && (
                <div className="q2-aside__meta">
                  {chosen.places?.length ? <div>📍 {chosen.places.join(" • ")}</div> : null}
                  {chosen.tags?.length ? <div>🏷️ {chosen.tags.join(" · ")}</div> : null}
                </div>
              )}
            </div>
          )}

          <div className="q2-asidecard">
            <div className="q2-aside__title">Why travelers choose us</div>
            <ul className="q2-aside__list">
              <li>✅ Itineraries crafted by local experts</li>
              <li>✅ WhatsApp support before & during trip</li>
              <li>✅ Flexible, budget-matched options</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Sticky mobile bar */}
      <div className="q2-sticky">
        {step > 1 && <button className="q2-btn q2-btn--ghost" onClick={prevStep}>Back</button>}
        {step < 3 ? (
          <button className="q2-btn" onClick={nextStep}>Next</button>
        ) : (
          <button className={`q2-btn ${submitting ? "is-loading" : ""}`} onClick={triggerMain} disabled={submitting}>
            {submitting ? "Sending…" : "Submit"}
            {submitting && <span className="q2-spinner" aria-hidden="true" />}
          </button>
        )}
      </div>
    </section>
  );
}

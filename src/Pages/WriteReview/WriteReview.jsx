import React, { useEffect, useState } from "react";
import JourneyIntro from "../../Components/JourneyIntro/JourneyIntro";
import Navbar from "../../Components/Navbar/Navbar";
import "./WriteReview.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const SATISFACTION_OPTIONS = [
  { value: 1, face: "😞", label: "Very dissatisfied" },
  { value: 2, face: "🙁", label: "Dissatisfied" },
  { value: 3, face: "😐", label: "Neutral" },
  { value: 4, face: "🙂", label: "Satisfied" },
  { value: 5, face: "😄", label: "Very satisfied" },
];

export default function WriteReview() {
  const [form, setForm] = useState({ name: "", country: "", trip: "Custom Trip", text: "", rating: 0, supportRating: 0, agree: true });
  const [trips, setTrips] = useState(["Custom Trip"]);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/tours`).then((r) => r.json()).then((json) => {
      if (json?.ok && Array.isArray(json.data)) {
        const names = [...new Set(json.data.map((tour) => tour.title?.trim()).filter(Boolean))];
        setTrips(["Custom Trip", ...names]);
      }
    }).catch(() => {});
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "Please choose an image smaller than 5 MB." });
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setStatus({ type: "", message: "" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.country.trim() || form.text.trim().length < 20 || !form.rating || !form.agree) {
      setStatus({ type: "error", message: "Please complete the required fields and write at least 20 characters." });
      return;
    }
    setSending(true);
    setStatus({ type: "", message: "" });
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "agree" && (key !== "supportRating" || value > 0)) data.append(key, String(value).trim());
      });
      data.append("date", new Date().toISOString().slice(0, 10));
      if (photo) data.append("photo", photo);
      const response = await fetch(`${API_BASE}/api/testimonials`, { method: "POST", body: data });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json?.ok !== true) throw new Error(json?.error || "We could not submit your review.");
      setStatus({ type: "success", message: "Thank you! Your review has been sent to the Menty Tours team." });
      setForm({ name: "", country: "", trip: "Custom Trip", text: "", rating: 0, supportRating: 0, agree: true });
      setPhoto(null);
      setPreview("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
    <Navbar forceDark />
    <main className="write-review-page">
      <JourneyIntro review />
      <form id="review-form" className="write-review-form" onSubmit={submit} noValidate>
        <div className="write-review-form__heading"><span>01</span><div><h2>Tell us about your trip</h2><p>Fields marked with * are required.</p></div></div>
        <div className="write-review-grid">
          <label><span>Your name *</span><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Sarah Williams" /></label>
          <label><span>Country *</span><input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. United Kingdom" /></label>
        </div>
        <label><span>Your tour</span><select value={form.trip} onChange={(e) => update("trip", e.target.value)}>{trips.map((trip) => <option key={trip}>{trip}</option>)}</select></label>
        <div className="write-review-ratings">
          <fieldset className="write-rating write-rating--mood">
            <legend>Overall satisfaction *</legend>
            <p>How satisfied are you with your Menty Tours experience?</p>
            <div className="write-moods">
              {SATISFACTION_OPTIONS.map((option) => (
                <button key={option.value} type="button" className={form.rating === option.value ? "active" : ""} onClick={() => update("rating", option.value)} aria-label={`${option.label}, ${option.value} out of 5`} aria-pressed={form.rating === option.value} title={option.label}>
                  <span aria-hidden="true">{option.face}</span>
                  <small>{option.label}</small>
                </button>
              ))}
            </div>
            <small className="write-rating-feedback" aria-live="polite">{form.rating ? SATISFACTION_OPTIONS[form.rating - 1].label : "Choose the face that fits your experience"}</small>
          </fieldset>
          <fieldset className="write-rating write-rating--support">
            <legend>Quality of support <small>(optional)</small></legend>
            <p>How was the help you received from our team?</p>
            <div className="write-stars">
              {[1, 2, 3, 4, 5].map((number) => <button key={number} type="button" className={form.supportRating >= number ? "active" : ""} onClick={() => update("supportRating", form.supportRating === number ? 0 : number)} aria-label={`${number} out of 5 stars for support`} aria-pressed={form.supportRating === number}>★</button>)}
            </div>
            <small className="write-rating-feedback" aria-live="polite">{form.supportRating ? `${form.supportRating} out of 5 stars` : "Select a star rating if you used our support"}</small>
          </fieldset>
        </div>
        <label><span>Your review *</span><textarea rows="6" maxLength="1000" value={form.text} onChange={(e) => update("text", e.target.value)} placeholder="What did you enjoy most? Tell future travelers about your guide, route and favorite moments." /><small className="write-count">{form.text.length}/1000</small></label>
        <label className="write-photo"><span>Trip photo <small>(optional, max 5 MB)</small></span><input type="file" accept="image/*" onChange={selectPhoto} />{preview && <img src={preview} alt="Your selected trip" />}</label>
        <label className="write-consent"><input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} /><span>I agree that Menty Tours may publish this review on its website.</span></label>
        {status.message && <p className={`write-status write-status--${status.type}`} role="status">{status.message}</p>}
        <button className="write-submit" disabled={sending}>{sending ? "Sending review…" : "Submit my review"}<span>→</span></button>
      </form>
    </main>
    </>
  );
}


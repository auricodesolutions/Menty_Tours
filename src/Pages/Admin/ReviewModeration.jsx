import React, { useEffect, useState } from "react";
import { Check, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { req } from "../../lib/adminApi";

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reload = async () => { setError(""); setLoading(true); try { const result = await req("/api/testimonials", { auth: true }); setReviews(result.data); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { reload(); }, []);
  const moderate = async (review, remove = false) => {
    if (remove && !window.confirm(`Delete the review from ${review.name}?`)) return;
    setBusy(true); setError("");
    try { await req(`/api/admin/reviews/${review.id}`, { method: remove ? "DELETE" : "PATCH", auth: true, json: remove ? undefined : { approved: !review.approved } }); await reload(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <><div className="cms-page-heading"><div><span className="cms-eyebrow">Guest voices</span><h1>Guest reviews</h1><p>Your existing website reviews are listed below. New reviews stay private until you choose Show on website.</p></div><button className="cms-button cms-button--outline" disabled={loading || busy} onClick={reload}><RefreshCw size={16} />Refresh</button></div>{error && <p role="alert" className="cms-error">{error}</p>}{loading ? <div className="cms-empty" role="status">Loading reviews…</div> : <div className="cms-two-columns">{reviews.map((review) => <article className="cms-panel" key={review.id}><div className="cms-panel-heading"><div><span className="cms-eyebrow">{review.rating} / 5 · {review.country}</span><h2>{review.name}</h2></div><span className={`cms-status-pill${review.approved ? "" : " cms-status-pill--draft"}`}>{review.approved ? "Published" : "Needs review"}</span></div><p>{review.text}</p>{review.photo && <img className="cms-review-photo" src={review.photo} alt={`Trip shared by ${review.name}`} />}<small className="cms-muted">{review.trip} · {review.date}</small><div className="cms-button-row"><button className="cms-button cms-button--gold" disabled={busy} onClick={() => moderate(review)}>{review.approved ? <EyeOff size={16} /> : <Check size={16} />}{review.approved ? "Hide from website" : "Show on website"}</button><button className="cms-icon-button cms-danger" disabled={busy} aria-label={`Delete review by ${review.name}`} onClick={() => moderate(review,true)}><Trash2 size={17} /></button></div></article>)}</div>}{!loading && !reviews.length && <div className="cms-empty"><h2>No reviews to moderate yet</h2><p>Guest submissions will appear here after they complete the review form.</p></div>}</>;
}

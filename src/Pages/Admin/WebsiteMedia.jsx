import React, { useEffect, useState } from "react";
import { Check, RotateCcw, Save } from "lucide-react";
import { MEDIA_SLOTS, DEFAULT_MEDIA } from "../../data/mediaDefaults";
import { useSiteContent } from "../../lib/SiteContent";
import { publishMedia } from "../../lib/cmsApi";
import MediaField from "./MediaField";

function MediaSlot({ slot }) {
  const { media, versions, refresh, connected } = useSiteContent();
  const current = media(slot.key);
  const [draft, setDraft] = useState(current || { url: "", alt: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  useEffect(() => { setDraft(current || { url: "", alt: "" }); }, [current]);
  const dirty = draft.url !== (current?.url || "") || draft.alt !== (current?.alt || "");
  const save = async () => {
    setBusy(true); setStatus(null);
    try { await publishMedia(slot.key, draft.url ? draft : null, versions[`media.${slot.key}`] || 0); await refresh(); setStatus({ success: true, text: "Saved! Your website now shows this change." }); }
    catch (error) { setStatus({ success: false, text: error.message }); }
    finally { setBusy(false); }
  };
  return <article className="cms-panel cms-media-slot"><div className="cms-panel-heading"><div><span className="cms-eyebrow">{slot.section}</span><h2>{slot.title}</h2></div><span className={`cms-status-pill ${dirty ? "cms-status-pill--draft" : ""}`}>{dirty ? "Unsaved" : "Current"}</span></div><p className="cms-muted">{slot.help}</p>
    <MediaField value={draft.url} onChange={(url) => setDraft((value) => ({ ...value, url }))} type={slot.type} label={slot.type === "video" ? "Video" : "Image"} onBusyChange={setUploading} disabled={busy} />
    {slot.type === "image" && <label>Image description<input value={draft.alt} maxLength={300} onChange={(event) => setDraft((value) => ({ ...value, alt: event.target.value }))} placeholder="Describe the image for visitors using a screen reader" /></label>}
    <div className="cms-button-row"><button type="button" className="cms-button cms-button--gold" disabled={!connected || !dirty || busy || uploading} onClick={save}><Save size={16} />{busy ? "Publishing…" : "Save to website"}</button><button type="button" className="cms-text-button" disabled={busy || uploading} onClick={() => setDraft(DEFAULT_MEDIA[slot.key])}><RotateCcw size={14} />Restore original</button></div>
    <small className="cms-muted">Clear the media and publish to remove it from the website. Uploaded files stay in your library until deleted.</small>
    {status && <p role="status" className={status.success ? "cms-success" : "cms-error"}>{status.success && <Check size={15} />}{status.text}</p>}
  </article>;
}
export default function WebsiteMedia() {
  const [page, setPage] = useState("home");
  const groups = { home: ["heroVideo", "heroPoster", "reviewsBackground"], about: ["aboutMain", "aboutSecondary"], contact: ["contactHero"], footer: ["footerBackground"] };
  return <><div className="cms-page-heading"><div><span className="cms-eyebrow">Make it yours</span><h1>Page photos & video</h1><p>Choose a page below, then replace its photo or video.</p></div></div><div className="cms-help-strip"><strong>How to make a change</strong><span>1. Choose a page</span><span>2. Upload a photo or video</span><span>3. Click Save to website</span></div><div className="cms-page-tabs" role="group" aria-label="Choose website page">{[["home","Home page"],["about","About us"],["contact","Contact page"],["footer","Bottom of every page"]].map(([key,label]) => <button key={key} className={`cms-button ${page === key ? "cms-button--gold" : "cms-button--outline"}`} aria-pressed={page === key} onClick={() => setPage(key)}>{label}</button>)}</div><div className="cms-two-columns">{MEDIA_SLOTS.filter((slot) => groups[page].includes(slot.key)).map((slot) => <MediaSlot key={slot.key} slot={slot} />)}</div></>;
}

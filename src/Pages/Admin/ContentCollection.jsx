import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Search, ArrowUp, ArrowDown } from "lucide-react";
import { useSiteContent } from "../../lib/SiteContent";
import { publishCollection } from "../../lib/cmsApi";
import MediaField from "./MediaField";

const labels = { destinations: ["Popular destinations", "destination", "Manage names, photographs, regions and the order shown on the homepage."], stories: ["Travel stories", "story", "Create the stories that rotate through the featured Travel Stories card."], tours: ["Tour packages", "package", "Create and update packages, pricing, photos and day-by-day itineraries."] };
const csv = (value) => String(value || "").split(",").map((part) => part.trim()).filter(Boolean);
function makeItem(kind) { return { id: `${kind.slice(0,-1)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`, title: "", name: "", category: "", region: "", description: "", image: "", img: "", hero: "", alt: "", duration: "", priceFrom: "", rating: "", places: [], tags: [], itinerary: [], featured: false, best: false }; }

export default function ContentCollection({ kind }) {
  const { collections, versions, refresh, connected } = useSiteContent();
  const items = collections[kind];
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const editorRef = useRef(null);
  const draftId = draft?.id;
  useEffect(() => {
    if (!draftId || !editorRef.current) return;
    editorRef.current.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    editorRef.current.querySelector("input")?.focus({ preventScroll: true });
  }, [draftId]);
  useEffect(() => { setDraft(null); setSearch(""); setMessage(null); }, [kind]);
  const [heading, singular, description] = labels[kind];
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const publish = async (nextItems) => {
    setBusy(true); setMessage(null);
    try { await publishCollection(kind, nextItems, versions[kind] || 0); await refresh(); setMessage({ success: true, text: "Published successfully. The public website has been updated." }); return true; }
    catch (error) { setMessage({ success: false, text: error.message }); return false; }
    finally { setBusy(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    const next = { ...draft };
    if (kind === "tours") {
      next.priceFrom = next.priceFrom === "" || next.priceFrom === null ? null : Number(next.priceFrom);
      next.rating = next.rating === "" || next.rating === null ? null : Number(next.rating);
      next.priceLabel = next.priceFrom !== null ? `USD ${next.priceFrom.toLocaleString("en-US")} for ${next.person || 2} persons` : "";
      next.itinerary = (next.itinerary || []).map((day) => ({ ...day, activities: (day.desc || "").split(/\r?\n| · /).map((line) => line.trim()).filter(Boolean) }));
    }
    const nextItems = isNew ? [...items, next] : items.map((item) => item.id === next.id ? next : item);
    if (await publish(nextItems)) setDraft(null);
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.name || item.title}” from the website? The media file will remain in the library.`)) return;
    await publish(items.filter((current) => current.id !== item.id));
  };
  const move = (index, direction) => { const next = [...items]; const other = index + direction; [next[index], next[other]] = [next[other], next[index]]; publish(next); };
  const close = () => { if (window.confirm("Discard your unsaved edits?")) setDraft(null); };
  return <>
    <div className="cms-page-heading"><div><span className="cms-eyebrow">Website content</span><h1>{heading}</h1><p>{description}</p></div><button className="cms-button cms-button--gold" disabled={!connected || busy} onClick={() => { setDraft(makeItem(kind)); setIsNew(true); setMessage(null); }}><Plus size={18} />Add {singular}</button></div>
    <div className="cms-help-strip"><strong>Manage your {heading.toLowerCase()}</strong><span>Click Edit to change an existing item.</span><span>Use Add {singular} to create a new one.</span><span>Save to website when finished.</span></div>
    {message && <p role="status" className={message.success ? "cms-success" : "cms-error"}>{message.text}</p>}
    <div className="cms-toolbar"><label className="cms-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${heading.toLowerCase()}…`} aria-label={`Search ${heading}`} /></label><span className="cms-muted">{items.length} {items.length === 1 ? singular : heading.toLowerCase()}</span></div>
    <div className="cms-content-grid">{items.filter((item) => `${item.name || item.title} ${item.category || item.region}`.toLowerCase().includes(search.toLowerCase())).map((item) => {
      const index = items.findIndex((entry) => entry.id === item.id);
      return <article className="cms-panel cms-content-card" key={item.id}>{(item.image || item.img) ? <img className="cms-content-card__image" src={item.image || item.img} alt={item.alt || item.name || item.title} /> : <div className="cms-content-card__image cms-media-empty">No image</div>}<div className="cms-content-card__body"><span className="cms-eyebrow">{item.region || item.category || singular}</span><h2>{item.name || item.title}</h2><p className="cms-muted">{item.description || item.duration || "No description added"}</p><div className="cms-button-row"><button className="cms-button cms-button--outline" disabled={busy} onClick={() => { setDraft(JSON.parse(JSON.stringify(item))); setIsNew(false); setMessage(null); }}><Pencil size={15} />Edit {singular}</button><button className="cms-icon-button cms-danger" aria-label={`Delete ${item.name || item.title}`} disabled={busy || !connected} onClick={() => remove(item)}><Trash2 size={17} />Delete</button><span className="cms-card-spacer" /><button className="cms-icon-button" aria-label="Move earlier" disabled={index === 0 || busy || !connected} onClick={() => move(index,-1)}><ArrowUp size={16} /></button><button className="cms-icon-button" aria-label="Move later" disabled={index === items.length - 1 || busy || !connected} onClick={() => move(index,1)}><ArrowDown size={16} /></button></div></div></article>;
    })}</div>
    {!items.length && <div className="cms-empty"><h2>Your first {singular} starts here</h2><p>Add an image and a few useful details to bring this section to life.</p></div>}
    {draft && <section ref={editorRef} className="cms-panel cms-editor" aria-label={`${isNew ? "Add" : "Edit"} ${singular}`}><div className="cms-panel-heading"><div><span className="cms-eyebrow">{isNew ? "New content" : "Editing content"}</span><h2>{isNew ? `Add a ${singular}` : draft.name || draft.title}</h2></div><button className="cms-icon-button" aria-label="Close editor" disabled={busy || uploading} onClick={close}><X size={20} /></button></div><form onSubmit={submit}>
      <div className="cms-two-columns"><label>{kind === "destinations" ? "Place name" : "Title"} *<input required maxLength={150} value={kind === "destinations" ? draft.name : draft.title} onChange={(event) => set(kind === "destinations" ? "name" : "title", event.target.value)} /></label><label>{kind === "destinations" ? "Region" : "Category"}<input maxLength={120} value={kind === "destinations" ? draft.region : draft.category} onChange={(event) => set(kind === "destinations" ? "region" : "category", event.target.value)} placeholder={kind === "destinations" ? "e.g. Southern coast" : "e.g. Culture & heritage"} /></label></div>
      <label>Description<textarea maxLength={5000} rows={4} value={draft.description} onChange={(event) => set("description", event.target.value)} /></label>
      <MediaField value={kind === "tours" ? draft.img : draft.image} onChange={(url) => set(kind === "tours" ? "img" : "image", url)} label="Card image" onBusyChange={setUploading} disabled={busy || uploading} />
      <label>Image description<input maxLength={300} value={draft.alt || ""} onChange={(event) => set("alt", event.target.value)} placeholder="A short description of this photograph" /></label>
      {kind === "destinations" && <label className="cms-checkbox"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => set("featured", event.target.checked)} />Use a wider featured destination card</label>}
      {kind === "tours" && <><div className="cms-three-columns"><label>Duration<input value={draft.duration} onChange={(event) => set("duration", event.target.value)} placeholder="6 days / 5 nights" /></label><label>Price from (USD)<input type="number" min="0" step="0.01" value={draft.priceFrom ?? ""} onChange={(event) => set("priceFrom", event.target.value)} /></label><label>Rating (optional)<input type="number" min="0" max="5" step="0.1" value={draft.rating ?? ""} onChange={(event) => set("rating", event.target.value)} /></label></div><div className="cms-two-columns"><label>Places (comma separated)<input value={(draft.places || []).join(", ")} onChange={(event) => set("places", event.target.value.split(","))} onBlur={() => set("places", csv((draft.places || []).join(",")))} /></label><label>Tags (comma separated)<input value={(draft.tags || []).join(", ")} onChange={(event) => set("tags", event.target.value.split(","))} onBlur={() => set("tags", csv((draft.tags || []).join(",")))} /></label></div><div className="cms-three-columns"><label>Travellers included in price<input type="number" min="1" max="50" value={draft.person || 2} onChange={(event) => set("person", event.target.value)} /></label></div><div className="cms-two-columns"><label>Inclusions (one per line)<textarea rows={4} value={(draft.inclusions || []).join("\n")} onChange={(event) => set("inclusions", event.target.value.split("\n"))} /></label><label>Exclusions (one per line)<textarea rows={4} value={(draft.exclusions || []).join("\n")} onChange={(event) => set("exclusions", event.target.value.split("\n"))} /></label></div><label className="cms-checkbox"><input type="checkbox" checked={Boolean(draft.best)} onChange={(event) => set("best", event.target.checked)} />Highlight as a recommended package</label><MediaField value={draft.hero || ""} onChange={(url) => set("hero", url)} label="Package hero image" onBusyChange={setUploading} disabled={busy || uploading} /><div className="cms-panel-heading"><h3>Day-by-day itinerary</h3><button type="button" className="cms-button cms-button--outline" onClick={() => set("itinerary", [...(draft.itinerary || []), { title: "", desc: "", img: "" }])}><Plus size={15} />Add day</button></div>{(draft.itinerary || []).map((day,index) => <div className="cms-day" key={index}><div className="cms-panel-heading"><strong>Day {index + 1}</strong><button type="button" className="cms-text-button cms-danger" onClick={() => set("itinerary", draft.itinerary.filter((_,i) => i !== index))}>Remove day</button></div><label>Day title<input required value={day.title} onChange={(event) => set("itinerary", draft.itinerary.map((entry,i) => i === index ? { ...entry, title: event.target.value } : entry))} /></label><label>Activities & description<textarea rows={3} value={day.desc || ""} onChange={(event) => set("itinerary", draft.itinerary.map((entry,i) => i === index ? { ...entry, desc: event.target.value } : entry))} /></label><MediaField value={day.img || ""} onChange={(url) => set("itinerary", draft.itinerary.map((entry,i) => i === index ? { ...entry, img: url } : entry))} label="Day image (optional)" onBusyChange={setUploading} disabled={busy || uploading} /></div>)}</>}
      {message && !message.success && <p className="cms-error" role="alert">{message.text}</p>}
      <div className="cms-editor-actions"><button className="cms-button cms-button--gold" disabled={busy || uploading || !connected}><Save size={16} />{busy ? "Publishing…" : "Save to website"}</button><button type="button" className="cms-button cms-button--outline" disabled={busy || uploading} onClick={close}>Cancel</button><small className="cms-muted">Visitors will see your changes immediately after saving.</small></div>
    </form></section>}
  </>;
}

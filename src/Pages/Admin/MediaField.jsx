import React, { useEffect, useRef, useState } from "react";
import { Upload, Images, X } from "lucide-react";
import { listUploads, uploadFile } from "../../lib/cmsApi";

export function MediaPreview({ url, type = "image", alt = "Media preview", controls = true }) {
  if (!url) return <div className="cms-media-empty">No {type} selected</div>;
  return type === "video" ? <video src={url} controls={controls} preload="metadata" playsInline /> : <img src={url} alt={alt} loading="lazy" />;
}

export default function MediaField({ value = "", onChange, type = "image", label = "Image", disabled = false, onBusyChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [library, setLibrary] = useState(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!library) return undefined;
    const previousFocus = document.activeElement;
    const keyboard = (event) => {
      if (event.key === "Escape") setLibrary(null);
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll("button:not(:disabled),input,a[href],video[controls]");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keyboard);
    return () => { window.removeEventListener("keydown", keyboard); previousFocus?.focus(); };
  }, [library]);
  const upload = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    const limit = type === "video" ? 15 : 10;
    const accepted = type === "video" ? ["video/mp4", "video/webm"] : ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!accepted.includes(file.type) || file.size > limit * 1024 * 1024) { setError(`Choose a supported ${type} under ${limit} MB.`); return; }
    setBusy(true); onBusyChange?.(true); setError("");
    try { const result = await uploadFile(file); onChange(result.url || result.path); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); onBusyChange?.(false); }
  };
  const browse = async () => {
    setError("");
    try { const result = await listUploads(); setLibrary(result.data.filter((file) => file.mime.startsWith(`${type}/`))); }
    catch (err) { setError(err.message); }
  };
  return <div className="cms-media-field">
    <span className="cms-field-label">{label}</span><small className="cms-muted">{type === "video" ? "MP4 or WebM video. Maximum 15 MB." : "Maximum image size: 10 MB."}</small>
    <div className="cms-media-preview"><MediaPreview url={value} type={type} /></div>
    <div className="cms-button-row">
      <label className={`cms-button cms-button--soft${busy || disabled ? " is-disabled" : ""}`}><Upload size={16} />{busy ? "Uploading…" : `Upload ${type}`}<input type="file" className="cms-file-input" accept={type === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/gif,image/avif"} disabled={busy || disabled} onChange={upload} /></label>
      <button type="button" className="cms-button cms-button--outline" onClick={browse} disabled={busy || disabled}><Images size={16} />Choose uploaded file</button>
      {value && <button type="button" className="cms-text-button" onClick={() => onChange("")} disabled={busy || disabled}>Remove from this section</button>}
    </div>
    <details className="cms-advanced"><summary>Advanced: use a link instead</summary><label className="cms-url-label">Paste a {type} link<input type="url" value={value.startsWith("/") ? "" : value} placeholder="https://…" onChange={(event) => onChange(event.target.value)} disabled={busy || disabled} /></label></details>
    {error && <p className="cms-error" role="alert">{error}</p>}
    {library && <div className="cms-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setLibrary(null); }}><section ref={dialogRef} className="cms-modal" role="dialog" aria-modal="true" aria-label="Choose from media library"><div className="cms-panel-heading"><h2>Choose a {type}</h2><button type="button" className="cms-icon-button" aria-label="Close media library" autoFocus onClick={() => setLibrary(null)}><X size={20} /></button></div><div className="cms-library-grid">{library.map((file) => <button className="cms-library-choice" key={file.id} type="button" onClick={() => { onChange(file.url); setLibrary(null); }}><MediaPreview url={file.url} type={type} controls={false} /><span>{file.original_name}</span></button>)}</div>{!library.length && <p className="cms-muted">No uploaded {type}s yet. Close this window and upload your first file.</p>}</section></div>}
  </div>;
}

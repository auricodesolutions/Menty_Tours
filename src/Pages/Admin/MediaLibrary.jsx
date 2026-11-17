import React, { useEffect, useState } from "react";
import { Search, Trash2, Upload, RefreshCw } from "lucide-react";
import { listUploads, removeUpload, uploadFile } from "../../lib/cmsApi";
import { MediaPreview } from "./MediaField";

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const reload = async () => { setLoading(true); setError(""); try { const result = await listUploads(); setFiles(result.data); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { reload(); }, []);
  const upload = async (event) => {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    setBusy(true); setNotice(""); setError("");
    try { await uploadFile(file); await reload(); setNotice("File uploaded. Select it from a content editor to use it on the website."); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const remove = async (file) => {
    if (!window.confirm(`Permanently delete “${file.original_name}” from the media library?`)) return;
    setBusy(true); setError(""); setNotice("");
    try { await removeUpload(file.id); setFiles((current) => current.filter((item) => item.id !== file.id)); setNotice("Unused file deleted."); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <><div className="cms-page-heading"><div><span className="cms-eyebrow">Your creative collection</span><h1>Media library</h1><p>Upload once, reuse anywhere. Files currently used on the website are protected from deletion.</p></div><label className="cms-button cms-button--gold"><Upload size={17} />{busy ? "Working…" : "Upload media"}<input type="file" className="cms-file-input" disabled={busy} onChange={upload} accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm" /></label></div>
    <div className="cms-toolbar"><label className="cms-search"><Search size={18} /><input aria-label="Search media" placeholder="Search filenames…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="cms-button cms-button--outline" disabled={loading || busy} onClick={reload}><RefreshCw size={16} />Refresh</button></div>
    {error && <p role="alert" className="cms-error">{error}</p>}{notice && <p role="status" className="cms-success">{notice}</p>}
    {loading ? <div className="cms-empty" role="status">Loading your media…</div> : <div className="cms-library-grid">{files.filter((file) => file.original_name.toLowerCase().includes(search.toLowerCase())).map((file) => <article className="cms-panel cms-file-card" key={file.id}><MediaPreview url={file.url} type={file.mime.startsWith("video/") ? "video" : "image"} alt={file.original_name} /><div className="cms-file-card__details"><strong title={file.original_name}>{file.original_name}</strong><span className="cms-muted">{file.mime.split("/")[1].toUpperCase()} · {(file.bytes / 1024 / 1024).toFixed(2)} MB</span><div className="cms-button-row"><span className="cms-status-pill">{file.inUse ? "In use" : "Available"}</span><span className="cms-card-spacer" /><button className="cms-icon-button cms-danger" disabled={busy || file.inUse} title={file.inUse ? "Remove or replace the file in the content editor first" : "Delete unused file"} aria-label={`Delete ${file.original_name}`} onClick={() => remove(file)}><Trash2 size={17} /></button></div></div></article>)}</div>}
    {!loading && !files.length && <div className="cms-empty"><h2>Your library is ready</h2><p>Upload your first photograph or video to get started. Original website images remain available in their content editors.</p></div>}
  </>;
}

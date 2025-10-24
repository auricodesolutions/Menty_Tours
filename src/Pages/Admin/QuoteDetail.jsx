import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminToken, getQuote, updateQuoteStatus, viewURL } from "../../lib/adminApi";
import "./admin-shell.css";

const STATUSES = ["new","read","quoted","won","lost","spam"];

export default function QuoteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!AdminToken.get()) return nav("/admin/login");
    (async () => {
      try {
        const r = await getQuote(id);
        setQ(r.data || r);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id, nav]);

  const pkgImg = useMemo(() => {
    if (!q?.tour_img) return "";
    const s = String(q.tour_img);
    if (/^(https?:|data:|\/)/i.test(s)) return s;
    return viewURL(s);
  }, [q]);

  const setStatus = async (status) => {
    try {
      setBusy(true);
      await updateQuoteStatus(id, status);
      setQ((old) => old ? { ...old, status } : old);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (err) return <div className="mt-admin-card" style={{ color:"#fca5a5" }}>{err}</div>;
  if (!q) return <div className="mt-admin-card">Loading…</div>;

  return (
    <div className="mt-admin-card">
      <div className="mt-admin-row" style={{ marginBottom: 10 }}>
        <h2>Quote #{q.id}</h2>
        <button className="mt-admin-btn" onClick={() => nav("/admin/quotes")}>Back</button>
      </div>

      <div className="mt-admin-grid">
        <section>
          <h3>Guest</h3>
          <div className="mt-admin-box">
            <div><strong>{q.name}</strong></div>
            <div style={{ opacity:.8 }}>{q.email}{q.phone ? ` • ${q.phone}` : ""}</div>
            <div style={{ opacity:.8 }}>{q.country || ""}</div>
          </div>

          <h3 style={{ marginTop:12 }}>Travel</h3>
          <div className="mt-admin-box">
            <div>Check-in: <strong>{q.checkin || "-"}</strong></div>
            <div>Check-out: <strong>{q.checkout || "-"}</strong></div>
            <div>Nights: <strong>{q.nights || 0}</strong></div>
            <div>Adults: <strong>{q.adults}</strong> {q.children ? `• Children: ${q.children}` : ""}</div>
            <div>Budget: <strong>{q.budget || "-"}</strong></div>
          </div>

          <h3 style={{ marginTop:12 }}>Request</h3>
          <div className="mt-admin-box">
            <pre style={{ whiteSpace:"pre-wrap", fontFamily:"inherit" }}>{q.requests || "-"}</pre>
          </div>
        </section>

        <section>
          <h3>Selected Package</h3>
          <div className="mt-admin-box" style={{ display:"flex", gap:12 }}>
            {pkgImg ? <img src={pkgImg} alt="" style={{ width:120, height:80, objectFit:"cover", borderRadius:8 }} /> : null}
            <div>
              <div><strong>{q.tour_title || q.package || "-"}</strong></div>
              {q.tour_duration ? <div style={{ opacity:.8 }}>{q.tour_duration}</div> : null}
              {q.tour_price_from != null ? <div style={{ opacity:.8 }}>From USD {q.tour_price_from}</div> : null}
              {q.tour_person != null ? <div style={{ opacity:.8 }}>{q.tour_person} person</div> : null}
            </div>
          </div>

          <h3 style={{ marginTop:12 }}>Status</h3>
          <div className="mt-admin-row" style={{ flexWrap:"wrap", gap:8 }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                className={`mt-admin-btn ${q.status===s ? "mt-admin-btn--accent" : ""}`}
                onClick={() => setStatus(s)}
                disabled={busy || q.status===s}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

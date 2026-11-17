import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { login, me } from "../../lib/adminApi";
import logo from "../../assets/menty-tours-logo.png";
import landscape from "../../assets/reviews-coast-golden-hour.jpg";
import "./admin-shell.css";
import "./cms.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const location = useLocation();
  const requested = new URLSearchParams(location.search).get("next") || "/admin";
  const destination = /^\/admin(?:\/|$)/.test(requested) && !requested.startsWith("/admin/login") ? requested : "/admin";
  useEffect(() => { let active = true; me().then((result) => { if (active && result?.ok && result.user) nav(destination, { replace: true }); }); return () => { active = false; }; }, [destination,nav]);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await login(email.trim(), password); nav(destination, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="cms-login"><section className="cms-login-scene" style={{ backgroundImage: `linear-gradient(180deg,rgba(10,31,40,.16),rgba(10,31,40,.83)),url(${landscape})` }}><a className="cms-brand" href="/"><img src={logo} alt="Menty Tours" /><span>Menty Tours<small>SRI LANKA</small></span></a><div><span className="cms-eyebrow">Your next chapter</span><h1>Great journeys.<br /><em>Beautifully managed.</em></h1><p>Keep your island stories, destinations, and experiences up to date from one simple workspace.</p></div><small>Menty Tours · Client administration</small></section><section className="cms-login-form-area"><form className="cms-login-form" onSubmit={submit}><span className="cms-eyebrow">Welcome back</span><h2>Sign in to Menty Studio</h2><p className="cms-muted">Manage the details that inspire your guests.</p><label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your admin email" /></label><label>Password<div className="cms-password"><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{error && <p className="cms-error" role="alert">{error}</p>}<button className="cms-button cms-button--gold" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ArrowRight size={18} /></button><small className="cms-muted">Accounts are created by your website administrator. Contact them if you need access.</small><a className="cms-back-link" href="/">← Back to the website</a></form></section></main>;
}
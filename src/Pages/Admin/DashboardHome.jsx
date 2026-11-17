import React from "react";
import { Link } from "react-router-dom";
import { Video, MapPin, BookOpen, Package, ArrowUpRight, Images, Globe } from "lucide-react";
import { useSiteContent } from "../../lib/SiteContent";
import { MEDIA_SLOTS } from "../../data/mediaDefaults";

export default function DashboardHome() {
  const { collections, connected } = useSiteContent();
  const cards = [
    { to: "/admin/media", icon: Video, label: "Website media", count: MEDIA_SLOTS.length, copy: "Hero video, page images, and backgrounds" },
    { to: "/admin/tours", icon: Package, label: "Tour packages", count: collections.tours.length, copy: "Itineraries, prices, and package photography" },
    { to: "/admin/destinations", icon: MapPin, label: "Destinations", count: collections.destinations.length, copy: "Places guests discover on the homepage" },
    { to: "/admin/stories", icon: BookOpen, label: "Travel stories", count: collections.stories.length, copy: "The stories that inspire the next journey" },
  ];
  return <><div className="cms-page-heading"><div><span className="cms-eyebrow">Your website, your story</span><h1>Welcome to Menty Studio</h1><p>A simple space to keep your Sri Lanka journeys looking their best.</p></div><a className="cms-button cms-button--outline" href="/" target="_blank" rel="noreferrer"><Globe size={17} />View website <ArrowUpRight size={16} /></a></div>
    <div className="cms-welcome"><div><span className="cms-eyebrow">Ready for your next update?</span><h2>Fresh images.<br />Unforgettable first impressions.</h2><p>Change a photo, add a destination, or introduce a new package. Preview your content, then publish it to the website.</p><Link className="cms-button cms-button--gold" to="/admin/media">Manage website media <ArrowUpRight size={16} /></Link></div><div className="cms-welcome-art" aria-hidden="true"><MapPin size={70} strokeWidth={1} /><span>SRI LANKA</span></div></div>
    <div className="cms-stat-grid">{cards.map(({ to, icon: Icon, label, count, copy }) => <Link to={to} className="cms-stat" key={to}><span className="cms-stat-icon"><Icon size={22} /></span><strong>{count}</strong><h2>{label}</h2><p>{copy}</p><ArrowUpRight className="cms-stat-arrow" size={18} /></Link>)}</div>
    <div className="cms-two-columns"><section className="cms-panel"><span className="cms-eyebrow">A quick guide</span><h2>From edit to live in three steps</h2><ol className="cms-steps"><li><span>01</span><div><strong>Choose a section</strong><p>Open website media, packages, destinations, or stories.</p></div></li><li><span>02</span><div><strong>Make it yours</strong><p>Upload an image or video and update the details.</p></div></li><li><span>03</span><div><strong>Save & publish</strong><p>Confirm your update, then open the website to check it.</p></div></li></ol></section><section className="cms-panel"><span className="cms-eyebrow">Keep everything organised</span><h2>Your media library</h2><p className="cms-muted">Find previously uploaded images and videos, reuse them across the website, and remove files you no longer need.</p><Link className="cms-button cms-button--outline" to="/admin/library"><Images size={17} />Open media library</Link><div className="cms-connection-note"><span className={`cms-connection-dot${connected ? " is-online" : ""}`} /><span>{connected ? "Connected to your content server" : "Content server needs configuration"}</span></div></section></div>
  </>;
}

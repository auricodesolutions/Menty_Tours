import React, { useEffect, useState } from "react";
import { Plane, Compass } from "lucide-react";
import boundary from "../../data/sri-lanka-boundary.json";
import "./Loader.css";

const polygons = boundary.geometry.type === "MultiPolygon" ? boundary.geometry.coordinates : [boundary.geometry.coordinates];
const islandPath = polygons.map((polygon) => polygon.map((ring) => ring.map(([lon, lat], index) => `${index ? "L" : "M"}${130 + (lon - 80.75) * 38},${24 + (10 - lat) * 38}`).join(" ") + " Z").join(" ")).join(" ");
const topics = [
  { title: "Your island story begins", content: "Discover Sri Lanka, with every journey shaped around you." },
  { title: "Timeless culture", content: "Ancient cities, sacred temples, and warm local welcomes." },
  { title: "Coastlines to unwind", content: "Golden shores, ocean breezes, and a slower pace of life." },
  { title: "Into the wild", content: "Explore the island’s wildlife, green hills, and open landscapes." },
];

export default function Loader({ exiting = false }) {
  const [topicIndex, setTopicIndex] = useState(0);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (exiting) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden && !reducedMotion.matches) setTopicIndex((index) => (index + 1) % topics.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [exiting]);
  return (
    <div className={`journey-loader${exiting ? " journey-loader--leaving" : ""}`} role="status" aria-live="polite" aria-label="Preparing your Menty Tours journey">
      <div className="journey-loader__scene" aria-hidden="true">
        <div className="journey-loader__orbit"><span><Plane size={26} strokeWidth={1.6} /></span></div>
        <svg className="journey-loader__island" viewBox="0 0 260 220">
          <defs><linearGradient id="loader-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f0c76a" /><stop offset="1" stopColor="#b98a30" /></linearGradient></defs>
          <circle cx="174" cy="60" r="33" fill="#f0c76a" opacity=".1" />
          <path d={islandPath} fill="url(#loader-land)" fillRule="evenodd" />
          <path className="journey-loader__route" d="M121 87 Q170 115 132 153 Q100 169 130 179" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 5" />
          <circle cx="121" cy="87" r="3.5" fill="#fff" /><circle cx="132" cy="153" r="3.5" fill="#fff" /><circle cx="130" cy="179" r="3.5" fill="#fff" />
        </svg>
        <Compass className="journey-loader__compass" size={22} strokeWidth={1} />
      </div>
      <div className="journey-loader__topics">
        <div className="journey-loader__topic" key={topicIndex}>
          <h2>{topics[topicIndex].title}</h2>
          <p>{topics[topicIndex].content}</p>
        </div>
      </div>
      <div className="journey-loader__track" aria-hidden="true"><span /></div>
      <span className="journey-loader__status">Preparing your journey</span>
    </div>
  );
}

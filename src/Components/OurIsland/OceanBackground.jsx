import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import reef from "../../assets/island-underwater-reef.jpg";
import "./OceanBackground.css";

export default function OceanBackground() {
  const layerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(layerRef.current.parentElement);
    return () => observer.disconnect();
  }, []);
  return <>
    <div className="ocean-scene" ref={layerRef} data-running={visible && !paused} aria-hidden="true">
      <img className="ocean-scene__photo" src={reef} alt="" loading="lazy" decoding="async" />
      <div className="ocean-scene__shade" />
      <div className="ocean-scene__rays" />
      <div className="ocean-scene__surface" />
      {Array.from({ length: 10 }, (_, index) => <i key={index} className="ocean-scene__bubble" style={{ "--bubble-x": `${index % 2 ? 88 + index % 9 : 3 + index % 12}%`, "--bubble-size": `${4 + index % 4 * 2}px`, "--bubble-duration": `${13 + index % 5 * 2}s`, "--bubble-delay": `${-index * 2.7}s` }} />)}
    </div>
    <button type="button" className="ocean-motion-toggle" aria-label={paused ? "Play sea animation" : "Pause sea animation"} aria-pressed={paused} onClick={() => setPaused((current) => !current)}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
  </>;
}

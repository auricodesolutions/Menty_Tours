import React from "react";
import "./OurIsland.css";
import SriLankaMap from "./SriLankaMap";
import OceanBackground from "./OceanBackground";

export default function OurIsland() {
  return (
    <section className="island-section island-section--ocean" id="our-island" aria-label="Explore Sri Lanka by experience">
      <OceanBackground />
      <div className="island-container">
        <SriLankaMap />
      </div>
    </section>
  );
}

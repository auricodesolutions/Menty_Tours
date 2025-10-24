// src/components/LineDivider/LineDivider.jsx
import React from "react";
import "./LineDivider.css";

/**
 * Props (all optional)
 * - color: CSS color string (default "#1e40af")
 * - thickness: number (px) (default 2)
 * - width: CSS width (default "min(1100px, 92%)")
 * - animate: boolean (default true) – turn sheen on/off
 */
export default function LineDivider({
  color = "#1e40af",
  thickness = 2,
  width = "min(1100px, 92%)",
  animate = true,
}) {
  return (
    <hr
      className={`sld-divider ${animate ? "sld-animate" : ""}`}
      style={{
        "--sld-color": color,
        "--sld-h": `${thickness}px`,
        "--sld-w": width,
      }}
      aria-hidden="true"
    />
  );
}

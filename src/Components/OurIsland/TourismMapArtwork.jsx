import React, { useId } from "react";
import { Landmark, Mountain, TreePine, Waves, Building2, Compass, Sailboat } from "lucide-react";

const symbols = { Anuradhapura: Landmark, Sigiriya: Landmark, Kandy: Landmark, Colombo: Building2, Ella: Mountain, Yala: TreePine, Galle: Landmark, Mirissa: Waves, "Arugam Bay": Waves, Trincomalee: Sailboat };

export default function TourismMapArtwork({ coastPath, project, places }) {
  const id = useId();
  return (
    <svg viewBox="0 0 440 600" className="lanka-explorer__coast lanka-tourist-art" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-land`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f7edbf" /><stop offset=".5" stopColor="#dbe6b7" /><stop offset="1" stopColor="#a7c7a2" /></linearGradient>
        <clipPath id={`${id}-coast`}><path d={coastPath} clipRule="evenodd" /></clipPath>
        <pattern id={`${id}-hills`} width="30" height="26" patternUnits="userSpaceOnUse"><path d="M5 18 Q12 10 20 18 M10 20 Q16 14 23 20" fill="none" stroke="#718e63" strokeWidth=".55" opacity=".25" /></pattern>
      </defs>
      <path d={coastPath} fill="none" stroke="#edf3ee" strokeWidth="14" strokeLinejoin="round" />
      <path d={coastPath} fill={`url(#${id}-land)`} stroke="#7d9b78" strokeWidth="1.3" fillRule="evenodd" />
      <g clipPath={`url(#${id}-coast)`}>
        <ellipse cx="237" cy="393" rx="62" ry="110" fill="#8fb381" opacity=".25" transform="rotate(-18 237 393)" />
        <ellipse cx="195" cy="240" rx="94" ry="80" fill="#f9f0cc" opacity=".4" />
        <path d={coastPath} fill={`url(#${id}-hills)`} />
        <path d="M202 308 Q255 334 244 378 T256 447 M184 320 Q227 355 216 400 T230 470 M209 291 Q273 337 270 402" fill="none" stroke="#88a779" strokeWidth="1" opacity=".35" />
        <g fill="#819c70" opacity=".6"><path d="M219 400 l12 -19 12 19Z" /><path d="M236 409 l16 -25 16 25Z" /><path d="M225 430 l10 -16 10 16Z" /></g>
        <g fill="#f7f3d9" opacity=".9"><path d="M225 390 l6 -9 6 9 -5 -2 -3 2Z" /><path d="M245 395 l7 -11 7 11 -7 -3Z" /></g>
      </g>
      {places.map((place) => {
        const [x, y] = project(place.lon, place.lat);
        const Icon = symbols[place.name] || Landmark;
        return <g key={place.name} transform={`translate(${x - 10},${y - 34})`}><circle cx="10" cy="10" r="14" fill="#fff9e8" opacity=".9" /><Icon width={20} height={20} stroke="#8a672b" strokeWidth={1.3} /></g>;
      })}
      <g transform="translate(370 60)" stroke="#748980"><Compass width="30" height="30" strokeWidth="1" /><text x="15" y="-8" textAnchor="middle" fill="#748980" stroke="none" fontSize="9">N</text></g>
      <text x="45" y="342" transform="rotate(-90 45 342)" fill="#9aaaa3" fontSize="8" letterSpacing="4">SRI LANKA</text>
    </svg>
  );
}

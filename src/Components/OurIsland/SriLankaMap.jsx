import React, { useState } from "react";
import boundary from "../../data/sri-lanka-boundary.json";
import sigiriya from "../../assets/Sigiriya.jpg";
import ella from "../../assets/Ella.jpg";
import kandy from "../../assets/Kandy .jpg";
import galle from "../../assets/Galle.jpg";
import colombo from "../../assets/Colombo.jpg";
import trincomalee from "../../assets/Trincomalee.jpg";
import anuradhapura from "../../assets/Anuradhapura.jpg";
import arugam from "../../assets/arugam-bay.jpg";
import yala from "../../assets/Yala.jpg";
import mirissa from "../../assets/pkg-yala-mirissa.jpg";
import adventure from "../../assets/adventure.jpg";
import culture from "../../assets/culture image.jpg";
import food from "../../assets/food.jpg";
import "./SriLankaMap.css";
import TourismMapArtwork from "./TourismMapArtwork";

const places = [
  { name: "Anuradhapura", lat: 8.3114, lon: 80.4037, image: anuradhapura, type: "Sacred cities", description: "Ancient stupas and a remarkable living Buddhist heritage.", side: "left" },
  { name: "Trincomalee", lat: 8.5874, lon: 81.2152, image: trincomalee, type: "East coast", description: "Peaceful bays, coastal temples, and clear blue water." },
  { name: "Sigiriya", lat: 7.957, lon: 80.7603, image: sigiriya, type: "Culture & heritage", description: "An ancient rock fortress rising above gardens and forest." },
  { name: "Kandy", lat: 7.2906, lon: 80.6337, image: kandy, type: "Culture & heritage", description: "Sacred temple traditions in the heart of the hill country." },
  { name: "Colombo", lat: 6.9271, lon: 79.8612, image: colombo, type: "City discoveries", description: "Markets, oceanfront walks, and the island’s vibrant capital.", side: "left" },
  { name: "Ella", lat: 6.8667, lon: 81.0466, image: ella, type: "Hill country", description: "Mountain trails, tea-covered hills, and scenic train journeys.", side: "left" },
  { name: "Arugam Bay", lat: 6.8404, lon: 81.8368, image: arugam, type: "Surf & sea", description: "Laid-back beach days and renowned east-coast surf breaks." },
  { name: "Yala", lat: 6.3833, lon: 81.5167, image: yala, type: "Wildlife & nature", description: "Wild landscapes and unforgettable safari encounters." },
  { name: "Galle", lat: 6.0329, lon: 80.2168, image: galle, type: "Southern coast", description: "Fort streets, coastal history, and Indian Ocean views.", side: "left" },
  { name: "Mirissa", lat: 5.9485, lon: 80.4716, image: mirissa, type: "Beach escapes", description: "Golden sands, palm-fringed bays, and easy coastal living.", labelY: 24 },
];


const categories = [
  { id: "beaches", title: "Popular Beaches", image: mirissa, places: ["Trincomalee", "Arugam Bay", "Mirissa"] },
  { id: "nature", title: "Wildlife & Nature", image: yala, places: ["Yala", "Ella"] },
  { id: "adventure", title: "Adventure", image: adventure, places: ["Ella", "Sigiriya", "Arugam Bay"] },
  { id: "culture", title: "History & Culture", image: culture, places: ["Anuradhapura", "Sigiriya", "Kandy", "Galle"] },
  { id: "quieter", title: "Lesser Travelled", image: trincomalee, places: ["Trincomalee", "Arugam Bay"] },
  { id: "food", title: "Gastronomy", image: food, places: ["Colombo", "Kandy", "Galle"] },
];

// Web Mercator keeps the road tiles and destination markers in the same coordinates.
const ZOOM = 8;
const TILE_SIZE = 185;
const worldPoint = (lon, lat) => {
  const radians = lat * Math.PI / 180;
  const size = 2 ** ZOOM * TILE_SIZE;
  return [(lon + 180) / 360 * size, (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2 * size];
};
const center = worldPoint(80.75, 7.95);
const origin = [center[0] - 220, center[1] - 300];
const project = (lon, lat) => worldPoint(lon, lat).map((value, index) => value - origin[index]);
const polygons = boundary.geometry.type === "MultiPolygon" ? boundary.geometry.coordinates : [boundary.geometry.coordinates];
const coastPath = polygons.map((polygon) => polygon.map((ring) => ring.map(([lon, lat], index) => `${index ? "L" : "M"}${project(lon, lat).join(",")}`).join(" ") + " Z").join(" ")).join(" ");

export default function SriLankaMap() {

  const [active, setActive] = useState(places[2]);
  const [categoryId, setCategoryId] = useState("all");
  const category = categories.find((item) => item.id === categoryId);
  const visiblePlaces = category ? places.filter((place) => category.places.includes(place.name)) : places;
  const selectCategory = (nextCategory) => {
    if (categoryId === nextCategory.id) { setCategoryId("all"); return; }
    setCategoryId(nextCategory.id);
    if (!nextCategory.places.includes(active.name)) {
      setActive(places.find((place) => place.name === nextCategory.places[0]));
    }
  };
  const categoryButton = (item) => (
    <button type="button" key={item.id} className={`lanka-category${categoryId === item.id ? " is-selected" : ""}`} onClick={() => selectCategory(item)} aria-pressed={categoryId === item.id} aria-controls="lanka-destination-map">
      <img src={item.image} alt="" loading="lazy" />
      <span>{item.title}<small>{item.places.length} places to explore</small></span>
    </button>
  );


  return (
    <div className="lanka-explorer">
      <div className="lanka-categories lanka-categories--left" role="group" aria-label="Beach, nature and adventure categories">{categories.slice(0, 3).map(categoryButton)}</div>
      <div className="lanka-explorer__map-column">
      <div id="lanka-destination-map" className="lanka-explorer__map" role="group" aria-label="Interactive map of famous places in Sri Lanka">
        <TourismMapArtwork coastPath={coastPath} project={project} places={visiblePlaces} />
        {visiblePlaces.map((place) => {
          const [x, y] = project(place.lon, place.lat);
          return <button key={place.name} type="button" className={`lanka-pin${active.name === place.name ? " is-active" : ""}`} style={{ left: `${x / 440 * 100}%`, top: `${y / 600 * 100}%` }} onClick={() => setActive(place)} aria-label={`Explore ${place.name}`} aria-pressed={active.name === place.name}>
            <span className="lanka-pin__dot" aria-hidden="true" />
            <span className={`lanka-pin__label${place.side === "left" || place.lon > 81.6 ? " lanka-pin__label--left" : ""}`} style={place.labelY ? { top: place.labelY, left: "50%", transform: "translateX(-50%)" } : undefined}>{place.name}</span>
          </button>;
        })}
      </div>
      <small className="lanka-explorer__credit">Illustrated explorer · Geographic outline: Natural Earth</small>
      </div>
      <div className="lanka-categories lanka-categories--right" role="group" aria-label="Culture, quieter destinations and food categories">{categories.slice(3).map(categoryButton)}</div>
    </div>
  );
}

import React, { useEffect } from "react";
import "./OurIsland.css";
import mapImg from "../../assets/map-srilanka.png";
import beach from "../../assets/img.jpg";
import wildlife from "../../assets/elephant.jpg";
import adventure from "../../assets/adventure.jpg";
import culture from "../../assets/culture image.jpg";
import hills from "../../assets/adventure.jpg";
import food from "../../assets/food.jpg";

export default function OurIsland() {
  useEffect(() => {
    const elements = document.querySelectorAll(".island-reveal");
    if (!("IntersectionObserver" in window)) { elements.forEach((element) => element.classList.add("show")); return undefined; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("show"); observer.unobserve(entry.target); }
    }), { threshold: 0.15 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const categories = [
    { img: beach, title: "Popular Beaches" },
    { img: wildlife, title: "Wildlife & Nature" },
    { img: adventure, title: "Adventure" },
    { img: culture, title: "History & Culture" },
    { img: hills, title: "Lesser Travelled" },
    { img: food, title: "Gastronomy" },
  ];

  return (
    <section className="island-section" id="our-island" aria-label="Our Island Sri Lanka">
      <div className="island-container">
        <header className="island-head island-reveal"><span>Discover Sri Lanka</span><h2>Our Island</h2><p>Sri Lanka</p></header>
        <div className="island-grid island-reveal">
          <div className="island-side desktop-only">
            {categories.slice(0, 3).map((category) => <article className="island-card" key={category.title}><div className="island-circle"><img src={category.img} alt={category.title} loading="lazy" /></div><h3>{category.title}</h3></article>)}
          </div>
          <div className="island-map"><div className="island-map-glow" /><img src={mapImg} alt="Illustrated travel map of Sri Lanka" /></div>
          <div className="island-side desktop-only">
            {categories.slice(3).map((category) => <article className="island-card island-card--right" key={category.title}><h3>{category.title}</h3><div className="island-circle"><img src={category.img} alt={category.title} loading="lazy" /></div></article>)}
          </div>
        </div>
        <div className="island-carousel mobile-only">
          {categories.map((category) => <article className="island-card" key={category.title}><div className="island-circle"><img src={category.img} alt={category.title} loading="lazy" /></div><h3>{category.title}</h3></article>)}
        </div>
      </div>
    </section>
  );
}

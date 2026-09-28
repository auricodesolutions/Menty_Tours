import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  Building2,
  Mountain,
  Waves,
  Trees,
  Sun,
  MapPin,
  Globe2,
  Filter,
} from "lucide-react";
import "./AboutSriLanka.css";
import SEO from "../../Components/Seo/SEO.jsx";

/* Images */
import sigiriya from "../../assets/Sigiriya.jpg";
import kandy from "../../assets/Kandy .jpg";
import ella from "../../assets/Ella.jpg";
import tea from "../../assets/NuwaraEliya.png";
import mirissa from "../../assets/pkg-yala-mirissa.jpg";
import galle from "../../assets/Galle.jpg";
import yala from "../../assets/Yala.jpg";
import anuradhapura from "../../assets/Anuradhapura.jpg";
import polonnaruwa from "../../assets/Polonnaruwa.jpg";
import dambulla from "../../assets/Dambulla.jpg";
import trincomalee from "../../assets/Trincomalee.jpg";
import colombo from "../../assets/Colombo.jpg";

export default function AboutSriLanka() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const seo = {
    title: "Top Tourist Attractions in Sri Lanka | Menty Tours",
    description:
      "Explore Sri Lanka's best attractions—Sigiriya, Kandy, Ella, Yala, Mirissa, Galle and more. Use quick filters (Culture, Hills, Beach, Wildlife, City) and plan with local experts.",
    canonical: "https://www.mentytours.com/about-sri-lanka",
    ogImage: "https://www.mentytours.com/og-cover.jpg",
  };

  const goBack = (e) => {
    e?.preventDefault?.();
    try {
      const ref = document.referrer;
      if (ref && new URL(ref).origin === window.location.origin) {
        navigate(-1);
        return;
      }
    } catch {}
    navigate("/", { replace: true });
  };

  /* Data (with categories for filters) */
  const items = [
    {
      id: "sigiriya",
      icon: <Landmark className="asla-card-icon" />,
      title: "Sigiriya — The Lion Rock Fortress",
      bullets: [
        "UNESCO World Heritage with 5th-century frescoes",
        "Summit views over jungle & ancient water gardens",
      ],
      img: sigiriya,
      alt: "Sigiriya Rock Fortress Sri Lanka",
      cats: ["Culture", "UNESCO", "City"],
    },
    {
      id: "kandy",
      icon: <Building2 className="asla-card-icon" />,
      title: "Kandy — Cultural Capital",
      bullets: [
        "Temple of the Tooth Relic & lakeside promenade",
        "Esala Perahera festival (Jul/Aug)",
      ],
      img: kandy,
      alt: "Kandy Temple of the Tooth Sri Lanka",
      cats: ["Culture", "City"],
    },
    {
      id: "ella",
      icon: <Mountain className="asla-card-icon" />,
      title: "Ella — Misty Hill Escape",
      bullets: [
        "Nine Arches Bridge and tea-blanketed valleys",
        "Hikes to Ella Rock & Little Adam’s Peak",
      ],
      img: ella,
      alt: "Ella Nine Arches Bridge Sri Lanka",
      cats: ["Hills", "Scenic"],
    },
    {
      id: "nuwaraeliya",
      icon: <Trees className="asla-card-icon" />,
      title: "Nuwara Eliya — Little England",
      bullets: [
        "Colonial charm, Gregory Lake & Hakgala Gardens",
        "Endless tea estates and cool climate",
      ],
      img: tea,
      alt: "Nuwara Eliya Tea Plantations Sri Lanka",
      cats: ["Hills", "Scenic"],
    },
    {
      id: "mirissa",
      icon: <Waves className="asla-card-icon" />,
      title: "Mirissa — Tropical Paradise",
      bullets: [
        "Surf, snorkel & sunsets from Palm Tree Hill",
        "Seasonal whale watching (Dec–Apr)",
      ],
      img: mirissa,
      alt: "Mirissa Beach Sri Lanka",
      cats: ["Beach"],
    },
    {
      id: "galle",
      icon: <Globe2 className="asla-card-icon" />,
      title: "Galle — Dutch Fort City",
      bullets: [
        "UNESCO-listed fort, lighthouses & cafés",
        "Perfect sunset walks on ramparts",
      ],
      img: galle,
      alt: "Galle Dutch Fort Sri Lanka",
      cats: ["Culture", "Beach", "City"],
    },
    {
      id: "yala",
      icon: <Sun className="asla-card-icon" />,
      title: "Yala National Park — Wild Heart",
      bullets: [
        "Leopards, elephants, crocs & birdlife",
        "Golden dunes meet jungle lagoons",
      ],
      img: yala,
      alt: "Yala National Park Safari Sri Lanka",
      cats: ["Wildlife"],
    },
    {
      id: "anuradhapura",
      icon: <Landmark className="asla-card-icon" />,
      title: "Anuradhapura — Sacred City",
      bullets: [
        "Ancient stupas & Sri Maha Bodhi (sacred tree)",
        "A living centre of Buddhist heritage",
      ],
      img: anuradhapura,
      alt: "Anuradhapura Sacred City Sri Lanka",
      cats: ["Culture", "UNESCO"],
    },
    {
      id: "polonnaruwa",
      icon: <Building2 className="asla-card-icon" />,
      title: "Polonnaruwa — Medieval Marvel",
      bullets: [
        "Gal Vihara Buddha masterpieces",
        "Ruins set among lakes & jungle",
      ],
      img: polonnaruwa,
      alt: "Polonnaruwa Ruins Sri Lanka",
      cats: ["Culture", "UNESCO"],
    },
    {
      id: "dambulla",
      icon: <Landmark className="asla-card-icon" />,
      title: "Dambulla — Golden Cave Temples",
      bullets: [
        "150+ Buddha statues & painted ceilings",
        "Gateway to the Cultural Triangle",
      ],
      img: dambulla,
      alt: "Dambulla Cave Temple Sri Lanka",
      cats: ["Culture", "UNESCO"],
    },
    {
      id: "trincomalee",
      icon: <Waves className="asla-card-icon" />,
      title: "Trincomalee — Eastern Beauty",
      bullets: [
        "White-sand beaches & coral bays",
        "Koneswaram Temple & Swami Rock views",
      ],
      img: trincomalee,
      alt: "Trincomalee Beach Sri Lanka",
      cats: ["Beach", "City"],
    },
    {
      id: "colombo",
      icon: <MapPin className="asla-card-icon" />,
      title: "Colombo — Modern Metropolis",
      bullets: [
        "Colonial lanes, markets & oceanfront sunsets",
        "Dining, galleries and Galle Face Green",
      ],
      img: colombo,
      alt: "Colombo City Sri Lanka",
      cats: ["City", "Culture"],
    },
  ];

  const categories = ["All", "Culture", "Hills", "Beach", "Wildlife", "City"];

  const visible = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.cats.includes(filter));
  }, [filter]);

  const gridVariants = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
  const cardVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
  };

  return (
    <div className="asla-page">
      <SEO {...seo} />

      {/* ===== Hero (Quote-style) ===== */}
      <section
        className="asla-hero asla-hero--quote"
        id="sri-lanka-tourism"
        aria-label="Sri Lanka overview"
      >
        <div className="asla-hero-media" aria-hidden="true" />
        <div className="asla-hero-overlay" aria-hidden="true" />
        <div className="asla-hero-inner">
          <button
            className="asla-btn asla-btn--ghost asla-hero-back"
            onClick={goBack}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1>Top Tourist Attractions in Sri Lanka</h1>
          <p>
            Discover the most beautiful and historic places in Sri Lanka — the “Pearl of the
            Indian Ocean.” Filter by interest and build your dream route with local insight.
          </p>
        </div>
      </section>

      {/* ===== Quick Facts ===== */}
      <section className="asla-facts" aria-label="Quick facts about Sri Lanka">
        <div className="asla-fact">
          <Landmark size={22} /> <strong>8</strong> UNESCO sites
        </div>
        <div className="asla-fact">
          <Sun size={22} /> Year-round travel (east/west seasons)
        </div>
        <div className="asla-fact">
          <Waves size={22} /> ~1,300 km coastline
        </div>
        <div className="asla-fact">
          <Trees size={22} /> 20+ national parks & reserves
        </div>
      </section>

      {/* ===== Filters ===== */}
      {/* <section className="asla-filters" aria-label="Attraction filters">
        <div className="asla-filters-row">
          <Filter size={18} className="asla-filter-icon" />
          {categories.map((c) => (
            <button
              key={c}
              className={`asla-chip ${filter === c ? "is-active" : ""}`}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
            >
              {c}
            </button>
          ))}
        </div>
      </section> */}

      {/* ===== Grid ===== */}
      <motion.section
        className="asla-grid"
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        {visible.map((it) => (
          <motion.article key={it.id} className="asla-card" variants={cardVariants}>
            <div className="asla-card-media">
              <img src={it.img} alt={it.alt} loading="lazy" />
              <span className="asla-card-badge">{it.icon}</span>
            </div>
            <div className="asla-card-body">
              <h3>{it.title}</h3>
              <ul className="asla-card-list">
                {it.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="asla-tags" aria-label="Categories">
                {it.cats.slice(0, 3).map((t) => (
                  <span key={t} className="asla-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </motion.section>

      {/* ===== CTA ===== */}
      <motion.section
        className="asla-cta"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2>🌴 Plan the Sri Lanka you’ll love</h2>
        <p>
          From misty hills to coral bays and ancient capitals — tell us your interests and we’ll
          design a route that matches your pace and budget.
        </p>
        <motion.a href="/quote" className="asla-btn" whileHover={{ scale: 1.04 }}>
          Plan Your Visit →
        </motion.a>
      </motion.section>
    </div>
  );
}

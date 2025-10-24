// src/components/AboutSriLanka/AboutSriLanka.jsx
import React, { useEffect } from "react";
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
} from "lucide-react";
import "./AboutSriLanka.css";
import SEO from "../../Components/Seo/SEO.jsx";

// ===== Import Images =====
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

  // === SEO meta ===
  const seo = {
    title: "Top Tourist Attractions in Sri Lanka | Menty Tours",
    description:
      "Explore Sri Lanka's best tourist attractions with Menty Tours — from Sigiriya Rock Fortress and Kandy Temple to Yala Safari, Ella train, and Mirissa beach. Discover top 10 places to visit in Sri Lanka with expert local guides.",
    canonical: "https://www.mentytours.com/about-sri-lanka",
    ogImage: "https://www.mentytours.com/og-cover.jpg",
  };

  // === Back navigation ===
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

  // === Scroll reveal ===
  useEffect(() => {
    const els = document.querySelectorAll(".asla-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("asla-show");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="asla-page">
      <SEO {...seo} />

      {/* ===== Topbar Back ===== */}
      <nav className="asla-topbar asla-reveal">
        <button
          className="asla-btn asla-btn--ghost asla-back"
          onClick={goBack}
          aria-label="Go Back"
        >
          ← Back
        </button>
      </nav>

      {/* ===== Hero Section ===== */}
      <section className="asla-hero" id="sri-lanka-tourism">
        <div className="asla-overlay"></div>
        <motion.div
          className="asla-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1>Top Tourist Attractions in Sri Lanka</h1>
          <p>
            Discover the most beautiful and historic places in Sri Lanka — the
            “Pearl of the Indian Ocean.” From ancient cities to tropical beaches
            and wildlife parks, explore a land of culture, adventure, and
            breathtaking nature.
          </p>
        </motion.div>
      </section>

      {/* ===== Attraction Sections ===== */}
      {[
        {
          id: "sigiriya",
          icon: <Landmark />,
          title: "Sigiriya – The Lion Rock Fortress",
          text: [
            "Sigiriya, also known as the “Eighth Wonder of the World,” is an ancient rock fortress built by King Kashyapa in the 5th century.",
            "Admire the world-famous frescoes and climb to the summit for panoramic jungle views — one of Sri Lanka’s most iconic UNESCO World Heritage Sites.",
          ],
          img: sigiriya,
          alt: "Sigiriya Rock Fortress Sri Lanka",
        },
        {
          id: "kandy",
          icon: <Building2 />,
          title: "Kandy – The Cultural Capital",
          text: [
            "Kandy, the last royal capital of Sri Lanka, is home to the sacred Temple of the Tooth Relic — a key Buddhist pilgrimage site.",
            "Its Esala Perahera festival fills the streets with music, elephants, and traditional dancers every July or August.",
          ],
          img: kandy,
          alt: "Kandy Temple of the Tooth Sri Lanka",
          altStyle: true,
        },
        {
          id: "ella",
          icon: <Mountain />,
          title: "Ella – The Misty Hill Escape",
          text: [
            "Ella is a hill-country gem surrounded by tea plantations and waterfalls.",
            "Visit the famous Nine Arches Bridge and Ella Rock for incredible views and cool mountain air.",
          ],
          img: ella,
          alt: "Ella Nine Arches Bridge Sri Lanka",
        },
        {
          id: "nuwaraeliya",
          icon: <Trees />,
          title: "Nuwara Eliya – Little England",
          text: [
            "Known for its colonial charm and cool climate, Nuwara Eliya features tea estates, Gregory Lake, and Hakgala Gardens.",
            "It’s one of Sri Lanka’s most romantic and scenic highlands.",
          ],
          img: tea,
          alt: "Nuwara Eliya Tea Plantations Sri Lanka",
          altStyle: true,
        },
        {
          id: "mirissa",
          icon: <Waves />,
          title: "Mirissa – Tropical Paradise",
          text: [
            "Mirissa’s beaches are famous for surfing, whale watching, and stunning sunsets from Palm Tree Hill.",
            "Relax and enjoy the laid-back southern coast of Sri Lanka.",
          ],
          img: mirissa,
          alt: "Mirissa Beach Sri Lanka",
        },
        {
          id: "galle",
          icon: <Globe2 />,
          title: "Galle – The Dutch Fort City",
          text: [
            "Galle Fort is a UNESCO World Heritage site combining colonial architecture and oceanfront beauty.",
            "Walk through cobblestone streets and admire historic lighthouses and art galleries.",
          ],
          img: galle,
          alt: "Galle Dutch Fort Sri Lanka",
          altStyle: true,
        },
        {
          id: "yala",
          icon: <Sun />,
          title: "Yala National Park – The Wild Heart",
          text: [
            "Sri Lanka’s top wildlife park, home to elephants, peacocks, and the world’s highest leopard density.",
            "A must-visit for nature and photography lovers.",
          ],
          img: yala,
          alt: "Yala National Park Safari Sri Lanka",
        },
        {
          id: "anuradhapura",
          icon: <Landmark />,
          title: "Anuradhapura – The Sacred City of Kings",
          text: [
            "An ancient capital filled with Buddhist monuments, stupas, and the sacred Bodhi Tree.",
            "A UNESCO World Heritage site representing Sri Lanka’s deep spiritual roots.",
          ],
          img: anuradhapura,
          alt: "Anuradhapura Sacred City Sri Lanka",
          altStyle: true,
        },
        {
          id: "polonnaruwa",
          icon: <Building2 />,
          title: "Polonnaruwa – The Medieval Marvel",
          text: [
            "Polonnaruwa’s well-preserved ruins and Gal Vihara statues showcase Sri Lanka’s glorious medieval past.",
            "A must-visit for history enthusiasts.",
          ],
          img: polonnaruwa,
          alt: "Polonnaruwa Ruins Sri Lanka",
        },
        {
          id: "dambulla",
          icon: <Landmark />,
          title: "Dambulla – The Golden Cave Temple",
          text: [
            "The Dambulla cave temples are adorned with over 150 golden Buddha statues and intricate murals.",
            "One of Sri Lanka’s most remarkable cultural landmarks.",
          ],
          img: dambulla,
          alt: "Dambulla Cave Temple Sri Lanka",
          altStyle: true,
        },
        {
          id: "trincomalee",
          icon: <Waves />,
          title: "Trincomalee – The Eastern Beauty",
          text: [
            "Famous for pristine beaches and coral reefs, Trincomalee is a diver’s paradise.",
            "Visit Koneswaram Temple for breathtaking coastal views.",
          ],
          img: trincomalee,
          alt: "Trincomalee Beach Sri Lanka",
        },
        {
          id: "colombo",
          icon: <MapPin />,
          title: "Colombo – The Modern Metropolis",
          text: [
            "The vibrant capital city blends colonial heritage with modern attractions.",
            "Enjoy shopping, fine dining, temples, and the famous Galle Face Green promenade.",
          ],
          img: colombo,
          alt: "Colombo City Sri Lanka",
          altStyle: true,
        },
      ].map((item, i) => (
        <motion.section
          key={item.id}
          id={item.id}
          className={`asla-section asla-reveal ${item.altStyle ? "asla-alt" : ""}`}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="asla-text">
            <h2>
              {item.icon} {item.title}
            </h2>
            {item.text.map((t, idx) => (
              <p key={idx}>{t}</p>
            ))}
          </div>
          <motion.div
            className="asla-image"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <img src={item.img} alt={item.alt} loading="lazy" />
          </motion.div>
        </motion.section>
      ))}

      {/* ===== CTA ===== */}
      <motion.section
        className="asla-cta asla-reveal"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <h2>🌴 Discover the Wonder of Sri Lanka</h2>
        <p>
          From the misty hills to golden beaches, Sri Lanka is a destination of
          endless beauty. Plan your perfect holiday with Menty Tours — trusted
          local experts for personalized itineraries.
        </p>
        <motion.a
          href="/quote"
          className="asla-btn"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(255,183,3,0.6)",
          }}
        >
          Plan Your Visit →
        </motion.a>
      </motion.section>
    </div>
  );
}

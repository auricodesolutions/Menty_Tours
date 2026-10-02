import sigiriya from "../assets/Sigiriya.jpg";
import polonnaruwa from "../assets/Polonnaruwa.jpg";
import nuwaraEliya from "../assets/NuwaraEliya.png";
import galle from "../assets/Galle.jpg";
import kandy from "../assets/Kandy .jpg";

const day = (title, place, img, activities) => ({
  title,
  place,
  img,
  activities,
  desc: activities.join(" · "),
});

export const FEATURED_PACKAGE = {
  id: "six-day-cultural-coast",
  title: "Sri Lanka Heritage & Coast",
  description: "A private six-day journey through Sri Lanka’s ancient cities, wildlife, hill country and southern coast, with transport and local guidance included.",
  duration: "6 days / 5 nights",
  priceFrom: 960,
  priceLabel: "USD 960 for 2 persons",
  person: "2",
  category: "Culture & Coast",
  img: sigiriya,
  hero: sigiriya,
  places: ["Negombo", "Minneriya", "Polonnaruwa", "Sigiriya", "Kandy", "Nuwara Eliya", "Galle"],
  tags: ["Ancient cities", "Wildlife safari", "Hill country", "Southern coast"],
  best: true,
  local: true,
  itinerary: [
    day("Day 1 · Arrival in Negombo", "Negombo", galle, [
      "Arrival at Bandaranaike International Airport", "Meet and greet by a Menty representative", "Transfer to Negombo", "Overnight in Negombo",
    ]),
    day("Day 2 · Negombo to Minneriya", "Minneriya", sigiriya, [
      "Dutch Canal", "Fish market", "Lagoon area", "Transfer to Minneriya", "Minneriya safari", "Overnight in Habarana",
    ]),
    day("Day 3 · Polonnaruwa sightseeing", "Polonnaruwa", polonnaruwa, [
      "Explore Polonnaruwa Ancient City", "Royal Palace", "Gal Viharaya", "Quadrangle", "Parakrama Samudraya", "Return to the hotel and relax", "Overnight in Habarana",
    ]),
    day("Day 4 · Sigiriya to Kandy", "Kandy", kandy, [
      "Climb Pidurangala or Sigiriya", "Spice garden in Matale", "Gem museum", "Kandy cultural dance show", "Overnight in Kandy",
    ]),
    day("Day 5 · Nuwara Eliya", "Nuwara Eliya", nuwaraEliya, [
      "Elephant activities (riding or bathing)", "Nuwara Eliya city", "Post office", "Gregory Lake", "Nuwara Eliya market", "Overnight in Nuwara Eliya",
    ]),
    day("Day 6 · Galle", "Galle", galle, [
      "Madu River boat safari", "Moonstone factory", "Sea turtle hatchery", "Spice garden", "Galle Fort",
    ]),
  ],
  inclusions: [
    "Airport pickup and drop-off",
    "Comfortable air-conditioned vehicle",
    "Tourist Board-approved driver",
    "Professional English-speaking tour guide",
    "Passenger insurance",
    "All entrance tickets",
    "All government taxes",
    "Pidurangala Rock climb",
    "Safari tickets",
    "Safari jeep",
    "Safari driver",
    "Boat safari",
    "Expressway tolls",
    "Parking",
    "Mineral water bottles",
    "Driver and guide accommodation and meals",
  ],
};

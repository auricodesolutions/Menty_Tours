import heroVideo from "../assets/hero.mp4";
import heroPoster from "../assets/hero.jpg";
import reviewsBackground from "../assets/reviews-coast-golden-hour.jpg";
import footerBackground from "../assets/footer-yala-elephant-herd.jpg";
import aboutMain from "../assets/Memories/Memories-with torism couple (2).jpeg";
import aboutSecondary from "../assets/Memories/Memories-with torism couple (3).jpeg";
import contactHero from "../assets/Sigiriya.jpg";

export const MEDIA_SLOTS = [
  { key: "heroVideo", title: "Homepage hero video", section: "Homepage", type: "video", src: heroVideo, alt: "Sri Lanka travel film", help: "Landscape MP4 or WebM. Keep the video short and compressed. Maximum 15 MB." },
  { key: "heroPoster", title: "Hero cover image", section: "Homepage", type: "image", src: heroPoster, alt: "Sri Lanka landscape", help: "A landscape image shown while the video loads, or when the video is removed." },
  { key: "reviewsBackground", title: "Guest reviews background", section: "Homepage", type: "image", src: reviewsBackground, alt: "Sri Lankan coastline at golden hour", help: "A wide scenic image. The website adds its own dark overlay." },
  { key: "footerBackground", title: "Footer background", section: "All public pages", type: "image", src: footerBackground, alt: "Elephants in a Sri Lankan forest setting", help: "A wide image with a calm composition behind the contact details." },
  { key: "aboutMain", title: "About us main image", section: "About us", type: "image", src: aboutMain, alt: "Guests and local host smiling together during a boat trip", help: "The large image beside the About us introduction." },
  { key: "aboutSecondary", title: "About us secondary image", section: "About us", type: "image", src: aboutSecondary, alt: "Guests travelling by boat through Sri Lankan mangroves", help: "The smaller image layered beside the main About us photo." },
  { key: "contactHero", title: "Contact / quote hero", section: "Contact", type: "image", src: contactHero, alt: "Sigiriya Rock Fortress in Sri Lanka", help: "The banner above the contact and trip enquiry form." },
];
export const DEFAULT_MEDIA = Object.fromEntries(MEDIA_SLOTS.map((slot) => [slot.key, { url: slot.src, alt: slot.alt }]));

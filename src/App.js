import React, { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

/* Layout + sections (public) */
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Loader from "./Components/Loader/Loader";
import Hero from "./Components/Hero/Hero";
import PopularDestinations from "./Components/PopularDestinations/PopularDestinations";
import Services from "./Components/Services/Services";
import TourPackages from "./Components/TourPackages/TourPackages";
import WhyChooseUs from "./Components/WhyChooseUs/WhyChooseUs";
import OurPartners from "./Components/OurPartners/OurPartners";
import TravelStories from "./Components/TravelStories/TravelStories";
import Contact from "./Components/Contact/Contact";
import Testominals from "./Components/Testominals/Testominals";
import FAQ from "./Components/FAQ/FAQ";
import OurIsland from "./Components/OurIsland/OurIsland";
import LineDivider from "./Components/LineDivider/LineDivider";
import FloatingButtons from "./Components/FloatingButtons/FloatingButtons";

/* Pages */
import AboutSriLanka from "./Pages/AboutSriLanka/AboutSriLanka."; // ✅ fixed (removed trailing dot)
import QuotePage from "./Pages/QuoteForm/QuoteRequestPage";
import TripDetails from "./Pages/TripDetails/TripDetails";
import TestominalsPage from "./Pages/TestimonialsPage/TestimonialsPage";
import ViewAllTours from "./Pages/ViewAllTours/ViewAllTours";
import WriteReview from "./Pages/WriteReview/WriteReview";
import AboutUs from "./Pages/AboutUs/AboutUs";


/* Admin */
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminLayout from "./Pages/Admin/AdminLayout";
import ToursList from "./Pages/Admin/ToursList";
import TourForm from "./Pages/Admin/TourForm";
import MemoriesList from "./Pages/Admin/MemoriesList";
import MemoryForm from "./Pages/Admin/MemoryForm";
import TestimonialsList from "./Pages/Admin/TestimonialsList";
import TestimonialForm from "./Pages/Admin/TestimonialForm";
import QuotesList from "./Pages/Admin/QuotesList";
import QuoteDetail from "./Pages/Admin/QuoteDetail";

import WebsiteMedia from "./Pages/Admin/WebsiteMedia";
import ContentCollection from "./Pages/Admin/ContentCollection";
import MediaLibrary from "./Pages/Admin/MediaLibrary";
import ReviewModeration from "./Pages/Admin/ReviewModeration";

/* Styles */
import "./App.css";
import "./brand-theme.css";
import "./modern-theme.css";
import "./motion.css";
import { SiteContentProvider } from "./lib/SiteContent";

/* Public homepage composition */
function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <PopularDestinations />
      <TravelStories />

      <Testominals />
      <FAQ />


      {/* <Contact /> */}
      <FloatingButtons />
    </>
  );
}

/* Public wrapper with Navbar/Footer */
function PublicLayout() {
  const layoutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const layout = layoutRef.current;
    if (!layout || !("IntersectionObserver" in window)) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet();
    const animations = new Set();
    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (reducedMotion.matches || !target.animate) return;
        const animation = target.animate([
          { opacity: .65, translate: "0 18px" },
          { opacity: 1, translate: "0 0" },
        ], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    const discover = () => {
      layout.querySelectorAll("section, main > header, main > form, main > .tm-all").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        if (element.closest("footer, [role='dialog'], .hero, .about-us, .quote-contact, .trip-modern")) return;
        if (element.parentElement?.closest("section")) return;
        const bounds = element.getBoundingClientRect();
        // Already-visible content and asynchronous carousel updates never replay.
        if (bounds.top < window.innerHeight || reducedMotion.matches) return;
        observer.observe(element);
      });
    };
    discover();
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => { frame = 0; discover(); });
    });
    mutations.observe(layout, { childList: true, subtree: true });
    const stopMotion = () => {
      if (!reducedMotion.matches) return;
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    reducedMotion.addEventListener("change", stopMotion);
    return () => {
      mutations.disconnect();
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", stopMotion);
      animations.forEach((animation) => animation.cancel());
    };
  }, [location.pathname]);

  return (
    <div className="public-site" ref={layoutRef}>
      <Outlet />
      <Footer />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(() => !pathname.startsWith("/admin"));
  const [loaderExiting, setLoaderExiting] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let revealTimer;
    let exitTimer;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      revealTimer = window.setTimeout(() => {
        setLoaderExiting(true);
        exitTimer = window.setTimeout(() => setLoading(false), 430);
      }, Math.max(0, 1200 - (performance.now() - started)));
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    const fallback = window.setTimeout(finish, 4500);
    return () => {
      window.removeEventListener("load", finish);
      window.clearTimeout(fallback);
      window.clearTimeout(revealTimer);
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (!loading) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [loading]);

  return (
    <>
      {loading && <Loader exiting={loaderExiting} />}
      <SiteContentProvider>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Routes>
          {/* ---------- Public ---------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about-sri-lanka" element={<AboutSriLanka />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/memories" element={<Navigate to="/about-us" replace />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/testimonials" element={<Testominals />} />
            <Route path="/testimonialsPage" element={<TestominalsPage />} />
            <Route path="/write-review" element={<WriteReview />} />
            <Route path="/tours" element={<ViewAllTours />} />
            <Route path="/packages" element={<Navigate to="/tours" replace />} />

          </Route>

          {/* ---------- Admin ---------- */}
          {/* Login is outside the layout */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin area (guard runs inside AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/media" replace />} />
            <Route path="media" element={<WebsiteMedia />} />
            <Route path="destinations" element={<ContentCollection key="destinations" kind="destinations" />} />
            <Route path="stories" element={<ContentCollection key="stories" kind="stories" />} />
            <Route path="library" element={<MediaLibrary />} />
            <Route path="reviews" element={<ReviewModeration />} />

            {/* Use relative child paths here */}
            <Route path="tours" element={<ContentCollection key="tours" kind="tours" />} />
            <Route path="tours/new" element={<Navigate to="/admin/tours" replace />} />
            <Route path="tours/:key" element={<Navigate to="/admin/tours" replace />} />

            <Route path="memories" element={<MemoriesList />} />
            <Route path="memories/new" element={<MemoryForm />} />
            <Route path="memories/:id" element={<MemoryForm />} />

            <Route path="testimonials" element={<TestimonialsList />} />
            <Route path="testimonials/:id" element={<TestimonialForm />} />

            <Route path="quotes" element={<QuotesList />} />
            <Route path="quotes/:id" element={<QuoteDetail />} />
          </Route>

          {/* ---------- 404 ---------- */}
          <Route path="*" element={<div style={{ padding: 24 }}>404 — Not found</div>} />
        </Routes>
      </Suspense>
      </SiteContentProvider>
    </>
  );
}

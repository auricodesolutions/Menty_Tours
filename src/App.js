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
import FutureInspire from "./Components/FutureInspire/FutureInspire";
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

/* Styles */
import "./App.css";

/* Public homepage composition */
function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <PopularDestinations />
      <OurIsland />
      <FutureInspire />
      <OurPartners />

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
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("mt-in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

    const discover = () => {
      layout.querySelectorAll("section, main").forEach((element) => {
        if (element.closest("footer, [role='dialog']") || element.classList.contains("hero")) return;
        if (element.matches("section") && element.parentElement?.closest("section")) return;
        if (element.matches("main") && element.querySelector("section")) return;
        if (element.classList.contains("mt-scroll-reveal")) {
          if (!element.classList.contains("mt-in-view")) observer.observe(element);
          return;
        }

        element.classList.add("mt-scroll-reveal");
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight * .9 && bounds.bottom > 0) {
          element.classList.add("mt-in-view");
        } else {
          observer.observe(element);
        }
      });

      layout.querySelectorAll("main :is(h1,h2,h3,p,article,figure,img), section :is(h1,h2,h3,p,article,figure,img)").forEach((element) => {
        if (element.closest("footer, [role='dialog'], .hero, .about-us, .quote-contact, .trip-modern")) return;
        if (element.parentElement?.closest("article, figure")) return;
        if (element.classList.contains("mt-content-reveal")) return;

        element.classList.add("mt-content-reveal");
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight * .92 && bounds.bottom > 0) {
          element.classList.add("mt-in-view");
        } else {
          observer.observe(element);
        }
      });
      layout.classList.add("mt-motion-ready");
    };

    discover();
    const mutationObserver = new MutationObserver(discover);
    mutationObserver.observe(layout, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* {loading && <Loader />} */}

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
            <Route index element={<Navigate to="tours" replace />} />

            {/* Use relative child paths here */}
            <Route path="tours" element={<ToursList />} />
            <Route path="tours/new" element={<TourForm />} />
            <Route path="tours/:key" element={<TourForm />} />

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
    </>
  );
}

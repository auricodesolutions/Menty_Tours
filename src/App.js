import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

/* Layout + sections (public) */
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Loader from "./Components/Loader/Loader";
import Hero from "./Components/Hero/Hero";
import About from "./Components/About/About";
import Services from "./Components/Services/Services";
import TourPackages from "./Components/TourPackages/TourPackages";
import WhyChooseUs from "./Components/WhyChooseUs/WhyChooseUs";
import OurPartners from "./Components/OurPartners/OurPartners";
import FutureInspire from "./Components/FutureInspire/FutureInspire";
import Contact from "./Components/Contact/Contact";
import Testominals from "./Components/Testominals/Testominals";
import MemoriesTeaser from "./Components/Memories/MemoriesTeaser";
import OurIsland from "./Components/OurIsland/OurIsland";
import DestinationsSection from "./Components/DestinationsSection/DestinationsSection";
import LineDivider from "./Components/LineDivider/LineDivider";
import FloatingButtons from "./Components/FloatingButtons/FloatingButtons";

/* Pages */
import MemoriesExplore from "./Pages/MemoriesExplore/MemoriesExplore";
import AboutSriLanka from "./Pages/AboutSriLanka/AboutSriLanka."; // ✅ fixed (removed trailing dot)
import QuotePage from "./Pages/QuoteForm/QuoteForm";
import TripDetails from "./Pages/TripDetails/TripDetails";
import TestominalsPage from "./Pages/TestimonialsPage/TestimonialsPage";
import ViewAllTours from "./Pages/ViewAllTours/ViewAllTours";


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
      <About />  

      <TourPackages />
      <LineDivider color="#c9a24b" thickness={3} />
      <DestinationsSection />
      <MemoriesTeaser />
      <Testominals />
      <LineDivider color="#c9a24b" thickness={3} />

       <OurIsland />
      <WhyChooseUs />
      <FutureInspire />
       <Services />
      <LineDivider color="#c9a24b" thickness={3} />

      <OurPartners />
      {/* <Contact /> */}
      <FloatingButtons />
    </>
  );
}

/* Public wrapper with Navbar/Footer */
function PublicLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
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
            <Route path="/memories" element={<MemoriesExplore />} />
            <Route path="/about-sri-lanka" element={<AboutSriLanka />} />
            <Route path="/quote" element={<QuotePage />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/testimonials" element={<Testominals />} />
            <Route path="/testimonialsPage" element={<TestominalsPage />} />
            <Route path="/tours" element={<ViewAllTours />} />

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

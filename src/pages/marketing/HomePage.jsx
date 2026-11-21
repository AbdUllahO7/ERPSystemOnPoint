import React from "react";
import HeroSection from "@/components/marketing/HeroSection";
import OurAppsSection from "@/components/marketing/OurAppsSection";
import ProductivitySection from "@/components/marketing/ProductivitySection";
import WhyChooseUsSection from "@/components/marketing/WhyChooseUsSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── 1. Hero Section with Rotating Circles and Orbiting Dots ── */}
      <HeroSection />

      {/* ── 2. Our Apps Suite Section ───────────────────────────── */}
      <OurAppsSection />

      {/* ── 3. Built For Speed & Productivity Section ───────────── */}
      <ProductivitySection />

      {/* ── 4. Why Choose Us Section ────────────────────────────── */}
      <WhyChooseUsSection />
    </div>
  );
}

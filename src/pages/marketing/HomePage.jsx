import React from "react";
import HeroSection from "@/components/marketing/HeroSection";
import ProductivitySection from "@/components/marketing/ProductivitySection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── 1. Hero Section with Rotating Circles and Orbiting Dots ── */}
      <HeroSection />

      {/* ── 2. Built For Speed & Productivity Section ───────────── */}
      <ProductivitySection />
    </div>
  );
}

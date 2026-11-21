import React from "react";
import HeroSection from "@/components/marketing/HeroSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* ── 1. Hero Section with Rotating Circles and Orbiting Dots ── */}
      <HeroSection />
    </div>
  );
}

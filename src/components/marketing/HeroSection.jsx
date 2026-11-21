import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import RotatingBackgroundCircles from "./RotatingBackgroundCircles";

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center bg-white overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* ── Soft Ambient Background Glow at Top ────────────────── */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none opacity-70"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(15, 113, 186, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Rotating Circles with Orbiting Dots (Anchored Exactly to Edges) ── */}
      <RotatingBackgroundCircles />

      {/* ── Hero Center Content ────────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#D0E2F2] bg-white shadow-[0_2px_10px_rgba(15,113,186,0.06)] mb-8 transition-all hover:border-[#0F71BA]/40">
          <span className="bg-[#EBF3FA] text-[#0F71BA] text-[11px] sm:text-xs font-bold tracking-wide px-2.5 py-0.5 rounded-md">
            ONPOINT
          </span>
          <span className="text-xs sm:text-[13px] font-medium text-slate-600">
            Everything You Need to Grow Your Business in One Place
          </span>
        </div>

        {/* Main Title (H1) matching Figma */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[58px] font-extrabold tracking-tight leading-[1.16] text-[#0F71BA] max-w-4xl">
          Take Full Control of Your
          <br />
          Business with One Platform
        </h1>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed">
          Powerful, intelligent solutions that help you grow your business,
          maximize efficiency, and achieve more.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 sm:mt-11 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <Link
            to="/solutions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0F71BA] hover:bg-[#0c5c99] text-white text-sm sm:text-base font-medium shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Discover the Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Secondary CTA */}
          <Link
            to="/get-started"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full border border-[#0F71BA] text-[#0F71BA] bg-white hover:bg-sky-50/70 text-sm sm:text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

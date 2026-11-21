import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  LayoutGrid,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Cloud,
  Rocket,
  Users,
} from "lucide-react";

export default function WhyChooseUsSection() {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Powerful Performance",
      desc: "Experience blazing-fast performance and reliability.",
      icon: Zap,
    },
    {
      title: "All-in-One Platform",
      desc: "Manage your business with one integrated solution.",
      icon: LayoutGrid,
    },
    {
      title: "Enterprise-Grade Security",
      desc: "Your data is always safe with top-level security.",
      icon: ShieldCheck,
    },
    {
      title: "Dedicated Support",
      desc: "Get expert help whenever you need it.",
      icon: Headphones,
    },
    {
      title: "Built for Growth",
      desc: "Scale your business with flexible and customizable tools.",
      icon: TrendingUp,
    },
    {
      title: "Cloud Flexibility",
      desc: "Access your platform anywhere, anytime.",
      icon: Cloud,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 bg-[#fafcff] overflow-hidden border-t border-slate-100"
    >
      {/* ── Soft Ambient Glow ─────────────────────────────────── */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[600px] pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(15, 113, 186, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-200 bg-white shadow-xs mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F71BA] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F71BA]" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0F71BA] uppercase">
              Why Choose Us
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-tight">
            Your Success is Our Priority
          </h2>
        </div>

        {/* ── Two Columns Grid Layout ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: 3D Platform & Floating Badges ──────── */}
          <div 
            className={`lg:col-span-5 flex items-center justify-center transition-all duration-700 ease-out ${
              isInView ? "translate-x-0 opacity-100 scale-100" : "-translate-x-8 opacity-0 scale-95"
            }`}
          >
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none">
              
              {/* Elliptical Planetary Orbit Rings */}
              <svg
                viewBox="0 0 420 340"
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                fill="none"
              >
                {/* Orbit 1 */}
                <ellipse
                  cx="210"
                  cy="170"
                  rx="195"
                  ry="75"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                  transform="rotate(-15 210 170)"
                />
                {/* Point on Orbit 1 */}
                <circle cx="28" cy="180" r="4" fill="#FFFFFF" stroke="#0F71BA" strokeWidth="1.5" />
                <circle cx="390" cy="160" r="4" fill="#FFFFFF" stroke="#0F71BA" strokeWidth="1.5" />

                {/* Orbit 2 */}
                <ellipse
                  cx="210"
                  cy="170"
                  rx="185"
                  ry="65"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                  strokeOpacity="0.35"
                  transform="rotate(12 210 170)"
                />
                <circle cx="85" cy="120" r="3.5" fill="#FFFFFF" stroke="#0F71BA" strokeWidth="1.5" />
              </svg>

              {/* 3D Tiered Glowing Podium at Base */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[310px] sm:w-[340px]">
                {/* Bottom Base Step */}
                <div 
                  className="w-full h-11 rounded-3xl"
                  style={{
                    background: "linear-gradient(180deg, #A7D8FC 0%, #65B7F3 100%)",
                    boxShadow: "0 18px 30px rgba(15, 113, 186, 0.25)",
                  }}
                />
                {/* Upper Glowing Step */}
                <div 
                  className="w-[82%] h-10 rounded-2xl mx-auto -mt-6"
                  style={{
                    background: "linear-gradient(180deg, #D4EDFE 0%, #90CCFA 100%)",
                    boxShadow: "inset 0 2px 4px rgba(255, 255, 255, 0.8)",
                  }}
                />
              </div>

              {/* Center Dashboard Windows (Tilted Glass Layers) */}
              <div className="relative z-10 w-[240px] sm:w-[260px] h-[190px] mb-8">
                
                {/* Back Window (tilted slightly left) */}
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-white/90 shadow-xl p-3 flex flex-col justify-between"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(200,230,255,0.6) 100%)",
                    backdropFilter: "blur(12px)",
                    transform: "rotate(-6deg) translateY(-8px) scale(0.94)",
                  }}
                >
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                </div>

                {/* Front Window (with bar chart & upward trendline) */}
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-white shadow-2xl p-4 flex flex-col justify-between"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(220,240,255,0.8) 100%)",
                    backdropFilter: "blur(16px)",
                    transform: "rotate(4deg)",
                  }}
                >
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="w-2 h-2 rounded-full bg-[#0F71BA]/50" />
                    <span className="w-2 h-2 rounded-full bg-[#0F71BA]/50" />
                    <span className="w-2 h-2 rounded-full bg-[#0F71BA]/50" />
                  </div>

                  {/* Upward Growth Chart */}
                  <div className="relative h-20 flex items-end justify-between px-2 pt-4">
                    {/* SVG Trendline Arrow */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" fill="none">
                      <path
                        d="M10 65 L50 48 L90 55 L135 15"
                        stroke="#0F71BA"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Arrowhead */}
                      <path
                        d="M125 15 H135 V25"
                        stroke="#0F71BA"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Ascending Chart Bars */}
                    <div className="w-5 h-8 bg-[#8ECFFF] rounded-t-md" />
                    <div className="w-5 h-11 bg-[#4AA5E8] rounded-t-md" />
                    <div className="w-5 h-14 bg-[#2382C7] rounded-t-md" />
                    <div className="w-5 h-18 bg-[#0F71BA] rounded-t-md" />
                  </div>
                </div>

              </div>

              {/* ── Floating 3D Icon Badges with Glassmorphism ── */}
              
              {/* Badge 1: Lightning (Top-Left) */}
              <div 
                className="absolute top-8 left-4 w-13 h-13 rounded-2xl bg-gradient-to-br from-[#53B2F5] to-[#1E8DE3] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/60 animate-float-1"
              >
                <Zap className="w-6 h-6 fill-white" />
              </div>

              {/* Badge 2: Users (Top-Right) */}
              <div 
                className="absolute top-10 right-6 w-13 h-13 rounded-2xl bg-gradient-to-br from-[#53B2F5] to-[#1E8DE3] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/60 animate-float-2"
              >
                <Users className="w-6 h-6 fill-white" />
              </div>

              {/* Badge 3: Shield (Bottom-Left) */}
              <div 
                className="absolute bottom-18 left-2 w-13 h-13 rounded-2xl bg-gradient-to-br from-[#53B2F5] to-[#1E8DE3] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/60 animate-float-3"
              >
                <ShieldCheck className="w-6 h-6" />
              </div>

              {/* Badge 4: Headset (Bottom-Right) */}
              <div 
                className="absolute bottom-20 right-3 w-13 h-13 rounded-2xl bg-gradient-to-br from-[#53B2F5] to-[#1E8DE3] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/60 animate-float-4"
              >
                <Headphones className="w-6 h-6" />
              </div>

              {/* Badge 5: Rocket (Center Floating Badge) */}
              <div 
                className="absolute top-1/2 left-1/3 -translate-y-1/2 z-20 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E94E5] to-[#0D6AB0] text-white flex items-center justify-center shadow-xl shadow-sky-600/40 border-2 border-white animate-float-1"
              >
                <Rocket className="w-7 h-7 fill-white/90" />
              </div>

            </div>
          </div>

          {/* ── RIGHT COLUMN: 6 Feature Cards (2x3 Grid) ────────── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`group relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-sky-100/90 bg-white shadow-[0_4px_20px_rgba(15,113,186,0.03)] hover:border-[#0F71BA]/60 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 ${
                      isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${Math.min(idx * 80 + 150, 700)}ms`,
                    }}
                  >
                    {/* Header: Icon + Title */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0F71BA] flex items-center justify-center shrink-0 group-hover:bg-[#0F71BA] group-hover:text-white transition-colors duration-300">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed pl-12">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

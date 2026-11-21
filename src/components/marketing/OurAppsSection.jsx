import React, { useState, useEffect, useRef } from "react";

// Official SVGs from assets
import aiIcon from "@/assets/ImagesWebSite/ai.svg";
import ecommerceIcon from "@/assets/ImagesWebSite/ecommerce.svg";
import crmIcon from "@/assets/ImagesWebSite/crm.svg";
import hrIcon from "@/assets/ImagesWebSite/hr.svg";
import emailsIcon from "@/assets/ImagesWebSite/emails.svg";
import salesIcon from "@/assets/ImagesWebSite/sales.svg";
import posIcon from "@/assets/ImagesWebSite/pos.svg";

// Website vector icon
const WebsiteIcon = () => (
  <svg width="44" height="44" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="url(#webBgGrad)" />
    <path
      d="M10 20C13 16 17 15 20 18C23 21 27 20 30 16C29 23 25 28 20 28C15 28 11 25 10 20Z"
      fill="#0284C7"
    />
    <path
      d="M11 23C14 20 17 19.5 20 21.5C23 23.5 26.5 23 29 20C27.5 25.5 24 28 20 28C16 28 12.5 26 11 23Z"
      fill="#10B981"
    />
    <defs>
      <linearGradient id="webBgGrad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B5A96" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

export default function OurAppsSection() {
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

  // 24 App Cards matching Figma:
  // Row 1: Website, AI, e commerce, CRM, Hr Sys, Emails, Sales, Point of sales
  // Rows 2 & 3: Remaining apps
  const appList = [
    // ── Row 1 ──
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "AI", isComponent: false, iconSrc: aiIcon },
    { name: "e commerce", isComponent: false, iconSrc: ecommerceIcon },
    { name: "CRM", isComponent: false, iconSrc: crmIcon },
    { name: "Hr Sys", isComponent: false, iconSrc: hrIcon },
    { name: "Emails", isComponent: false, iconSrc: emailsIcon },
    { name: "Sales", isComponent: false, iconSrc: salesIcon },
    { name: "Point of sales", isComponent: false, iconSrc: posIcon },

    // ── Row 2 ──
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },

    // ── Row 3 ──
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
    { name: "Website", isComponent: true, icon: WebsiteIcon },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 bg-white overflow-hidden"
    >
      {/* ── Soft Ambient Background Glow ──────────────────────── */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(15, 113, 186, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* ── Section Header ────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          
          {/* Pill Badge with Glowing Pulse */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-200 bg-white shadow-xs mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F71BA] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F71BA]" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0F71BA] uppercase">
              Our Apps
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-tight">
            All Your Business Tools in One Place
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            A complete suite of powerful applications to manage every aspect of your business efficiently.
          </p>
        </div>

        {/* ── Large Outer App Showcase Container ────────────────── */}
        <div
          className={`max-w-6xl mx-auto rounded-[32px] sm:rounded-[40px] border border-sky-200/90 bg-white/80 backdrop-blur-xs p-5 sm:p-8 lg:p-10 shadow-[0_8px_35px_rgba(15,113,186,0.04)] transition-all duration-700 ${
            isInView ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          {/* 8 Columns Grid on Desktop */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-5">
            {appList.map((app, idx) => {
              return (
                <div
                  key={idx}
                  className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-sky-100/80 bg-white hover:border-[#0F71BA] hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer aspect-square ${
                    isInView ? "translate-y-0 opacity-100 scale-100" : "translate-y-5 opacity-0 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${Math.min(idx * 30, 700)}ms`,
                  }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {app.isComponent ? (
                      <app.icon />
                    ) : (
                      <img
                        src={app.iconSrc}
                        alt={app.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-[#0F71BA] transition-colors mt-2 text-center tracking-tight leading-tight line-clamp-1">
                    {app.name}
                  </span>

                  {/* Active highlight corner dot */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#0F71BA] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Check, Search, Sparkles, Smartphone, ArrowRight, CornerDownLeft } from "lucide-react";

export default function ProductivitySection() {
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [counter, setCounter] = useState(0);

  // Trigger animations when the section enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate the 0 -> 90 counter when in view
  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = 90;
    const duration = 900;
    const startTime = performance.now();

    const animateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const current = Math.floor(progress === 1 ? end : end * (1 - Math.pow(2, -10 * progress)));
      setCounter(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCounter(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 bg-[#fafcff] overflow-hidden border-t border-slate-100"
    >
      {/* ── Ambient Radial Glow in Background ─────────────────── */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(15, 113, 186, 0.06) 0%, rgba(255, 255, 255, 0) 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          
          {/* Pill Badge with Glowing Indicator */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-200 bg-white shadow-xs mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F71BA] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0F71BA]" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#0F71BA] uppercase">
              Built for speed
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-tight">
            Optimized for productivity
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            True speed, reduced data entry, smart AI and a fast interface.
            <br className="hidden sm:inline" /> Every operation completes faster than a blink.
          </p>
        </div>

        {/* ── Grid Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-7">
          
          {/* ── Card 1: Lightning-fast interface (5 cols) ───────── */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-sky-100 shadow-[0_4px_25px_rgba(15,113,186,0.04)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(15,113,186,0.08)] hover:border-sky-200 transition-all duration-300">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Lightning-fast interface
              </h3>
              <p className="text-sm text-slate-500 mt-2 font-normal">
                All operations are done in less than 90 ms.
              </p>

              {/* Big Stat Counter */}
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold text-[#0F71BA] tracking-tight">
                  {counter}
                </span>
                <span className="text-xl font-bold text-[#0F71BA]">
                  ms
                </span>
              </div>
            </div>

            {/* The Animated Progress Line */}
            <div className="mt-8 w-full">
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F71BA] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(15,113,186,0.5)]"
                  style={{
                    width: isInView ? "45%" : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Card 2: Command palette (7 cols) ────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-sky-100 shadow-[0_4px_25px_rgba(15,113,186,0.04)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(15,113,186,0.08)] hover:border-sky-200 transition-all duration-300">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Command palette
              </h3>
              <p className="text-sm text-slate-500 mt-2 font-normal">
                Jump anywhere in the system with one shortcut.
              </p>
            </div>

            {/* Mockup Search Palette UI */}
            <div className="mt-7 space-y-3">
              {/* Input Bar */}
              <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-sky-200 bg-white shadow-xs focus-within:border-[#0F71BA] focus-within:ring-2 focus-within:ring-sky-100 transition-all">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  Search apps, records, actions...
                </span>
                <kbd className="px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200/80 rounded-md shadow-2xs font-mono">
                  Ctrl K
                </kbd>
              </div>

              {/* Action List Items */}
              <div className="space-y-2 pt-1 pl-1">
                {/* Active / Checked Action */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 transition-colors">
                  <div className="w-4 h-4 rounded-xs bg-[#0F71BA] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Create new invoice</span>
                </div>

                {/* Secondary Action */}
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-normal text-slate-500 hover:text-slate-700 transition-colors">
                  <div className="w-4 h-4 rounded-xs border border-slate-300 bg-white shrink-0" />
                  <span>Open sales dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 3: Less data entry (4 cols) ────────────────── */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-[0_4px_25px_rgba(15,113,186,0.04)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(15,113,186,0.08)] hover:border-sky-200 transition-all duration-300">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Less data entry
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Smart defaults fill in the rest.
              </p>
            </div>

            {/* Form Fields Simulation */}
            <div className="mt-6 space-y-2.5 text-xs">
              {/* Field 1 */}
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-slate-700 font-medium">
                Customer: <span className="font-semibold text-slate-900">Nova Trading Co.</span>
              </div>

              {/* Field 2 with Auto-filled Badge */}
              <div className="w-full px-3.5 py-2 rounded-xl border border-sky-100 bg-white flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">Address: <span className="text-slate-900">Dammam, KSA</span></span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight bg-[#0F71BA] text-white transition-all duration-500 ${
                    isInView ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                  style={{ transitionDelay: "400ms" }}
                >
                  auto-filled
                </span>
              </div>

              {/* Field 3 with Auto-filled Badge */}
              <div className="w-full px-3.5 py-2 rounded-xl border border-sky-100 bg-white flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">Tax ID: <span className="text-slate-900">3001 ****</span></span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight bg-[#0F71BA] text-white transition-all duration-500 ${
                    isInView ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                  style={{ transitionDelay: "600ms" }}
                >
                  auto-filled
                </span>
              </div>
            </div>
          </div>

          {/* ── Card 4: Smart AI assistant (4 cols) ─────────────── */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-[0_4px_25px_rgba(15,113,186,0.04)] flex flex-col justify-between hover:shadow-[0_8px_35px_rgba(15,113,186,0.08)] hover:border-sky-200 transition-all duration-300">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Smart AI assistant
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Ask in plain words, get results.
              </p>
            </div>

            {/* Chat Bubble Interface */}
            <div className="mt-8 space-y-3">
              {/* User Question Bubble */}
              <div
                className={`flex justify-end transition-all duration-600 ${
                  isInView ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <div className="px-3.5 py-2 rounded-2xl rounded-tr-xs border border-sky-200/90 bg-white text-xs text-slate-700 shadow-xs font-medium">
                  Show unpaid invoices this month
                </div>
              </div>

              {/* AI Response Bubble */}
              <div
                className={`flex justify-start transition-all duration-600 ${
                  isInView ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: "650ms" }}
              >
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#0F71BA] text-white text-xs font-semibold shadow-md shadow-sky-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  <span>12 invoices found - total US$ 18,420</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 5: Mobile productivity (4 cols) ────────────── */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 pb-0 sm:pb-0 border border-sky-100 shadow-[0_4px_25px_rgba(15,113,186,0.04)] flex flex-col justify-between overflow-hidden hover:shadow-[0_8px_35px_rgba(15,113,186,0.08)] hover:border-sky-200 transition-all duration-300">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Mobile productivity
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Your whole business in your pocket.
              </p>
            </div>

            {/* Smartphone Mockup Frame Peeking Up from Bottom */}
            <div className="mt-6 flex justify-center">
              <div
                className={`w-[185px] sm:w-[195px] h-[155px] rounded-t-[32px] border-4 border-b-0 border-[#2382C7] bg-[#161D26] p-2 pt-1.5 shadow-xl transition-all duration-700 ease-out ${
                  isInView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                {/* Dynamic Island / Speaker */}
                <div className="w-10 h-2 bg-black rounded-full mx-auto mb-2" />

                {/* Mobile Screen Contents */}
                <div className="space-y-1.5 px-1">
                  <div className="text-[9px] font-bold text-white tracking-tight">
                    All Projects
                  </div>

                  {/* List item 1 */}
                  <div className="p-1.5 rounded-md bg-[#242E3D] flex items-center justify-between text-[7px] text-slate-200">
                    <span className="truncate">Technical System for Healthcare</span>
                    <Check className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-1" />
                  </div>

                  {/* List item 2 */}
                  <div className="p-1.5 rounded-md bg-[#242E3D] flex items-center justify-between text-[7px] text-slate-200">
                    <span className="truncate">Creative and UI/UX Design</span>
                    <Check className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-1" />
                  </div>

                  {/* List item 3 */}
                  <div className="p-1.5 rounded-md bg-[#242E3D] flex items-center justify-between text-[7px] text-slate-200">
                    <span className="truncate">Web Application for Financial</span>
                    <Check className="w-2.5 h-2.5 text-sky-400 shrink-0 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

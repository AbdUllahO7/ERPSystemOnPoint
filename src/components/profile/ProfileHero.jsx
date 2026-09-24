import React from "react";
import { Sparkles } from "lucide-react";

export function ProfileHero({ onContactClick }) {
  return (
    <section
      id="hero"
      className="relative bg-[#131c2e] text-white pt-8 sm:pt-12 pb-0 overflow-hidden flex flex-col justify-between"
    >
      {/* Top Text Content */}
      <div className="max-w-4xl mx-auto text-center px-4 z-20 relative space-y-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Smart Solutions & Real Results
        </div>

        {/* Headline with curved golden underline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
            Your Business, Perfectly <br />
            <span className="relative inline-block">
              On Point
              <svg
                className="absolute -bottom-2.5 left-0 w-full text-amber-400"
                height="12"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9C50 3 150 3 197 9"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed pt-1 font-normal">
            We help ambitious businesses grow through smart strategy, creative design, and reliable digital
            solutions—all from one trusted partner
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onContactClick}
            className="px-8 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
          >
            Contact US
          </button>
        </div>
      </div>

      {/* 5-Column Gallery Collage matching Figma screenshot 100% */}
      <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-4 grid grid-cols-5 gap-2 sm:gap-4 lg:gap-5 items-end mt-6 sm:mt-10 z-10">
        {/* Column 1: Far Left (Top Card + Bottom Card) */}
        <div className="flex flex-col gap-2 sm:gap-3 -mb-4 sm:-mb-6">
          <div className="w-full h-32 sm:h-48 lg:h-56 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80"
              alt="Handshake Boardroom"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-full h-28 sm:h-40 lg:h-48 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80"
              alt="Team Conference"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Column 2: Left Mid (Tall Card) */}
        <div className="w-full h-52 sm:h-72 lg:h-[420px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 -mb-2 sm:-mb-4">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
            alt="Consultant Discussing"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Column 3: Center Bottom (2 side-by-side cards below Contact US) */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-3 items-end pb-0">
          <div className="w-full h-20 sm:h-32 lg:h-40 rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80"
              alt="Aerial Meeting"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full h-20 sm:h-32 lg:h-40 rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&auto=format&fit=crop&q=80"
              alt="Colleagues Collaborating"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Column 4: Right Mid (Tall Card) */}
        <div className="w-full h-52 sm:h-72 lg:h-[420px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 -mb-2 sm:-mb-4">
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"
            alt="Professional with Laptop"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Column 5: Far Right (Top Card + Bottom Card) */}
        <div className="flex flex-col gap-2 sm:gap-3 -mb-4 sm:-mb-6">
          <div className="w-full h-32 sm:h-48 lg:h-56 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80"
              alt="Data Operations Center"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="w-full h-28 sm:h-40 lg:h-48 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80"
              alt="Executives in Hallway"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileHero;

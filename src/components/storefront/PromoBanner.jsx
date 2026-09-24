import React from "react";
import { Link } from "react-router-dom";
import watchImg from "@/assets/watch.png";
import { usePromoBanner } from "@/features/ecommerce";

export function PromoBanner() {
  const { data: promo = {} } = usePromoBanner();

  return (
    <section className="w-full my-12 px-4 sm:px-8 lg:px-14">
      <div className="w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#172b44] via-[#122338] to-[#0c1827] text-white p-6 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between min-h-[260px] border border-slate-800">
        
        {/* Left Side: Copy */}
        <div className="space-y-3 z-10 max-w-lg text-center md:text-left">
          <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
            {promo.tagline || "Best Deal Online on smart watches"}
          </span>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
            {promo.title || "SMART WEARABLE."}
          </h2>

          <p className="text-lg sm:text-2xl font-extrabold text-slate-100 tracking-wider">
            UP to <span className="text-[#00b4d8]">{promo.discountText || "80% OFF"}</span>
          </p>

          {/* Slider Pagination Dots */}
          <div className="flex items-center justify-center md:justify-start gap-1.5 pt-4">
            <span className="w-6 h-1.5 rounded-full bg-[#0066d1]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Right Side: Smart Watch Visual */}
        <div className="relative mt-6 md:mt-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
          
          <img
            src={promo.image || watchImg}
            alt="Smart Wearable Watch"
            className="w-48 sm:w-64 lg:w-72 object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Ambient Ring Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
      </div>
    </section>
  );
}

export default PromoBanner;

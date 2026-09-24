import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBannerImg from "@/assets/herobanner.png";

export function HeroBanner() {
  return (
    <div className="w-full my-6 px-4 sm:px-8 lg:px-14">
      <div className="w-full relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-black border border-slate-800/80 group">
        {/* Left / Right Carousel Controls */}
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all shadow-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all shadow-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Full Image Banner (No text overlay) */}
        <Link to="/shop?promo=msi-bonus" className="block w-full">
          <img
            src={heroBannerImg}
            alt="Hero Promotion Banner"
            className="w-full h-auto object-cover rounded-2xl md:rounded-3xl block"
          />
        </Link>
      </div>
    </div>
  );
}

export default HeroBanner;


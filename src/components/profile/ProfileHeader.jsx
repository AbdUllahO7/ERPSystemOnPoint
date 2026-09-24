import React from "react";
import { Link } from "react-router-dom";

export function ProfileHeader({ onNavigate }) {
  const scrollTo = (id) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="w-full bg-[#0e1726]/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0066d1] to-[#00b4d8] flex items-center justify-center text-white font-black text-xl shadow-lg ring-2 ring-blue-400/20">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white leading-none">
              ONPOINT
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
              General Trading & Contracting Co.
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="text-[#00b4d8] hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#00b4d8]"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollTo("about")}
            className="hover:text-white transition-colors py-1"
          >
            About us
          </button>
          <button
            type="button"
            onClick={() => scrollTo("services")}
            className="hover:text-white transition-colors py-1"
          >
            Our Services
          </button>
          <button
            type="button"
            onClick={() => scrollTo("faq")}
            className="hover:text-white transition-colors py-1"
          >
            FAQ
          </button>
        </nav>

        {/* Contact CTA Button */}
        <button
          type="button"
          onClick={() => scrollTo("contact")}
          className="px-6 py-2.5 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
        >
          Contact Us
        </button>
      </div>
    </header>
  );
}

export default ProfileHeader;

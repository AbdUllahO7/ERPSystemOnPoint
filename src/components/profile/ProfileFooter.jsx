import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Mail } from "lucide-react";

export function ProfileFooter({ onNavigate }) {
  const scrollTo = (id) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#162a45] text-white pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-8 border-b border-slate-700/60">
          {/* Brand column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0066d1] to-[#00b4d8] flex items-center justify-center text-white font-bold text-xl shadow-md">
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
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              On Point delivers smart digital solutions that help businesses build, grow, and operate more
              effectively
            </p>

            {/* Social icons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-200 block">Follow us</span>
              <div className="flex items-center gap-2.5">
                <a
                  href="#facebook"
                  className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#instagram"
                  className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#whatsapp"
                  className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="mailto:support@onpoint.com"
                  className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-6 grid grid-cols-2 gap-6">
            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white tracking-wider">Company</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo("about")}
                    className="hover:text-white transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo("services")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Our Services
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo("faq")}
                    className="hover:text-white transition-colors text-left"
                  >
                    FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li>
                  <Link to="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-slate-400">
          © 2026 Copyright by ON Point
        </div>
      </div>
    </footer>
  );
}

export default ProfileFooter;

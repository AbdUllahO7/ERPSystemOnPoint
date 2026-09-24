import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="w-full bg-[#162a45] text-white pt-14 pb-8 mt-16 border-t border-slate-800">
      <div className="px-4 sm:px-8 lg:px-14">
        
        {/* Main Grid with Vertical Divider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-700/60">
          
          {/* Column 1: Logo, App Downloads, Social Icons (Left Side with Right Border) */}
          <div className="lg:col-span-4 space-y-6 lg:border-r border-slate-700/60 lg:pr-10">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-tr from-[#0066d1] to-[#00b4d8] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-2 ring-blue-400/20">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  ONPOINT
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
                  General Trading & Contracting Co.
                </span>
              </div>
            </div>

            {/* Download App Section */}
            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wider">
                Download App
              </h4>
              <div className="flex items-center gap-3">
                {/* Google Play Button */}
                <a
                  href="#playstore"
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-black hover:bg-slate-900 border border-slate-700 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.99 1.99 0 0 1-.225-1.01V2.825c0-.368.082-.714.224-1.011zm11.233 11.233l2.428 2.428-11.455 6.545 9.027-8.973zm0-2.094L5.815 1.98l11.455 6.545-2.428 2.428zm1.096 1.047l3.296 1.883c.96.549.96 1.444 0 1.993l-3.296 1.883-2.128-2.129 2.128-1.63z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 leading-none">GET IT ON</span>
                    <span className="text-xs font-bold text-white leading-tight">Google Play</span>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href="#appstore"
                  className="flex items-center gap-2.5 px-3.5 py-2 bg-black hover:bg-slate-900 border border-slate-700 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.18.67-2.84 1.45-.58.67-1.1 1.77-.96 2.83 1.12.09 2.2-.55 2.84-1.33z" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 leading-none">Download on the</span>
                    <span className="text-xs font-bold text-white leading-tight">App Store</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Circle Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#facebook" className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#instagram" className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#whatsapp" className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="mailto:support@onpoint.com" className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+96551675316" className="w-9 h-9 rounded-full bg-white text-[#162a45] hover:bg-[#0066d1] hover:text-white flex items-center justify-center transition-colors shadow-sm">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Side: Links & Contact Info (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 2: Home Links (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Home
              </h3>
              <ul className="space-y-3 text-sm text-slate-300 font-medium">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/return-policy" className="hover:text-white transition-colors">
                    Return Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Information & Payments (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Contact Information
              </h3>

              <div className="space-y-3.5 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>345 Faulconer Drive, Suite 4 • Charlottesville, CA, 12345</span>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <a href="tel:+96551675316" className="hover:text-white transition-colors">
                      +965 516 75316
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <a href="mailto:Support@upnq8.com" className="hover:text-white transition-colors">
                      Support@upnq8.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Payment Method Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200">
                  VISA
                </span>
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block -mr-1.5" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                </span>
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200 italic font-serif">
                  PayPal
                </span>
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200">
                  stripe
                </span>
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200">
                  G Pay
                </span>
                <span className="px-3.5 py-2 bg-[#203653] rounded-md text-xs font-bold tracking-wider text-slate-200">
                   Pay
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 text-center text-xs text-slate-400 font-medium">
          © 2026 Copyright by ON Point
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;

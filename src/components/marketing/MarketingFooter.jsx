import React from "react";
import { Link } from "react-router-dom";
import logoSvg from "@/assets/ImagesWebSite/logo.svg";

export default function MarketingFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSvg} alt="OnPoint" className="w-9 h-9 object-contain" />
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                ONPOINT
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Comprehensive ERP system empowering modern businesses to streamline operations, manage finances, automate workflows, and drive continuous growth.
            </p>
          </div>

          {/* Applications */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Applications
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/solutions/hr" className="hover:text-[#0F71BA] transition-colors">Human Resources</Link></li>
              <li><Link to="/solutions/accounting" className="hover:text-[#0F71BA] transition-colors">Accounting & Tax</Link></li>
              <li><Link to="/solutions/inventory" className="hover:text-[#0F71BA] transition-colors">Inventory Control</Link></li>
              <li><Link to="/solutions/crm" className="hover:text-[#0F71BA] transition-colors">CRM & Pipelines</Link></li>
              <li><Link to="/solutions/rentals" className="hover:text-[#0F71BA] transition-colors">Rentals & Bookings</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/pricing" className="hover:text-[#0F71BA] transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/contact" className="hover:text-[#0F71BA] transition-colors">Contact Support</Link></li>
              <li><Link to="/get-started" className="hover:text-[#0F71BA] transition-colors">Get Started</Link></li>
              <li><Link to="/about" className="hover:text-[#0F71BA] transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/privacy-policy" className="hover:text-[#0F71BA] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#0F71BA] transition-colors">Terms of Service</Link></li>
              <li><Link to="/return-policy" className="hover:text-[#0F71BA] transition-colors">Return Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} OnPoint ERP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-600">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-600">Terms</Link>
            <Link to="/contact" className="hover:text-slate-600">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, Sparkles, Building2, Users, DollarSign, Package, Calendar, Globe, Headphones } from "lucide-react";
import logoSvg from "@/assets/ImagesWebSite/logo.svg";

export default function MarketingHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applications = [
    { title: "Human Resources (HR)", desc: "Employees, attendance, payroll & leave management", icon: Users, href: "/solutions/hr" },
    { title: "Accounting & Finance", desc: "General ledger, invoicing, taxes & financial reports", icon: DollarSign, href: "/solutions/accounting" },
    { title: "Inventory & Stock", desc: "Warehouse tracking, purchases & barcode management", icon: Package, href: "/solutions/inventory" },
    { title: "CRM & Sales", desc: "Lead tracking, deals pipeline & customer management", icon: Building2, href: "/solutions/crm" },
    { title: "Rentals & Booking", desc: "Rental contracts, assets scheduling & reservations", icon: Calendar, href: "/solutions/rentals" },
    { title: "Website & Store Builder", desc: "Build online stores, landing pages & ecommerce", icon: Globe, href: "/solutions/website-builder" },
  ];

  const solutions = [
    { title: "For Startups & SMEs", desc: "All-in-one scalable tools for emerging businesses", href: "/solutions/sme" },
    { title: "For Enterprises", desc: "Custom workflows, advanced permissions & multi-branches", href: "/solutions/enterprise" },
    { title: "For Retail & E-Commerce", desc: "Integrated POS, inventory & multi-channel sales", href: "/solutions/retail" },
  ];

  const resources = [
    { title: "Documentation & Guides", desc: "Step-by-step tutorials and technical docs", href: "/docs" },
    { title: "System Updates", desc: "What's new in OnPoint release notes", href: "/updates" },
    { title: "Knowledge Base & FAQs", desc: "Frequently asked questions and guides", href: "/support" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* ── Brand Logo ────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoSvg}
            alt="OnPoint Logo"
            className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 font-sans">
            ONPOINT
          </span>
        </Link>

        {/* ── Desktop Navigation ────────────────────────────────── */}
        <nav ref={dropdownRef} className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
          
          {/* Home */}
          <Link
            to="/"
            className={`relative py-1 transition-colors hover:text-slate-900 ${
              location.pathname === "/" ? "text-slate-900 font-semibold after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#0F71BA] after:rounded-full" : ""
            }`}
          >
            Home
          </Link>

          {/* Applications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "apps" ? null : "apps")}
              className="flex items-center gap-1.5 py-1 transition-colors hover:text-slate-900"
            >
              Applications
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "apps" ? "rotate-180 text-[#0F71BA]" : "text-slate-400"}`} />
            </button>
            {activeDropdown === "apps" && (
              <div className="absolute top-full -left-20 mt-3 w-80 sm:w-96 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-2">
                {applications.map((app, idx) => (
                  <Link
                    key={idx}
                    to={app.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#0F71BA] flex items-center justify-center shrink-0 group-hover:bg-[#0F71BA] group-hover:text-white transition-colors">
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0F71BA] transition-colors">{app.title}</div>
                      <div className="text-xs text-slate-500 leading-snug">{app.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "solutions" ? null : "solutions")}
              className="flex items-center gap-1.5 py-1 transition-colors hover:text-slate-900"
            >
              Solutions
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "solutions" ? "rotate-180 text-[#0F71BA]" : "text-slate-400"}`} />
            </button>
            {activeDropdown === "solutions" && (
              <div className="absolute top-full -left-12 mt-3 w-72 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                {solutions.map((sol, idx) => (
                  <Link
                    key={idx}
                    to={sol.href}
                    onClick={() => setActiveDropdown(null)}
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0F71BA]">{sol.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sol.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 py-1 transition-colors hover:text-slate-900"
          >
            Pricing
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Resources Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "resources" ? null : "resources")}
              className="flex items-center gap-1.5 py-1 transition-colors hover:text-slate-900"
            >
              Resources
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180 text-[#0F71BA]" : "text-slate-400"}`} />
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full -left-12 mt-3 w-72 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                {resources.map((res, idx) => (
                  <Link
                    key={idx}
                    to={res.href}
                    onClick={() => setActiveDropdown(null)}
                    className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-[#0F71BA]">{res.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{res.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Contact Us */}
          <Link
            to="/contact"
            className="py-1 transition-colors hover:text-slate-900"
          >
            Contact Us
          </Link>
        </nav>

        {/* ── Action Buttons (Right) ────────────────────────────── */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/get-started"
            className="inline-flex items-center justify-center text-sm font-medium text-white bg-[#0F71BA] hover:bg-[#0c5c99] px-5 py-2.5 rounded-full shadow-sm shadow-sky-500/25 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Try It Free
          </Link>
        </div>

        {/* ── Mobile Hamburger ─────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-700 px-3 py-1.5"
          >
            Sign In
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-slate-900 rounded-lg hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Contact Us
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/get-started"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-4 bg-[#0F71BA] text-white rounded-full font-medium text-sm shadow-sm"
            >
              Try It Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

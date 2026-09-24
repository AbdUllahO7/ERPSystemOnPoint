import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  User,
  ShoppingCart,
  Heart,
  Menu,
  X,
} from "lucide-react";

export function StoreHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: "ELECTRONICS", path: "/shop?cat=electronics" },
    { name: "FASHION", path: "/shop?cat=fashion" },
    { name: "BEAUTY & PERSONAL CARE", path: "/shop?cat=beauty" },
    { name: "HOME & FURNITURE", path: "/shop?cat=home" },
    { name: "KITCHEN & DINING", path: "/shop?cat=kitchen" },
    { name: "HEALTH & WELLNESS", path: "/shop?cat=health" },
    { name: "GROCERIES", path: "/shop?cat=groceries" },
    { name: "BABY & KIDS", path: "/shop?cat=kids" },
    { name: "TOYS & GAMES", path: "/shop?cat=toys" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-xs">
      {/* 1. Top Bar */}
      <div className="bg-[#162a45] text-slate-300 text-xs py-2 px-3 sm:px-8 lg:px-14 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-200 text-[11px] sm:text-xs truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-medium">Delivered To</strong> Syria/Lattakia
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-slate-300 text-xs shrink-0">
          <Link to="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span className="text-slate-600">•</span>
          <Link to="/return-policy" className="hover:text-white transition-colors">
            Return Policy
          </Link>
          <span className="text-slate-600">•</span>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms and Conditions
          </Link>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="py-3 sm:py-4 px-3 sm:px-8 lg:px-14 flex items-center justify-between gap-2 sm:gap-4 md:gap-8 border-b border-slate-100">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#0066d1] to-[#00b4d8] flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-md ring-2 ring-blue-100 shrink-0">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#162a45] leading-none">
              ONPOINT
            </span>
            <span className="hidden sm:block text-[9px] uppercase tracking-wider text-slate-500 font-medium mt-0.5">
              General Trading & Contracting Co.
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-2xl items-center relative"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-[#f1f5f9] text-slate-800 placeholder-slate-400 text-sm rounded-l-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0066d1]/20 border border-transparent focus:bg-white focus:border-[#0066d1]"
          />
          <button
            type="submit"
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-6 py-2.5 rounded-r-lg flex items-center justify-center transition-colors h-full shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* User Actions */}
        <div className="flex items-center gap-1 sm:gap-3 md:gap-5 shrink-0">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="p-1.5 sm:p-2 text-slate-700 hover:text-[#0066d1] hover:bg-slate-50 rounded-full transition-colors relative"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="p-1.5 sm:p-2 text-slate-700 hover:text-[#0066d1] hover:bg-slate-50 rounded-full transition-colors relative"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-[#0066d1] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </Link>

          {/* Profile / Account */}
          <Link
            to="/account"
            className="p-1.5 sm:p-2 text-slate-700 hover:text-[#0066d1] hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1.5"
            title="My Account"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline text-xs font-semibold text-slate-700 hover:text-[#0066d1]">
              User Name
            </span>
          </Link>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to="/auth/sign-in"
              className="px-3 py-1.5 text-xs font-semibold text-[#0066d1] border border-[#0066d1] rounded-lg hover:bg-blue-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/auth/sign-up"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0066d1] hover:bg-[#0052a8] rounded-lg shadow-sm transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-700 hover:text-[#0066d1] rounded-lg"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Category Nav Bar (Desktop) */}
      <nav className="hidden lg:flex items-center justify-between px-4 sm:px-8 lg:px-14 py-3 bg-white border-b border-slate-100 overflow-x-auto text-xs font-bold tracking-wider text-slate-700 uppercase gap-6 whitespace-nowrap scrollbar-none">
        {categories.map((cat, i) => (
          <Link
            key={i}
            to={cat.path}
            className="hover:text-[#0066d1] transition-colors py-1 relative group"
          >
            {cat.name}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0066d1] group-hover:w-full transition-all duration-200" />
          </Link>
        ))}
      </nav>

      {/* Mobile Search & Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 animate-in slide-in-from-top-2 shadow-lg">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#f1f5f9] text-slate-800 text-sm rounded-l-lg py-2 px-3 focus:outline-none border border-transparent focus:border-[#0066d1]"
            />
            <button
              type="submit"
              className="bg-[#0066d1] text-white px-4 py-2 rounded-r-lg flex items-center justify-center shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Auth links on Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <Link
              to="/auth/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-xs font-semibold text-[#0066d1] border border-[#0066d1] rounded-lg"
            >
              Log In
            </Link>
            <Link
              to="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-2 text-xs font-semibold text-white bg-[#0066d1] rounded-lg"
            >
              Register
            </Link>
          </div>

          {/* Category links on Mobile */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              {categories.map((cat, i) => (
                <Link
                  key={i}
                  to={cat.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-700 hover:text-[#0066d1] hover:bg-blue-50/50 rounded transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Policy links on Mobile */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <Link to="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)}>Privacy Policy</Link>
            <Link to="/return-policy" onClick={() => setIsMobileMenuOpen(false)}>Return Policy</Link>
            <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)}>Terms</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default StoreHeader;

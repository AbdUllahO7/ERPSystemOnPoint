import React from "react";
import { Link } from "react-router-dom";
import { useEcommerceCategories } from "@/features/ecommerce";

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useEcommerceCategories();

  return (
    <section className="w-full my-10 px-4 sm:px-8 lg:px-14">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 tracking-tight">
        Categories
      </h2>

      {/* Grid of Circular Categories */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-4 sm:gap-y-6 gap-x-2 sm:gap-x-4">
        {isLoading
          ? [...Array(16)].map((_, i) => (
              <div key={i} className="flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-200" />
                <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-slate-200 rounded mt-2" />
              </div>
            ))
          : categories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                to={cat.path || `/shop?cat=${cat.slug || cat.id}`}
                className="flex flex-col items-center group text-center"
              >
                {/* Circular Ring Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-slate-100/90 border-2 border-slate-200/80 p-2 sm:p-2.5 flex items-center justify-center shadow-xs group-hover:border-[#0066d1] group-hover:scale-105 transition-all duration-200">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>

                {/* Label */}
                <span className="mt-1.5 sm:mt-2.5 text-[11px] sm:text-xs md:text-sm font-semibold text-slate-800 group-hover:text-[#0066d1] transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}

export default CategoriesSection;

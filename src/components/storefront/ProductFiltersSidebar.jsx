import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, SlidersHorizontal, RotateCcw } from "lucide-react";

export function ProductFiltersSidebar({
  categories = [],
  brands = [],
  selectedCategory = "all",
  onSelectCategory,
  selectedBrands = [],
  onToggleBrand,
  priceRange = { min: 0, max: 500 },
  onPriceChange,
  onApplyPriceFilter,
  inStock = true,
  onToggleInStock,
  onSale = false,
  onToggleOnSale,
  onResetFilters,
  isMobile = false,
}) {
  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    status: true,
    brand: true,
  });

  const [localMaxPrice, setLocalMaxPrice] = useState(priceRange.max || 500);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    if (onPriceChange) {
      onPriceChange({ min: priceRange.min, max: localMaxPrice });
    }
    if (onApplyPriceFilter) {
      onApplyPriceFilter();
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? "p-4" : ""}`}>
      {/* Clear Filters (if any filter is applied) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0066d1]" />
          Filters
        </span>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* 1. Product Category Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm"
        >
          <span>Product Category</span>
          {openSections.category ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.category && (
          <div className="mt-3.5 space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || (selectedCategory === "all" && cat.id === "all");
              return (
                <label
                  key={cat.id}
                  onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                  className="flex items-center justify-between group cursor-pointer text-xs text-slate-600 hover:text-[#0066d1] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#0066d1] border-[#0066d1] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#0066d1]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={isSelected ? "font-bold text-[#0066d1]" : "font-normal"}>
                      {cat.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Filter by Price Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm"
        >
          <span>Filter by price</span>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.price && (
          <div className="mt-4 space-y-4">
            {/* Range Slider */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0066d1]"
              />
            </div>

            {/* Filter Action & Price Label */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleApplyPrice}
                className="px-5 py-1.5 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Filter
              </button>
              <span className="text-xs text-slate-500 font-medium">
                price: <strong className="text-slate-800">${priceRange.min} - ${localMaxPrice}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Product Status Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm"
        >
          <span>Product Status</span>
          {openSections.status ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.status && (
          <div className="mt-3.5 space-y-2.5">
            <label
              onClick={onToggleInStock}
              className="flex items-center gap-2.5 group cursor-pointer text-xs text-slate-600 hover:text-[#0066d1]"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  inStock
                    ? "bg-[#0066d1] border-[#0066d1] text-white"
                    : "border-slate-300 bg-white group-hover:border-[#0066d1]"
                }`}
              >
                {inStock && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className={inStock ? "font-bold text-[#0066d1]" : "font-normal"}>
                In Stock
              </span>
            </label>

            <label
              onClick={onToggleOnSale}
              className="flex items-center gap-2.5 group cursor-pointer text-xs text-slate-600 hover:text-[#0066d1]"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  onSale
                    ? "bg-[#0066d1] border-[#0066d1] text-white"
                    : "border-slate-300 bg-white group-hover:border-[#0066d1]"
                }`}
              >
                {onSale && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className={onSale ? "font-bold text-[#0066d1]" : "font-normal"}>
                On Sale
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 4. Product Brand Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection("brand")}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-sm"
        >
          <span>Product Brand</span>
          {openSections.brand ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.brand && (
          <div className="mt-3.5 space-y-2.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {brands.map((brand) => {
              const isSelected = selectedBrands.includes(brand.id);
              return (
                <label
                  key={brand.id}
                  onClick={() => onToggleBrand && onToggleBrand(brand.id)}
                  className="flex items-center justify-between group cursor-pointer text-xs text-slate-600 hover:text-[#0066d1] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#0066d1] border-[#0066d1] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#0066d1]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={isSelected ? "font-bold text-[#0066d1]" : "font-normal"}>
                      {brand.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductFiltersSidebar;

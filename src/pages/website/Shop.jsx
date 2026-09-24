import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ArrowUpDown, SearchX } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import ProductFiltersSidebar from "@/components/storefront/ProductFiltersSidebar";
import { useShopProducts, useFilterOptions } from "@/features/ecommerce";
import toast from "react-hot-toast";

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("cat") || "all";

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [inStock, setInStock] = useState(true);
  const [onSale, setOnSale] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL category parameter
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Query filter options (categories and brands)
  const { data: filterOptions = { categories: [], brands: [] } } = useFilterOptions();

  // Query shop products
  const {
    data: shopData = { items: [], total: 5200 },
    isLoading,
  } = useShopProducts({
    search: searchParam,
    category: selectedCategory,
    brand: selectedBrands,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    inStock,
    onSale,
  });

  const products = shopData.items || [];
  const totalCount = shopData.total || products.length;

  const handleSelectCategory = (slug) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      newParams.delete("cat");
    } else {
      newParams.set("cat", slug);
    }
    setSearchParams(newParams);
  };

  const handleToggleBrand = (brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 500 });
    setInStock(true);
    setOnSale(false);
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  const handleAddToCart = (product) => {
    toast.success(`تمت إضافة "${product.title.slice(0, 25)}..." إلى السلة!`);
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-6 md:py-8 px-4 sm:px-8 lg:px-14">
      {/* 1. Header & Results Summary Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Results ({totalCount.toLocaleString()})
          </h1>
          {searchParam && (
            <span className="text-xs bg-blue-50 text-[#0066d1] border border-blue-200 px-3 py-1 rounded-full font-medium">
              Keyword: "{searchParam}"
            </span>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0066d1]" />
          Filters
        </button>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24">
          <ProductFiltersSidebar
            categories={filterOptions.categories}
            brands={filterOptions.brands}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            inStock={inStock}
            onToggleInStock={() => setInStock(!inStock)}
            onSale={onSale}
            onToggleOnSale={() => setOnSale(!onSale)}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Right Main Grid */}
        <main className="flex-1 w-full min-w-0">
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[24px] border border-slate-100 p-4 space-y-3 animate-pulse"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-9 w-full bg-slate-200 rounded-lg mt-4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            /* Products Grid matching screenshot */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  image={product.image}
                  originalPrice={product.originalPrice}
                  price={product.price}
                  badge={product.badge}
                  badgeType={product.badgeType}
                  rating={product.rating || 5}
                  reviewsCount={product.reviewsCount || 4}
                  showAddToCart={true}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0066d1] flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-sm text-slate-500">
                Try clearing some filters or changing your search criteria to discover available items.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 3. Mobile Filter Modal Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0066d1]" />
                Filter Products
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1">
              <ProductFiltersSidebar
                categories={filterOptions.categories}
                brands={filterOptions.brands}
                selectedCategory={selectedCategory}
                onSelectCategory={(slug) => {
                  handleSelectCategory(slug);
                  setIsMobileFilterOpen(false);
                }}
                selectedBrands={selectedBrands}
                onToggleBrand={handleToggleBrand}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                inStock={inStock}
                onToggleInStock={() => setInStock(!inStock)}
                onSale={onSale}
                onToggleOnSale={() => setOnSale(!onSale)}
                onResetFilters={handleResetFilters}
                isMobile={true}
              />
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#0066d1] text-white font-bold rounded-xl text-sm shadow-md"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;

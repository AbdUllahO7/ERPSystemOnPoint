import React, { useState } from "react";
import { Search, Filter, Eye } from "lucide-react";

export function EcommerceProductListDetailView({
  categories,
  onViewCategoryProducts,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by id or category name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0066d1] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Category Rows List */}
      <div className="space-y-3 pt-2">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {cat.name}
            </span>

            <button
              type="button"
              onClick={() => onViewCategoryProducts && onViewCategoryProducts(cat)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0066d1] hover:text-[#0052a8] transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View Products</span>
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 pt-2 text-xs font-semibold text-slate-600">
        <button type="button" className="px-2 py-1 hover:text-slate-900">
          Pre
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg bg-[#0066d1] text-white font-bold flex items-center justify-center shadow-xs"
        >
          1
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
        >
          2
        </button>
        <span className="px-1 text-slate-400">....</span>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
        >
          20
        </button>
        <button
          type="button"
          className="px-2 py-1 text-[#0066d1] font-bold hover:underline"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default EcommerceProductListDetailView;

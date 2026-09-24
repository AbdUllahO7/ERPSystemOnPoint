import React from "react";
import { Eye } from "lucide-react";

export function StepEcommerceProducts({
  categories,
  onToggleCategoryAll,
  onViewCategoryProducts,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Step 4: Products
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Select the products you want to add to the site from your inventory
        </p>
      </div>

      {/* Category Rows List */}
      <div className="space-y-3 pt-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
          >
            {/* Category Name */}
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {cat.name}
            </span>

            {/* Right Controls */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
              {/* Add All Product To E-Commerce */}
              <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(cat.isAllSelected)}
                  onChange={() => onToggleCategoryAll && onToggleCategoryAll(cat.id)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                />
                <span className="hidden sm:inline">Add All Product To E-Commerce</span>
                <span className="sm:hidden">Add All</span>
              </label>

              {/* View Products Link */}
              <button
                type="button"
                onClick={() => onViewCategoryProducts && onViewCategoryProducts(cat)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0066d1] hover:text-[#0052a8] transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Products</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination matching Screenshot 4 */}
      <div className="flex items-center justify-end gap-2 pt-4 text-xs font-semibold text-slate-600">
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

export default StepEcommerceProducts;

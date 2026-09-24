import React, { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function EcommerceCategoriesTableView({
  categories = [],
  onToggleCategory,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.toLowerCase();
    return categories.filter((cat) => cat.name?.toLowerCase().includes(q));
  }, [categories, debouncedSearch]);

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

      {/* Categories Table */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                  />
                </th>
                <th className="py-3.5 px-4 w-40">Serial Number</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4 text-right w-12">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 inline" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCategories.map((cat, idx) => (
                <tr key={cat.id || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={Boolean(cat.selected)}
                      onChange={() => onToggleCategory(cat.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#0066d1]">
                    {cat.serialNumber || 1}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <input
                      type="checkbox"
                      checked={Boolean(cat.selected)}
                      onChange={() => onToggleCategory(cat.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default React.memo(EcommerceCategoriesTableView);

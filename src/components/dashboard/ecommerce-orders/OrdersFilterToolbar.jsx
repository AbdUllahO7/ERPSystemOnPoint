import React from "react";
import {
  Search,
  Filter,
  List,
  LayoutGrid,
  RefreshCw,
  Printer,
  Download,
} from "lucide-react";

export function OrdersFilterToolbar({
  searchQuery,
  onSearchChange,
  onRefresh,
  onExport,
  viewMode = "list",
  onViewModeChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Left: Search & Filter */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by id or employee name..."
            value={searchQuery || ""}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0066d1] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Right: Actions (List/Grid view, Refresh, Print, Export) */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-[#0066d1] text-white"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange && onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[#0066d1] text-white"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
          title="Print"
        >
          <Printer className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onExport}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}

export default OrdersFilterToolbar;

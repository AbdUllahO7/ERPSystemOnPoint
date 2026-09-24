import React from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export function OrderDetailsItemsTable({
  items = [],
  selectedItems = [],
  onToggleItem,
  onToggleAllItems,
  searchQuery = "",
  onSearchChange,
}) {
  const isAllSelected =
    items.length > 0 && selectedItems.length === items.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by id or employee name..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
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

      {/* Items Table */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleAllItems}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                  />
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Code</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Item Name</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Category</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Unit</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <div className="inline-flex items-center gap-1">
                    <span>Number of pieces required</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right w-12">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 inline" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map((item, idx) => {
                const isSelected = selectedItems.includes(item.id);

                return (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItem && onToggleItem(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0066d1]">
                      {item.code || "1"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0066d1]">
                      {item.name || "Laptop Pro 14"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.category || "Electronics"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.unit || "Piece"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0066d1]">
                      {item.quantity || "30"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {/* Actions */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 pt-2 text-xs font-semibold text-slate-600">
        <button type="button" className="px-2 py-1 hover:text-slate-900 cursor-pointer">
          Pre
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg bg-[#0066d1] text-white font-bold flex items-center justify-center shadow-xs cursor-pointer"
        >
          1
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          2
        </button>
        <span className="px-1 text-slate-400">....</span>
        <button
          type="button"
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          20
        </button>
        <button
          type="button"
          className="px-2 py-1 text-[#0066d1] font-bold hover:underline cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OrderDetailsItemsTable;

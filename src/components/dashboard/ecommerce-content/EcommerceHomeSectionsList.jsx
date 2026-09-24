import React from "react";
import { ArrowUp, ArrowDown, Settings, Plus } from "lucide-react";

export function EcommerceHomeSectionsList({
  sections,
  onMoveSection,
  onToggleSection,
  onOpenSectionSettings,
  onAddProductList,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
      {sections.map((section, index) => {
        const canMoveUp = index > 0;
        const canMoveDown = index < sections.length - 1;

        return (
          <div
            key={section.id || index}
            className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
          >
            {/* Title */}
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {section.title}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Settings Gear Icon */}
              {section.hasSettings && (
                <button
                  type="button"
                  onClick={() => onOpenSectionSettings(section.id)}
                  className="p-1.5 text-slate-400 hover:text-[#0066d1] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Configure Section"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* Reorder Arrows */}
              <div className="flex items-center gap-1 text-[#0066d1]">
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={() => onMoveSection(index, "up")}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={() => onMoveSection(index, "down")}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Status Pill */}
              <button
                type="button"
                onClick={() => onToggleSection(section.id)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  section.status === "Apparent"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100/70"
                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {section.status || "Apparent"}
              </button>

              {/* Add List Button */}
              {section.hasAddList && (
                <button
                  type="button"
                  onClick={onAddProductList}
                  className="px-5 py-2 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add List
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EcommerceHomeSectionsList;

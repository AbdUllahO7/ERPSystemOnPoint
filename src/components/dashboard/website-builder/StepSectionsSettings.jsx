import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function StepSectionsSettings({
  sections,
  onMoveSection,
  onToggleSection,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Step 3: Sections & Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Sections Management
        </p>
      </div>

      {/* Sections Cards List */}
      <div className="space-y-3 pt-2">
        {sections.map((section, index) => {
          const isFirstMovable = index === 2; // after topbar & hero
          const isLastMovable = index === sections.length - 2; // before footer

          return (
            <div
              key={section.id || index}
              className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
            >
              {/* Section Title */}
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {section.title}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Reorder Arrows (Visible for movable middle sections) */}
                {section.canReorder !== false && (
                  <div className="flex items-center gap-1 text-[#0066d1]">
                    <button
                      type="button"
                      disabled={isFirstMovable}
                      onClick={() => onMoveSection(index, "up")}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      disabled={isLastMovable}
                      onClick={() => onMoveSection(index, "down")}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                {/* Status Pill (Apparent / Hidden) */}
                <button
                  type="button"
                  onClick={() => onToggleSection && onToggleSection(section.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    section.status === "Apparent"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100/70"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {section.status || "Apparent"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepSectionsSettings;

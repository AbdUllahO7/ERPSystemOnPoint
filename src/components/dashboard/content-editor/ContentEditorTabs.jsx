import React from "react";
import { CONTENT_SECTION_TABS } from "@/features/website-content";

export function ContentEditorTabs({ activeTab, onTabClick }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 sm:gap-4 min-w-max px-2 py-1">
        {CONTENT_SECTION_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabClick(tab.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? "text-[#0066d1] bg-blue-50/70 border-b-2 border-[#0066d1]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ContentEditorTabs;

import React from "react";
import { WEBSITE_TYPES } from "@/features/website-builder";

export function StepPublishing({
  websiteType,
  info,
  subdomain,
  onSubdomainChange,
}) {
  const typeDisplay =
    websiteType === WEBSITE_TYPES.COMPANY
      ? "Company Website"
      : "E-Commerce";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Step 4: Publishing
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Verify the data before launching the site with one click
        </p>
      </div>

      {/* Summary Data */}
      <div className="space-y-6 pt-2">
        {/* Info row */}
        <div className="flex flex-wrap items-center gap-8 sm:gap-16 text-xs sm:text-sm">
          <div>
            <span className="font-bold text-slate-900">Website name : </span>
            <span className="text-slate-600 font-medium">
              {info.websiteName || "website name"}
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-900">Website type : </span>
            <span className="text-slate-600 font-medium">
              {typeDisplay}
            </span>
          </div>
        </div>

        {/* Website Link Field */}
        <div className="space-y-2 max-w-md">
          <label className="text-xs font-bold text-slate-800 block">
            Website link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="website name"
              value={subdomain || ""}
              onChange={(e) => onSubdomainChange && onSubdomainChange(e.target.value)}
              className="w-full max-w-[240px] bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all font-medium"
            />
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              .onpoint.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepPublishing;

import React from "react";

export function CtaContentEditor({ data, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Call To Action Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter the primary and secondary text and the button title.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5 pt-2">
        {/* Main Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Main Text</label>
          <input
            type="text"
            placeholder="main text"
            value={data.mainText || ""}
            onChange={(e) => onChange("mainText", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all font-semibold"
          />
        </div>

        {/* Secondary Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Secondary Text</label>
          <textarea
            rows={4}
            placeholder="secondary text"
            value={data.secondaryText || ""}
            onChange={(e) => onChange("secondaryText", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Button Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Button Text</label>
          <input
            type="text"
            placeholder="button text"
            value={data.buttonText || ""}
            onChange={(e) => onChange("buttonText", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all font-bold text-[#0066d1]"
          />
        </div>
      </div>
    </div>
  );
}

export default CtaContentEditor;

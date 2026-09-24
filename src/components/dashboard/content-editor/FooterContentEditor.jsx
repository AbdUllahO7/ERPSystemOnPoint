import React from "react";

export function FooterContentEditor({ data, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Footer Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter description and contact information
        </p>
      </div>

      <div className="space-y-5 pt-2">
        {/* The text below the logo */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">
            The text below the logo
          </label>
          <textarea
            rows={4}
            placeholder="The text below the logo"
            value={data.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Row 1: Facebook Link & Instagram Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Facebook Link</label>
            <input
              type="url"
              placeholder="facebook link"
              value={data.facebookLink || ""}
              onChange={(e) => onChange("facebookLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Instagram Link</label>
            <input
              type="url"
              placeholder="instagram link"
              value={data.instagramLink || ""}
              onChange={(e) => onChange("instagramLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Whatsapp Link & E-Mail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Whatsapp Link</label>
            <input
              type="text"
              placeholder="whatsapp link"
              value={data.whatsappLink || ""}
              onChange={(e) => onChange("whatsappLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">E-Mail</label>
            <input
              type="email"
              placeholder="E-Mail"
              value={data.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterContentEditor;

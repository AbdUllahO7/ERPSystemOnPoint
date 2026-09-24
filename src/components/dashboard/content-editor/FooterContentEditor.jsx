import React from "react";

export function FooterContentEditor({ data, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Footer Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter footer description, copyright, and social media links
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Company Brief Description</label>
          <textarea
            rows={3}
            placeholder="On Point delivers smart digital solutions that help businesses build, grow, and operate more effectively"
            value={data.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Facebook URL</label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={data.facebookLink || ""}
              onChange={(e) => onChange("facebookLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Instagram URL</label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={data.instagramLink || ""}
              onChange={(e) => onChange("instagramLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">WhatsApp URL / Number</label>
            <input
              type="text"
              placeholder="+965..."
              value={data.whatsappLink || ""}
              onChange={(e) => onChange("whatsappLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-800">Copyright Text</label>
          <input
            type="text"
            placeholder="© 2026 Copyright by ON Point"
            value={data.copyright || ""}
            onChange={(e) => onChange("copyright", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export default FooterContentEditor;

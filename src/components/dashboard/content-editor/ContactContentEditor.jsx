import React from "react";

export function ContactContentEditor({ data, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Contact Us Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter contact information
        </p>
      </div>

      {/* Form Fields Stacked Full-Width matching Screenshot 2 */}
      <div className="space-y-5 pt-2">
        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Phone Number</label>
          <input
            type="tel"
            placeholder="phone number"
            value={data.phoneNumber || ""}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        {/* E-Mail */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">E-Mail</label>
          <input
            type="email"
            placeholder="e-mail"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Location</label>
          <input
            type="text"
            placeholder="location"
            value={data.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export default ContactContentEditor;

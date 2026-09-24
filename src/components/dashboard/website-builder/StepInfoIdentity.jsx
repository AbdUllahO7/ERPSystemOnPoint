import React, { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import { FONT_OPTIONS, BUTTON_EDGES_OPTIONS } from "@/features/website-builder";

export function StepInfoIdentity({
  info,
  identity,
  onUpdateInfo,
  onUpdateIdentity,
  onUploadLogo,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadLogo) {
        await onUploadLogo(file);
      } else {
        const url = URL.createObjectURL(file);
        onUpdateIdentity("logoUrl", url);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Step 2: Info & identity
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter Website information and visual identity information
        </p>
      </div>

      {/* Inputs Section */}
      <div className="space-y-5">
        {/* Row 1: 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Website name</label>
            <input
              type="text"
              placeholder="website name"
              value={info.websiteName || ""}
              onChange={(e) => onUpdateInfo("websiteName", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Business name</label>
            <input
              type="text"
              placeholder="Business name"
              value={info.businessName || ""}
              onChange={(e) => onUpdateInfo("businessName", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Phone Number</label>
            <input
              type="tel"
              placeholder="phone number"
              value={info.phoneNumber || ""}
              onChange={(e) => onUpdateInfo("phoneNumber", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>

        {/* Row 2: 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">E-mail</label>
            <input
              type="email"
              placeholder="e-mail"
              value={info.email || ""}
              onChange={(e) => onUpdateInfo("email", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Facebook link</label>
            <input
              type="url"
              placeholder="Facebook link"
              value={info.facebookLink || ""}
              onChange={(e) => onUpdateInfo("facebookLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Instagram link</label>
            <input
              type="url"
              placeholder="Instagram link"
              value={info.instagramLink || ""}
              onChange={(e) => onUpdateInfo("instagramLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>

        {/* Row 3: WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">WhatsApp link</label>
            <input
              type="text"
              placeholder="WhatsApp link"
              value={info.whatsappLink || ""}
              onChange={(e) => onUpdateInfo("whatsappLink", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
            />
          </div>
        </div>

        {/* Row 4: Short Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Short description</label>
          <textarea
            rows={3}
            placeholder="Short description"
            value={info.shortDescription || ""}
            onChange={(e) => onUpdateInfo("shortDescription", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all"
          />
        </div>
      </div>

      {/* Visual Identity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left: Logo Drag & Drop Box (5 Cols) */}
        <div className="lg:col-span-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/mp4"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0066d1] bg-slate-50/50 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
          >
            {identity.logoUrl ? (
              <div className="relative group/logo">
                <img
                  src={identity.logoUrl}
                  alt="Uploaded Logo"
                  className="max-h-24 max-w-[180px] object-contain rounded-lg"
                />
                <span className="text-[11px] text-[#0066d1] font-bold mt-2 block">
                  Change Logo
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0066d1] group-hover:border-blue-200 transition-colors shadow-2xs mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Choose a logo & drop it here
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  JPEG, PNG, PDG, and MP4 formats, up to 50MB
                </p>
                <button
                  type="button"
                  className="mt-4 px-6 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 group-hover:border-[#0066d1] group-hover:text-[#0066d1] shadow-2xs transition-all"
                >
                  Browse File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Colors & Controls (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={identity.primaryColor || "#0066d1"}
                onChange={(e) => onUpdateIdentity("primaryColor", e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
              />
              <div
                className="flex-1 h-10 rounded-xl border border-slate-200 shadow-2xs flex items-center px-3"
                style={{ backgroundColor: identity.primaryColor || "#0066d1" }}
              >
                <span className="text-xs font-bold text-white drop-shadow-xs">
                  {identity.primaryColor || "#0066d1"}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={identity.secondaryColor || "#131c2e"}
                onChange={(e) => onUpdateIdentity("secondaryColor", e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
              />
              <div
                className="flex-1 h-10 rounded-xl border border-slate-200 shadow-2xs flex items-center px-3"
                style={{ backgroundColor: identity.secondaryColor || "#131c2e" }}
              >
                <span className="text-xs font-bold text-white drop-shadow-xs">
                  {identity.secondaryColor || "#131c2e"}
                </span>
              </div>
            </div>
          </div>

          {/* Font Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Font Type</label>
            <select
              value={identity.fontType || "inter"}
              onChange={(e) => onUpdateIdentity("fontType", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 text-slate-700"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Button edges */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Button edges</label>
            <select
              value={identity.buttonEdges || "rounded-xl"}
              onChange={(e) => onUpdateIdentity("buttonEdges", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 text-slate-700"
            >
              {BUTTON_EDGES_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepInfoIdentity;

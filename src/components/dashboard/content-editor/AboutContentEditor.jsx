import React, { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

export function AboutContentEditor({ data, onChange, onUploadPhoto }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadPhoto) {
        onUploadPhoto("about", file);
      } else {
        const url = URL.createObjectURL(file);
        onChange("photoUrl", url);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          About Us Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter the image, top text, title, and subtext
        </p>
      </div>

      {/* Main Image Upload Box */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full min-h-[180px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0066d1] bg-slate-50/40 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
      >
        {data.photoUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={data.photoUrl}
              alt="About Us Banner"
              className="max-h-36 max-w-md object-cover rounded-xl shadow-xs"
            />
            <span className="text-xs font-bold text-[#0066d1]">
              Change Photo
            </span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0066d1] group-hover:border-blue-200 transition-colors shadow-2xs mb-2">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">
              Choose a Photo
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              JPEG, PNG formats, up to 50MB
            </p>
            <button
              type="button"
              className="mt-3 px-6 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 group-hover:border-[#0066d1] group-hover:text-[#0066d1] shadow-2xs transition-all"
            >
              Browse File
            </button>
          </>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 pt-2">
        {/* Top Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Top Text</label>
          <input
            type="text"
            placeholder="top text"
            value={data.topText || ""}
            onChange={(e) => onChange("topText", e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

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
      </div>
    </div>
  );
}

export default AboutContentEditor;

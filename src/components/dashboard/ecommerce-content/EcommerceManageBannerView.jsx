import React, { useRef } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";

export function EcommerceManageBannerView({
  banners,
  onAddBanner,
  onDeleteBanner,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onAddBanner) {
      onAddBanner(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Banner Photo
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Insert an image to display
        </p>
      </div>

      {/* Upload Box */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full min-h-[170px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0066d1] bg-slate-50/40 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
      >
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
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md aspect-4/3 group border border-slate-800"
          >
            {/* Banner Image */}
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Red Trash Delete Button (matching Screenshot 3) */}
            <button
              type="button"
              onClick={() => onDeleteBanner(banner.id)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-600 flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer z-10"
              title="Delete Banner"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EcommerceManageBannerView;

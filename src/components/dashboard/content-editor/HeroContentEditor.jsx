import React, { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

export function HeroContentEditor({ data, onChange, onUploadPhoto }) {
  const fileInputRefs = useRef({});

  const handlePhotoClick = (place) => {
    fileInputRefs.current[place]?.click();
  };

  const handleFileSelected = (place, e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadPhoto) {
        onUploadPhoto(place, file);
      } else {
        const url = URL.createObjectURL(file);
        onChange("photos", data.photos.map((p) => (p.place === place ? { ...p, url } : p)));
      }
    }
  };

  const places = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-10">
      {/* 1. Photos Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Hero Section Photos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Choose the images you want to appear on the site in the order they will appear from left to right
          </p>
        </div>

        {/* 8 Photo Slots Grid (4 Columns x 2 Rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
          {places.map((place) => {
            const photoObj = data.photos?.find((p) => p.place === place);
            const currentUrl = photoObj?.url;

            return (
              <div key={place} className="space-y-2">
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[place] = el)}
                  onChange={(e) => handleFileSelected(place, e)}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => handlePhotoClick(place)}
                  className="w-full min-h-[170px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0066d1] bg-slate-50/40 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
                >
                  {currentUrl ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <img
                        src={currentUrl}
                        alt={`Place ${place}`}
                        className="w-full h-24 object-cover rounded-xl shadow-2xs"
                      />
                      <span className="text-[11px] font-bold text-[#0066d1]">
                        Change Place {place}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0066d1] group-hover:border-blue-200 transition-colors shadow-2xs mb-2">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Choose a Photo For <span className="text-[#0066d1]">Place {place}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        JPEG, PNG formats, up to 50MB
                      </p>
                      <button
                        type="button"
                        className="mt-3 px-4 py-1.5 rounded-xl border border-slate-300 bg-white text-[11px] font-bold text-slate-700 group-hover:border-[#0066d1] group-hover:text-[#0066d1] shadow-2xs transition-all"
                      >
                        Browse File
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Texts Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            Hero Section Texts
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Enter the main text, secondary text, and top text
          </p>
        </div>

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
              rows={3}
              placeholder="secondary text"
              value={data.secondaryText || ""}
              onChange={(e) => onChange("secondaryText", e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroContentEditor;

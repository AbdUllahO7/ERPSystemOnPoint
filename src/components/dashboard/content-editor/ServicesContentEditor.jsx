import React, { useState, useRef } from "react";
import { Image as ImageIcon, Box, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function ServicesContentEditor({ data, onChange, onUploadPhoto }) {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onUploadPhoto) {
        onUploadPhoto("service", file);
      } else {
        const url = URL.createObjectURL(file);
        setNewPhotoUrl(url);
      }
    }
  };

  const handleAddService = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a service title");
      return;
    }
    const newItem = {
      id: `srv-${Date.now()}`,
      title: newTitle,
      description: newDescription || "High quality service tailored to your business needs.",
      photoUrl: newPhotoUrl,
    };
    onChange("items", [...(data.items || []), newItem]);
    setNewTitle("");
    setNewDescription("");
    setNewPhotoUrl("");
    toast.success("Service added successfully!");
  };

  const handleDeleteService = (id) => {
    onChange(
      "items",
      data.items.filter((item) => item.id !== id)
    );
    toast.success("Service removed");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Our Services Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter the service icon, its title, and its descriptive text
        </p>
      </div>

      {/* Top Form: Upload Box (Left) + Inputs & Save Button (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Icon / Photo Upload Box (5 cols) */}
        <div className="lg:col-span-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.svg"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[190px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0066d1] bg-slate-50/40 hover:bg-blue-50/20 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
          >
            {newPhotoUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={newPhotoUrl}
                  alt="Service Icon"
                  className="w-16 h-16 object-contain rounded-xl"
                />
                <span className="text-xs font-bold text-[#0066d1]">
                  Change Icon
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#0066d1] group-hover:border-blue-200 transition-colors shadow-2xs mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                  Choose a Photo
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPEG, PNG & Svg formats, up to 50MB
                </p>
                <button
                  type="button"
                  className="mt-3 px-5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 group-hover:border-[#0066d1] group-hover:text-[#0066d1] shadow-2xs transition-all"
                >
                  Browse File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Inputs & Save Button (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Service Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Service Title</label>
              <input
                type="text"
                placeholder="service title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Description</label>
              <textarea
                rows={3}
                placeholder="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all"
              />
            </div>
          </div>

          {/* Save & Add Another Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddService}
              className="w-full sm:w-auto px-8 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Save & Add Another
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-100">
        {data.items?.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 relative group hover:border-slate-300 transition-all"
          >
            {/* Top row: Icon on left, Trash Icon on right */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0066d1] flex items-center justify-center shrink-0">
                {item.photoUrl ? (
                  <img src={item.photoUrl} alt="" className="w-7 h-7 object-contain" />
                ) : (
                  <Box className="w-6 h-6" />
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteService(item.id)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServicesContentEditor;

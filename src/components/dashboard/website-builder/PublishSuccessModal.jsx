import React, { useState } from "react";
import { Check, Copy, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";

export function PublishSuccessModal({
  isOpen,
  onClose,
  onProceed,
  websiteUrl = "www.store.onpoint.com",
  isEcommerce = true,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* Top Green Checkmark in rounded box (1:1 with Figma) */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
            Congratulations! Your website has been successfully published online
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
            {isEcommerce
              ? "The store has been successfully linked to your ERP system and sales warehouses."
              : "Your company profile website has been successfully linked to your ERP system."}
          </p>
        </div>

        {/* Link box with Copy button */}
        <div className="space-y-2 text-left pt-2">
          <label className="text-xs font-bold text-slate-800 block">
            Link to the published website:
          </label>
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs sm:text-sm font-semibold text-[#0066d1] truncate">
              {websiteUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onProceed}
            className="w-full py-3.5 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Go To Website Content Setup
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishSuccessModal;

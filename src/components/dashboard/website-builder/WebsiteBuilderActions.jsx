import React from "react";
import { Loader2 } from "lucide-react";

export function WebsiteBuilderActions({
  currentStep,
  totalSteps = 4,
  isCategoryProductView = false,
  onPrevious,
  onNext,
  onPublish,
  onAddAndBack,
  isSubmitting = false,
}) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-center gap-3">
      {/* Previous Button (Visible from Step 2 onwards or in Category Product View) */}
      {(currentStep > 1 || isCategoryProductView) && (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="w-full sm:w-36 py-3 px-6 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
      )}

      {/* Action Button */}
      {isCategoryProductView ? (
        <button
          type="button"
          onClick={onAddAndBack}
          className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Add And Back
        </button>
      ) : isLastStep ? (
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish & Proceed To Add Content
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-36 py-3 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Next
        </button>
      )}
    </div>
  );
}

export default WebsiteBuilderActions;

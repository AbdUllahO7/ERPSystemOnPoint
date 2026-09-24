import React from "react";
import { Loader2 } from "lucide-react";

export function ContentEditorActions({
  onBack,
  onSave,
  isSaving = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-center gap-3">
      {/* Back Button (matching 1:1 with Figma Image 1, 2, 3, 4) */}
      <button
        type="button"
        onClick={onBack}
        disabled={isSaving}
        className="w-full sm:w-36 py-3 px-6 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center"
      >
        Back
      </button>

      {/* Save Changes Button (matching 1:1 with Figma Image 1, 2, 3, 4) */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-center"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>Save Changes</span>
      </button>
    </div>
  );
}

export default ContentEditorActions;

import React from "react";

export function ProfileCtaBanner({ onContactClick }) {
  return (
    <section className="w-full bg-[#162a45] text-white py-16 px-4 sm:px-8 text-center">
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Ready to Bring Your Next Idea to Life?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          Whether you're launching a new business or improving an existing one, On Point is ready to help you take the
          next step with confidence
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={onContactClick}
            className="px-8 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            Let's Work Together
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProfileCtaBanner;

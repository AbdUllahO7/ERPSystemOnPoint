import React from "react";
import { ArrowUp, ArrowDown, Plus } from "lucide-react";
import { WEBSITE_TYPES, PAYMENT_METHODS } from "@/features/website-builder";

export function StepSectionsSettings({
  websiteType,
  sections,
  paymentMethods = [],
  onMoveSection,
  onToggleSection,
  onTogglePaymentMethod,
  onAddProductList,
}) {
  const isEcommerce = websiteType === WEBSITE_TYPES.ECOMMERCE;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          {isEcommerce ? "Step 3: Home Page & Settings" : "Step 3: Sections & Settings"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {isEcommerce
            ? "Homepage sections and website settings"
            : "Sections Management"}
        </p>
      </div>

      {/* Sections Cards List */}
      <div className="space-y-3 pt-2">
        {sections.map((section, index) => {
          const isFirstMovable = index === 2;
          const isLastMovable = index === sections.length - (isEcommerce ? 1 : 2);

          return (
            <div
              key={section.id || index}
              className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
            >
              {/* Section Title */}
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {section.title}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Reorder Arrows */}
                {section.canReorder !== false && (
                  <div className="flex items-center gap-1 text-[#0066d1]">
                    <button
                      type="button"
                      disabled={isFirstMovable}
                      onClick={() => onMoveSection(index, "up")}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      disabled={isLastMovable}
                      onClick={() => onMoveSection(index, "down")}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                )}

                {/* Status Pill */}
                <button
                  type="button"
                  onClick={() => onToggleSection && onToggleSection(section.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    section.status === "Apparent"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80 hover:bg-emerald-100/70"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {section.status || "Apparent"}
                </button>

                {/* Add List Button (for Product lists in E-Commerce) */}
                {section.hasAddList && (
                  <button
                    type="button"
                    onClick={onAddProductList}
                    className="px-5 py-2 bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add List
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods Selection for E-Commerce (matching Screenshot 3) */}
      {isEcommerce && (
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
            Choose the payment methods you wish to use :
          </h3>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            {PAYMENT_METHODS.map((method) => {
              const isChecked = paymentMethods.includes(method.id);
              return (
                <label
                  key={method.id}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onTogglePaymentMethod && onTogglePaymentMethod(method.id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066d1] focus:ring-[#0066d1]"
                  />
                  <span>{method.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default StepSectionsSettings;

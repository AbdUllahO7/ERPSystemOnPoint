import React from "react";
import { Globe, ShoppingCart } from "lucide-react";
import { WEBSITE_TYPES } from "@/features/website-builder";

export function StepWebsiteType({ selectedType, onSelectType }) {
  const options = [
    {
      id: WEBSITE_TYPES.COMPANY,
      title: "Company Website",
      description:
        "About Us, Our Services, Frequently Asked Questions, and Contact Form",
      icon: Globe,
    },
    {
      id: WEBSITE_TYPES.ECOMMERCE,
      title: "E-Commerce",
      description:
        "Sell products and services with a shopping cart and electronic payment",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Step 1: Website Type
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Define the primary purpose of the website to automatically adapt templates and sections
        </p>
      </div>

      {/* Website Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
        {options.map((option) => {
          const isSelected = selectedType === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectType(option.id)}
              className={`text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer focus:outline-none ${
                isSelected
                  ? "bg-[#0066d1] border-[#0066d1] text-white shadow-md ring-2 ring-[#0066d1]/20 scale-[1.01]"
                  : "bg-white border-slate-200/90 text-slate-900 hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-white/15 text-white ring-1 ring-white/30"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Text content */}
              <div className="space-y-1">
                <h3
                  className={`text-base font-bold ${
                    isSelected ? "text-white" : "text-slate-900"
                  }`}
                >
                  {option.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed font-normal ${
                    isSelected ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepWebsiteType;

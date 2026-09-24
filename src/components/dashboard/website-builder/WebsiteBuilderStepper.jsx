import React from "react";
import { Check } from "lucide-react";
import {
  WEBSITE_TYPES,
  COMPANY_STEPS,
  ECOMMERCE_STEPS,
} from "@/features/website-builder";

export function WebsiteBuilderStepper({ currentStep, websiteType, onStepClick }) {
  const steps =
    websiteType === WEBSITE_TYPES.ECOMMERCE ? ECOMMERCE_STEPS : COMPANY_STEPS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto relative">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(step.id)}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none z-10"
              >
                {/* Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#0066d1] text-white shadow-sm ring-4 ring-blue-50"
                      : isCurrent
                      ? "border-2 border-[#0066d1] text-[#0066d1] bg-white ring-4 ring-blue-50/50"
                      : "border-2 border-slate-300 text-slate-400 bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Title */}
                <span
                  className={`text-xs font-bold whitespace-nowrap transition-colors ${
                    isCurrent || isCompleted
                      ? "text-[#0066d1]"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                >
                  {step.title}
                </span>
              </button>

              {/* Connecting Line between steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 -mt-6">
                  <div
                    className={`h-[2.5px] rounded-full transition-all duration-500 ${
                      currentStep > step.id
                        ? "bg-[#0066d1]"
                        : "bg-slate-200"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default WebsiteBuilderStepper;

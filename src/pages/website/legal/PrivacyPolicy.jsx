import React from "react";
import { useI18n } from "@/context/translate-api";

export function PrivacyPolicy() {
  const { t } = useI18n();

  const policyData = t?.legal?.privacyPolicy || {};
  const sections = Array.isArray(policyData?.sections) ? policyData.sections : [];
  const pageTitle = policyData?.title || "";

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-12 px-4 sm:px-8 lg:px-14">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {sec.title}
              </h2>
              {sec.subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {sec.subtitle}
                </p>
              )}
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

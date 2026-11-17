import React from "react";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function ProfileStats() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const stats = [
    { value: "6+", label: isAr ? "سنوات الخبرة" : "Years of Experience" },
    { value: "30%", label: isAr ? "المشاريع المنجزة" : "Projects Delivered" },
    { value: "15+", label: isAr ? "الحلول الرقمية" : "Digital Solutions" },
    { value: "95%", label: isAr ? "رضا العملاء" : "Client Satisfaction" },
  ];

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-8 border-b border-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800">
              {stat.value}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfileStats;

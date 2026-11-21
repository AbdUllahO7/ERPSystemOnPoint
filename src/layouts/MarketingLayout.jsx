import React from "react";
import { Outlet } from "react-router-dom";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { useI18n } from "../context/translate-api";

export default function MarketingLayout() {
  const { locale } = useI18n();

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-white text-slate-900 font-sans"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* 1. Global Marketing Header */}
      <MarketingHeader />

      {/* 2. Main Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* 3. Global Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}

import React from "react";
import { Outlet } from "react-router-dom";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import { useI18n } from "../context/translate-api";

export default function WebsiteLayout() {
  const { locale } = useI18n();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#f8fafc] text-slate-900 font-sans" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* 1. Global Storefront Header */}
      <StoreHeader />

      {/* 2. Page Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* 3. Global Storefront Footer */}
      <StoreFooter />
    </div>
  );
}

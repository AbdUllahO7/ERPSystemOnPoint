import React from "react";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function BasicInformationTab({ account }) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="bg-[#f0f7ff] border border-[#d0e4ff] rounded-xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0066cc] mb-1">
            {isAr ? "رصيد الحساب" : "Account balance"}
          </h3>
          <p className="text-2xl font-bold text-[#0066cc]">
            {account.accountBalance?.toLocaleString() || "0"} {isAr ? "ر.س" : "$"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "رقم الحساب" : "Account ID"}
          </p>
          <p className="font-semibold text-primary">#{account.accountNumber}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "اسم الحساب" : "Account Name"}
          </p>
          <p className="font-semibold text-foreground">{account.accountName || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "الحساب الأب" : "Parent Account"}
          </p>
          <p className="font-semibold text-foreground">{account.accountParentName || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "الحساب الختامي" : "Final Account"}
          </p>
          <p className="font-semibold text-foreground">
            {isAr ? translateErp(account.finalAccount, locale) : (account.finalAccount || "-")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "القائمة المالية" : "Financial Statement"}
          </p>
          <p className="font-semibold text-foreground">
            {isAr ? translateErp(account.financialStatement, locale) : (account.financialStatement || "-")}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {isAr ? "العملة" : "Currency"}
          </p>
          <p className="font-semibold text-foreground">{account.currencyName || "-"}</p>
        </div>
      </div>
    </div>
  );
}

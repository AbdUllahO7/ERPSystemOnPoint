import React from "react";

export function BasicInformationTab({ account }) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="bg-[#f0f7ff] border border-[#d0e4ff] rounded-xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0066cc] mb-1">Account balance</h3>
          <p className="text-2xl font-bold text-[#0066cc]">
            $ {account.accountBalance?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Account ID</p>
          <p className="font-semibold text-primary">#{account.accountNumber}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Account Name</p>
          <p className="font-semibold text-foreground">{account.accountName || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Parent Account</p>
          <p className="font-semibold text-foreground">{account.accountParentName || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Final Account</p>
          <p className="font-semibold text-foreground">{account.finalAccount || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Financial Statement</p>
          <p className="font-semibold text-foreground">{account.financialStatement || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Currency</p>
          <p className="font-semibold text-foreground">{account.currencyName || "-"}</p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { getInvoicePatternById } from "../../../../lib/api";

export default function InvoicePatternDetails() {
  const { id } = useParams();

  const { data: patternData, isLoading } = useQuery({
    queryKey: ["getInvoicePatternById", id],
    queryFn: () => getInvoicePatternById(id),
  });

  const data = patternData?.data || {};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Invoice Pattern Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Link to="/dashboard/accounting/basics/invoicing-patterns" className="hover:text-primary transition-colors">
            Invoice Patterns
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Invoice Pattern Details</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Pattern Name</p>
              <p className="text-sm text-muted-foreground">{data.pattern_Name || "N/A"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Type</p>
              <p className="text-sm text-muted-foreground">{data.invoiceType || "N/A"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Materials Account</p>
              <p className="text-sm text-muted-foreground">{data.material_Account_Name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Cash Account</p>
              <p className="text-sm text-muted-foreground">{data.cash_Account_Name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Deductions Account</p>
              <p className="text-sm text-muted-foreground">{data.discount_Account_Name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Virtual Warehouse</p>
              <p className="text-sm text-muted-foreground">{data.warehouse_Name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Start Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(data.start_Date)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">End Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(data.end_Date)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Cost Center</p>
              <p className="text-sm text-muted-foreground">{data.costCenter_Name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Currency</p>
              <p className="text-sm text-muted-foreground">{data.currency_id || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Payment Method</p>
              <p className="text-sm text-muted-foreground">{data.paymentPay || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Tax</p>
              <p className="text-sm text-muted-foreground">{data.tax_Percentage !== undefined ? `${data.tax_Percentage}%` : "N/A"}</p>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5">
              <p className="text-sm font-semibold text-foreground">Notes</p>
              <p className="text-sm text-muted-foreground">{data.note || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, DollarSign, FileText, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFixedExpenseById } from "../../../../lib/api";

export default function FixedExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: expenseResponse, isLoading } = useQuery({
    queryKey: ["getFixedExpenseById", id],
    queryFn: () => getFixedExpenseById(id),
  });

  // Extract data safely regardless of API response wrapping
  const data = expenseResponse?.data?.id
    ? expenseResponse.data
    : expenseResponse?.id
    ? expenseResponse
    : expenseResponse?.data || {};

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading details...</div>;
  }

  // Safe date extraction to avoid timezone UTC shifts
  const formatDate = (val) => {
    if (!val) return "-";
    if (typeof val === "string") return val.split("T")[0];
    try {
      const d = new Date(val);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return String(val);
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "-";
    return `$${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formattedStartDate = formatDate(data.startDate);
  const formattedEndDate = formatDate(data.endDate);
  const formattedLastGenerated = formatDate(data.lastGeneratedDate);

  // Projections
  const cost = Number(data.totalAmount != null ? data.totalAmount : data.amount || 0);
  let monthlyEstimate = cost;
  let yearlyEstimate = cost;
  if (data.cycle === "Daily") {
    monthlyEstimate = cost * 30;
    yearlyEstimate = cost * 365;
  } else if (data.cycle === "Weekly") {
    monthlyEstimate = cost * 4.33;
    yearlyEstimate = cost * 52;
  } else if (data.cycle === "Monthly") {
    monthlyEstimate = cost;
    yearlyEstimate = cost * 12;
  } else if (data.cycle === "Quarterly") {
    monthlyEstimate = cost / 3;
    yearlyEstimate = cost * 4;
  } else if (data.cycle === "Yearly") {
    monthlyEstimate = cost / 12;
    yearlyEstimate = cost;
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Fixed Expense Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => navigate("/dashboard/accounting/fixed-expenses")}
          >
            Fixed Expenses
          </span>
          <span>/</span>
          <span className="font-medium text-foreground">Fixed Expense Details</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-foreground">{data.description || "-"}</h3>
              {data.categoryName && data.categoryName !== "-" && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded-md text-xs font-medium">
                  {data.categoryName}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  data.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {data.isActive ? "Active" : "Inactive"}
              </span>
              {data.cycle && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 rounded-md text-xs font-medium">
                  ↺ {data.cycle}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {data.vendorName && data.vendorName !== "-" ? `${data.vendorName} • ` : ""}
              Starts {formattedStartDate}
              {formattedEndDate !== "-" ? ` • Ends ${formattedEndDate}` : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(data.totalAmount)}</p>
          <p className="text-sm text-muted-foreground">
            incl. {formatCurrency(data.taxAmount)} tax ({data.cycle ? `${data.cycle}` : "Per Cycle"})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <div className="mb-6">
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto flex-wrap">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="recurrence"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Recurrence & Projection
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted data-[state=active]:hover:bg-primary"
            >
              Attachments
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 overflow-hidden">
          {/* Details Content */}
          <TabsContent value="details" className="mt-0 outline-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Expense ID</p>
                <p className="text-sm font-semibold text-foreground break-all">{data.id || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-semibold text-foreground">{data.categoryName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Vendor</p>
                <p className="text-sm font-semibold text-foreground">{data.vendorName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Payment Method</p>
                <p className="text-sm font-semibold text-foreground">{data.paymentMethod || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Cost Center</p>
                <p className="text-sm font-semibold text-foreground">{data.costCenterName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Cycle</p>
                <p className="text-sm font-semibold text-foreground">{data.cycle || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm font-semibold text-foreground">{formattedStartDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">End Date</p>
                <p className="text-sm font-semibold text-foreground">{formattedEndDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Amount (Excl. Tax)</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(data.amount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Tax Amount</p>
                <p className="text-sm font-semibold text-foreground">{formatCurrency(data.taxAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Amount</p>
                <p className="text-sm font-semibold text-primary">{formatCurrency(data.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {data.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Auto Journal Entry</p>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    data.autoGenerateJournal
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {data.autoGenerateJournal ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Notify Days Before Due</p>
                <p className="text-sm font-semibold text-foreground">
                  {data.notifyDaysBeforeDue != null ? `${data.notifyDaysBeforeDue} day(s)` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Last Generated Date</p>
                <p className="text-sm font-semibold text-foreground">{formattedLastGenerated}</p>
              </div>
            </div>

            {/* Description / Notes */}
            <div className="pt-4 border-t">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border">
                {data.description || "-"}
              </p>
            </div>
          </TabsContent>

          {/* Recurrence & Projection Content */}
          <TabsContent value="recurrence" className="mt-0 outline-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-medium">Per Cycle ({data.cycle || "Daily"})</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(data.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Base amount: {formatCurrency(data.amount)} + Tax: {formatCurrency(data.taxAmount)}</p>
              </div>
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-medium">Estimated Monthly</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(monthlyEstimate)}</p>
                <p className="text-xs text-muted-foreground">Based on recurring cycle calculation</p>
              </div>
              <div className="p-4 rounded-xl border bg-muted/20 space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-medium">Estimated Yearly</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(yearlyEstimate)}</p>
                <p className="text-xs text-muted-foreground">Annualized expense projection</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Cycle</p>
                <p className="text-sm font-semibold text-foreground">{data.cycle || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm font-semibold text-foreground">{formattedStartDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">End Date</p>
                <p className="text-sm font-semibold text-foreground">{formattedEndDate}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Auto JE</p>
                <p className={`text-sm font-semibold ${data.autoGenerateJournal ? "text-green-600" : "text-muted-foreground"}`}>
                  {data.autoGenerateJournal ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Attachments Content */}
          <TabsContent value="attachments" className="mt-0 outline-none">
            {data.attachmentFilePath ? (
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {data.attachmentFilePath.split("/").pop() || "Expense Attachment"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{data.attachmentFilePath}</p>
                  </div>
                </div>
                <a
                  href={data.attachmentFilePath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View File
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attachments found.</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

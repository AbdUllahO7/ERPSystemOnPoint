import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Building2,
  Info,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInstallmentById } from "@/services/accounting";

export default function InstallmentDetailsDialog({
  isOpen,
  onClose,
  installmentId,
  onPay,
}) {
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["getInstallmentById", installmentId],
    queryFn: () => getInstallmentById(installmentId),
    enabled: Boolean(isOpen && installmentId),
  });

  const detail = responseData?.data || responseData;

  const id = detail?.id || detail?.scheduleId || installmentId;
  const description = detail?.description || detail?.desc || "Invoice Installment";
  const invoiceId = detail?.invoiceId || detail?.invoice_Id;
  const invoiceNumber =
    detail?.invoice_Number ||
    detail?.invoiceNumber ||
    detail?.invoice?.invoice_Number ||
    "N/A";

  const amountDue = Number(
    detail?.amountDue ?? detail?.amount_Due ?? detail?.totalAmount ?? detail?.amount ?? 0
  );
  const amountPaid = Number(
    detail?.amountPaid ?? detail?.amount_Paid ?? detail?.paidAmount ?? 0
  );
  const remainingAmount = Math.max(0, amountDue - amountPaid);
  const percentPaid = amountDue > 0 ? Math.min(100, Math.round((amountPaid / amountDue) * 100)) : 0;

  const dueDate = detail?.dueDate || detail?.due_Date;
  const paymentDate = detail?.paymentDate || detail?.payment_Date;
  const notes = detail?.notes || detail?.note || detail?.description;

  // Determine status
  let status = detail?.status || "Pending";
  const isFullyPaid = remainingAmount === 0 && amountDue > 0;
  const isPartiallyPaid = amountPaid > 0 && remainingAmount > 0;
  const isOverdue =
    dueDate && new Date(dueDate) < new Date() && remainingAmount > 0;

  if (isFullyPaid) status = "Paid";
  else if (isOverdue) status = "Overdue";
  else if (isPartiallyPaid) status = "Partially Paid";

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid (مسدد)
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1.5 py-1 px-3">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue (متأخر)
          </Badge>
        );
      case "partially paid":
      case "partiallypaid":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5 py-1 px-3">
            <Clock className="w-3.5 h-3.5" /> Partially Paid (مسدد جزئياً)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1.5 py-1 px-3">
            <Clock className="w-3.5 h-3.5" /> Pending (معلق)
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Installment Details (تفاصيل القسط)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  ID: <span className="font-mono text-foreground">{id || "N/A"}</span>
                </DialogDescription>
              </div>
            </div>
            {!isLoading && getStatusBadge()}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading installment details...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-destructive space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="font-medium text-sm">Failed to load installment details.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Associated Invoice Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground block">
                  Associated Invoice (الفاتورة المرتبطة)
                </span>
                <span className="text-sm font-bold text-foreground">
                  Invoice #{invoiceNumber}
                </span>
              </div>
              {invoiceId && (
                <Link
                  to={`/dashboard/accounting/invoices/${invoiceId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20"
                >
                  View Invoice <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs text-muted-foreground block mb-1">
                  Amount Due
                </span>
                <span className="text-base font-extrabold text-foreground">
                  ${amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs text-muted-foreground block mb-1">
                  Amount Paid
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-xs text-muted-foreground block mb-1">
                  Remaining
                </span>
                <span className="text-base font-extrabold text-primary">
                  ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Payment Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Payment Progress (نسبة السداد)</span>
                <span className="font-semibold text-foreground">{percentPaid}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentPaid}%` }}
                />
              </div>
            </div>

            {/* Timeline & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due Date (تاريخ الاستحقاق)</span>
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {dueDate ? new Date(dueDate).toLocaleDateString() : "Not specified"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-border/70 bg-card space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Payment Date (تاريخ السداد)</span>
                </div>
                <p className="font-semibold text-foreground text-sm">
                  {paymentDate ? new Date(paymentDate).toLocaleDateString() : "Not paid yet"}
                </p>
              </div>
            </div>

            {/* Description & Notes */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1 text-xs">
              <span className="text-muted-foreground font-medium block">
                Description & Notes:
              </span>
              <p className="text-foreground leading-relaxed">
                {notes || description || "No notes provided."}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="p-6 pt-4 border-t border-border bg-muted/20 flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {remainingAmount > 0 && onPay && (
            <Button
              onClick={() => {
                onClose();
                onPay(detail || { id, scheduleId: id, amountDue, amountPaid, remainingAmount, invoiceNumber, description });
              }}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay Installment (${remainingAmount.toFixed(2)})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

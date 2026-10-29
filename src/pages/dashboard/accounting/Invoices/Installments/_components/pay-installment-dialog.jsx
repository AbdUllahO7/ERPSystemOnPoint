import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Calendar,
  Wallet,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/context/translate-api";
import { payInstallment, getCashLookUp, getCardLookUp } from "@/services/accounting";

export default function PayInstallmentDialog({
  isOpen,
  onClose,
  installment,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const instT = t?.installments || {};

  const [paymentMethodType, setPaymentMethodType] = useState("cash"); // "cash" | "card"
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  // Extract financial properties safely handling camelCase and snake_case
  const scheduleId =
    installment?.scheduleId ||
    installment?.id ||
    installment?.paymentScheduleId ||
    "";
  const invoiceNumber =
    installment?.invoice_Number ||
    installment?.invoiceNumber ||
    installment?.invoice?.invoice_Number ||
    installment?.invoiceId ||
    "N/A";
  const description =
    installment?.description || installment?.desc || "Invoice Installment";

  const amountDue = Number(
    installment?.amountDue ??
      installment?.amount_Due ??
      installment?.totalAmount ??
      installment?.amount ??
      0
  );
  const previouslyPaid = Number(
    installment?.amountPaid ??
      installment?.amount_Paid ??
      installment?.paidAmount ??
      0
  );
  const calculatedRemaining = Math.max(0, amountDue - previouslyPaid);
  const remainingAmount =
    installment?.remainingAmount !== undefined
      ? Number(installment.remainingAmount)
      : calculatedRemaining;

  // Initialize or reset form values when installment changes
  useEffect(() => {
    if (isOpen && installment) {
      setAmountPaid(remainingAmount > 0 ? String(remainingAmount) : "0");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setValidationError("");
    }
  }, [isOpen, installment, remainingAmount]);

  // Fetch Cash and Card Accounts
  const { data: cashAccountsData, isLoading: isLoadingCash } = useQuery({
    queryKey: ["getCashLookUp"],
    queryFn: () => getCashLookUp({ PageNumber: 1, PageSize: 100 }),
    enabled: isOpen,
  });

  const { data: cardAccountsData, isLoading: isLoadingCard } = useQuery({
    queryKey: ["getCardLookUp"],
    queryFn: () => getCardLookUp({ PageNumber: 1, PageSize: 100 }),
    enabled: isOpen,
  });

  const cashAccounts = cashAccountsData?.data?.items || cashAccountsData?.data || [];
  const cardAccounts = cardAccountsData?.data?.items || cardAccountsData?.data || [];
  const availableAccounts = paymentMethodType === "cash" ? cashAccounts : cardAccounts;

  // Auto-select first account if not set
  useEffect(() => {
    if (availableAccounts.length > 0 && !paymentAccountId) {
      setPaymentAccountId(String(availableAccounts[0].id));
    }
  }, [availableAccounts, paymentAccountId]);

  // Mutation
  const payMutation = useMutation({
    mutationFn: payInstallment,
    onSuccess: () => {
      toast.success("Installment payment recorded successfully!");
      queryClient.invalidateQueries(["getAllInstallments"]);
      queryClient.invalidateQueries(["getAllInvoices"]);
      queryClient.invalidateQueries(["getInvoiceById"]);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to record installment payment";
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!scheduleId) {
      setValidationError("Installment schedule ID is missing.");
      return;
    }

    const numAmount = parseFloat(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!paymentAccountId) {
      setValidationError("Please select a payment account.");
      return;
    }

    const payload = {
      scheduleId,
      amountPaid: numAmount,
      paymentAccountId,
      paymentDate: paymentDate
        ? new Date(paymentDate).toISOString()
        : new Date().toISOString(),
      notes: notes.trim(),
    };

    payMutation.mutate(payload);
  };

  const handlePayFull = () => {
    setAmountPaid(String(remainingAmount));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-card border-border shadow-xl">
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {instT.payInstallment || "Pay Installment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {instT.associatedInvoice || "Invoice"}:{" "}
                <span className="font-semibold text-foreground">
                  #{invoiceNumber}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Installment Summary Badge Card */}
        <div className="px-6 pt-4">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{description}</span>
              <span className="font-mono text-muted-foreground">
                {instT.dueDate || "Due"}: {installment?.dueDate ? new Date(installment.dueDate).toLocaleDateString() : (instT.notSpecified || "N/A")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-center">
              <div className="p-2 rounded-lg bg-background border border-border/50">
                <span className="text-[11px] text-muted-foreground block">
                  {instT.amountDue || "Amount Due"}
                </span>
                <span className="text-sm font-bold text-foreground">
                  ${amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-background border border-border/50">
                <span className="text-[11px] text-muted-foreground block">
                  {instT.previouslyPaid || "Previously Paid"}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ${previouslyPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-[11px] text-primary font-medium block">
                  {instT.remaining || "Remaining"}
                </span>
                <span className="text-sm font-extrabold text-primary">
                  ${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Amount to Pay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                {instT.paymentAmount || "Payment Amount"} ($) <span className="text-destructive">*</span>
              </Label>
              {remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {instT.payFullRemaining || "Pay Full Remaining"} (${remainingAmount.toFixed(2)})
                </button>
              )}
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="any"
                min="0.01"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className="pl-9 font-semibold text-base"
              />
            </div>
          </div>

          {/* Payment Method Selector (Cash vs Card/Bank) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {instT.paymentMethodType || "Payment Method"} <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethodType("cash");
                  setPaymentAccountId("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  paymentMethodType === "cash"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Wallet className="w-4 h-4" />
                {instT.cash || "Cash"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethodType("card");
                  setPaymentAccountId("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  paymentMethodType === "card"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Building2 className="w-4 h-4" />
                {instT.card || "Bank / Card"}
              </button>
            </div>
          </div>

          {/* Account Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {instT.paymentAccount || "Payment Account"} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={paymentAccountId}
              onValueChange={setPaymentAccountId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingCash || isLoadingCard
                      ? (instT.loadingDetails || "Loading...")
                      : (instT.selectPaymentAccount || "Select Payment Account")
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper">
                {availableAccounts.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    {t?.common?.na || "No accounts available"}
                  </div>
                ) : (
                  availableAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name || acc.name_Account || acc.account_Name || `Account #${acc.id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {instT.paymentDate || "Payment Date"} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {instT.notes || "Notes"}
            </Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={instT.notesPlaceholder || "e.g. Paid via receipt..."}
              className="resize-none text-xs"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2 border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={payMutation.isPending}
            >
              {instT.cancel || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={payMutation.isPending || !scheduleId}
              className="gap-2 min-w-[120px]"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {instT.processing || "Processing..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {instT.confirmPayment || "Confirm Payment"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


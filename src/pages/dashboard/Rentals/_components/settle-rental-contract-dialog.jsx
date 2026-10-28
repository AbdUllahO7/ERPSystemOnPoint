import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Receipt,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import toast from "react-hot-toast";
import { getRentalLookups, settleRentalContract } from "@/services/rentals";

export default function SettleRentalContractDialog({
  isOpen,
  onClose,
  contract,
  onSuccess,
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    actualEndDate: new Date().toISOString().slice(0, 16),
    invoicePattern: "",
    damageCharges: "0",
    damageNotes: "",
    refundAccountId: "",
  });

  const [checkInItems, setCheckInItems] = useState([
    { key: "Physical Condition", value: "Good" },
    { key: "Fuel / Charge Level", value: "100%" },
    { key: "Cleanliness", value: "Clean" },
  ]);

  const [paymentSchedules, setPaymentSchedules] = useState([]);

  // Fetch Lookups (Invoice Patterns & Payment/Refund Accounts)
  const { data: lookupsData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["rentalLookups"],
    queryFn: getRentalLookups,
    enabled: isOpen,
  });

  const lookups = lookupsData?.data || {
    invoicePatterns: [],
    paymentAccounts: [],
  };

  useEffect(() => {
    if (isOpen && contract) {
      setFormData({
        actualEndDate: new Date().toISOString().slice(0, 16),
        invoicePattern: lookups.invoicePatterns[0]?.id || "",
        damageCharges: "0",
        damageNotes: "",
        refundAccountId: lookups.paymentAccounts[0]?.id || "",
      });
      setCheckInItems([
        { key: "Physical Condition", value: "Good" },
        { key: "Fuel / Charge Level", value: "100%" },
        { key: "Cleanliness", value: "Clean" },
      ]);
      setPaymentSchedules([]);
    }
  }, [isOpen, contract, lookups.invoicePatterns, lookups.paymentAccounts]);

  // Financial calculations
  const deposit = Number(contract?.numericDeposit ?? contract?.securityDeposit ?? 0);
  const damageCharges = Number(formData.damageCharges) || 0;
  const netRefund = Math.max(0, deposit - damageCharges);
  const netDueFromCustomer = Math.max(0, damageCharges - deposit);

  // Settle Mutation
  const settleMutation = useMutation({
    mutationFn: (payload) => settleRentalContract(payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Rental contract settled successfully!");
      queryClient.invalidateQueries(["rentals"]);
      if (contract?.id) {
        queryClient.invalidateQueries(["rental", contract.id]);
      }
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to settle contract";
      toast.error(msg);
    },
  });

  const handleAddCheckInItem = () => {
    setCheckInItems((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveCheckInItem = (index) => {
    setCheckInItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSchedule = () => {
    setPaymentSchedules((prev) => [
      ...prev,
      {
        description: `Damage / Settlement Fee #${prev.length + 1}`,
        amountDue: netDueFromCustomer > 0 ? String(netDueFromCustomer) : "0",
        dueDate: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleRemoveSchedule = (index) => {
    setPaymentSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!contract?.id) {
      toast.error("Contract ID is missing");
      return;
    }

    const checkInDetails = checkInItems.reduce((acc, curr) => {
      if (curr.key && curr.key.trim()) {
        acc[curr.key.trim()] = curr.value || "";
      }
      return acc;
    }, {});

    const schedules = paymentSchedules
      .filter((s) => Number(s.amountDue) > 0)
      .map((s) => ({
        description: s.description || "Settlement Schedule",
        amountDue: Number(s.amountDue),
        dueDate: s.dueDate ? new Date(s.dueDate).toISOString() : new Date().toISOString(),
      }));

    settleMutation.mutate({
      contractId: contract.id,
      actualEndDate: formData.actualEndDate
        ? new Date(formData.actualEndDate).toISOString()
        : new Date().toISOString(),
      invoicePattern: formData.invoicePattern || null,
      damageCharges: Number(formData.damageCharges || 0),
      damageNotes: formData.damageNotes || "",
      refundAccountId: formData.refundAccountId || null,
      checkInDetails,
      paymentSchedules: schedules,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-7">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066d1] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Settle Rental Contract
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Record actual return date, inspect items, assess damage charges, and process deposit settlement.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Contract Summary Banner */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2">
          <div>
            <span className="text-slate-400 block text-[11px]">Contract #</span>
            <span className="font-semibold text-slate-800">
              {contract?.contractNumber || contract?.id?.slice(0, 8) || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Customer</span>
            <span className="font-semibold text-slate-800 truncate block">
              {contract?.customer || contract?.customerName || "Customer"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Resource / Unit</span>
            <span className="font-semibold text-slate-800 truncate block">
              {contract?.resource || contract?.resourceName || "Resource"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Deposit Held</span>
            <span className="font-bold text-emerald-600 block">
              ${deposit.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          {/* Row 1: Actual End Date & Invoice Pattern */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Actual Return Date & Time <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.actualEndDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, actualEndDate: e.target.value }))
                }
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Invoice Pattern
              </Label>
              <Select
                value={formData.invoicePattern}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, invoicePattern: val }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select Invoice Pattern" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.invoicePatterns.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Damage Charges & Refund Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Damage / Penalty Charges ($)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.damageCharges}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, damageCharges: e.target.value }))
                }
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Settlement / Refund Account
              </Label>
              <Select
                value={formData.refundAccountId}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, refundAccountId: val }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.paymentAccounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)} className="text-xs">
                      {a.name} {a.accountNumber ? `(${a.accountNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Damage & Condition Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Damage & Return Notes
            </Label>
            <Textarea
              rows={3}
              placeholder="Describe condition on return, repairs needed, fuel refilling notes, or return checklist observations..."
              value={formData.damageNotes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, damageNotes: e.target.value }))
              }
              className="rounded-xl text-xs p-3 resize-none"
            />
          </div>

          {/* Section: Inspection / Check-In Details */}
          <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0066d1]" />
                <span className="text-xs font-bold text-slate-800">
                  Return Inspection Checklist
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCheckInItem}
                className="h-8 gap-1.5 text-xs rounded-lg border-dashed text-[#0066d1] hover:text-[#0052a8]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {checkInItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Attribute (e.g. Mileage, Fuel)"
                    value={item.key}
                    onChange={(e) => {
                      const updated = [...checkInItems];
                      updated[idx].key = e.target.value;
                      setCheckInItems(updated);
                    }}
                    className="h-9 rounded-lg text-xs w-1/2 bg-white"
                  />
                  <Input
                    placeholder="Status / Value (e.g. 100%, Good)"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...checkInItems];
                      updated[idx].value = e.target.value;
                      setCheckInItems(updated);
                    }}
                    className="h-9 rounded-lg text-xs w-1/2 bg-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCheckInItem(idx)}
                    className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Payment Schedules for Remaining Balances (Optional) */}
          <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0066d1]" />
                <span className="text-xs font-bold text-slate-800">
                  Settlement Payment Schedules (Optional)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSchedule}
                className="h-8 gap-1.5 text-xs rounded-lg border-dashed text-[#0066d1] hover:text-[#0052a8]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Schedule
              </Button>
            </div>

            {paymentSchedules.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">
                No payment schedules added. Add schedules if damage charges exceed deposit or require deferred collection.
              </p>
            ) : (
              <div className="space-y-2">
                {paymentSchedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Description"
                      value={schedule.description}
                      onChange={(e) => {
                        const updated = [...paymentSchedules];
                        updated[idx].description = e.target.value;
                        setPaymentSchedules(updated);
                      }}
                      className="h-9 rounded-lg text-xs w-2/5 bg-white"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={schedule.amountDue}
                      onChange={(e) => {
                        const updated = [...paymentSchedules];
                        updated[idx].amountDue = e.target.value;
                        setPaymentSchedules(updated);
                      }}
                      className="h-9 rounded-lg text-xs w-1/4 bg-white"
                    />
                    <Input
                      type="date"
                      value={schedule.dueDate}
                      onChange={(e) => {
                        const updated = [...paymentSchedules];
                        updated[idx].dueDate = e.target.value;
                        setPaymentSchedules(updated);
                      }}
                      className="h-9 rounded-lg text-xs w-1/4 bg-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSchedule(idx)}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settlement Summary Card */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Security Deposit on Hold:</span>
              <span className="font-semibold text-slate-800">${deposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Damage / Additional Charges:</span>
              <span className="font-semibold text-rose-600">-${damageCharges.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200/60 pt-2 flex justify-between font-bold text-sm">
              {netDueFromCustomer > 0 ? (
                <>
                  <span className="text-amber-800">Remaining Due from Customer:</span>
                  <span className="text-amber-700">${netDueFromCustomer.toFixed(2)}</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-800">Net Refund to Customer:</span>
                  <span className="text-emerald-700">${netRefund.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={settleMutation.isPending}
              className="h-10 rounded-xl text-xs font-semibold px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={settleMutation.isPending}
              className="h-10 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold px-6"
            >
              {settleMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
                  Settling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 me-1.5" />
                  Confirm Settlement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


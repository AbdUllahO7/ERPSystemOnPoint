import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { XCircle, Loader2, Receipt, ShieldCheck } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
import {
  getRentalById,
  cancelRentalContract,
  getRentalLookups,
} from "@/services/rentals";
import { IssueContractInvoiceDialog } from "@/pages/dashboard/crm/customers/_components/tabs/issue-contract-invoice-dialog";
import SettleRentalContractDialog from "./_components/settle-rental-contract-dialog";
import { useI18n } from "@/context/translate-api";

export default function RentalDetailsPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [cancelForm, setCancelForm] = useState({
    cancellationReason: "",
    refundAccount: "",
    refundAmount: "0",
  });

  // Query Contract
  const { data: contractData, isLoading } = useQuery({
    queryKey: ["rental", id],
    queryFn: () => getRentalById(id),
  });
  const contract = contractData?.data || {};

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["rentalLookups"],
    queryFn: getRentalLookups,
  });
  const lookups = lookupsData?.data || { refundAccounts: [] };

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (payload) =>
      cancelRentalContract({ id, ...payload }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rental", id]);
      queryClient.invalidateQueries(["rentals"]);
      toast.success(res?.message || "Contract canceled successfully!");
      setIsCancelModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to cancel contract");
    },
  });

  const handleCancelSubmit = (e) => {
    e?.preventDefault();
    if (!cancelForm.cancellationReason.trim()) {
      toast.error("Please enter cancellation reason");
      return;
    }
    cancelMutation.mutate(cancelForm);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const additionalData = contract.additionalData || {};
  const invoicesList = contract.invoices || [];

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb and Red Cancel Contract Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title="Contract Details"
          breadcrumbLinks={[
            { label: "Rental Contracts", href: "/dashboard/rentals" },
            { label: "Contract Details" },
          ]}
        />

        <div className="flex items-center gap-2.5">
          {contract.status !== "Settled" && contract.status !== "Closed" && contract.status !== "Canceled" && (
            <Button
              type="button"
              onClick={() => setIsSettleModalOpen(true)}
              className="h-10 gap-2 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold px-5 shadow-xs cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Settle Contract
            </Button>
          )}

          {contract.status !== "Canceled" && (
            <Button
              type="button"
              onClick={() => setIsInvoiceDialogOpen(true)}
              className="h-10 gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold px-5 shadow-xs cursor-pointer transition-colors"
            >
              <Receipt className="w-4 h-4" />
              إصدار فاتورة من العقد
            </Button>
          )}

          {contract.status !== "Canceled" && (
            <Button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="h-10 gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-5 shadow-xs cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Contract
            </Button>
          )}
        </div>
      </div>


      {/* Top Grid: Left 8 cols (Contract Info + Items Breakdown) + Right 4 cols (Financials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Contract Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              Contract Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">Customer</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.customer || contract.customerName || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Resource</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.resource || contract.resourceName || "Resource"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Service</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.service || contract.serviceName || "Service"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Cost Center</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.costCenter || "Cost Center"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Currency</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.currency || "USD"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Payment Method
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.paymentMethod || "Payment Method"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Contract Start
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.contractStart || contract.startDate || "23/7/2025"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Contract End
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.contractEnd || contract.endDate || "23/7/2026"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Items & Quantities Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              {t?.rentalDetails?.itemsBreakdown || "Contract Items & Quantities"}
            </h2>

            <div className="overflow-x-auto border rounded-xl">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-start">Item / Service</th>
                    <th className="py-2.5 px-3 text-start">Contracted Qty</th>
                    <th className="py-2.5 px-3 text-start">Invoiced Qty</th>
                    <th className="py-2.5 px-3 text-start">Available to Invoice</th>
                    <th className="py-2.5 px-3 text-end">Rate / Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(contract.items && contract.items.length > 0 ? contract.items : [
                    {
                      custom_Item_Name: contract.resource || contract.service || "Rental Service",
                      quantity: contract.quantity || 1,
                      invoicedQuantity: contract.invoices?.length || 0,
                      unit_Price: contract.rentalPrice || 45,
                    }
                  ]).map((it, idx) => {
                    const cQty = Number(it.quantity || 1);
                    const iQty = Number(it.invoicedQuantity || 0);
                    const rQty = Math.max(0, cQty - iQty);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {it.custom_Item_Name || it.title}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-semibold">{cQty}</td>
                        <td className="py-3 px-3 text-amber-700 font-semibold">{iQty}</td>
                        <td className="py-3 px-3 text-emerald-700 font-bold">{rQty}</td>
                        <td className="py-3 px-3 text-end text-blue-600 font-bold">
                          ${Number(it.unit_Price || 45).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Financials Card (4 cols) with Collections breakdown */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5 sticky top-6">
          <h2 className="text-base font-bold text-slate-800">
            {t?.rentalDetails?.financials || "Financials & Collections"}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Rental Rate</span>
              <span className="font-semibold text-slate-800">
                {contract.rate ? contract.rate.split("×")[0].trim() : "USD 45/day"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Contract Total</span>
              <span className="font-bold text-slate-900 text-sm">
                {contract.total || "$0.00"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>{t?.customerContracts?.advancePayment || "Advance Payment"}</span>
              <span className="font-semibold text-emerald-600">
                {contract.deposit || "$0.00"}
              </span>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between font-bold text-xs pt-1">
              <span className="text-slate-800">
                {t?.rentalDetails?.remainingToCollect || "Remaining to Collect"}
              </span>
              <span className="text-purple-700 font-bold text-sm">
                ${Math.max(
                  0,
                  (Number(contract.numericTotal || 0) || parseFloat(String(contract.total || "0").replace(/[^0-9.-]+/g, "")) || 0) -
                    (Number(contract.numericDeposit || 0) || parseFloat(String(contract.deposit || "0").replace(/[^0-9.-]+/g, "")) || 0)
                ).toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">
              قيمة الالتزام المستحق ناقص المبالغ المحصلة فعلياً
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Card: Rental Invoices matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800">
          Rental Invoices
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 font-semibold text-start">
                <th className="py-3 px-4 text-start font-semibold">ID</th>
                <th className="py-3 px-4 text-start font-semibold">Return Date</th>
                <th className="py-3 px-4 text-start font-semibold">Damage</th>
                <th className="py-3 px-4 text-start font-semibold">Total</th>
                <th className="py-3 px-4 text-start font-semibold">Paid</th>
                <th className="py-3 px-4 text-start font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoicesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No rental invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoicesList.map((inv, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-[#0066d1]">
                      {inv.id}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal">
                      {inv.returnDate}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal">
                      {inv.damage}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#0066d1]">
                      {inv.total}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#0066d1]">
                      {inv.paid}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">
                        {inv.status || "Paid"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-slate-100 text-xs">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
          >
            Pre
          </button>
          <button
            type="button"
            onClick={() => setPage(1)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 1
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setPage(2)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 2
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            2
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button
            type="button"
            onClick={() => setPage(20)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 20
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            20
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Cancel Contract Modal matching Image 4 */}
      <DynamicModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Cancel Contract"
        icon={XCircle}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Cancellation Reason
            </Label>
            <Textarea
              rows={3}
              placeholder="Cancellation Reason"
              value={cancelForm.cancellationReason}
              onChange={(e) =>
                setCancelForm({ ...cancelForm, cancellationReason: e.target.value })
              }
              className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Refund Account (Bank / Cash Box)
            </Label>
            <Select
              value={cancelForm.refundAccount}
              onValueChange={(val) =>
                setCancelForm({ ...cancelForm, refundAccount: val })
              }
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-red-500">
                <SelectValue placeholder="Refund Account (Bank / Cash Box)" />
              </SelectTrigger>
              <SelectContent>
                {(lookups.refundAccounts || []).map((acc) => (
                  <SelectItem key={acc.id} value={acc.name}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Refund Amount (USD)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={cancelForm.refundAmount}
              onChange={(e) =>
                setCancelForm({ ...cancelForm, refundAmount: e.target.value })
              }
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-red-500"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={cancelMutation.isPending}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
            >
              {cancelMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin me-1.5" />
              )}
              Confirm and Cancellation
            </Button>
          </div>
        </form>
      </DynamicModal>

      {isInvoiceDialogOpen && (
        <IssueContractInvoiceDialog
          contract={contract}
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
        />
      )}

      {/* Settle Contract Dialog */}
      <SettleRentalContractDialog
        contract={contract}
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries(["rental", id])}
      />
    </div>
  );
}

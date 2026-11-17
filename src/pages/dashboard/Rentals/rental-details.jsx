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
import { translateErp } from "@/lib/erp-i18n";

export default function RentalDetailsPage() {
  const { t, locale } = useI18n();
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
      toast.success(res?.message || t("rentalsModule.contractCanceledSuccess"));
      setIsCancelModalOpen(false);
    },
    onError: () => {
      toast.error(t("rentalsModule.contractCancelFailed"));
    },
  });

  const handleCancelSubmit = (e) => {
    e?.preventDefault();
    if (!cancelForm.cancellationReason.trim()) {
      toast.error(t("rentalsModule.enterCancellationReason"));
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
          title={t("rentalsModule.contractDetails")}
          breadcrumbLinks={[
            { label: t("rentalsModule.rentals"), href: "/dashboard/rentals" },
            { label: t("rentalsModule.contractDetails") },
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
              {t("rentalsModule.settleContract")}
            </Button>
          )}

          {contract.status !== "Canceled" && (
            <Button
              type="button"
              onClick={() => setIsInvoiceDialogOpen(true)}
              className="h-10 gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold px-5 shadow-xs cursor-pointer transition-colors"
            >
              <Receipt className="w-4 h-4" />
              {t("rentalsModule.issueInvoiceFromContract")}
            </Button>
          )}

          {contract.status !== "Canceled" && (
            <Button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="h-10 gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-5 shadow-xs cursor-pointer transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {t("rentalsModule.cancelContract")}
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
              {t("rentalsModule.contractInfo")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">{t("rentalsModule.customer")}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.customer || contract.customerName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">{t("rentalsModule.resource")}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.resource || contract.resourceName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">{t("rentalsModule.service")}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.service || contract.serviceName || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">{t("rentalsModule.costCenter")}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.costCenter || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">{t("rentalsModule.currency")}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.currency || "USD"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t("rentalsModule.paymentMethod")}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {translateErp(contract.paymentMethod || "Credit", locale)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t("rentalsModule.contractStart")}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.contractStart || contract.startDate || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t("rentalsModule.contractEnd")}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.contractEnd || contract.endDate || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Items & Quantities Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              {t("rentalsModule.itemsBreakdown")}
            </h2>

            <div className="overflow-x-auto border rounded-xl">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{t("rentalsModule.itemService")}</th>
                    <th className="py-2.5 px-3 text-start">{t("rentalsModule.contractedQty")}</th>
                    <th className="py-2.5 px-3 text-start">{t("rentalsModule.invoicedQty")}</th>
                    <th className="py-2.5 px-3 text-start">{t("rentalsModule.availableToInvoice")}</th>
                    <th className="py-2.5 px-3 text-end">{t("rentalsModule.ratePrice")}</th>
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
            {t("rentalsModule.financials")}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>{t("rentalsModule.rentalRate")}</span>
              <span className="font-semibold text-slate-800">
                {contract.rate ? contract.rate.split("×")[0].trim() : "USD 45/day"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>{t("rentalsModule.contractTotal")}</span>
              <span className="font-bold text-slate-900 text-sm">
                {contract.total || "$0.00"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>{t("rentalsModule.advancePayment")}</span>
              <span className="font-semibold text-emerald-600">
                {contract.deposit || "$0.00"}
              </span>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center justify-between font-bold text-xs pt-1">
              <span className="text-slate-800">
                {t("rentalsModule.remainingToCollect")}
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
              {t("rentalsModule.financialsObligationNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Card: Rental Invoices matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800">
          {t("rentalsModule.rentalInvoices")}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-700 font-semibold text-start">
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.id")}</th>
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.returnDate")}</th>
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.damage")}</th>
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.total")}</th>
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.paid")}</th>
                <th className="py-3 px-4 text-start font-semibold">{t("rentalsModule.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoicesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t("rentalsModule.noInvoicesYet")}
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
                        {translateErp(inv.status || "Paid", locale)}
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
            {t("common.prev")}
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
            className="px-2.5 py-1 text-[#0066d1] font-semibold hover:underline cursor-pointer"
          >
            {t("common.next")}
          </button>
        </div>
      </div>

      {/* Cancel Contract Modal matching Image 4 */}
      <DynamicModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title={t("rentalsModule.cancelContract")}
        icon={XCircle}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {t("rentalsModule.cancellationReason")}
            </Label>
            <Textarea
              rows={3}
              placeholder={t("rentalsModule.cancellationReasonPlaceholder")}
              value={cancelForm.cancellationReason}
              onChange={(e) =>
                setCancelForm({ ...cancelForm, cancellationReason: e.target.value })
              }
              className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {t("rentalsModule.refundAccount")}
            </Label>
            <Select
              value={cancelForm.refundAccount}
              onValueChange={(val) =>
                setCancelForm({ ...cancelForm, refundAccount: val })
              }
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-red-500">
                <SelectValue placeholder={t("rentalsModule.refundAccountPlaceholder")} />
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
              {t("rentalsModule.refundAmount")}
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
              {t("rentalsModule.confirmCancellation")}
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

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { XCircle, Loader2 } from "lucide-react";
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

export default function RentalDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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
          infoTooltip="Detailed overview of rental contract terms, rate schedules, dynamic details, and invoice returns."
        />

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

      {/* Top Grid: Left 8 cols (Contract Info + Additional Data) + Right 4 cols (Financials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Contract Information matching Image 3 */}
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Rate Type</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.rateType || "2 = Day"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Quantity</p>
                <p className="text-xs text-slate-500 mt-1">
                  {contract.quantity || 1}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Additional Data matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              Additional Data
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  DriverLicenseNumber
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {additionalData.driverLicenseNumber || "9876543210"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  CurrentMileage
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {additionalData.currentMileage || "45000 KM"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  FuelLevel
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {additionalData.fuelLevel || "Full"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Financials Card (4 cols) matching Image 3 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5 sticky top-6">
          <h2 className="text-base font-bold text-slate-800">
            Financials
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Units (Day)</span>
              <span className="font-semibold text-slate-800">$0.00</span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Rental Price</span>
              <span className="font-semibold text-slate-800">
                {contract.rate ? contract.rate.split("×")[0].trim() : "USD 45/day"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">$0.00</span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Discount</span>
              <span className="font-semibold text-slate-800">$0.00</span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Tax (5%)</span>
              <span className="font-semibold text-slate-800">$0.00</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-base font-bold text-slate-900">
                {contract.total || "$0.00"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Security Deposit</span>
              <span className="font-semibold text-slate-800">
                {contract.deposit || "$0.00"}
              </span>
            </div>
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
    </div>
  );
}

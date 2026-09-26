import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getRentalInvoiceById,
  addRentalInvoicePayment,
  getRentalInvoiceLookups,
} from "@/services/rentals";

export default function RentalInvoiceDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [paymentForm, setPaymentForm] = useState({
    amount: "0",
    method: "bank",
    reference: "",
  });

  // Query Invoice
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["rentalInvoice", id],
    queryFn: () => getRentalInvoiceById(id),
  });
  const invoice = invoiceData?.data || {};

  // Query Lookups
  const { data: lookupsData } = useQuery({
    queryKey: ["rentalInvoiceLookups"],
    queryFn: getRentalInvoiceLookups,
  });
  const lookups = lookupsData?.data || { paymentMethods: [] };

  // Add Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: (payload) => addRentalInvoicePayment(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rentalInvoice", id]);
      queryClient.invalidateQueries(["rentalInvoices"]);
      toast.success(res?.message || "Payment recorded successfully!");
      setPaymentForm({ amount: "0", method: "bank", reference: "" });
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  const handlePaymentSubmit = (e) => {
    e?.preventDefault();
    if (Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    paymentMutation.mutate(paymentForm);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const additionalData = invoice.additionalData || {};
  const paymentsList = invoice.payments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageTitle
        title="Rental Invoices"
        breadcrumbLinks={[
          { label: "Rental Invoices", href: "/dashboard/rentals/invoices" },
          { label: "Rental Invoices" },
        ]}
        infoTooltip="View return inspection results, itemized damage surcharges, and settle payment installments."
      />

      {/* Main Grid: Left 8 cols (Invoice Info, Additional Data, Payments) + Right 4 cols (Balance & Payment Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Invoice Information matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Invoice Information
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#0066d1]">
                {invoice.status || "Partial"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">Contract</p>
                <Link
                  to={`/dashboard/rentals/${invoice.contractId || invoice.contractNumber}`}
                  className="text-xs font-medium text-[#0066d1] hover:underline mt-1 block"
                >
                  {invoice.contractNumber || invoice.contractId || "RC-1003"}
                </Link>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Customer</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.customer || invoice.customerName || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Resource</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.resource || invoice.resourceName || "Resource"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Rate</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.rate || invoice.rateText || "Rate"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Return Date</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.returnDate || "23/9/2025"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Mode</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.mode || "Payment Method"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Damage Amount</p>
                <p className="text-xs text-slate-500 mt-1">
                  {invoice.damage || `$${invoice.damageAmount || 0}`}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-800">Notes</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {invoice.notes ||
                  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem"}
              </p>
            </div>
          </div>

          {/* Card 2: Additional Data matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              Additional Data
            </h2>

            <div>
              <p className="text-xs font-semibold text-slate-800">ReturnedBy</p>
              <p className="text-xs text-slate-500 mt-1">
                {additionalData.returnedBy || invoice.returnedByName || "ReturnedBy"}
              </p>
            </div>
          </div>

          {/* Card 3: Payments matching Image 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              Payments
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-700 font-semibold text-start">
                    <th className="py-3 px-4 text-start font-semibold">Date</th>
                    <th className="py-3 px-4 text-start font-semibold">Method</th>
                    <th className="py-3 px-4 text-start font-semibold">Reference</th>
                    <th className="py-3 px-4 text-start font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((pm, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-4 px-4 text-slate-700 font-normal">
                          {pm.date}
                        </td>
                        <td className="py-4 px-4 text-slate-700 font-normal">
                          {pm.method}
                        </td>
                        <td className="py-4 px-4 text-slate-700 font-normal">
                          {pm.reference}
                        </td>
                        <td className="py-4 px-4 font-semibold text-[#0066d1]">
                          {pm.amount}
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
        </div>

        {/* Right Balance & Record Payment Card (4 cols) matching Image 3 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5 sticky top-6">
          <h2 className="text-base font-bold text-slate-800">
            Balance
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Contract Total</span>
              <span className="font-semibold text-slate-800">
                ${Number(invoice.contractTotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Damage Fees</span>
              <span className="font-semibold text-slate-800">
                ${Number(invoice.damageAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-base font-bold text-slate-900">
                ${Number(invoice.numericTotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Paid</span>
              <span className="font-semibold text-slate-800">
                ${Number(invoice.numericPaid || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#0066d1] font-semibold">
              <span>Due</span>
              <span className="font-bold">
                ${Number(invoice.numericDue || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Record Payment Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-1">
            <h3 className="text-xs font-bold text-slate-800">
              Record Payment
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Amount
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Method
              </Label>
              <Select
                value={paymentForm.method}
                onValueChange={(val) =>
                  setPaymentForm({ ...paymentForm, method: val })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {(lookups.paymentMethods || []).map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Reference
              </Label>
              <Input
                placeholder="Reference"
                value={paymentForm.reference}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, reference: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>

            <Button
              type="submit"
              disabled={paymentMutation.isPending}
              className="w-full h-11 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              {paymentMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Payment
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

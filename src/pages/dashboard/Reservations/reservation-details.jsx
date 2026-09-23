import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  RotateCw,
  Wallet,
  Calendar as CalendarIcon,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
import {
  getReservationById,
  cancelReservationTickets,
  updateReservationStatus,
  updateReservation,
} from "@/services/reservations";

export default function ReservationDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [cancelQty, setCancelQty] = useState("1");
  const [selectedStatus, setSelectedStatus] = useState("Completed");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    dueDate: "2026-06-21",
    notes: "",
  });

  // Reservation Query
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
  });
  const reservation = reservationData?.data || {};

  // Cancel Tickets Mutation
  const cancelTicketsMutation = useMutation({
    mutationFn: () => cancelReservationTickets(id, cancelQty),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      toast.success("Tickets canceled successfully!");
    },
    onError: () => {
      toast.error("Failed to cancel tickets");
    },
  });

  // Change Status Mutation
  const changeStatusMutation = useMutation({
    mutationFn: (status) => updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      toast.success("Status updated successfully!");
      setIsStatusModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Add Installment Mutation
  const addInstallmentMutation = useMutation({
    mutationFn: (newSchedule) =>
      updateReservation(id, { paymentSchedule: newSchedule }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      toast.success("Payment installment added!");
      setIsPaymentModalOpen(false);
      setPaymentForm({ amount: "", dueDate: "2026-06-21", notes: "" });
    },
  });

  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentSchedule = reservation.paymentSchedule || [];
    const newInstallment = {
      id: Date.now(),
      amount: Number(paymentForm.amount),
      dueDate: paymentForm.dueDate,
      notes: paymentForm.notes,
    };

    addInstallmentMutation.mutate([...currentSchedule, newInstallment]);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-[#eaf8f1] text-[#22c55e]";
      case "booked":
        return "bg-[#eaf4ff] text-[#0066d1]";
      case "checked-in":
        return "bg-[#f3e8ff] text-[#9333ea]";
      case "canceled":
        return "bg-[#fee2e2] text-[#ef4444]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageTitle
        title="Reservation Details"
        breadcrumbs={[
          { label: "Reservations", href: "/dashboard/reservations" },
          { label: "Reservation Details" },
        ]}
        infoTooltip="Review reservation attendee information, amounts breakdown, and ticket management."
        actions={
          <Button
            variant="outline"
            onClick={() => setIsStatusModalOpen(true)}
            className="rounded-xl border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-10 gap-2 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#0066d1]" />
            Change Status
          </Button>
        }
      />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Customer & Event */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              Customer & Event
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">Customer</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.customer || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Booking Event
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.bookingEvent || "Booking Event"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Resource</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.resource || "Resource"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Provider</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.provider || "Provider"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Period</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.period || "Period"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Time</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.time || "Time"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Amounts */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">Amounts</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">Quantity</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.quantity || 1} (
                  {reservation.canceledQuantity || 0} canceled,{" "}
                  {reservation.activeQuantity || 1} active)
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Payment Method
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.paymentMethod || "card"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Currency</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.currency || "USD"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Discount</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.discountAmount || "USD 0.00 (0%)"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Tax</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.taxAmount || "USD 0.00 (0%)"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Total</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.total || "USD 220.00"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <p className="text-xs font-semibold text-slate-800">Paid</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.paid || "USD 50.00"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Due</p>
                <p className="text-xs text-slate-500 mt-1">
                  {reservation.due || "USD 170.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Schedule */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                Payment Schedule
              </h2>
              <Button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-5 rounded-xl font-medium text-xs h-10 gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              {(reservation.paymentSchedule || []).map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200/90 rounded-2xl p-5 bg-white space-y-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066d1] flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        ${item.amount}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">
                        {item.dueDate}
                      </p>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="pt-1">
                      <p className="text-xs font-bold text-slate-700 mb-1">
                        Notes
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Status & Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              Status & Info
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    reservation.status
                  )}`}
                >
                  {reservation.status || "Completed"}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Created</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reservation.createdAt || "23/7/2025"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Cancel Tickets Action */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              Cancel Tickets
            </h2>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Quantity (9 remaining)
              </Label>
              <Input
                placeholder="1"
                value={cancelQty}
                onChange={(e) => setCancelQty(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-red-500"
              />
            </div>

            <Button
              type="button"
              onClick={() => cancelTicketsMutation.mutate()}
              disabled={cancelTicketsMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3 h-11 rounded-xl font-semibold text-xs shadow-xs cursor-pointer transition-colors"
            >
              Cancel
            </Button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Refunds are issued to the original payment method (no installments
              on returns)
            </p>
          </div>
        </div>
      </div>

      {/* Add Payment Modal matching Image 4 */}
      <DynamicModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        title="Add Payment"
        icon={Wallet}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Amount
            </Label>
            <Input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Due Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, dueDate: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white pr-10 focus-visible:ring-[#0066d1]"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Notes
            </Label>
            <Textarea
              placeholder="Notes"
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, notes: e.target.value })
              }
              className="min-h-[90px] rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={addInstallmentMutation.isPending}
              className="w-full bg-[#0066d1] hover:bg-[#0052a8] text-white py-3.5 h-auto rounded-xl font-medium text-sm transition-all shadow-none cursor-pointer"
            >
              Add
            </Button>
          </div>
        </form>
      </DynamicModal>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Change Reservation Status"
        icon={CheckCircle2}
        showDefaultFooter={false}
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Select Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-full h-11 border-slate-200">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Checked-In">Checked-In</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
                <SelectItem value="No-Show">No-Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => changeStatusMutation.mutate(selectedStatus)}
              disabled={changeStatusMutation.isPending}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white"
            >
              Update
            </Button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
}

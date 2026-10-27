import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Users,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
  XCircle,
  Copy,
  Check,
  RotateCw,
  Ticket,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
  getReservationById,
  cancelReservationTickets,
  updateReservationStatus,
} from "@/services/reservations";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function ReservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [copiedKey, setCopiedKey] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [cancelQty, setCancelQty] = useState("1");
  const [cancelPaymentMethod, setCancelPaymentMethod] = useState("Cash");
  const [selectedStatus, setSelectedStatus] = useState("Booked");

  // Reservation Query
  const { data: reservationData, isLoading, refetch } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
    enabled: Boolean(id),
  });

  const reservation = reservationData?.data || {};

  const totalSeats = Number(reservation.quantity) || 1;
  const canceledSeats = Number(reservation.canceledQuantity) || 0;
  const activeSeats = Math.max(0, totalSeats - canceledSeats);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cancel Tickets Mutation
  const cancelTicketsMutation = useMutation({
    mutationFn: () =>
      cancelReservationTickets(id, Math.min(activeSeats, Math.max(1, Number(cancelQty) || 1)), {
        paymentMethod: cancelPaymentMethod,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["events"]);
      toast.success("Tickets canceled and seats released successfully!");
      setIsCancelModalOpen(false);
      setCancelQty("1");
    },
    onError: (err) => {
      console.error("Failed to cancel tickets:", err);
      toast.error("Failed to cancel tickets!");
    },
  });

  // Change Status Mutation
  const changeStatusMutation = useMutation({
    mutationFn: (newStatus) => updateReservationStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      toast.success("Reservation status updated successfully!");
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status!");
    },
  });

  const handleStatusSubmit = (e) => {
    e?.preventDefault();
    changeStatusMutation.mutate(selectedStatus);
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase().replace("-", "");
    switch (s) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "booked":
        return "bg-blue-50 text-[#0066d1] border-blue-200";
      case "checkedin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "canceled":
        return "bg-rose-50 text-rose-700 border-rose-200 line-through";
      case "noshow":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Reservation Details"
          breadcrumbs={[
            { label: "Reservations", href: "/dashboard/reservations" },
            { label: "Details" },
          ]}
        />
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-primary mb-3">
            <RefreshCw className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={`Reservation Details (#${reservation.id ? reservation.id.slice(0, 8) : id})`}
          breadcrumbs={[
            { label: "Reservations", href: "/dashboard/reservations" },
            { label: "Reservation Details" },
          ]}
          infoTooltip="View customer event reservation details, seats allocation, and invoice linkage."
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/reservations")}
            className="border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to List
          </Button>

          {/* Change Status Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatus(reservation.status || "Booked");
              setIsStatusModalOpen(true);
            }}
            className="border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <RotateCw className="w-4 h-4 mr-1.5 text-[#0066d1]" />
            Change Status
          </Button>

          {/* Cancel Tickets Button */}
          {activeSeats > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCancelQty("1");
                setIsCancelModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Cancel Tickets
            </Button>
          )}
        </div>
      </div>

      {/* Main Reservation Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066d1] to-[#0d3963] text-white flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
              <Ticket className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">
                  {reservation.customerName || "Customer Reservation"}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                    reservation.status
                  )}`}
                >
                  {reservation.status || "Booked"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Booked for event: <strong className="text-slate-700">{reservation.bookingEventTitle || "—"}</strong>
              </p>
            </div>
          </div>

          {/* Quick Seat Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center min-w-[110px]">
              <p className="text-xs text-slate-400 font-medium">Total Seats</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {totalSeats}
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center min-w-[110px]">
              <p className="text-xs text-blue-500 font-medium">Active Seats</p>
              <p className="text-lg font-bold text-[#0066d1] mt-0.5">
                {activeSeats}
              </p>
            </div>
            {canceledSeats > 0 && (
              <div className="px-4 py-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-center min-w-[110px]">
                <p className="text-xs text-rose-500 font-medium">Canceled</p>
                <p className="text-lg font-bold text-rose-600 mt-0.5">
                  {canceledSeats}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Identifiers & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {/* Reservation ID */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Reservation ID</span>
              <button
                type="button"
                onClick={() => handleCopy(reservation.id, "resId")}
                className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                title="Copy ID"
              >
                {copiedKey === "resId" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs font-semibold text-slate-800 break-all select-all">
              {reservation.id || id}
            </p>
          </div>

          {/* Customer */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Customer</span>
              {reservation.customerId && (
                <Link
                  to={`/dashboard/crm/customers/${reservation.customerId}`}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  View Profile <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800">
              {reservation.customerName || "—"}
            </p>
            {reservation.customerId && (
              <p className="font-mono text-[11px] text-slate-400 mt-0.5 truncate">
                {reservation.customerId}
              </p>
            )}
          </div>

          {/* Booking Event */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Event</span>
              {reservation.bookingEventId && (
                <Link
                  to={`/dashboard/events/${reservation.bookingEventId}`}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  View Event <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800 truncate" title={reservation.bookingEventTitle}>
              {reservation.bookingEventTitle || "—"}
            </p>
            {reservation.bookingEventId && (
              <p className="font-mono text-[11px] text-slate-400 mt-0.5 truncate">
                {reservation.bookingEventId}
              </p>
            )}
          </div>

          {/* Invoice */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Linked Invoice</span>
              {reservation.invoiceId && (
                <button
                  type="button"
                  onClick={() => handleCopy(reservation.invoiceId, "invId")}
                  className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                  title="Copy Invoice ID"
                >
                  {copiedKey === "invId" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {reservation.invoiceId ? (
              <Link
                to={`/dashboard/accounting/invoices/${reservation.invoiceId}`}
                className="font-mono text-xs font-semibold text-[#0066d1] hover:underline flex items-center gap-1 mt-1 break-all"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>{reservation.invoiceId}</span>
              </Link>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">
                No invoice associated
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event Schedule & Dates Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Event Schedule Period (فترة وتواريخ الحدث)
            </h3>
            <p className="text-xs text-slate-500">
              Operational schedule window for this booked event.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              Event Start Date
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#0066d1]" />
              {formatDateTime(reservation.eventStartDate)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              Event End Date
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#0066d1]" />
              {formatDateTime(reservation.eventEndDate)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              Seat Status
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {activeSeats} Active / {totalSeats} Total Booked
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Tickets Modal */}
      <DynamicModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Cancel Reservation Tickets (إلغاء المقاعد)"
        icon={XCircle}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cancelTicketsMutation.mutate();
          }}
          className="space-y-4 pt-1"
        >
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Total Active Seats:</span>
              <strong className="text-slate-900">{activeSeats} Seats</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Quantity to Cancel:</span>
              <strong className="text-rose-600">{cancelQty} Seats</strong>
            </div>
            <div className="flex justify-between text-slate-700 border-t border-slate-200/80 pt-2">
              <span>Remaining Active Seats:</span>
              <strong className="text-emerald-700">
                {Math.max(0, activeSeats - (Number(cancelQty) || 1))} Seats
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Quantity to Cancel (بحد أقصى {activeSeats})
            </Label>
            <Input
              type="number"
              min="1"
              max={activeSeats}
              value={cancelQty}
              onChange={(e) => setCancelQty(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-rose-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Refund Method (طريقة الاسترداد)
            </Label>
            <Select value={cancelPaymentMethod} onValueChange={setCancelPaymentMethod}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Select refund method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash (نقداً)</SelectItem>
                <SelectItem value="Credit">Credit / Card (بطاقة)</SelectItem>
                <SelectItem value="Bank">Bank Transfer (تحويل بنكي)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={cancelTicketsMutation.isPending}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {cancelTicketsMutation.isPending ? "Canceling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </DynamicModal>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Change Operational Status (تعديل الحالة التشغيلية)"
        icon={CheckCircle2}
        showDefaultFooter={false}
        size="sm"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Select Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-11 border-slate-200 bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booked">Booked (محجوز)</SelectItem>
                <SelectItem value="CheckedIn">Checked-In (حاضر / تم تسجيل الحضور)</SelectItem>
                <SelectItem value="Completed">Completed (مكتمل)</SelectItem>
                <SelectItem value="NoShow">No-Show (لم يحضر)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={changeStatusMutation.isPending}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white h-10 px-5 rounded-xl text-xs font-semibold"
            >
              {changeStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

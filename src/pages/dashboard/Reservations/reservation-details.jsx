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
  AlertTriangle,
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
import { useI18n } from "@/context/translate-api";
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
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [copiedKey, setCopiedKey] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [statusError, setStatusError] = useState(null);

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
    toast.success(t("reservationsModule.copiedToClipboard"));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cancel Tickets Mutation
  const cancelTicketsMutation = useMutation({
    mutationFn: () =>
      cancelReservationTickets(id, Math.min(activeSeats, Math.max(1, Number(cancelQty) || 1)), {
        paymentMethod: cancelPaymentMethod,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || t("reservationsModule.cancelTicketsSuccess"));
      setIsCancelModalOpen(false);
      setCancelQty("1");
      setCancelError(null);
    },
    onError: (err) => {
      console.error("Failed to cancel tickets:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        t("reservationsModule.cancelTicketsError");
      toast.error(errMsg);
      setCancelError(errMsg);
    },
  });

  // Change Status Mutation
  const changeStatusMutation = useMutation({
    mutationFn: (newStatus) => updateReservationStatus(id, newStatus),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      toast.success(res?.message || t("reservationsModule.statusUpdateSuccess"));
      setIsStatusModalOpen(false);
      setStatusError(null);
    },
    onError: (err) => {
      console.error("Failed to update status:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        t("reservationsModule.statusUpdateError");
      toast.error(errMsg);
      setStatusError(errMsg);
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
          title={t("reservationsModule.details")}
          breadcrumbs={[
            { label: t("reservationsModule.title"), href: "/dashboard/reservations" },
            { label: t("common.viewDetails") },
          ]}
        />
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-primary mb-3">
            <RefreshCw className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={`${t("reservationsModule.details")} (#${reservation.id ? reservation.id.slice(0, 8) : id})`}
          breadcrumbs={[
            { label: t("reservationsModule.title"), href: "/dashboard/reservations" },
            { label: t("reservationsModule.details") },
          ]}
          infoTooltip={t("reservationsModule.infoTooltip")}
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
            {t("reservationsModule.backToList")}
          </Button>

          {/* Change Status Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusError(null);
              setSelectedStatus(reservation.status || "Booked");
              setIsStatusModalOpen(true);
            }}
            className="border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <RotateCw className="w-4 h-4 mr-1.5 text-[#0066d1]" />
            {t("reservationsModule.changeStatus")}
          </Button>

          {/* Cancel Tickets Button */}
          {activeSeats > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCancelError(null);
                setCancelQty("1");
                setIsCancelModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              {t("reservationsModule.cancelTickets")}
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
                  {reservation.customerName || t("reservationsModule.customerReservation")}
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
                {t("reservationsModule.bookedForEvent")}<strong className="text-slate-700">{reservation.bookingEventTitle || "—"}</strong>
              </p>
            </div>
          </div>

          {/* Quick Seat Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center min-w-[110px]">
              <p className="text-xs text-slate-400 font-medium">{t("reservationsModule.totalSeats")}</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {totalSeats}
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center min-w-[110px]">
              <p className="text-xs text-blue-500 font-medium">{t("reservationsModule.activeSeats")}</p>
              <p className="text-lg font-bold text-[#0066d1] mt-0.5">
                {activeSeats}
              </p>
            </div>
            {canceledSeats > 0 && (
              <div className="px-4 py-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-center min-w-[110px]">
                <p className="text-xs text-rose-500 font-medium">{t("reservationsModule.canceledSeats")}</p>
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
              <span className="text-xs font-medium text-slate-500">{t("reservationsModule.reservationId")}</span>
              <button
                type="button"
                onClick={() => handleCopy(reservation.id, "resId")}
                className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                title="Copy ID"
              >
                {copiedKey === "resId" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">{t("reservationsModule.copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t("reservationsModule.copy")}</span>
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
              <span className="text-xs font-medium text-slate-500">{t("reservationsModule.customer")}</span>
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
              <span className="text-xs font-medium text-slate-500">{t("reservationsModule.event")}</span>
              {reservation.bookingEventId && (
                <Link
                  to={`/dashboard/events/${reservation.bookingEventId}`}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  {t("reservationsModule.viewEvent")} <ArrowRight className="w-3 h-3" />
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
              <span className="text-xs font-medium text-slate-500">{t("reservationsModule.linkedInvoice")}</span>
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
                      <span className="text-emerald-600">{t("reservationsModule.copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t("reservationsModule.copy")}</span>
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
                {t("reservationsModule.noLinkedInvoice")}
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
              {t("reservationsModule.schedulePeriod")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("reservationsModule.operationalScheduleWindow")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              {t("reservationsModule.eventStartDate")}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#0066d1]" />
              {formatDateTime(reservation.eventStartDate)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              {t("reservationsModule.eventEndDate")}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#0066d1]" />
              {formatDateTime(reservation.eventEndDate)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-400 font-medium block">
              {t("reservationsModule.seatStatus")}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {`${activeSeats} / ${totalSeats}`}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Tickets Modal */}
      <DynamicModal
        open={isCancelModalOpen}
        onOpenChange={(open) => {
          setIsCancelModalOpen(open);
          if (!open) setCancelError(null);
        }}
        title={t("reservationsModule.cancelTickets")}
        icon={XCircle}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCancelError(null);
            cancelTicketsMutation.mutate();
          }}
          className="space-y-4 pt-1"
        >
          {/* Error Message Display */}
          {cancelError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">{t("reservationsModule.cancellationFailed")}</span>
                <span>{cancelError}</span>
              </div>
            </div>
          )}

          {/* Warning if status is Completed */}
          {reservation.status === "Completed" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t("reservationsModule.completedTicketsNotice")}
              </span>
            </div>
          )}

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>{t("reservationsModule.totalActiveSeats")}</span>
              <strong className="text-slate-900">{activeSeats} {t("reservationsModule.seatsUnit")}</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>{t("reservationsModule.quantityToCancel")}</span>
              <strong className="text-rose-600">{cancelQty} {t("reservationsModule.seatsUnit")}</strong>
            </div>
            <div className="flex justify-between text-slate-700 border-t border-slate-200/80 pt-2">
              <span>{t("reservationsModule.remainingActiveSeats")}</span>
              <strong className="text-emerald-700">
                {Math.max(0, activeSeats - (Number(cancelQty) || 1))} {t("reservationsModule.seatsUnit")}
              </strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {`${t("reservationsModule.quantityToCancel")} (Max ${activeSeats})`}
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
              {t("reservationsModule.refundMethod")}
            </Label>
            <Select value={cancelPaymentMethod} onValueChange={setCancelPaymentMethod}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder={t("reservationsModule.selectRefundMethod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">{t("reservationsModule.cash")}</SelectItem>
                <SelectItem value="Credit">{t("reservationsModule.credit")}</SelectItem>
                <SelectItem value="Bank">{t("reservationsModule.bankTransfer")}</SelectItem>
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
              {t("reservationsModule.back")}
            </Button>
            <Button
              type="submit"
              disabled={cancelTicketsMutation.isPending}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {cancelTicketsMutation.isPending
                ? t("reservationsModule.canceling")
                : t("reservationsModule.confirmCancellation")}
            </Button>
          </div>
        </form>
      </DynamicModal>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={(open) => {
          setIsStatusModalOpen(open);
          if (!open) setStatusError(null);
        }}
        title={t("reservationsModule.changeStatus")}
        icon={CheckCircle2}
        showDefaultFooter={false}
        size="sm"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          {/* Error Message Display */}
          {statusError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">{t("reservationsModule.statusUpdateError")}</span>
                <span>{statusError}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {t("reservationsModule.selectStatus")}
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-11 border-slate-200 bg-white">
                <SelectValue placeholder={t("reservationsModule.selectStatusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booked">{t("reservationsModule.statuses.booked")}</SelectItem>
                <SelectItem value="CheckedIn">{t("reservationsModule.statuses.checkedIn")}</SelectItem>
                <SelectItem value="Completed">{t("reservationsModule.statuses.completed")}</SelectItem>
                <SelectItem value="NoShow">{t("reservationsModule.statuses.noShow")}</SelectItem>
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={changeStatusMutation.isPending}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white h-10 px-5 rounded-xl text-xs font-semibold"
            >
              {changeStatusMutation.isPending
                ? t("reservationsModule.updating")
                : t("reservationsModule.updateStatus")}
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

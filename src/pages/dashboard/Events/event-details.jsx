import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCcw,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  Building2,
  Users,
  DollarSign,
  Pencil,
  CheckCircle2,
  Layers,
  Globe,
  Info,
  Ticket,
  FileText,
  Plus,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
  getEventById,
  changeEventStatus,
  getEventLookups,
  DAYS_OF_WEEK_CONFIG,
  calculateEventOccurrences,
} from "@/services/events";
import { getReservations } from "@/services/reservations";

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

export default function EventDetailsPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Booked");

  // Event Details Query
  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
  });
  const event = eventData?.data || {};

  // Live Linked Reservations Query matching API
  const { data: reservationsData, isLoading: isLoadingReservations } = useQuery({
    queryKey: ["eventReservations", id],
    queryFn: () => getReservations({ BookingEventId: id, PageSize: 50 }),
    enabled: Boolean(id),
  });
  const reservationsList = reservationsData?.data?.items || event.reservations || [];

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["eventLookups"],
    queryFn: getEventLookups,
  });
  const lookups = lookupsData?.data || { statuses: [] };

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeEventStatus({ id, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["event", id]);
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || "Event status updated!");
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    },
  });

  const handleStatusSubmit = (e) => {
    e?.preventDefault();
    statusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase().replace("-", "");
    switch (s) {
      case "booked":
        return "bg-blue-50 text-[#0066d1] border-blue-200";
      case "checkedin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "canceled":
        return "bg-rose-50 text-rose-700 border-rose-200 line-through";
      case "noshow":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Extract metadata from notes if present
  const pricingModel = useMemo(() => {
    return event.notes?.includes("pricingModel:PerBooking") ? "PerBooking" : "PerSeat";
  }, [event.notes]);

  const bookingModel = useMemo(() => {
    return event.notes?.includes("bookingModel:PerSession") ? "PerSession" : "FullCourse";
  }, [event.notes]);

  const isOvernight = useMemo(() => {
    if (!event.startTime || !event.endTime) return false;
    return event.endTime <= event.startTime;
  }, [event.startTime, event.endTime]);

  const sessionOccurrences = useMemo(() => {
    return calculateEventOccurrences(
      event.startDate,
      event.endDate,
      event.recurringDays
    );
  }, [event.startDate, event.endDate, event.recurringDays]);

  const activeReservedSeats = useMemo(() => {
    if (reservationsList.length > 0) {
      return reservationsList.reduce(
        (sum, r) => sum + (Number(r.activeQuantity ?? r.quantity) || 1),
        0
      );
    }
    return Number(event.reserved) || 0;
  }, [reservationsList, event.reserved]);

  const maxCap = Number(event.maxCapacity) || 20;
  const remainingSeats = Math.max(0, maxCap - activeReservedSeats);
  const capacityPercent =
    maxCap > 0 ? Math.min(100, Math.round((activeReservedSeats / maxCap) * 100)) : 0;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumbs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={event.title || "Event Details"}
          breadcrumbLinks={[
            { label: "Events", href: "/dashboard/events" },
            { label: event.title || "Event Details" },
          ]}
          infoTooltip="مواصفات الحدث، المكان والمورد، جدول الأيام المتكررة، السعة المحجوزة وقائمة المشتركين."
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => navigate(`/dashboard/reservations/add?bookingEventId=${id}`)}
            className="h-10 gap-1.5 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold px-4 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {t?.eventsModule?.newReservation || "New Reservation"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/events/edit/${id}`)}
            className="h-10 gap-2 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold px-4 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            Edit Event
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewStatus(event.status || "Booked");
              setIsStatusModalOpen(true);
            }}
            className="h-10 gap-2 rounded-xl border-[#0066d1]/40 text-[#0066d1] bg-white hover:bg-blue-50/50 text-xs font-semibold px-4 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-[#0066d1]" />
            Change Status
          </Button>
        </div>
      </div>

      {/* Top Grid: Left 8 cols (Event Details) + Right 4 cols (Capacity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Event Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0066d1]" />
              {t?.eventsModule?.specifications || "Event Specifications"}
            </h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Ref: {event.code || `EVT-${event.id}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-800">الخدمة أو الصنف (ProductVariantId)</p>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {event.service || event.serviceName || "Service"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">المكان أو المورد (ResourceId)</p>
              <div className="mt-1">
                {event.resourceId ? (
                  <Link
                    to={`/dashboard/resources/${event.resourceId}`}
                    className="text-xs text-[#0066d1] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#0066d1]" />
                    {event.resource || event.resourceName || "Resource"}
                  </Link>
                ) : (
                  <span className="text-xs text-slate-600">{event.resource || event.resourceName || "Resource"}</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">مقدم الخدمة (ServiceProviderId)</p>
              <p className="text-xs text-slate-600 mt-1">
                {event.provider || event.providerName || "بدون مقدم محدد (General)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">الفترة (StartDate - EndDate)</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {event.period || `${event.startDate} - ${event.endDate}`}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-800">توقيت الجلسة (Time)</p>
                {isOvernight && (
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    Overnight
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {event.time || `${event.startTime} - ${event.endTime}`}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">المنطقة الزمنية (Timezone)</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Asia/Riyadh
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">سعر الحدث (Price)</p>
              <p className="text-xs font-bold text-[#0066d1] mt-1">
                {event.price || "$0"}
                <span className="text-[10px] text-slate-400 font-normal ms-1">
                  ({pricingModel === "PerSeat" ? (t?.eventsModule?.perSeat || "Per Seat") : (t?.eventsModule?.perBooking || "Per Booking")})
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">العربون (AdvancePayment)</p>
              <p className="text-xs text-slate-600 mt-1 font-semibold">
                {event.deposit || "$0"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">قاعدة التسعير</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 mt-1">
                {pricingModel === "PerSeat" ? (t?.eventsModule?.perSeat || "Per Seat") : (t?.eventsModule?.perBooking || "Per Booking")}
              </span>
            </div>
          </div>

          {/* Recurring Days Section */}
          <div className="pt-2 border-t border-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800">
                أيام التكرار داخل الفترة (RecurringDays)
              </p>
              {sessionOccurrences.count > 0 && (
                <span className="text-[11px] font-semibold text-[#0066d1]">
                  {sessionOccurrences.count} جلسات محسوبة في الفترة
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {DAYS_OF_WEEK_CONFIG.map((day) => {
                const isSelected = event.recurringDays?.includes(day.id);
                return (
                  <span
                    key={day.id}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium border ${
                      isSelected
                        ? "bg-[#0066d1] text-white border-[#0066d1] font-semibold shadow-2xs"
                        : "bg-slate-50 text-slate-400 border-slate-200/80"
                    }`}
                  >
                    {day.arabic} ({day.id})
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Capacity Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0066d1]" />
              Capacity & Occupancy
            </h2>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                event.status
              )}`}
            >
              {event.status || "Booked"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">
                {activeReservedSeats}
              </span>
              <span className="text-xl font-bold text-slate-400">
                / {maxCap}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {remainingSeats} مقعد متاح للحجز ({capacityPercent}% محجوز)
            </p>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent >= 100
                  ? "bg-rose-500"
                  : capacityPercent >= 75
                  ? "bg-amber-500"
                  : "bg-[#0066d1]"
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <p className="text-xs font-semibold text-slate-800">ملاحظات الحدث (Notes)</p>
            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {event.notes || "لا توجد متطلبات أو شروط إضافية مسجلة."}
            </p>
          </div>
        </div>
      </div>

      {/* Linked Reservations Section matching API fields */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0066d1]" />
              سجل حجوزات العملاء في هذا الحدث (Customer Reservations)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              كل تسجيل عميل في الحدث يمثل حجزاً معتمداً برقم فاتورة وسعة مقاعد مستقطعة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0066d1] border border-blue-200">
              {reservationsList.length} حجوزات مسجلة
            </span>
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`/dashboard/reservations/add?bookingEventId=${id}`)}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              إضافة حجز
            </Button>
          </div>
        </div>

        {isLoadingReservations ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0066d1]" />
            جاري تحميل سجل الحجوزات...
          </div>
        ) : reservationsList.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">لا توجد حجوزات مسجلة لهذا الحدث حتى الآن</p>
            <p className="text-[11px] text-slate-400 mt-1">
              المقاعد الشاغرة المتبقية: {remainingSeats} مقعداً متاحاً.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">رقم الحجز (Reservation Ref)</th>
                  <th className="py-3 px-4">العميل (Customer)</th>
                  <th className="py-3 px-4">المقاعد (Seats)</th>
                  <th className="py-3 px-4">فترة الحدث (Event Period)</th>
                  <th className="py-3 px-4">الفاتورة (Invoice)</th>
                  <th className="py-3 px-4">الحالة (Status)</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservationsList.map((resItem, idx) => {
                  const qty = Number(resItem.quantity) || 1;
                  const canceledQty = Number(resItem.canceledQuantity) || 0;
                  const activeQty = Math.max(0, qty - canceledQty);

                  return (
                    <tr key={resItem.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Reservation ID */}
                      <td className="py-3 px-4">
                        <Link
                          to={`/dashboard/reservations/${resItem.id}`}
                          className="font-semibold text-[#0066d1] hover:underline font-mono text-xs flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{String(resItem.id).slice(0, 8)}...</span>
                        </Link>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">
                            {resItem.customerName || "Customer"}
                          </span>
                          {resItem.customerId && (
                            <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[130px]">
                              {resItem.customerId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Seats Quantity */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-800 text-xs">
                            {activeQty} مقعد
                          </span>
                          {canceledQty > 0 && (
                            <span className="text-[10px] text-rose-500 font-medium block">
                              ({canceledQty} ملغي)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Event Period */}
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-600">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(resItem.eventStartDate)}
                          </span>
                          {resItem.eventEndDate && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              إلى: {formatDate(resItem.eventEndDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Linked Invoice */}
                      <td className="py-3 px-4">
                        {resItem.invoiceId ? (
                          <Link
                            to={`/dashboard/accounting/invoices/${resItem.invoiceId}`}
                            className="font-mono text-xs text-[#0066d1] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{String(resItem.invoiceId).slice(0, 8)}...</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            resItem.status
                          )}`}
                        >
                          {resItem.status || "Booked"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/reservations/${resItem.id}`)}
                          className="h-8 px-2.5 text-xs text-[#0066d1] hover:bg-blue-50 cursor-pointer font-medium"
                        >
                          عرض التفاصيل
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title={t?.eventsModule?.changeStatus || "Change Event Status"}
        icon={RefreshCcw}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {lookups.statuses.map((st) => {
                  const val = typeof st === "string" ? st : (st.id || st.name);
                  const label = typeof st === "string" ? st : st.name;
                  return (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={statusMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              {statusMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              Save Status
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCw,
  Wallet,
  Calendar as CalendarIcon,
  CheckCircle2,
  Banknote,
  AlertTriangle,
  Sparkles,
  Users,
  DollarSign,
  Building2,
  FileText,
  ShieldAlert,
  ArrowRight,
  Info,
  Loader2,
  XCircle,
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
  getReservationLookups,
} from "@/services/reservations";

export default function ReservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [cancelQty, setCancelQty] = useState("1");
  const [cancelPaymentMethod, setCancelPaymentMethod] = useState("Cash");
  const [cancelNotes, setCancelNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Completed");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Lookups Query (for invoice patterns & payment methods)
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || { invoicePatterns: [] };

  // Reservation Query
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
  });
  const reservation = reservationData?.data || {};

  const totalSeats = Number(reservation.quantity) || 1;
  const canceledSeats = Number(reservation.canceledQuantity) || 0;
  const activeSeats = Math.max(0, totalSeats - canceledSeats);

  const numericTotal = Number(reservation.numericTotal) || 0;
  const numericPaid = Number(reservation.numericPaid) || 0;
  const numericDue = Number(reservation.numericDue) || 0;
  const unitPrice = totalSeats > 0 ? numericTotal / totalSeats : 0;

  // Partial / Full Cancellation Financial Calculator (Page 8: المرتجع ليس دائماً استرداداً نقدياً)
  const cancellationMath = useMemo(() => {
    const qtyToCancel = Math.min(activeSeats, Math.max(1, Number(cancelQty) || 1));
    const cancellationValue = qtyToCancel * unitPrice;

    // Debt reduction vs Cash refund logic:
    // If client owes money (numericDue > 0), reduce due balance first!
    const debtReduction = Math.min(numericDue, cancellationValue);
    const cashRefund = Math.max(0, cancellationValue - debtReduction);

    const isFullCancellation = qtyToCancel === activeSeats;
    const remainingAfterCancel = Math.max(0, activeSeats - qtyToCancel);

    return {
      qtyToCancel,
      cancellationValue,
      debtReduction,
      cashRefund,
      isFullCancellation,
      remainingAfterCancel,
    };
  }, [cancelQty, activeSeats, unitPrice, numericDue]);

  // Cancel Tickets Mutation (Dedicated financial & seat release function)
  const cancelTicketsMutation = useMutation({
    mutationFn: () =>
      cancelReservationTickets(id, cancellationMath.qtyToCancel, {
        paymentMethod: cancelPaymentMethod,
        notes: cancelNotes,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || "تم إلغاء التذاكر وتحرير المقاعد بنجاح!");
      setIsCancelModalOpen(false);
      setCancelQty("1");
      setCancelNotes("");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "فشل إلغاء التذاكر";
      toast.error(msg);
    },
  });

  // Change Operational Status Mutation (With rule: prevent CheckedIn -> NoShow)
  const changeStatusMutation = useMutation({
    mutationFn: (status) => updateReservationStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reservation", id]);
      queryClient.invalidateQueries(["reservations"]);
      toast.success(res?.message || "تم تحديث الحالة التشغيلية للحجز بنجاح!");
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "فشل تحديث الحالة";
      toast.error(msg);
    },
  });

  // Add Installment Mutation
  const addInstallmentMutation = useMutation({
    mutationFn: (newSchedule) =>
      updateReservation(id, { paymentSchedule: newSchedule }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservation", id]);
      toast.success("تمت إضافة القسط المجدول بنجاح!");
      setIsPaymentModalOpen(false);
      setPaymentForm({ amount: "", dueDate: new Date().toISOString().split("T")[0], notes: "" });
    },
  });

  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح للقسط");
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

  const handleStatusSubmit = (e) => {
    e?.preventDefault();

    // Page 8 Rule: منع اعتبار من سجل حضوره «لم يحضر»
    const currentStatusNormalized = String(reservation.status || "").toLowerCase().replace("-", "");
    const targetStatusNormalized = String(selectedStatus || "").toLowerCase().replace("-", "");

    if (currentStatusNormalized === "checkedin" && targetStatusNormalized === "noshow") {
      toast.error("مخالفة لقواعد النظام: لا يمكن تحويل حالة العميل إلى «لم يحضر» بعد أن تم تسجيل حضوره بالفعل (Checked-In).");
      return;
    }

    if (targetStatusNormalized === "canceled") {
      toast.error("الإلغاء المالي وتحرير المقاعد يتم حصراً عبر زر «إلغاء التذاكر» لضمان تسوية المرتجع والسعة.");
      return;
    }

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const isCheckedIn = String(reservation.status || "").toLowerCase().replace("-", "") === "checkedin";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageTitle
        title={`Reservation Details (#${reservation.id})`}
        breadcrumbLinks={[
          { label: "Reservations", href: "/dashboard/reservations" },
          { label: `Reservation #${reservation.id}` },
        ]}
        infoTooltip="تفاصيل حجز العميل، المبالغ المسددة، التذاكر النشطة والملغاة، وتسوية المرتجعات."
        actions={
          <div className="flex items-center gap-2">
            {/* Dedicated Cancel Tickets Button */}
            {activeSeats > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setCancelQty("1");
                  setIsCancelModalOpen(true);
                }}
                className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold h-10 gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Cancel Tickets (إلغاء التذاكر)
              </Button>
            )}

            {/* Change Operational Status Button */}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus(reservation.status || "Booked");
                setIsStatusModalOpen(true);
              }}
              className="rounded-xl border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold h-10 gap-2 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#0066d1]" />
              Change Status (الحالة التشغيلية)
            </Button>
          </div>
        }
      />

      {/* Page 8 System Guidance Card */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-indigo-50/30 p-5 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066d1] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                08 / فهم النظام: حجز العميل والإلغاء الجزئي
              </span>
              <span className="text-xs text-slate-500">قواعد الإلغاء، تسوية المرتجع، والانتقالات المسموحة</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>قاعدة المرتجع والتسوية:</strong> المرتجع ليس دائماً استرداداً نقدياً! إذا كانت الفاتورة آجلة أو مدفوعة جزئياً، يقل الدين على العميل أولاً. كما أن تغيير الحالة التشغيلية مخصص للحضور والإكمال، بينما يمر الإلغاء المالي وتحرير المقاعد حصراً عبر دالة الإلغاء المخصصة.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/60 shadow-2xs text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">المقاعد النشطة</p>
              <span className="text-base font-bold text-[#0066d1] block mt-0.5">
                {activeSeats} / {totalSeats} مقعد
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Customer & Event */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0066d1]" />
                Customer & Event Details
              </h2>
              {reservation.bookingEventId && (
                <Link
                  to={`/dashboard/events/${reservation.bookingEventId}`}
                  className="text-xs text-[#0066d1] font-semibold hover:underline flex items-center gap-1"
                >
                  View Event <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">Customer (العميل)</p>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {reservation.customer || reservation.customerName || "Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Booking Event (الحدث)</p>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {reservation.bookingEvent || reservation.eventName || "Event"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Resource / Venue (المكان)</p>
                <p className="text-xs text-slate-600 mt-1">
                  {reservation.resource || "Main Hall"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Service Provider (مقدم الخدمة)</p>
                <p className="text-xs text-slate-600 mt-1">
                  {reservation.provider || "General"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Period (الفترة)</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  {reservation.period || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Time (التوقيت)</p>
                <p className="text-xs text-slate-600 mt-1">
                  {reservation.time || "09:00 - 12:00"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Financials & Ticket Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0066d1]" />
              Amounts & Seat Allocation (المبالغ والمقاعد)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-800">حالة المقاعد (Seats)</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {totalSeats} إجمالي
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-emerald-600 font-semibold">
                    {activeSeats} نشط
                  </span>
                  {canceledSeats > 0 && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-rose-600 font-semibold">
                        {canceledSeats} ملغى
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Payment Method</p>
                <p className="text-xs text-slate-600 mt-1">
                  {reservation.paymentMethod || "Cash"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Currency</p>
                <p className="text-xs text-slate-600 mt-1">
                  {reservation.currency || "USD"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Total Amount (الإجمالي)</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {reservation.total || `$${numericTotal.toFixed(2)}`}
                </p>
                <span className="text-[10px] text-slate-400">
                  (${unitPrice.toFixed(2)} / مقعد)
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Paid Amount (المدفوع)</p>
                <p className="text-sm font-bold text-[#0066d1] mt-1">
                  {reservation.paid || `$${numericPaid.toFixed(2)}`}
                </p>
                <span className="text-[10px] text-slate-400">المبلغ المستلم فعلياً</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Due Debt (المتبقي كدين)</p>
                <p className="text-sm font-bold text-amber-600 mt-1">
                  {reservation.due || `$${numericDue.toFixed(2)}`}
                </p>
                <span className="text-[10px] text-slate-400">
                  {numericDue > 0 ? "ذمة مستحقة على العميل" : "مسدد بالكامل"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Schedule */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  جدول الأقساط والدفعات (Payment Installment Schedule)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  الدفعات المجدولة لتسوية المبلغ المستحق على الحجز.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-5 rounded-xl font-medium text-xs h-10 gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add Installment
              </Button>
            </div>

            {(!reservation.paymentSchedule || reservation.paymentSchedule.length === 0) ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                لا توجد أقساط مجدولة مسجلة لهذا الحجز.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {reservation.paymentSchedule.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200/90 rounded-2xl p-4 bg-white flex items-center justify-between"
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
                          استحقاق: {item.dueDate}
                        </p>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 max-w-xs truncate">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Operational Status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">
              Operational Status
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-800 mb-1.5">
                  الحالة التشغيلية الحالية
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                    reservation.status
                  )}`}
                >
                  {reservation.status || "Booked"}
                </span>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  تستخدم دالة الحالة لتسجيل الحضور (Checked-In) والإكمال وعدم الحضور.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">تاريخ الحجز</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reservation.createdAt || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Ticket Cancellation Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                إلغاء التذاكر وتحرير المقاعد
              </h2>
              <span className="text-[11px] font-semibold text-[#0066d1]">
                {activeSeats} مقاعد نشطة
              </span>
            </div>

            {activeSeats <= 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                جميع تذاكر هذا الحجز ملغاة بالفعل.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    الكمية المراد إلغاؤها (بحد أقصى {activeSeats})
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max={activeSeats}
                    placeholder="1"
                    value={cancelQty}
                    onChange={(e) => setCancelQty(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-rose-500"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white py-3 h-11 rounded-xl font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  إجراء الإلغاء وتسوية المرتجع
                </Button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  يتم تحرير المقاعد الملغاة فورياً لتصبح متاحة في الحدث، وتسوية المرتجع المالي.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partial & Full Cancellation Settlement Modal (Page 8: ماذا يفعله الإلغاء؟ + المرتجع ليس دائماً استرداداً نقدياً) */}
      <DynamicModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="إلغاء التذاكر وتسوية المرتجع المالي (Ticket Cancellation & Refund)"
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
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>المقاعد المراد إلغاؤها:</span>
              <strong className="text-slate-900">{cancellationMath.qtyToCancel} من أصل {activeSeats} مقعد نشط</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>القيمة الإجمالية للجزء الملغي:</span>
              <strong className="text-slate-900">${cancellationMath.cancellationValue.toFixed(2)}</strong>
            </div>
            <div className="border-t border-slate-200/80 pt-2 flex justify-between text-slate-700">
              <span>تخفيض الدين المستحق على العميل:</span>
              <strong className="text-amber-700">-${cancellationMath.debtReduction.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between font-bold text-emerald-800">
              <span>المبلغ المسترد نقداً للعميل:</span>
              <span className="text-sm font-extrabold text-emerald-700">${cancellationMath.cashRefund.toFixed(2)}</span>
            </div>
          </div>

          {/* Notice explaining Page 8 rule */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
            <strong>قاعدة التسوية: المرتجع ليس دائماً استرداداً نقدياً!</strong>
            <p className="leading-relaxed">
              إذا كانت الفاتورة آجلة أو مدفوعة جزئياً، يقل الدين على العميل أولاً. لا يُدفع له كامل قيمة الجزء الملغي نقداً دون تسوية ما دفعه فعلاً.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              طريقة تسوية الاسترداد (Refund Method)
            </Label>
            <Select value={cancelPaymentMethod} onValueChange={setCancelPaymentMethod}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="اختر طريقة التسوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">نقداً (Cash Refund)</SelectItem>
                <SelectItem value="Credit">رصيد بالبطاقة / الحساب (Card/Credit)</SelectItem>
                <SelectItem value="Bank">تحويل بنكي (Bank Transfer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              سبب الإلغاء أو ملاحظات المرتجع (Reason / Notes)
            </Label>
            <Textarea
              placeholder="سبب طلب العميل للإلغاء..."
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="min-h-[75px] rounded-xl border-slate-200 bg-white resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200"
            >
              تراجع
            </Button>
            <Button
              type="submit"
              disabled={cancelTicketsMutation.isPending}
              className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
            >
              {cancelTicketsMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              تأكيد الإلغاء وتحرير المقاعد
            </Button>
          </div>
        </form>
      </DynamicModal>

      {/* Change Operational Status Modal (With Transition Validation) */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="تعديل الحالة التشغيلية للحجز (Change Operational Status)"
        icon={CheckCircle2}
        showDefaultFooter={false}
        size="sm"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          {isCheckedIn && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>تنبيه انتقالات الحالة:</strong> تم تسجيل حضور العميل (Checked-In). يمنع النظام تحويل حالته إلى «لم يحضر (No-Show)».
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              اختر الحالة التشغيلية
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-11 border-slate-200 bg-white">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booked">Booked (محجوز)</SelectItem>
                <SelectItem value="Checked-In">Checked-In (حاضر / تم تسجيل الحضور)</SelectItem>
                <SelectItem value="Completed">Completed (مكتمل)</SelectItem>
                <SelectItem value="No-Show" disabled={isCheckedIn}>
                  No-Show (لم يحضر) {isCheckedIn ? "- غير مسموح بعد الحضور" : ""}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400">
              ملاحظة: الإلغاء المالي وتحرير المقاعد يتم عبر زر «إلغاء التذاكر» المخصص.
            </p>
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
              {changeStatusMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              Update Status
            </Button>
          </div>
        </form>
      </DynamicModal>

      {/* Add Payment Installment Modal */}
      <DynamicModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        title="Add Payment Installment"
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
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
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
              className="min-h-[90px] rounded-xl border-slate-200 bg-white resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addInstallmentMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white"
            >
              Add Installment
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

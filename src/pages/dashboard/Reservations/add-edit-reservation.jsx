import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Wallet,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  FileText,
  ShieldCheck,
  CreditCard,
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
  createReservation,
  updateReservation,
  getReservationLookups,
} from "@/services/reservations";

export default function AddEditReservation() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customerId: "",
    customer: "",
    bookingEventId: "",
    bookingEvent: "",
    quantity: "1",
    invoicePatternId: "",
    paymentMethod: "Cash",
    costCenterId: "",
    description: "",
    notes: "",
    amountPaid: "0",
    discountAmount: "0",
    discountPercent: "0",
    taxPercent: "0",
    paymentSchedule: [],
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    events: [],
    invoicePatterns: [],
    paymentMethods: [
      { id: "Cash", name: "Cash" },
      { id: "Credit", name: "Credit / Card" },
      { id: "Bank", name: "Bank Transfer" },
    ],
    costCenters: [],
  };

  // Reservation Query for Edit Mode
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (reservationData?.data) {
      const r = reservationData.data;
      setFormData({
        customerId: r.customerId || "",
        customer: r.customerName || "Customer",
        bookingEventId: r.bookingEventId || "",
        bookingEvent: r.eventName || "Event",
        quantity: String(r.quantity || 1),
        invoicePatternId: r.invoicePatternId || "",
        paymentMethod: r.paymentMethod || "Cash",
        costCenterId: r.costCenterId || "",
        description: r.description || r.notes || "",
        notes: r.notes || "",
        amountPaid: String(r.numericPaid || 0),
        discountAmount: "0",
        discountPercent: "0",
        taxPercent: "0",
        paymentSchedule: r.paymentSchedule || [],
      });
    }
  }, [reservationData]);

  // Set default pattern / costCenter when lookups load
  useEffect(() => {
    if (!formData.invoicePatternId && lookups.invoicePatterns.length > 0) {
      setFormData((prev) => ({ ...prev, invoicePatternId: lookups.invoicePatterns[0].id }));
    }
    if (!formData.costCenterId && lookups.costCenters.length > 0) {
      setFormData((prev) => ({ ...prev, costCenterId: lookups.costCenters[0].id }));
    }
  }, [lookups]);

  // Selected Event metadata for capacity checks & pricing
  const selectedEvent = useMemo(() => {
    if (!formData.bookingEventId || !lookups.events) return null;
    return lookups.events.find((e) => String(e.id) === String(formData.bookingEventId));
  }, [formData.bookingEventId, lookups.events]);

  // Seat Availability & Capacity Math (Page 8: التحقق من صلاحية الحدث وتوافر المقاعد: المحجوز الحالي + الطلب لا يتجاوز سعة الحدث)
  const capacityCheck = useMemo(() => {
    if (!selectedEvent) return { available: 0, max: 0, reserved: 0, isExceeded: false, newRemaining: 0 };
    const max = Number(selectedEvent.maxCapacity) || 20;
    const reserved = Number(selectedEvent.reservedQuantity) || 0;
    const available = Math.max(0, max - reserved);
    const requested = Number(formData.quantity) || 0;
    const isExceeded = requested > available;
    const newRemaining = Math.max(0, available - requested);
    return {
      available,
      max,
      reserved,
      isExceeded,
      newRemaining,
      newReserved: reserved + requested,
    };
  }, [selectedEvent, formData.quantity]);

  // Total Booking Financials
  const financialSummary = useMemo(() => {
    const unitPrice = Number(selectedEvent?.price) || 0;
    const qty = Number(formData.quantity) || 1;
    const subtotal = unitPrice * qty;
    const discount = Number(formData.discountAmount) || 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = (afterDiscount * (Number(formData.taxPercent) || 0)) / 100;
    const grandTotal = afterDiscount + tax;
    const paid = Number(formData.amountPaid) || 0;
    const due = Math.max(0, grandTotal - paid);
    return {
      unitPrice,
      qty,
      subtotal,
      grandTotal,
      paid,
      due,
    };
  }, [selectedEvent, formData.quantity, formData.discountAmount, formData.taxPercent, formData.amountPaid]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateReservation(id, data) : createReservation(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["reservation", id]);
      toast.success(
        res?.message || (isEdit ? "Reservation updated successfully!" : "Reservation created successfully!")
      );
      navigate("/dashboard/reservations");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? "Failed to update reservation!" : "Failed to create reservation!");
      toast.error(msg);
    },
  });

  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid installment amount");
      return;
    }

    const newPayment = {
      id: Date.now(),
      amount: Number(paymentForm.amount),
      dueDate: paymentForm.dueDate,
      notes: paymentForm.notes,
    };

    setFormData((prev) => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newPayment],
    }));

    setPaymentForm({ amount: "", dueDate: new Date().toISOString().split("T")[0], notes: "" });
    setIsPaymentModalOpen(false);
    toast.success("Payment installment added!");
  };

  const handleRemovePayment = (paymentId) => {
    setFormData((prev) => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter((p) => p.id !== paymentId),
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.customerId && !formData.customer) {
      toast.error("يرجى اختيار العميل (Customer is required)");
      return;
    }
    if (!formData.bookingEventId && !formData.bookingEvent) {
      toast.error("يرجى اختيار الحدث (Booking Event is required)");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("يرجى إدخال الوصف (Description is required)");
      return;
    }

    const reqQty = Number(formData.quantity) || 0;
    if (reqQty <= 0) {
      toast.error("كمية التذاكر يجب أن تكون 1 على الأقل");
      return;
    }

    // Step 2 Rule: المحجوز الحالي + الطلب لا يتجاوز سعة الحدث
    if (capacityCheck.isExceeded) {
      toast.error(`المقاعد المطلوبة (${reqQty}) تتجاوز المقاعد المتاحة بالحدث (${capacityCheck.available} مقعداً فقط)`);
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Page Title with Top Actions */}
      <PageTitle
        title={isEdit ? "Edit Reservation (تعديل الحجز)" : "New Reservation (حجز عميل جديد)"}
        breadcrumbLinks={[
          { label: "Reservations", href: "/dashboard/reservations" },
          { label: isEdit ? "Edit Reservation" : "New Reservation" },
        ]}
        infoTooltip="ربط العميل بالكمية المطلوبة في الحدث، إنشاء الفاتورة، والتحقق التلقائي من توافر المقاعد."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/reservations")}
              className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending || isLoading || capacityCheck.isExceeded}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-medium shadow-xs transition-all cursor-pointer"
            >
              {saveMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              {saveMutation.isPending ? "Saving..." : "Confirm Reservation (تأكيد الحجز)"}
            </Button>
          </div>
        }
      />

      {/* Page 8 System Guidance Card */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-indigo-50/30 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066d1] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                08 / فهم النظام: حجز العميل والإلغاء الجزئي
              </span>
              <span className="text-xs text-slate-500">الحدث يحدد العرض المتاح، والحجز يربط العميل بالكمية التي اختارها</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>دورة إنشاء الحجز المعتمدة:</strong> (1) اختيار العميل والحدث والكمية والمبلغ المستلم فعلياً. (2) التحقق من صلاحية وتوافر المقاعد: <code>المحجوز الحالي + الطلب &le; سعة الحدث</code>. (3) إنشاء الفاتورة وفق السياسة المعتمدة، ثم حفظ الحجز وتحديث كمية المقاعد. (4) ضمان اتساق الفاتورة والحجز والسعة عند النجاح أو الفشل.
            </p>
          </div>
        </div>

        {/* Practical Example from Page 8 */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900 space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>مثال عملي موجه:</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            حدث سعته 20 مقعداً، سعر المقعد 25. حجز العميل 3 مقاعد: قيمة الحجز 75، والمحجوز يصبح 3، والمتاح 17. وإذا تم إلغاء مقعد لاحقاً، يصبح المحجوز 2 والمتاح 18.
          </p>
        </div>
      </div>

      {/* Seat Availability Warning Alert */}
      {capacityCheck.isExceeded && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-900 text-sm">
              تجاوز السعة المتاحة للحدث!
            </span>
            <p className="text-xs text-rose-700 leading-relaxed">
              المقاعد المطلوبة ({formData.quantity}) تتجاوز المقاعد المتبقية في الحدث ({capacityCheck.available} مقعداً متاحاً فقط من أصل {capacityCheck.max}). يرجى تقليل الكمية لتتوافق مع السعة الشاغرة.
            </p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="space-y-6">
        {/* Section 1: Reservation Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0066d1]" />
            بيانات الحجز والحدث (Reservation & Event Information)
          </h2>

          {/* Row 1: Customer, Booking Event, Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                العميل (Customer) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(val) => {
                  const cust = lookups.customers.find((c) => String(c.id) === String(val));
                  setFormData({
                    ...formData,
                    customerId: val,
                    customer: cust?.name || "Customer",
                  });
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                الحدث المتاح (Booking Event) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.bookingEventId}
                onValueChange={(val) => {
                  const ev = lookups.events.find((e) => String(e.id) === String(val));
                  const defaultPrice = ev?.price || 0;
                  const defaultAdvance = ev?.advancePayment || defaultPrice;
                  setFormData({
                    ...formData,
                    bookingEventId: val,
                    bookingEvent: ev?.name || "Event",
                    amountPaid: String(defaultAdvance),
                  });
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر الحدث المطروح" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.events.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name} (المتاح: {e.remainingQty ?? 20} مقعداً | السعر: ${e.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-800">
                  الكمية المطلوبة (Quantity / Seats) <span className="text-rose-500">*</span>
                </Label>
                {selectedEvent && (
                  <span className="text-[11px] font-medium text-slate-500">
                    المتبقي بالحدث: <strong className="text-[#0066d1]">{capacityCheck.available}</strong> مقعد
                  </span>
                )}
              </div>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className={`h-11 rounded-xl bg-white focus-visible:ring-[#0066d1] ${
                  capacityCheck.isExceeded ? "border-rose-400 focus-visible:ring-rose-500" : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Live Capacity & Financial Math Preview Box */}
          {selectedEvent && (
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">سعر المقعد</span>
                <span className="text-sm font-bold text-slate-800">${financialSummary.unitPrice}</span>
              </div>
              <div>
                <span className="text-slate-500 block">إجمالي قيمة التذاكر</span>
                <span className="text-sm font-bold text-[#0066d1]">${financialSummary.subtotal}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المحجوز بعد هذا الطلب</span>
                <span className="text-sm font-bold text-slate-800">{capacityCheck.newReserved} / {capacityCheck.max}</span>
              </div>
              <div>
                <span className="text-slate-500 block">المقاعد الشاغرة المتبقية</span>
                <span className="text-sm font-bold text-emerald-600">{capacityCheck.newRemaining} مقعد</span>
              </div>
            </div>
          )}

          {/* Row 2: Invoice Pattern, Payment Method, Cost Center */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                نمط الفاتورة المعتمد (Invoice Pattern)
              </Label>
              <Select
                value={formData.invoicePatternId}
                onValueChange={(val) =>
                  setFormData({ ...formData, invoicePatternId: val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر نمط الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.invoicePatterns.map((ip) => (
                    <SelectItem key={ip.id} value={String(ip.id)}>
                      {ip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                إنشاء الفاتورة آلياً وفق السياسة المعتمدة لضمان اتساق القيود.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                طريقة الدفع (Payment Method)
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData({ ...formData, paymentMethod: val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                مركز التكلفة (Cost Center)
              </Label>
              <Select
                value={formData.costCenterId || "none"}
                onValueChange={(val) =>
                  setFormData({ ...formData, costCenterId: val === "none" ? "" : val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر مركز التكلفة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- المركز الافتراضي --</SelectItem>
                  {lookups.costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={String(cc.id)}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Field (Required) */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <Label className="text-xs font-semibold text-slate-800">
              الوصف (Description) <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              placeholder="وصف تفصيلي للحجز أو المتدرب / المشترك..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          {/* Row 3: Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-800">
              ملاحظات أو شروط خاصة بالحجز (Notes)
            </Label>
            <Textarea
              placeholder="شروط المقاعد، تفاصيل تسجيل المشترك، متطلبات الشهادة أو الحضور..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="min-h-[85px] rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
            />
          </div>
        </div>

        {/* Section 2: Financials & Settlement */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0066d1]" />
              القيم المالية والمبلغ المستلم فعلياً (Amounts & Actual Paid)
            </h2>
            <span className="text-xs font-semibold text-slate-600">
              الإجمالي الصافي: <strong className="text-[#0066d1]">${financialSummary.grandTotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                المبلغ المستلم فعلياً (Amount Actually Paid)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.amountPaid}
                onChange={(e) =>
                  setFormData({ ...formData, amountPaid: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] font-semibold text-[#0066d1]"
              />
              <p className="text-[10px] text-slate-400">
                المبلغ المسدد نقداً أو بالبطاقة عند إجراء الحجز.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                مبلغ الخصم (Discount Amount)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData({ ...formData, discountAmount: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                نسبة الضريبة (Tax %)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.taxPercent}
                onChange={(e) =>
                  setFormData({ ...formData, taxPercent: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                المتبقي كدين على العميل (Due Balance)
              </Label>
              <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 flex items-center font-bold text-slate-800">
                ${financialSummary.due.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400">
                {financialSummary.due > 0 ? "فاتورة آجلة / مدفوعة جزئياً" : "حجز مدفوع بالكامل"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Installments Schedule (Optional) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0066d1]" />
                جدول الدفعات والأقساط (Payment Installment Schedule)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                في حال كان الحجز آجلاً أو مقسطاً على دفعات.
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

          {formData.paymentSchedule.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              لا توجد أقساط مجدولة مسجلة.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {formData.paymentSchedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-sm">${item.amount}</span>
                    <span className="text-[11px] text-slate-400 block">{item.dueDate}</span>
                    {item.notes && <p className="text-[10px] text-slate-500 mt-1">{item.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePayment(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Installment Modal */}
      <DynamicModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        title="Add Payment Installment (إضافة قسط مجدول)"
        icon={Wallet}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              مبلغ القسط (Amount)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              تاريخ الاستحقاق (Due Date)
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, dueDate: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              ملاحظات الدفعة (Notes)
            </Label>
            <Textarea
              placeholder="ملاحظات القسط..."
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, notes: e.target.value })
              }
              className="min-h-[80px] rounded-xl border-slate-200 bg-white resize-none"
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

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  Receipt,
  CreditCard,
  Barcode,
  Coins,
  Percent,
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
  createReservation,
  updateReservation,
  getReservationLookups,
} from "@/services/reservations";

export default function AddEditReservation() {
  const { t } = useI18n();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const eventIdFromQuery = searchParams.get("bookingEventId") || searchParams.get("eventId") || "";

  // Strict 14 fields matching CreateCustomerReservationDto
  const [formData, setFormData] = useState({
    customerId: "",
    bookingEventId: eventIdFromQuery || "",
    quantity: "1",
    invoicePatternId: "",
    currencyId: "",
    paymentMethod: "Cash",
    paidAmount: "0",
    discountAmount: "0",
    discountPercentage: "0",
    tax_Percentage: "0",
    taxAmount: "0",
    barcode: "",
    costCenterId: "",
    paymentSchedules: [],
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    description: "",
    amountDue: "",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Lookups Query (Customers, Events, Invoice Patterns, Cost Centers, Currencies)
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });

  const lookups = lookupsData?.data || {
    customers: [],
    events: [],
    invoicePatterns: [],
    costCenters: [],
    currencies: [],
    paymentMethods: [
      { id: "Cash", name: t?.reservationsModule?.cash || "Cash" },
      { id: "Credit", name: t?.reservationsModule?.credit || "Credit / Card" },
      { id: "Bank", name: t?.reservationsModule?.bankTransfer || "Bank Transfer" },
    ],
  };

  // Reservation Query for Edit Mode
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
    enabled: isEdit,
  });

  // Pre-populate fields in edit mode
  useEffect(() => {
    if (reservationData?.data) {
      const r = reservationData.data;
      setFormData({
        customerId: r.customerId || "",
        bookingEventId: r.bookingEventId || "",
        quantity: String(r.quantity || 1),
        invoicePatternId: r.invoicePatternId || "",
        currencyId: r.currencyId || "",
        paymentMethod: r.paymentMethod || "Cash",
        paidAmount: String(r.paidAmount ?? 0),
        discountAmount: String(r.discountAmount ?? 0),
        discountPercentage: String(r.discountPercentage ?? 0),
        tax_Percentage: String(r.tax_Percentage ?? 0),
        taxAmount: String(r.taxAmount ?? 0),
        barcode: r.barcode || "",
        costCenterId: r.costCenterId || "",
        paymentSchedules: r.paymentSchedules || [],
      });
    }
  }, [reservationData]);

  // Set default invoice pattern, cost center, and currency when lookups load
  useEffect(() => {
    if (!formData.invoicePatternId && lookups.invoicePatterns?.length > 0) {
      setFormData((prev) => ({ ...prev, invoicePatternId: lookups.invoicePatterns[0].id }));
    }
    if (!formData.costCenterId && lookups.costCenters?.length > 0) {
      setFormData((prev) => ({ ...prev, costCenterId: lookups.costCenters[0].id }));
    }
    if (!formData.currencyId && lookups.currencies?.length > 0) {
      setFormData((prev) => ({ ...prev, currencyId: lookups.currencies[0].id }));
    }
  }, [lookups]);

  // If bookingEventId was passed via query, sync default advance price
  useEffect(() => {
    if (eventIdFromQuery && lookups.events?.length > 0 && !isEdit && !formData.paidAmount) {
      const ev = lookups.events.find((e) => String(e.id) === String(eventIdFromQuery));
      if (ev) {
        setFormData((prev) => ({
          ...prev,
          bookingEventId: eventIdFromQuery,
          paidAmount: String(ev.advancePayment || ev.price || 0),
        }));
      }
    }
  }, [eventIdFromQuery, lookups.events, isEdit]);

  // Selected Event metadata for capacity checks & pricing
  const selectedEvent = useMemo(() => {
    if (!formData.bookingEventId || !lookups.events) return null;
    return lookups.events.find((e) => String(e.id) === String(formData.bookingEventId));
  }, [formData.bookingEventId, lookups.events]);

  // Selected Currency metadata
  const selectedCurrency = useMemo(() => {
    if (!formData.currencyId || !lookups.currencies) return null;
    return lookups.currencies.find((c) => String(c.id) === String(formData.currencyId));
  }, [formData.currencyId, lookups.currencies]);

  const currencySymbol = selectedCurrency?.code || selectedCurrency?.name || "$";

  // Seat Availability & Capacity Math: المحجوز الحالي + الطلب لا يتجاوز سعة الحدث
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

  // Financial Math & Calculations
  const unitPrice = Number(selectedEvent?.price) || 0;
  const qty = Math.max(1, Number(formData.quantity) || 1);
  const subtotal = unitPrice * qty;
  const discountAmt = Number(formData.discountAmount) || 0;
  const taxableBase = Math.max(0, subtotal - discountAmt);
  const taxAmt = Number(formData.taxAmount) || 0;
  const grandTotal = taxableBase + taxAmt;
  const paidAmt = Number(formData.paidAmount) || 0;
  const dueBalance = Math.max(0, grandTotal - paidAmt);

  // Sync Discount Percentage -> Discount Amount
  const handleDiscountPercentChange = (pct) => {
    const p = Math.max(0, Number(pct) || 0);
    const calculatedDiscount = ((subtotal * p) / 100).toFixed(2);
    const newTaxable = Math.max(0, subtotal - Number(calculatedDiscount));
    const calculatedTax = (((newTaxable) * (Number(formData.tax_Percentage) || 0)) / 100).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      discountPercentage: pct,
      discountAmount: calculatedDiscount,
      taxAmount: calculatedTax,
    }));
  };

  // Sync Discount Amount -> Discount Percentage
  const handleDiscountAmountChange = (amt) => {
    const a = Math.max(0, Number(amt) || 0);
    const calculatedPct = subtotal > 0 ? ((a / subtotal) * 100).toFixed(2) : "0";
    const newTaxable = Math.max(0, subtotal - a);
    const calculatedTax = (((newTaxable) * (Number(formData.tax_Percentage) || 0)) / 100).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      discountAmount: amt,
      discountPercentage: calculatedPct,
      taxAmount: calculatedTax,
    }));
  };

  // Sync Tax Percentage -> Tax Amount
  const handleTaxPercentChange = (pct) => {
    const p = Math.max(0, Number(pct) || 0);
    const calculatedTax = ((taxableBase * p) / 100).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      tax_Percentage: pct,
      taxAmount: calculatedTax,
    }));
  };

  // Sync Tax Amount -> Tax Percentage
  const handleTaxAmountChange = (amt) => {
    const a = Math.max(0, Number(amt) || 0);
    const calculatedPct = taxableBase > 0 ? ((a / taxableBase) * 100).toFixed(2) : "0";

    setFormData((prev) => ({
      ...prev,
      taxAmount: amt,
      tax_Percentage: calculatedPct,
    }));
  };

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

  // Add Installment to Schedule (CreateInvoiceScheduleDto)
  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amountDue || Number(paymentForm.amountDue) <= 0) {
      toast.error("يرجى إدخال مبلغ قسط صالح (Please enter a valid installment amount)");
      return;
    }

    const newPayment = {
      id: Date.now(),
      description: paymentForm.description?.trim() || `قسط ${formData.paymentSchedules.length + 1}`,
      amountDue: Number(paymentForm.amountDue),
      dueDate: paymentForm.dueDate,
    };

    setFormData((prev) => ({
      ...prev,
      paymentSchedules: [...prev.paymentSchedules, newPayment],
    }));

    setPaymentForm({
      description: "",
      amountDue: "",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setIsPaymentModalOpen(false);
    toast.success("تمت إضافة القسط إلى الجدول بنجاح");
  };

  const handleRemovePayment = (paymentId) => {
    setFormData((prev) => ({
      ...prev,
      paymentSchedules: prev.paymentSchedules.filter((p) => p.id !== paymentId),
    }));
  };

  // Submit Handler strictly formatting CreateCustomerReservationDto
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.customerId) {
      toast.error("يرجى اختيار العميل (Customer is required)");
      return;
    }
    if (!formData.bookingEventId) {
      toast.error("يرجى اختيار الحدث المتاح (Booking Event is required)");
      return;
    }
    const reqQty = Number(formData.quantity) || 0;
    if (reqQty <= 0) {
      toast.error("كمية التذاكر يجب أن تكون 1 على الأقل (Quantity must be at least 1)");
      return;
    }
    if (!formData.invoicePatternId) {
      toast.error("يرجى تحديد نمط الفاتورة (Invoice Pattern is required)");
      return;
    }

    // Capacity Check
    if (capacityCheck.isExceeded) {
      toast.error(`المقاعد المطلوبة (${reqQty}) تتجاوز المقاعد المتاحة بالحدث (${capacityCheck.available} مقعداً فقط)`);
      return;
    }

    // Build exact 14 properties of CreateCustomerReservationDto
    const payload = {
      customerId: formData.customerId,
      bookingEventId: formData.bookingEventId,
      quantity: reqQty,
      invoicePatternId: formData.invoicePatternId,
      currencyId: formData.currencyId || null,
      paymentMethod: formData.paymentMethod || "Cash",
      paidAmount: Number(formData.paidAmount) || 0,
      discountAmount: Number(formData.discountAmount) || 0,
      discountPercentage: Number(formData.discountPercentage) || 0,
      tax_Percentage: Number(formData.tax_Percentage) || 0,
      taxAmount: Number(formData.taxAmount) || 0,
      barcode: formData.barcode ? String(formData.barcode).trim() : null,
      costCenterId: formData.costCenterId || null,
      paymentSchedules: formData.paymentSchedules.length > 0
        ? formData.paymentSchedules.map((s) => ({
            description: s.description || null,
            amountDue: Number(s.amountDue) || 0,
            dueDate: s.dueDate ? new Date(s.dueDate).toISOString() : new Date().toISOString(),
          }))
        : null,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Page Title with Top Actions */}
      <PageTitle
        title={
          isEdit
            ? t?.reservationsModule?.editReservation || "Edit Reservation"
            : t?.reservationsModule?.newReservation || "New Reservation"
        }
        breadcrumbLinks={[
          { label: "Reservations", href: "/dashboard/reservations" },
          { label: isEdit ? "Edit Reservation" : "New Reservation" },
        ]}
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
              {saveMutation.isPending
                ? "Saving..."
                : isEdit
                ? t?.reservationsModule?.updateReservation || "Update Reservation"
                : t?.reservationsModule?.confirmReservation || "Confirm Reservation"}
            </Button>
          </div>
        }
      />

     

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
        {/* Section 1: Customer, Event, and Quantity */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0066d1]" />
            بيانات الحجز والحدث (Reservation & Event Information)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* customerId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                العميل (Customer) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, customerId: val }))}
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

            {/* bookingEventId */}
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
                  setFormData((prev) => ({
                    ...prev,
                    bookingEventId: val,
                    paidAmount: String(defaultAdvance),
                  }));
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

            {/* quantity */}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                className={`h-11 rounded-xl bg-white focus-visible:ring-[#0066d1] ${
                  capacityCheck.isExceeded ? "border-rose-400 focus-visible:ring-rose-500" : "border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Live Capacity & Pricing Math Preview Box */}
          {selectedEvent && (
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">سعر المقعد الواحد</span>
                <span className="text-sm font-bold text-slate-800">{currencySymbol}{unitPrice}</span>
              </div>
              <div>
                <span className="text-slate-500 block">إجمالي قيمة التذاكر</span>
                <span className="text-sm font-bold text-[#0066d1]">{currencySymbol}{subtotal.toFixed(2)}</span>
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
        </div>

        {/* Section 2: Invoice Pattern, Currency, Payment Method, Cost Center & Barcode */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0066d1]" />
            الإعدادات المالية ونمط الفاتورة (Invoice & Accounting Setup)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* invoicePatternId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                نمط الفاتورة المعتمد (Invoice Pattern) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.invoicePatternId}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, invoicePatternId: val }))}
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

            {/* currencyId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                العملة (Currency)
              </Label>
              <Select
                value={formData.currencyId || "none"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, currencyId: val === "none" ? "" : val }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- الافتراضية (Default) --</SelectItem>
                  {lookups.currencies.map((curr) => (
                    <SelectItem key={curr.id} value={String(curr.id)}>
                      {curr.name} {curr.code ? `(${curr.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* paymentMethod */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                طريقة الدفع (Payment Method) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, paymentMethod: val }))}
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

            {/* costCenterId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                مركز التكلفة (Cost Center)
              </Label>
              <Select
                value={formData.costCenterId || "none"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, costCenterId: val === "none" ? "" : val }))}
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

            {/* barcode */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-semibold text-slate-800">
                الباركود (Barcode)
              </Label>
              <div className="relative">
                <Input
                  placeholder="رمز الباركود أو التذكرة..."
                  value={formData.barcode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 bg-white ps-10 focus-visible:ring-[#0066d1]"
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Amounts, Discounts, Taxes & Paid Amount */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0066d1]" />
              القيم المالية والمبالغ المسددة (Financials, Discounts & Taxes)
            </h2>
            <span className="text-xs font-semibold text-slate-600">
              الإجمالي الصافي: <strong className="text-[#0066d1]">{currencySymbol}{grandTotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* paidAmount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                المبلغ المسدد فعلياً (Paid Amount) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={formData.paidAmount}
                onChange={(e) => setFormData((prev) => ({ ...prev, paidAmount: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] font-bold text-[#0066d1]"
              />
              <p className="text-[10px] text-slate-400">
                المبلغ المدفوع فوراً عند إنشاء الحجز.
              </p>
            </div>

            {/* discountPercentage */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                نسبة الخصم (Discount %)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.discountPercentage}
                  onChange={(e) => handleDiscountPercentChange(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white pe-8 focus-visible:ring-[#0066d1]"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* discountAmount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                مبلغ الخصم (Discount Amount)
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={formData.discountAmount}
                onChange={(e) => handleDiscountAmountChange(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            {/* Due Balance Display */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                المتبقي كدين على العميل (Due Balance)
              </Label>
              <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 flex items-center font-bold text-slate-800">
                {currencySymbol}{dueBalance.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400">
                {dueBalance > 0 ? "فاتورة آجلة / متبقي دين" : "حجز مدفوع بالكامل"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2 border-t border-slate-50">
            {/* tax_Percentage */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                نسبة الضريبة (Tax %)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.tax_Percentage}
                  onChange={(e) => handleTaxPercentChange(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white pe-8 focus-visible:ring-[#0066d1]"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* taxAmount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                مبلغ الضريبة (Tax Amount)
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={formData.taxAmount}
                onChange={(e) => handleTaxAmountChange(e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            {/* Financial Summary Badges */}
            <div className="space-y-1 md:col-span-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">المجموع قبل الخصم</span>
                <span className="font-semibold text-slate-700">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الخصم الإجمالي</span>
                <span className="font-semibold text-amber-600">-{currencySymbol}{discountAmt.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الضريبة المحتسبة</span>
                <span className="font-semibold text-slate-700">+{currencySymbol}{taxAmt.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الإجمالي النهائي</span>
                <span className="font-bold text-[#0066d1]">{currencySymbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Payment Installments Schedule (CreateInvoiceScheduleDto) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0066d1]" />
                جدول الدفعات والأقساط المجدولة (Payment Schedules)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                في حال كان الحجز مؤجلاً أو مقسطاً على دفعات بتواريخ استحقاق محددة (CreateInvoiceScheduleDto).
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-5 rounded-xl font-medium text-xs h-10 gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              إضافة قسط (Add Installment)
            </Button>
          </div>

          {formData.paymentSchedules.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              لا توجد دفعات أو أقساط مجدولة مسجلة للحجز.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {formData.paymentSchedules.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 text-sm">
                      {currencySymbol}{item.amountDue}
                    </span>
                    <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                      {item.dueDate ? String(item.dueDate).split("T")[0] : ""}
                    </span>
                    {item.description && (
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
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
        title="إضافة قسط مجدول (Add Payment Installment)"
        icon={Wallet}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 pt-1">
          {/* description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              وصف القسط أو الدفعة (Description)
            </Label>
            <Input
              placeholder="مثال: الدفعة الثانية بعد الحضور..."
              value={paymentForm.description}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          {/* amountDue */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              المبلغ المستحق (Amount Due) <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0"
              value={paymentForm.amountDue}
              onChange={(e) =>
                setPaymentForm((prev) => ({ ...prev, amountDue: e.target.value }))
              }
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          {/* dueDate */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              تاريخ الاستحقاق (Due Date) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) =>
                  setPaymentForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200"
            >
              إلغاء (Cancel)
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white"
            >
              إضافة القسط (Add)
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Wallet,
  Loader2,
  AlertTriangle,
  Users,
  DollarSign,
  Receipt,
  CreditCard,
  Barcode,
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
import { apiHandler } from "@/lib/api-handler";
import {
  getAllInvoicePatterns,
  getInvoicePatternById,
} from "@/services/accounting/accounting.service";
import {
  getReservationById,
  createReservation,
  updateReservation,
  getReservationLookups,
} from "@/services/reservations";

export default function AddEditReservation() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
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

  // Lookups Query (Customers, Events, Invoice Patterns, Currencies, Payment Methods)
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });

  const lookups = useMemo(() => {
    return (
      lookupsData?.data || {
        customers: [],
        events: [],
        invoicePatterns: [],
        costCenters: [],
        currencies: [],
        paymentMethods: [
          { id: "Cash", name: isAr ? "نقدي" : "Cash" },
          { id: "Credit", name: isAr ? "بطاقة / آجل" : "Credit / Card" },
          { id: "Bank", name: isAr ? "تحويل بنكي" : "Bank Transfer" },
        ],
      }
    );
  }, [lookupsData, isAr]);

  // Direct Cost Centers Query from accounting endpoint
  const { data: costCentersQueryData } = useQuery({
    queryKey: ["costCentersListForReservation"],
    queryFn: () =>
      apiHandler({
        endPoint: "accounting/CostCenters/GetAllCostCenters/all",
        method: "GET",
        params: { search: "", pageNumber: 1, pageSize: 100 },
      }),
  });

  // Reservation Query for Edit Mode
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
    enabled: isEdit,
  });

  // Strictly fetch Sales Invoice Patterns (reservations issue sales invoices only)
  const { data: salesPatternsData } = useQuery({
    queryKey: ["getAllInvoicePatterns", "Sales"],
    queryFn: () => getAllInvoicePatterns({ Type: "Sales", pageNumber: 1, pageSize: 100 }),
  });

  const salesPatternOptions = useMemo(() => {
    const rawDirect = salesPatternsData?.data?.items || salesPatternsData?.data || [];
    const sourceList =
      Array.isArray(rawDirect) && rawDirect.length > 0
        ? rawDirect
        : lookups.invoicePatterns || [];

    const mapped = sourceList
      .filter((p) => {
        const t = p.invoiceType || p.type || p.invoice_Type;
        return !t || t === "Sales" || String(t).toLowerCase() === "sales";
      })
      .map((p) => {
        const ccId =
          p.costCenter_id ||
          p.costCenter_Id ||
          p.costCenterId ||
          p.cost_Center_Id ||
          null;
        const ccName =
          p.costCenter_Name ||
          p.costCenterName ||
          p.cost_Center_Name ||
          null;
        return {
          id: p.id,
          name: p.pattern_Name || p.name || (isAr ? "نمط مبيعات" : "Sales Invoice"),
          costCenter_id: ccId,
          costCenterId: ccId,
          costCenter_Name: ccName,
          costCenterName: ccName,
          tax_Percentage: p.tax_Percentage ?? p.taxPercentage ?? 0,
          currency_id: p.currency_id || p.currencyId || null,
          invoiceType: p.invoiceType || "Sales",
        };
      });

    return mapped;
  }, [salesPatternsData, lookups.invoicePatterns, isAr]);

  // Detailed pattern query whenever invoicePatternId is selected
  const { data: patternDetailData } = useQuery({
    queryKey: ["invoicePatternDetail", formData.invoicePatternId],
    queryFn: () => getInvoicePatternById(formData.invoicePatternId),
    enabled: Boolean(formData.invoicePatternId),
  });

  const selectedPattern = useMemo(() => {
    if (!formData.invoicePatternId) return null;
    return (
      salesPatternOptions?.find((p) => String(p.id) === String(formData.invoicePatternId)) ||
      lookups.invoicePatterns?.find((p) => String(p.id) === String(formData.invoicePatternId)) ||
      null
    );
  }, [formData.invoicePatternId, salesPatternOptions, lookups.invoicePatterns]);

  const patternCostCenterInfo = useMemo(() => {
    const detail = patternDetailData?.data;
    const ccId =
      detail?.costCenter_id ||
      detail?.costCenter_Id ||
      detail?.costCenterId ||
      detail?.cost_Center_Id ||
      selectedPattern?.costCenter_id ||
      selectedPattern?.costCenterId ||
      null;
    const ccName =
      detail?.costCenter_Name ||
      detail?.costCenterName ||
      detail?.cost_Center_Name ||
      selectedPattern?.costCenter_Name ||
      selectedPattern?.costCenterName ||
      null;
    return {
      id: ccId ? String(ccId) : null,
      name: ccName,
    };
  }, [patternDetailData, selectedPattern]);

  // Handle invoice pattern selection - cost center comes from the chosen pattern
  const handleInvoicePatternChange = (patternId) => {
    const pat =
      salesPatternOptions?.find((p) => String(p.id) === String(patternId)) ||
      lookups.invoicePatterns?.find((p) => String(p.id) === String(patternId));
    const linkedCc = pat?.costCenter_id || pat?.costCenterId || "";
    setFormData((prev) => ({
      ...prev,
      invoicePatternId: patternId,
      costCenterId: linkedCc ? String(linkedCc) : "",
    }));
  };

  // Sync cost center once detailed pattern data arrives (if not set yet)
  useEffect(() => {
    if (patternCostCenterInfo.id && (!formData.costCenterId || formData.costCenterId === "none")) {
      setFormData((prev) => ({
        ...prev,
        costCenterId: patternCostCenterInfo.id,
      }));
    }
  }, [patternCostCenterInfo.id]);

  // Memoized Cost Center options merging direct endpoint response, lookups, and pattern's cost center
  const costCenterOptions = useMemo(() => {
    const rawItems = costCentersQueryData?.data?.items || costCentersQueryData?.data || [];
    const sourceList = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : (lookups.costCenters || []);
    const mapped = sourceList.map((cc) => {
      const name = cc.cost_Center_Name || cc.costCenter_Name || cc.name || (isAr ? "مركز تكلفة" : "Cost Center");
      const number = cc.cost_Center_Number || cc.costCenter_Number || cc.number || "";
      return {
        id: cc.id,
        number,
        name,
        label: number ? `${name} (${number})` : name,
      };
    });

    if (
      patternCostCenterInfo.id &&
      !mapped.some((c) => String(c.id) === String(patternCostCenterInfo.id))
    ) {
      const patLabel = patternCostCenterInfo.name || (isAr ? "مركز تكلفة النمط" : "Pattern Cost Center");
      mapped.unshift({
        id: patternCostCenterInfo.id,
        number: "",
        name: patLabel,
        label: patLabel,
      });
    }

    if (
      formData.costCenterId &&
      formData.costCenterId !== "none" &&
      !mapped.some((c) => String(c.id) === String(formData.costCenterId))
    ) {
      const fallbackName = reservationData?.data?.costCenterName || (isAr ? `مركز تكلفة #${String(formData.costCenterId).substring(0, 8)}` : `Cost Center #${String(formData.costCenterId).substring(0, 8)}`);
      mapped.unshift({
        id: formData.costCenterId,
        number: "",
        name: fallbackName,
        label: fallbackName,
      });
    }

    return mapped;
  }, [costCentersQueryData, lookups.costCenters, patternCostCenterInfo, formData.costCenterId, reservationData, isAr]);

  // Pre-populate fields in edit mode
  useEffect(() => {
    if (reservationData?.data) {
      const r = reservationData.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Set default currency when lookups load
  useEffect(() => {
    if (!formData.currencyId && lookups.currencies?.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, currencyId: lookups.currencies[0].id }));
    }
  }, [lookups.currencies, formData.currencyId]);

  // If bookingEventId was passed via query, sync default advance price
  useEffect(() => {
    if (eventIdFromQuery && lookups.events?.length > 0 && !isEdit && !formData.paidAmount) {
      const ev = lookups.events.find((e) => String(e.id) === String(eventIdFromQuery));
      if (ev) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData((prev) => ({
          ...prev,
          bookingEventId: eventIdFromQuery,
          paidAmount: String(ev.advancePayment || ev.price || 0),
        }));
      }
    }
  }, [eventIdFromQuery, lookups.events, isEdit, formData.paidAmount]);

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

  // Seat Availability & Capacity Math
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
        res?.message || (isEdit ? (isAr ? "تم تحديث الحجز بنجاح" : "Reservation updated successfully!") : (isAr ? "تم إنشاء الحجز بنجاح" : "Reservation created successfully!"))
      );
      navigate("/dashboard/reservations");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? (isAr ? "فشل تحديث الحجز" : "Failed to update reservation!") : (isAr ? "فشل إنشاء الحجز" : "Failed to create reservation!"));
      toast.error(msg);
    },
  });

  // Add Installment to Schedule
  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amountDue || Number(paymentForm.amountDue) <= 0) {
      toast.error(isAr ? "يرجى إدخال مبلغ قسط صالح" : "Please enter a valid installment amount");
      return;
    }

    const newPayment = {
      id: Date.now(),
      description: paymentForm.description?.trim() || (isAr ? `قسط ${formData.paymentSchedules.length + 1}` : `Installment ${formData.paymentSchedules.length + 1}`),
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
    toast.success(isAr ? "تمت إضافة القسط إلى الجدول بنجاح" : "Installment added to schedule successfully");
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
      toast.error(isAr ? "يرجى اختيار العميل" : "Customer is required");
      return;
    }
    if (!formData.bookingEventId) {
      toast.error(isAr ? "يرجى اختيار الحدث" : "Booking Event is required");
      return;
    }
    const reqQty = Number(formData.quantity) || 0;
    if (reqQty <= 0) {
      toast.error(isAr ? "كمية التذاكر يجب أن تكون 1 على الأقل" : "Quantity must be at least 1");
      return;
    }
    if (!formData.invoicePatternId) {
      toast.error(isAr ? "يرجى تحديد نمط الفاتورة" : "Invoice Pattern is required");
      return;
    }

    // Capacity Check
    if (capacityCheck.isExceeded) {
      toast.error(
        isAr
          ? `المقاعد المطلوبة (${reqQty}) تتجاوز المقاعد المتاحة بالحدث (${capacityCheck.available} مقعداً فقط)`
          : `Requested seats (${reqQty}) exceed available seats (${capacityCheck.available} seats only)`
      );
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
      costCenterId: formData.costCenterId && formData.costCenterId !== "none" ? formData.costCenterId : null,
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
            ? isAr ? "تعديل الحجز" : "Edit Reservation"
            : isAr ? "إضافة حجز" : "New Reservation"
        }
        breadcrumbLinks={[
          { label: isAr ? "الحجوزات" : "Reservations", href: "/dashboard/reservations" },
          { label: isEdit ? (isAr ? "تعديل الحجز" : "Edit Reservation") : (isAr ? "إضافة حجز" : "New Reservation") },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/reservations")}
              className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending || isLoading || capacityCheck.isExceeded || !formData.customerId || !formData.bookingEventId || !formData.invoicePatternId}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-medium shadow-xs transition-all cursor-pointer"
              title={!formData.customerId || !formData.bookingEventId || !formData.invoicePatternId ? (isAr ? "يرجى اختيار العميل والحدث ونمط الفاتورة" : "Please select customer, event, and invoice pattern") : ""}
            >
              {saveMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              {saveMutation.isPending
                ? (isAr ? "جاري الحفظ..." : "Saving...")
                : isEdit
                ? (isAr ? "تحديث الحجز" : "Update Reservation")
                : (isAr ? "تأكيد الحجز" : "Confirm Reservation")}
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
              {isAr ? "تجاوز السعة المتاحة للحدث!" : "Event Capacity Exceeded!"}
            </span>
            <p className="text-xs text-rose-700 leading-relaxed">
              {isAr
                ? `المقاعد المطلوبة (${formData.quantity}) تتجاوز المقاعد المتبقية في الحدث (${capacityCheck.available} مقعداً متاحاً فقط من أصل ${capacityCheck.max}). يرجى تقليل الكمية لتتوافق مع السعة الشاغرة.`
                : `Requested seats (${formData.quantity}) exceed available seats in event (${capacityCheck.available} available out of ${capacityCheck.max}). Please reduce the quantity.`}
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
            {isAr ? "بيانات الحجز والحدث" : "Reservation & Event Details"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* customerId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "العميل" : "Customer"} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, customerId: val }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={isAr ? "اختر العميل" : "Select Customer"} />
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
                {isAr ? "الحدث المتاح" : "Booking Event"} <span className="text-rose-500">*</span>
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
                  <SelectValue placeholder={isAr ? "اختر الحدث المطروح" : "Select Booking Event"} />
                </SelectTrigger>
                <SelectContent>
                  {lookups.events.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name} ({isAr ? `المتاح: ${e.remainingQty ?? 20} مقعداً | السعر: $${e.price}` : `Available: ${e.remainingQty ?? 20} seats | Price: $${e.price}`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-800">
                  {isAr ? "الكمية المطلوبة" : "Quantity / Seats"} <span className="text-rose-500">*</span>
                </Label>
                {selectedEvent && (
                  <span className="text-[11px] font-medium text-slate-500">
                    {isAr ? "المتبقي بالحدث:" : "Remaining in event:"} <strong className="text-[#0066d1]">{capacityCheck.available}</strong> {isAr ? "مقعد" : "seats"}
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
                <span className="text-slate-500 block">{isAr ? "سعر المقعد الواحد" : "Unit Price"}</span>
                <span className="text-sm font-bold text-slate-800">{currencySymbol}{unitPrice}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? "إجمالي قيمة التذاكر" : "Subtotal"}</span>
                <span className="text-sm font-bold text-[#0066d1]">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? "المحجوز بعد هذا الطلب" : "Reserved After Request"}</span>
                <span className="text-sm font-bold text-slate-800">{capacityCheck.newReserved} / {capacityCheck.max}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{isAr ? "المقاعد الشاغرة المتبقية" : "Remaining Seats"}</span>
                <span className="text-sm font-bold text-emerald-600">{capacityCheck.newRemaining} {isAr ? "مقعد" : "seats"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Invoice Pattern, Currency, Payment Method, Cost Center & Barcode */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0066d1]" />
            {isAr ? "الإعدادات المالية ونمط الفاتورة" : "Invoice & Accounting Settings"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. invoicePatternId - Strictly Sales Patterns */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "نمط فاتورة المبيعات المعتمد" : "Sales Invoice Pattern"} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.invoicePatternId}
                onValueChange={handleInvoicePatternChange}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={isAr ? "اختر نمط فاتورة مبيعات" : "Select Sales Invoice Pattern"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.invoicePatternId && !salesPatternOptions.some((p) => String(p.id) === String(formData.invoicePatternId)) && (
                    <SelectItem value={String(formData.invoicePatternId)}>
                      {reservationData?.data?.invoicePatternName || (isAr ? `نمط مبيعات #${String(formData.invoicePatternId).substring(0, 8)}` : `Pattern #${String(formData.invoicePatternId).substring(0, 8)}`)}
                    </SelectItem>
                  )}
                  {salesPatternOptions.map((ip) => (
                    <SelectItem key={ip.id} value={String(ip.id)}>
                      {ip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                {isAr ? "إنشاء فاتورة المبيعات آلياً لتوثيق حجز العميل." : "Auto-issue sales invoice for customer booking."}
              </p>
            </div>

            {/* 2. costCenterId (derived from invoice pattern) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-800">
                  {isAr ? "مركز التكلفة" : "Cost Center"}
                </Label>
                {Boolean(formData.invoicePatternId && patternCostCenterInfo.id) && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {isAr ? "مرتبط بالنمط" : "Pattern Linked"}
                  </span>
                )}
              </div>
              <Select
                disabled={!formData.invoicePatternId}
                key={`${formData.invoicePatternId}-${formData.costCenterId || "none"}`}
                value={formData.costCenterId || "none"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, costCenterId: val === "none" ? "" : val }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed">
                  <SelectValue
                    placeholder={
                      !formData.invoicePatternId
                        ? (isAr ? "اختر نمط الفاتورة أولاً" : "Select Invoice Pattern First")
                        : (isAr ? "اختر مركز التكلفة" : "Select Cost Center")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {isAr ? "-- بدون مركز تكلفة --" : "-- None / Default --"}
                  </SelectItem>
                  {costCenterOptions.map((cc) => (
                    <SelectItem key={cc.id} value={String(cc.id)}>
                      {cc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                {!formData.invoicePatternId
                  ? (isAr ? "يرجى اختيار نمط الفاتورة لتفعيل واختيار مركز التكلفة." : "Select invoice pattern first to enable cost center.")
                  : (isAr ? "يأتي مركز التكلفة تلقائياً من نمط الفاتورة ويمكنك تعديله." : "Cost center is derived from invoice pattern and can be changed.")}
              </p>
            </div>

            {/* 3. currencyId */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "العملة" : "Currency"}
              </Label>
              <Select
                value={formData.currencyId || "none"}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, currencyId: val === "none" ? "" : val }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={isAr ? "اختر العملة" : "Select Currency"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isAr ? "-- العملة الافتراضية --" : "-- Default Currency --"}</SelectItem>
                  {lookups.currencies.map((curr) => (
                    <SelectItem key={curr.id} value={String(curr.id)}>
                      {curr.name} {curr.code ? `(${curr.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                {isAr ? "عملة تسعير وسداد الحجز." : "Pricing and settlement currency."}
              </p>
            </div>

            {/* 4. paymentMethod */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "طريقة الدفع" : "Payment Method"} <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, paymentMethod: val }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder={isAr ? "اختر طريقة الدفع" : "Select Payment Method"} />
                </SelectTrigger>
                <SelectContent>
                  {lookups.paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400">
                {isAr ? "وسيلة تحصيل قيمة الحجز." : "Method for collecting reservation fees."}
              </p>
            </div>
          </div>

          {/* barcode row */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <Label className="text-xs font-semibold text-slate-800">
              {isAr ? "الباركود" : "Barcode"}
            </Label>
            <div className="relative">
              <Input
                placeholder={isAr ? "رمز الباركود أو التذكرة..." : "Barcode or ticket code..."}
                value={formData.barcode}
                onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 bg-white ps-10 focus-visible:ring-[#0066d1]"
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Section 3: Amounts, Discounts, Taxes & Paid Amount */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0066d1]" />
              {isAr ? "القيم المالية والمبالغ المسددة" : "Financials & Payments"}
            </h2>
            <span className="text-xs font-semibold text-slate-600">
              {isAr ? "الإجمالي الصافي:" : "Net Total:"} <strong className="text-[#0066d1]">{currencySymbol}{grandTotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* paidAmount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "المبلغ المسدد فعلياً" : "Paid Amount"} <span className="text-rose-500">*</span>
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
                {isAr ? "المبلغ المدفوع فوراً عند إنشاء الحجز." : "Amount paid upfront when creating reservation."}
              </p>
            </div>

            {/* discountPercentage */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "نسبة الخصم (%)" : "Discount %"}
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
                {isAr ? "مبلغ الخصم" : "Discount Amount"}
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
                {isAr ? "المتبقي كدين على العميل" : "Due Balance"}
              </Label>
              <div className="h-11 rounded-xl bg-slate-50 border border-slate-200 px-3.5 flex items-center font-bold text-slate-800">
                {currencySymbol}{dueBalance.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400">
                {dueBalance > 0 ? (isAr ? "فاتورة آجلة / متبقي دين" : "Due Balance / Credit") : (isAr ? "حجز مدفوع بالكامل" : "Fully Paid")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2 border-t border-slate-50">
            {/* tax_Percentage */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                {isAr ? "نسبة الضريبة (%)" : "Tax %"}
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
                {isAr ? "مبلغ الضريبة" : "Tax Amount"}
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
                <span className="text-slate-400 block text-[10px]">{isAr ? "المجموع قبل الخصم" : "Subtotal"}</span>
                <span className="font-semibold text-slate-700">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isAr ? "الخصم الإجمالي" : "Total Discount"}</span>
                <span className="font-semibold text-amber-600">-{currencySymbol}{discountAmt.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isAr ? "الضريبة المحتسبة" : "Estimated Tax"}</span>
                <span className="font-semibold text-slate-700">+{currencySymbol}{taxAmt.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isAr ? "الإجمالي النهائي" : "Grand Total"}</span>
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
                {isAr ? "جدول الدفعات والأقساط المجدولة" : "Payment Schedules"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? "في حال كان الحجز مؤجلاً أو مقسطاً على دفعات بتواريخ استحقاق محددة." : "For deferred reservations or installment schedules with due dates."}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-5 rounded-xl font-medium text-xs h-10 gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              {isAr ? "إضافة قسط" : "Add Installment"}
            </Button>
          </div>

          {formData.paymentSchedules.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
              {isAr ? "لا توجد دفعات أو أقساط مجدولة مسجلة للحجز." : "No payment schedules recorded for this reservation."}
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
        title={isAr ? "إضافة قسط مجدول" : "Add Payment Installment"}
        icon={Wallet}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 pt-1">
          {/* description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "وصف القسط أو الدفعة" : "Installment Description"}
            </Label>
            <Input
              placeholder={isAr ? "مثال: الدفعة الثانية بعد الحضور..." : "e.g. Second installment..."}
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
              {isAr ? "المبلغ المستحق" : "Amount Due"} <span className="text-rose-500">*</span>
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
              {isAr ? "تاريخ الاستحقاق" : "Due Date"} <span className="text-rose-500">*</span>
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
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white"
            >
              {isAr ? "إضافة القسط" : "Add"}
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

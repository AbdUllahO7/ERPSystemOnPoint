import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Loader2,
  Building2,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  Users,
  DollarSign,
  Globe,
  Layers,
  HelpCircle,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  createEvent,
  updateEvent,
  getEventById,
  getEventLookups,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_CONFIG,
  calculateEventOccurrences,
} from "@/services/events";

export default function AddEditEventPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    service: "",
    resource: "",
    provider: "",
    maxCapacity: "20",
    startDate: "",
    endDate: "",
    startTime: "10:00",
    endTime: "12:00",
    price: "0",
    deposit: "0",
    pricingModel: "PerSeat", // "PerSeat" | "PerBooking"
    bookingModel: "FullCourse", // "FullCourse" | "PerSession"
    timeZone: "Asia/Riyadh",
    recurringDays: ["Sun", "Tue"],
    isOvernight: false,
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["eventLookups"],
    queryFn: getEventLookups,
  });
  const lookups = lookupsData?.data || {
    services: [],
    resources: [],
    providers: [],
    statuses: [],
    days: DAYS_OF_WEEK,
  };

  // Fetch Event if in edit mode
  const { data: eventData, isLoading: isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && eventData) {
      const e = eventData?.data?.data || eventData?.data || eventData;
      if (!e) return;

      const nameToShortDay = {
        Sunday: "Sun",
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sun: "Sun",
        Mon: "Mon",
        Tue: "Tue",
        Wed: "Wed",
        Thu: "Thu",
        Fri: "Fri",
        Sat: "Sat",
      };

      let parsedDays = [];
      if (typeof e.recurringDays === "string") {
        parsedDays = e.recurringDays
          .split(",")
          .map((d) => nameToShortDay[d.trim()] || d.trim())
          .filter(Boolean);
      } else if (Array.isArray(e.recurringDays)) {
        parsedDays = e.recurringDays
          .map((d) => nameToShortDay[d] || d)
          .filter(Boolean);
      }
      if (parsedDays.length === 0) {
        parsedDays = ["Sun", "Tue"];
      }

      setFormData({
        title: e.title || e.fullTitle || "",
        service: String(e.productVariantId || e.service || ""),
        resource: String(e.resourceId || e.resource || ""),
        provider: String(e.serviceProviderId || e.provider || "none"),
        maxCapacity: String(e.maxCapacity ?? 20),
        startDate: e.startDate ? e.startDate.split("T")[0] : "",
        endDate: e.endDate ? e.endDate.split("T")[0] : "",
        startTime: e.startTime ? (typeof e.startTime === "string" ? e.startTime.slice(0, 5) : "10:00") : "10:00",
        endTime: e.endTime ? (typeof e.endTime === "string" ? e.endTime.slice(0, 5) : "12:00") : "12:00",
        price: String(e.price ?? e.numericPrice ?? 0),
        deposit: String(e.advancePayment ?? e.numericDeposit ?? e.deposit ?? 0),
        pricingModel: e.notes?.includes("pricingModel:PerBooking") ? "PerBooking" : "PerSeat",
        bookingModel: e.notes?.includes("bookingModel:PerSession") ? "PerSession" : "FullCourse",
        timeZone: "Asia/Riyadh",
        recurringDays: parsedDays,
        isOvernight: e.startTime && e.endTime && e.endTime < e.startTime,
        notes: (e.notes || "").replace(/\[pricingModel:.*?\]/g, "").replace(/\[bookingModel:.*?\]/g, "").trim(),
      });
    }
  }, [isEdit, eventData]);

  // Selected Resource metadata for capacity & lease contract compatibility checks
  const selectedResource = useMemo(() => {
    if (!formData.resource || !lookups.resources) return null;
    return lookups.resources.find((r) => String(r.id) === String(formData.resource));
  }, [formData.resource, lookups.resources]);

  // Capacity Compatibility Check
  const capacityWarning = useMemo(() => {
    if (!selectedResource) return null;
    const requestedCap = Number(formData.maxCapacity) || 0;
    const resourceMax = Number(selectedResource.capacity) || 0;
    if (resourceMax > 0 && requestedCap > resourceMax) {
      return `سعة الحدث (${requestedCap}) تتجاوز السعة القصوى للمورد المحدد (${resourceMax} مقعداً).`;
    }
    return null;
  }, [selectedResource, formData.maxCapacity]);

  // Duration & Lease Contract Compatibility Check
  const leaseContractWarning = useMemo(() => {
    if (!selectedResource || selectedResource.ownership !== "Leased" || !selectedResource.contractEndDate) {
      return null;
    }
    if (!formData.endDate) return null;
    const eventEnd = new Date(formData.endDate);
    const leaseEnd = new Date(selectedResource.contractEndDate);
    if (!isNaN(eventEnd.getTime()) && !isNaN(leaseEnd.getTime()) && eventEnd > leaseEnd) {
      return `تاريخ نهاية الحدث (${formData.endDate}) يتجاوز تاريخ انتهاء عقد استئجار المورد (${selectedResource.contractEndDate}).`;
    }
    return null;
  }, [selectedResource, formData.endDate]);

  // Check if session spans past midnight
  const isOvernightDetected = useMemo(() => {
    if (!formData.startTime || !formData.endTime) return false;
    return formData.endTime <= formData.startTime;
  }, [formData.startTime, formData.endTime]);

  // Occurrence Calculation (Page 7: تفسير وتطبيق RecurringDays وحساب عدد الجلسات الإجمالية داخل الفترة)
  const sessionOccurrences = useMemo(() => {
    return calculateEventOccurrences(
      formData.startDate,
      formData.endDate,
      formData.recurringDays
    );
  }, [formData.startDate, formData.endDate, formData.recurringDays]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Embed metadata into notes for backend persistence
      const metaTag = `[pricingModel:${data.pricingModel}][bookingModel:${data.bookingModel}]`;
      const enrichedPayload = {
        ...data,
        notes: `${metaTag} ${data.notes || ""}`.trim(),
      };
      return isEdit ? updateEvent(id, enrichedPayload) : createEvent(enrichedPayload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || (isEdit ? "Event updated successfully!" : "Event created successfully!"));
      navigate("/dashboard/events");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? "Failed to update event" : "Failed to create event");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRecurringDay = (day) => {
    setFormData((prev) => {
      const exists = prev.recurringDays.includes(day);
      return {
        ...prev,
        recurringDays: exists
          ? prev.recurringDays.filter((d) => d !== day)
          : [...prev.recurringDays, day],
      };
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان أو اسم الحدث (Event title is required)");
      return;
    }
    if (!formData.service) {
      toast.error("يرجى اختيار الصنف أو الخدمة التي يمثلها الحدث (Service/Product is required)");
      return;
    }
    if (!formData.resource) {
      toast.error("يرجى اختيار المكان أو المورد (Resource is required)");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("يرجى تحديد بداية ونهاية فترة الحدث (Start and End dates are required)");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("تاريخ نهاية الفترة يجب أن يكون لاحقاً لتاريخ البداية");
      return;
    }

    const cap = Number(formData.maxCapacity);
    if (!cap || cap <= 0) {
      toast.error("السعة القصوى للحدث يجب أن تكون أكبر من صفر");
      return;
    }

    saveMutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={isEdit ? "Edit Event (تعديل الحدث)" : "Add Event (إنشاء حدث جديد)"}
          breadcrumbLinks={[
            { label: "Events", href: "/dashboard/events" },
            { label: isEdit ? "Edit Event" : "Add Event" },
          ]}
          infoTooltip="طرح خدمة في مورد وموعد محددين مع ضبط الأيام المتكررة، السعة، والتسعير."
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/events")}
            className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            Save Event (حفظ الحدث)
          </Button>
        </div>
      </div>

      {/* Page 7 System Guidance Card */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-indigo-50/30 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066d1] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                07 / فهم النظام: الأحداث والأيام المتكررة (Events & Recurring Days)
              </span>
              <span className="text-xs text-slate-500">طرح خدمة في مورد وموعد محددين، ثم فتحه للحجز</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>مثال معتمد:</strong> خدمة «دورة إنكليزي»، داخل «قاعة A»، من 1 إلى 30 نوفمبر، يومي الأحد والثلاثاء من 10 إلى 12. هذا هو <code>BookingEvent</code>؛ أما تسجيل عميل فيه فهو حجز منفصل.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
            <Globe className="w-4 h-4 text-[#0066d1]" />
            <span>المنطقة الزمنية: {formData.timeZone} (توقيت مكة)</span>
          </div>
        </div>

        {/* The Two Booking Models (Green & Yellow Cards from Page 7) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Green Card: Full Course Booking */}
          <div
            onClick={() => handleInputChange("bookingModel", "FullCourse")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              formData.bookingModel === "FullCourse"
                ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs"
                : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                الحجز للدورة كاملة (Full Course Booking)
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded">
                الافتراضي
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-2 leading-relaxed">
              إذا كانت المجموعة نفسها تحضر كل جلسات الدورة، يمثل الحدث مجموعة واحدة بسعة مشتركة. حجز مقعدين يعني تسجيل شخصين في الدورة كاملة.
            </p>
          </div>

          {/* Yellow Card: Per-Session Booking */}
          <div
            onClick={() => handleInputChange("bookingModel", "PerSession")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              formData.bookingModel === "PerSession"
                ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30 shadow-xs"
                : "bg-amber-50/40 border-amber-100 hover:bg-amber-50/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                الحجز لكل جلسة مستقلة (Per-Session / Occurrences)
              </span>
              <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded">
                مواعيد فرعية
              </span>
            </div>
            <p className="text-[11px] text-amber-800 mt-2 leading-relaxed">
              إذا كان العميل يحجز الأحد أو الثلاثاء كلاً على حدة، يحتاج النظام أحداثاً منفصلة أو جدول مواعيد فرعي مثل <code>BookingOccurrence</code> مع سعة وحجوزات لكل موعد مستقل.
            </p>
          </div>
        </div>
      </div>

      {/* Warnings & Compatibility Alerts */}
      {(capacityWarning || leaseContractWarning) && (
        <div className="space-y-2">
          {capacityWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{capacityWarning}</span>
            </div>
          )}
          {leaseContractWarning && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{leaseContractWarning}</span>
            </div>
          )}
        </div>
      )}

      {/* Event Specification Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0066d1]" />
          بيانات وتخصيص الحدث (Event Specifications)
        </h2>

        {/* Row 1: Title, Service (ProductVariantId), Resource (ResourceId) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              عنوان الحدث / الدورة (Event Title) *
            </Label>
            <Input
              placeholder="مثال: دورة إنكليزي مكثفة - المستوى الأول"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              الصنف / الخدمة (ProductVariantId) *
            </Label>
            <Select
              key={formData.service || "service-select"}
              value={formData.service}
              onValueChange={(val) => {
                handleInputChange("service", val);
                const selectedSvc = lookups.services.find((s) => String(s.id) === String(val));
                if (selectedSvc && selectedSvc.price && Number(formData.price) === 0) {
                  handleInputChange("price", String(selectedSvc.price));
                }
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="اختر الخدمة أو الصنف" />
              </SelectTrigger>
              <SelectContent>
                {formData.service && !lookups.services.some((s) => String(s.id) === String(formData.service)) && (
                  <SelectItem value={String(formData.service)}>
                    {eventData?.data?.productName || eventData?.data?.service || `Service #${String(formData.service).substring(0, 8)}`}
                  </SelectItem>
                )}
                {lookups.services.map((svc) => (
                  <SelectItem key={svc.id} value={String(svc.id)}>
                    {svc.name} {svc.price ? `($${svc.price})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              المكان أو المورد (ResourceId) *
            </Label>
            <Select
              key={formData.resource || "resource-select"}
              value={formData.resource}
              onValueChange={(val) => {
                handleInputChange("resource", val);
                const selectedRes = lookups.resources.find((r) => String(r.id) === String(val));
                if (selectedRes && selectedRes.capacity && (Number(formData.maxCapacity) === 0 || Number(formData.maxCapacity) === 20)) {
                  handleInputChange("maxCapacity", String(selectedRes.capacity));
                }
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="اختر المورد أو القاعة" />
              </SelectTrigger>
              <SelectContent>
                {formData.resource && !lookups.resources.some((r) => String(r.id) === String(formData.resource)) && (
                  <SelectItem value={String(formData.resource)}>
                    {eventData?.data?.resourceName || eventData?.data?.resource || `Resource #${String(formData.resource).substring(0, 8)}`}
                  </SelectItem>
                )}
                {lookups.resources.map((res) => (
                  <SelectItem key={res.id} value={String(res.id)}>
                    {res.name} (السعة: {res.capacity} مقعداً) {res.ownership === "Leased" ? "- مستأجر" : "- مملوك"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Provider (ServiceProviderId), Max Capacity (MaxCapacity), Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              مقدم الخدمة الاختياري (ServiceProviderId)
            </Label>
            <Select
              key={formData.provider || "provider-select"}
              value={formData.provider || "none"}
              onValueChange={(val) => handleInputChange("provider", val === "none" ? "" : val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="اختر مقدم الخدمة (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- بدون مقدم خدمة محدد --</SelectItem>
                {formData.provider && formData.provider !== "none" && !lookups.providers.some((p) => String(p.id) === String(formData.provider)) && (
                  <SelectItem value={String(formData.provider)}>
                    {eventData?.data?.serviceProviderName || eventData?.data?.provider || `Provider #${String(formData.provider).substring(0, 8)}`}
                  </SelectItem>
                )}
                {lookups.providers.map((prov) => (
                  <SelectItem key={prov.id} value={String(prov.id)}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              سعة الحدث القصوى (MaxCapacity) *
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="20"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9"
              />
              <Users className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {selectedResource && (
              <p className="text-[10px] text-slate-400">
                السعة القصوى للمورد المحدد: {selectedResource.capacity} مقعد
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              بداية الفترة (StartDate) *
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 3: End Date, Start Time, End Time, Overnight Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              نهاية الفترة (EndDate) *
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              توقيت بدء الجلسة (StartTime)
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="10:00"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9 font-mono text-xs"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                توقيت انتهاء الجلسة (EndTime)
              </Label>
              {isOvernightDetected && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  تمتد لليوم التالي (Overnight)
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="12:00"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9 font-mono text-xs"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 4: Pricing Model, Price (Price), Advance Payment / Deposit (AdvancePayment) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-slate-50">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              قاعدة التسعير (Pricing Basis)
            </Label>
            <Select
              value={formData.pricingModel}
              onValueChange={(val) => handleInputChange("pricingModel", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="حدد قاعدة التسعير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PerSeat">سعر لكل مقعد / مشارك (Per Seat)</SelectItem>
                <SelectItem value="PerBooking">سعر لكامل الحجز / المجموعة (Per Booking)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400">
              حدد إن كان السعر والعربون للمقعد الواحد أو للحجز الإجمالي.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              سعر الحدث (Price / BookingEvent.Price)
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9 font-semibold"
              />
              <DollarSign className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400">
              سعر البيع للعميل (لا يلزم تساويه مع تكلفة المورد DailyRentalCost).
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              العربون / الدفعة المقدمة (AdvancePayment)
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={formData.deposit}
                onChange={(e) => handleInputChange("deposit", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9 font-semibold"
              />
              <DollarSign className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 5: Recurring Days Selection & Occurrence Calculation */}
        <div className="space-y-3 pt-3 border-t border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-bold text-slate-800">
                أيام التكرار داخل الفترة (RecurringDays)
              </Label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تحديد أيام الأسبوع التي تنعقد فيها جلسات الحدث داخل الفترة المحددة.
              </p>
            </div>

            {/* Calculated Sessions Badge */}
            {sessionOccurrences.count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066d1] border border-blue-200">
                <Calendar className="w-3.5 h-3.5" />
                إجمالي الجلسات المحسوبة: {sessionOccurrences.count} جلسة
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {DAYS_OF_WEEK_CONFIG.map((day) => {
              const isSelected = formData.recurringDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleRecurringDay(day.id)}
                  className={`min-w-[95px] h-11 px-3.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "border-[#0066d1] bg-[#0066d1] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{day.arabic}</span>
                  <span className="text-[10px] opacity-80 font-mono">({day.id})</span>
                </button>
              );
            })}
          </div>

          {sessionOccurrences.dates.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">مواعيد الجلسات الفعلية المحسوبة: </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {sessionOccurrences.dates.slice(0, 6).join(", ")}
                {sessionOccurrences.dates.length > 6 && ` ... (+${sessionOccurrences.dates.length - 6} جلسات أخرى)`}
              </span>
            </div>
          )}
        </div>

        {/* Row 6: Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-50">
          <Label className="text-xs font-semibold text-slate-700">
            ملاحظات وشروط إضافية (Notes)
          </Label>
          <Textarea
            rows={3}
            placeholder="تعليمات القاعة، تجهيزات البروجكتر، مستلزمات الضيافة أو شروط الحضور..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] resize-none"
          />
        </div>
      </div>
    </form>
  );
}

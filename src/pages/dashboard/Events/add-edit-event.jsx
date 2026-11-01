import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Loader2,
  Building2,
  AlertTriangle,
  Users,
  DollarSign,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  createEvent,
  updateEvent,
  getEventById,
  getEventLookups,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_CONFIG,
  calculateEventOccurrences,
  formatTimeSpan,
} from "@/services/events";

export default function AddEditEventPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State strictly aligned with CreateBookingEventDto / UpdateBookingEventDto schemas
  const [formData, setFormData] = useState({
    title: "",
    productVariantId: "",
    resourceId: "",
    serviceProviderId: "",
    startDate: "",
    endDate: "",
    startTime: "10:00",
    endTime: "12:00",
    recurringDays: ["Sun", "Tue"],
    maxCapacity: "20",
    price: "0",
    advancePayment: "0",
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

      const formattedStartTime = e.startTime
        ? (typeof e.startTime === "string" ? e.startTime.slice(0, 5) : formatTimeSpan(e.startTime).slice(0, 5))
        : "10:00";
      const formattedEndTime = e.endTime
        ? (typeof e.endTime === "string" ? e.endTime.slice(0, 5) : formatTimeSpan(e.endTime).slice(0, 5))
        : "12:00";

      setFormData({
        title: e.title || e.fullTitle || "",
        productVariantId: String(e.productVariantId || e.service || ""),
        resourceId: String(e.resourceId || e.resource || ""),
        serviceProviderId: e.serviceProviderId ? String(e.serviceProviderId) : "",
        startDate: e.startDate ? (e.startDate.includes("T") ? e.startDate.split("T")[0] : e.startDate) : "",
        endDate: e.endDate ? (e.endDate.includes("T") ? e.endDate.split("T")[0] : e.endDate) : "",
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        recurringDays: parsedDays,
        maxCapacity: String(e.maxCapacity ?? 20),
        price: String(e.price ?? e.numericPrice ?? 0),
        advancePayment: String(e.advancePayment ?? e.numericDeposit ?? e.deposit ?? 0),
      });
    }
  }, [isEdit, eventData]);

  // Selected Resource metadata for capacity & lease contract compatibility checks
  const selectedResource = useMemo(() => {
    if (!formData.resourceId || !lookups.resources) return null;
    return lookups.resources.find((r) => String(r.id) === String(formData.resourceId));
  }, [formData.resourceId, lookups.resources]);

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

  // Occurrence Calculation: recurringDays inside the event period
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
      return isEdit ? updateEvent(id, data) : createEvent(data);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || (isEdit ? "Event updated successfully!" : "Event created successfully!"));
      navigate("/dashboard/events");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (isEdit ? "Failed to update event" : "Failed to create event");
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
    if (!formData.productVariantId) {
      toast.error("يرجى اختيار الصنف أو الخدمة التي يمثلها الحدث (ProductVariantId is required)");
      return;
    }
    if (!formData.resourceId) {
      toast.error("يرجى اختيار المكان أو المورد (ResourceId is required)");
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
      toast.error("السعة القصوى للحدث يجب أن تكون أكبر من صفر (MaxCapacity must be > 0)");
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error("يرجى إدخال سعر صحيح للحدث (Price must be >= 0)");
      return;
    }

    const advance = Number(formData.advancePayment);
    if (isNaN(advance) || advance < 0) {
      toast.error("يرجى إدخال عربون / دفعة مقدمة صحيحة (AdvancePayment must be >= 0)");
      return;
    }

    if (price > 0 && advance > price) {
      toast.error("العربون / الدفعة المقدمة لا يمكن أن تتجاوز السعر الإجمالي للحدث");
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
          title={
            isEdit
              ? t?.eventsModule?.editEvent || "Edit Event"
              : t?.eventsModule?.addEvent || "Add Event"
          }
          breadcrumbLinks={[
            { label: "Events", href: "/dashboard/events" },
            { label: isEdit ? "Edit Event" : "Add Event" },
          ]}
          infoTooltip="طرح خدمة في مورد وموعد محددين مع ضبط الأيام المتكررة، السعة، والتسعير متوافقاً مع API الحجوزات."
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
            disabled={saveMutation.isPending || !formData.title?.trim() || !formData.productVariantId || !formData.resourceId || !formData.startDate || !formData.endDate}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
            title={!formData.title?.trim() || !formData.productVariantId || !formData.resourceId || !formData.startDate || !formData.endDate ? "Please enter title, service, venue, and dates" : ""}
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            {t?.eventsModule?.saveEvent || "Save Event"}
          </Button>
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

        {/* Row 1: Title & ProductVariantId */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              عنوان الحدث / الدورة (title) *
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
              الصنف / الخدمة (productVariantId) *
            </Label>
            <Select
              key={formData.productVariantId || "service-select"}
              value={formData.productVariantId}
              onValueChange={(val) => {
                handleInputChange("productVariantId", val);
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
                {formData.productVariantId && !lookups.services.some((s) => String(s.id) === String(formData.productVariantId)) && (
                  <SelectItem value={String(formData.productVariantId)}>
                    {eventData?.data?.serviceName || eventData?.data?.productName || `Service #${String(formData.productVariantId).substring(0, 8)}`}
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
        </div>

        {/* Row 2: ResourceId, ServiceProviderId, MaxCapacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              المكان أو المورد (resourceId) *
            </Label>
            <Select
              key={formData.resourceId || "resource-select"}
              value={formData.resourceId}
              onValueChange={(val) => {
                handleInputChange("resourceId", val);
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
                {formData.resourceId && !lookups.resources.some((r) => String(r.id) === String(formData.resourceId)) && (
                  <SelectItem value={String(formData.resourceId)}>
                    {eventData?.data?.resourceName || `Resource #${String(formData.resourceId).substring(0, 8)}`}
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

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              مقدم الخدمة (serviceProviderId)
            </Label>
            <Select
              key={formData.serviceProviderId || "provider-select"}
              value={formData.serviceProviderId || "none"}
              onValueChange={(val) => handleInputChange("serviceProviderId", val === "none" ? "" : val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="اختر مقدم الخدمة (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- بدون مقدم خدمة محدد --</SelectItem>
                {formData.serviceProviderId && formData.serviceProviderId !== "none" && !lookups.providers.some((p) => String(p.id) === String(formData.serviceProviderId)) && (
                  <SelectItem value={String(formData.serviceProviderId)}>
                    {eventData?.data?.providerName || eventData?.data?.serviceProviderName || `Provider #${String(formData.serviceProviderId).substring(0, 8)}`}
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
              سعة الحدث القصوى (maxCapacity) *
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
        </div>

        {/* Row 3: Start Date, End Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              بداية الفترة (startDate) *
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

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              نهاية الفترة (endDate) *
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
              توقيت بدء الجلسة (startTime) *
            </Label>
            <div className="relative">
              <Input
                type="time"
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
                توقيت انتهاء الجلسة (endTime) *
              </Label>
              {isOvernightDetected && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  اليوم التالي
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9 font-mono text-xs"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 4: Price & Advance Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-50">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              سعر الحدث (price) *
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
              سعر الحجز الإجمالي للحدث المعروض للعملاء.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              العربون / الدفعة المقدمة (advancePayment)
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={formData.advancePayment}
                onChange={(e) => handleInputChange("advancePayment", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9 font-semibold"
              />
              <DollarSign className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-400">
              قيمة الدفعة المقدمة المطلوبة عند تأكيد حجز العميل للحدث.
            </p>
          </div>
        </div>

        {/* Row 5: Recurring Days Selection & Occurrence Calculation */}
        <div className="space-y-3 pt-3 border-t border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-bold text-slate-800">
                أيام التكرار داخل الفترة (recurringDays)
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
      </div>
    </form>
  );
}

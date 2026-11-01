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
import { apiHandler } from "@/lib/api-handler";
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
  const { locale } = useI18n();
  const isAr = locale === "ar";
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

  // Direct Employees query for Service Providers
  const { data: employeesData } = useQuery({
    queryKey: ["employeesForEventServiceProvider"],
    queryFn: () =>
      apiHandler({
        endPoint: "HR/Employees/GetAll",
        method: "GET",
        params: { PageSize: 1000 },
      }),
  });

  // Fetch Event if in edit mode
  const { data: eventData, isLoading: isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: isEdit,
  });

  const rawEvent = useMemo(() => {
    return eventData?.data?.data || eventData?.data || eventData;
  }, [eventData]);

  const providerOptions = useMemo(() => {
    const directList = employeesData?.data?.items || employeesData?.data || [];
    const list = Array.isArray(directList) && directList.length > 0 ? directList : (lookups.providers || []);
    const mapped = list.map((emp) => {
      const name = emp.fullName || emp.name || (isAr ? "موظف" : "Employee");
      const job = emp.jobTitle ? ` - ${emp.jobTitle}` : "";
      return {
        id: String(emp.id),
        name,
        label: `${name}${job}`,
      };
    });
    if (
      formData.serviceProviderId &&
      formData.serviceProviderId !== "none" &&
      !mapped.some((p) => String(p.id) === String(formData.serviceProviderId))
    ) {
      const fallback =
        rawEvent?.serviceProviderName ||
        rawEvent?.providerName ||
        (isAr
          ? `مقدم الخدمة #${String(formData.serviceProviderId).substring(0, 8)}`
          : `Provider #${String(formData.serviceProviderId).substring(0, 8)}`);
      mapped.unshift({ id: String(formData.serviceProviderId), name: fallback, label: fallback });
    }
    return mapped;
  }, [employeesData, lookups.providers, formData.serviceProviderId, rawEvent, isAr]);

  useEffect(() => {
    if (isEdit && rawEvent) {
      const e = rawEvent;
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
      if (parsedDays.length === 0 && !isEdit) {
        parsedDays = ["Sun", "Tue"];
      }

      const formattedStartTime = e.startTime
        ? (typeof e.startTime === "string" ? e.startTime.slice(0, 5) : formatTimeSpan(e.startTime).slice(0, 5))
        : "10:00";
      const formattedEndTime = e.endTime
        ? (typeof e.endTime === "string" ? e.endTime.slice(0, 5) : formatTimeSpan(e.endTime).slice(0, 5))
        : "12:00";

      // Robust number cleaner that extracts only valid decimal digits
      const cleanNum = (val, fallback = "0") => {
        if (val === null || val === undefined || val === "") return fallback;
        if (typeof val === "number") return String(val);
        const s = String(val).replace(/[^0-9.-]/g, "");
        return s !== "" ? s : fallback;
      };

      const finalPrice = cleanNum(
        typeof e.price === "number"
          ? e.price
          : (e.numericPrice !== undefined ? e.numericPrice : e.price),
        "0"
      );

      const finalAdvance = cleanNum(
        typeof e.advancePayment === "number"
          ? e.advancePayment
          : (e.numericDeposit !== undefined ? e.numericDeposit : (e.advancePayment ?? e.deposit)),
        "0"
      );

      const finalCapacity = cleanNum(
        e.maxCapacity ?? e.capacity,
        "20"
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        maxCapacity: finalCapacity,
        price: finalPrice,
        advancePayment: finalAdvance,
      });
    }
  }, [isEdit, rawEvent]);

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
      return isAr
        ? `سعة الحدث (${requestedCap}) تتجاوز السعة القصوى للمورد المحدد (${resourceMax} مقعداً).`
        : `Event capacity (${requestedCap}) exceeds resource maximum capacity (${resourceMax}).`;
    }
    return null;
  }, [selectedResource, formData.maxCapacity, isAr]);

  // Duration & Lease Contract Compatibility Check
  const leaseContractWarning = useMemo(() => {
    if (!selectedResource || selectedResource.ownership !== "Leased" || !selectedResource.contractEndDate) {
      return null;
    }
    if (!formData.endDate) return null;
    const eventEnd = new Date(formData.endDate);
    const leaseEnd = new Date(selectedResource.contractEndDate);
    if (!isNaN(eventEnd.getTime()) && !isNaN(leaseEnd.getTime()) && eventEnd > leaseEnd) {
      return isAr
        ? `تاريخ نهاية الحدث (${formData.endDate}) يتجاوز تاريخ انتهاء عقد استئجار المورد (${selectedResource.contractEndDate}).`
        : `Event end date (${formData.endDate}) exceeds resource lease contract end date (${selectedResource.contractEndDate}).`;
    }
    return null;
  }, [selectedResource, formData.endDate, isAr]);

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
      toast.success(
        res?.message ||
          (isEdit
            ? isAr
              ? "تم تحديث الحدث بنجاح"
              : "Event updated successfully!"
            : isAr
            ? "تم إنشاء الحدث بنجاح"
            : "Event created successfully!")
      );
      navigate("/dashboard/events");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (isEdit
          ? isAr
            ? "فشل تحديث الحدث"
            : "Failed to update event"
          : isAr
          ? "فشل إنشاء الحدث"
          : "Failed to create event");
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
      toast.error(isAr ? "يرجى إدخال عنوان أو اسم الحدث" : "Event title is required");
      return;
    }
    if (!formData.productVariantId) {
      toast.error(isAr ? "يرجى اختيار الصنف أو الخدمة" : "Service is required");
      return;
    }
    if (!formData.resourceId) {
      toast.error(isAr ? "يرجى اختيار المكان أو المورد" : "Resource is required");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error(isAr ? "يرجى تحديد بداية ونهاية فترة الحدث" : "Start and end dates are required");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error(
        isAr
          ? "تاريخ نهاية الفترة يجب أن يكون لاحقاً لتاريخ البداية"
          : "End date must be after start date"
      );
      return;
    }

    const cap = Number(formData.maxCapacity);
    if (!cap || cap <= 0) {
      toast.error(
        isAr
          ? "السعة القصوى للحدث يجب أن تكون أكبر من صفر"
          : "Max capacity must be greater than zero"
      );
      return;
    }

    const currentReserved = Number(rawEvent?.currentReservedQuantity || 0);
    if (isEdit && currentReserved > 0 && cap < currentReserved) {
      toast.error(
        isAr
          ? `السعة القصوى (${cap}) لا يمكن أن تكون أقل من عدد الحجوزات الحالية (${currentReserved})`
          : `Max capacity (${cap}) cannot be less than current reservations (${currentReserved})`
      );
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error(isAr ? "يرجى إدخال سعر صحيح للحدث" : "Price must be greater than or equal to 0");
      return;
    }

    const advance = Number(formData.advancePayment);
    if (isNaN(advance) || advance < 0) {
      toast.error(
        isAr
          ? "يرجى إدخال عربون / دفعة مقدمة صحيحة"
          : "Advance payment must be greater than or equal to 0"
      );
      return;
    }

    if (price > 0 && advance > price) {
      toast.error(
        isAr
          ? "العربون / الدفعة المقدمة لا يمكن أن تتجاوز السعر الإجمالي للحدث"
          : "Advance payment cannot exceed total price"
      );
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
              ? isAr
                ? "تعديل الحدث"
                : "Edit Event"
              : isAr
              ? "إضافة حدث جديد"
              : "Add Event"
          }
          breadcrumbLinks={[
            { label: isAr ? "الأحداث والفعاليات" : "Events", href: "/dashboard/events" },
            { label: isEdit ? (isAr ? "تعديل الحدث" : "Edit Event") : (isAr ? "إضافة حدث" : "Add Event") },
          ]}
          infoTooltip={
            isAr
              ? "طرح خدمة في مورد وموعد محددين مع ضبط الأيام المتكررة، السعة، والتسعير."
              : "Schedule a service in a venue with recurring days, capacity, and pricing."
          }
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/events")}
            className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || !formData.title?.trim() || !formData.productVariantId || !formData.resourceId || !formData.startDate || !formData.endDate}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
            title={!formData.title?.trim() || !formData.productVariantId || !formData.resourceId || !formData.startDate || !formData.endDate ? (isAr ? "يرجى إدخال العنوان، الخدمة، المورد والتواريخ" : "Please enter title, service, venue, and dates") : ""}
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            {isAr ? "حفظ الحدث" : "Save Event"}
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
          {isAr ? "بيانات وتخصيص الحدث" : "Event Specifications"}
        </h2>

        {/* Row 1: Title & ProductVariantId */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "عنوان الحدث *" : "Event Title *"}
            </Label>
            <Input
              placeholder={isAr ? "مثال: دورة إنكليزي مكثفة - المستوى الأول" : "e.g. Intensive English Course - Level 1"}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "الخدمة / الصنف *" : "Service / Product *"}
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
                <SelectValue placeholder={isAr ? "اختر الخدمة أو الصنف" : "Select Service"} />
              </SelectTrigger>
              <SelectContent>
                {formData.productVariantId && !lookups.services.some((s) => String(s.id) === String(formData.productVariantId)) && (
                  <SelectItem value={String(formData.productVariantId)}>
                    {rawEvent?.productName || rawEvent?.productVariantName || rawEvent?.serviceName || (isAr ? `خدمة #${String(formData.productVariantId).substring(0, 8)}` : `Service #${String(formData.productVariantId).substring(0, 8)}`)}
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
              {isAr ? "المكان أو المورد *" : "Resource / Venue *"}
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
                <SelectValue placeholder={isAr ? "اختر المورد أو القاعة" : "Select Resource"} />
              </SelectTrigger>
              <SelectContent>
                {formData.resourceId && !lookups.resources.some((r) => String(r.id) === String(formData.resourceId)) && (
                  <SelectItem value={String(formData.resourceId)}>
                    {rawEvent?.resourceName || rawEvent?.resource || (isAr ? `مورد #${String(formData.resourceId).substring(0, 8)}` : `Resource #${String(formData.resourceId).substring(0, 8)}`)}
                  </SelectItem>
                )}
                {lookups.resources.map((res) => (
                  <SelectItem key={res.id} value={String(res.id)}>
                    {res.name} ({isAr ? `السعة: ${res.capacity} مقعداً` : `Capacity: ${res.capacity}`} {res.ownership === "Leased" ? (isAr ? "- مستأجر" : "- Leased") : (isAr ? "- مملوك" : "- Owned")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "مقدم الخدمة" : "Service Provider"}
            </Label>
            <Select
              key={formData.serviceProviderId || "provider-select"}
              value={formData.serviceProviderId || "none"}
              onValueChange={(val) => handleInputChange("serviceProviderId", val === "none" ? "" : val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder={isAr ? "اختر مقدم الخدمة (اختياري)" : "Select Service Provider (Optional)"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{isAr ? "-- بدون مقدم خدمة محدد --" : "-- None --"}</SelectItem>
                {providerOptions.map((prov) => (
                  <SelectItem key={prov.id} value={prov.id}>
                    {prov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "السعة القصوى *" : "Max Capacity *"}
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
            {isEdit && rawEvent?.currentReservedQuantity !== undefined && (
              <div className="text-[11px] font-medium text-[#0066d1] bg-blue-50/70 border border-blue-100 rounded-lg px-2.5 py-1 flex items-center justify-between">
                <span>{isAr ? "الحجوزات الحالية:" : "Current Reserved:"}</span>
                <span className="font-bold font-mono">{rawEvent.currentReservedQuantity} / {formData.maxCapacity || 0}</span>
              </div>
            )}
            {selectedResource && (
              <p className="text-[10px] text-slate-400">
                {isAr ? `السعة القصوى للمورد المحدد: ${selectedResource.capacity} مقعد` : `Selected resource capacity: ${selectedResource.capacity}`}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Start Date, End Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "بداية الفترة *" : "Start Date *"}
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
              {isAr ? "نهاية الفترة *" : "End Date *"}
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
              {isAr ? "توقيت بدء الجلسة *" : "Start Time *"}
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
                {isAr ? "توقيت انتهاء الجلسة *" : "End Time *"}
              </Label>
              {isOvernightDetected && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {isAr ? "اليوم التالي" : "Next Day"}
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
              {isAr ? "سعر الحدث *" : "Event Price *"}
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
              {isAr ? "سعر الحجز الإجمالي للحدث المعروض للعملاء." : "Total reservation price for the event."}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              {isAr ? "الدفعة المقدمة / العربون" : "Advance Payment"}
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
              {isAr ? "قيمة الدفعة المقدمة المطلوبة عند تأكيد حجز العميل للحدث." : "Required advance payment upon booking."}
            </p>
          </div>
        </div>

        {/* Row 5: Recurring Days Selection & Occurrence Calculation */}
        <div className="space-y-3 pt-3 border-t border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-bold text-slate-800">
                {isAr ? "أيام التكرار داخل الفترة" : "Recurring Days"}
              </Label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr ? "تحديد أيام الأسبوع التي تنعقد فيها جلسات الحدث داخل الفترة المحددة." : "Select days of the week when event sessions will take place."}
              </p>
            </div>

            {/* Calculated Sessions Badge */}
            {sessionOccurrences.count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0066d1] border border-blue-200">
                <Calendar className="w-3.5 h-3.5" />
                {isAr ? `إجمالي الجلسات المحسوبة: ${sessionOccurrences.count} جلسة` : `Calculated sessions: ${sessionOccurrences.count}`}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {DAYS_OF_WEEK_CONFIG.map((day) => {
              const isSelected = formData.recurringDays.includes(day.id);
              const dayLabel = isAr ? (day.arabic || day.name) : (day.english || day.name || day.id);
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
                  <span>{dayLabel}</span>
                </button>
              );
            })}
          </div>

          {sessionOccurrences.dates.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{isAr ? "مواعيد الجلسات الفعلية المحسوبة: " : "Calculated Session Dates: "}</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {sessionOccurrences.dates.slice(0, 6).join(", ")}
                {sessionOccurrences.dates.length > 6 && (isAr ? ` ... (+${sessionOccurrences.dates.length - 6} جلسات أخرى)` : ` ... (+${sessionOccurrences.dates.length - 6} more sessions)`)}
              </span>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

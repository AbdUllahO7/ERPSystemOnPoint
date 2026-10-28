import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Check,
  UserCheck,
  CalendarClock,
  CalendarDays,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  Hash,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  getServiceProviderLookups,
  DAYS_OF_WEEK,
  FULL_DAYS_OF_WEEK,
} from "@/services/appointments";

const DAY_TRANSLATIONS = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

function formatDisplayTime(timeStr) {
  if (!timeStr || timeStr === "00:00:00") return "—";
  const parts = String(timeStr).split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, "0");
  return `${formattedHours}:${minutes} ${ampm}`;
}

export default function AddEditServiceProvider() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { locale } = useI18n();

  const [copiedId, setCopiedId] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    startTime: "08:00",
    endTime: "17:00",
    active: true,
    workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
  });

  // Lookups Query for HR Employees
  const { data: lookupsData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["serviceProviderLookups"],
    queryFn: getServiceProviderLookups,
  });
  const employees = lookupsData?.data?.employees || [];

  // Fetch provider data if in edit mode
  const {
    data: providerData,
    isLoading: isLoadingProvider,
    refetch,
  } = useQuery({
    queryKey: ["serviceProvider", id],
    queryFn: () => getServiceProviderById(id),
    enabled: isEdit,
  });

  const provider = providerData?.data || {};

  // Initialize form state when provider data is loaded
  useEffect(() => {
    if (providerData?.data) {
      const p = providerData.data;
      setFormData((prev) => ({
        ...prev,
        employeeId: p.hrEmployeeId || "",
        startTime: p.startTime || "08:00",
        endTime: p.endTime || "17:00",
        active: Boolean(p.isActive ?? true),
        workingDays:
          Array.isArray(p.workingDays) && p.workingDays.length > 0
            ? p.workingDays
            : ["Sun", "Mon", "Tue", "Wed", "Thu"],
      }));
    }
  }, [providerData]);

  // Selected HR Employee entity
  const selectedEmployee = employees.find(
    (e) => e.id === formData.employeeId || e.value === formData.employeeId
  );

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateServiceProvider(id, data) : createServiceProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceProviders"]);
      queryClient.invalidateQueries(["serviceProvider", id]);
      toast.success(
        isEdit
          ? "Service provider updated successfully!"
          : "Service provider created successfully!"
      );
      navigate("/dashboard/appointments/service-providers");
    },
    onError: (err) => {
      console.error("Failed to save service provider:", err);
      toast.error(
        isEdit
          ? "Failed to update service provider!"
          : "Failed to create service provider!"
      );
    },
  });

  const handleSelectEmployee = (empId) => {
    if (!empId || empId === "none") {
      setFormData((prev) => ({ ...prev, employeeId: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, employeeId: empId }));
  };

  const handleToggleDay = (dayId) => {
    setFormData((prev) => {
      const current = prev.workingDays || [];
      const exists = current.includes(dayId);
      const updated = exists
        ? current.filter((d) => d !== dayId)
        : [...current, dayId];
      return { ...prev, workingDays: updated };
    });
  };

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Provider ID copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isEdit) {
      // POST /api/inventory/ServiceProvider/UpdateServiceProvider
      // Schema: { id: "uuid", hrEmployeeId: "uuid | null" }
      saveMutation.mutate({
        id,
        hrEmployeeId: formData.employeeId || null,
      });
    } else {
      // POST /api/inventory/ServiceProvider/CreateServiceProvider
      // Schema: { hrEmployeeId: "uuid | null", weeklySchedule: [...] }
      saveMutation.mutate(formData);
    }
  };

  // Weekly Schedule organized list for display
  const scheduleMap = new Map();
  if (Array.isArray(provider.weeklySchedule)) {
    provider.weeklySchedule.forEach((item) => {
      if (item && item.dayOfWeek) {
        scheduleMap.set(item.dayOfWeek.toLowerCase(), item);
      }
    });
  }

  const weeklyScheduleList = FULL_DAYS_OF_WEEK.map((dayName) => {
    const existing = scheduleMap.get(dayName.toLowerCase());
    if (existing) {
      return {
        dayOfWeek: dayName,
        isDayOff: Boolean(existing.isDayOff),
        startTime: existing.startTime || "00:00:00",
        endTime: existing.endTime || "00:00:00",
      };
    }
    const isSelected = formData.workingDays.some((shortId) => {
      const d = DAYS_OF_WEEK.find((item) => item.id === shortId);
      return d && d.full.toLowerCase() === dayName.toLowerCase();
    });
    return {
      dayOfWeek: dayName,
      isDayOff: !isSelected,
      startTime: isSelected ? `${formData.startTime}:00` : "00:00:00",
      endTime: isSelected ? `${formData.endTime}:00` : "00:00:00",
    };
  });

  if (isEdit && isLoadingProvider) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Edit Service Provider"
          breadcrumbs={[
            { label: "Service Provider", href: "/dashboard/appointments/service-providers" },
            { label: "Edit Service Provider" },
          ]}
        />
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-primary mb-3">
            <RefreshCw className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Loading provider details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumbs & Top Action Buttons */}
      <PageTitle
        title={isEdit ? "Edit Service Provider" : "Add Service Provider"}
        breadcrumbs={[
          { label: "Service Provider", href: "/dashboard/appointments/service-providers" },
          { label: isEdit ? "Edit Service Provider" : "Add Service Provider" },
        ]}
        infoTooltip="Configure service provider assignment and weekly operational schedule matching backend schema."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/appointments/service-providers")}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending || isLoadingProvider}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-7 py-2 rounded-lg font-medium shadow-sm transition-all"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {/* Provider Header / Identifiers in Edit Mode */}
      {isEdit && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#eaf4ff] text-[#0066d1] flex items-center justify-center shrink-0">
              <UserCheck className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedEmployee?.fullName || selectedEmployee?.label || "Service Provider"}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    provider.isActive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      provider.isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  {provider.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Edit service provider HR employee assignment and review weekly schedule.
              </p>
            </div>
          </div>

          {/* Provider ID Badge with Copy */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
            <div className="text-left">
              <span className="text-[11px] font-medium text-slate-400 block leading-tight">
                Provider ID (UUID)
              </span>
              <span className="font-mono text-xs font-semibold text-slate-800">
                {id}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-primary hover:text-blue-700 p-1.5 rounded hover:bg-slate-200/50 transition-colors"
              title="Copy Provider UUID"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        {/* Section 1: HR Employee Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-slate-800">
              {locale === "ar" ? "اختيار موظف الموارد البشرية" : "Select HR Employee"}
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign or reassign an employee from the HR system to this service provider.
            </p>
          </div>

          <div className="max-w-xl">
            <Select
              value={formData.employeeId || "none"}
              onValueChange={handleSelectEmployee}
              disabled={isLoadingEmployees}
            >
              <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]">
                <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Choose employee..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Independent Provider - بدون موظف HR)</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.label} {emp.code ? `(#${emp.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Employee Details Card Preview */}
          {selectedEmployee && (
            <div className="max-w-xl p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Employee Details
                </span>
                {selectedEmployee.code && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Hash className="w-3 h-3 text-slate-400" />
                    Job #{selectedEmployee.code}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-normal">Full Name:</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">
                    {selectedEmployee.fullName || selectedEmployee.label}
                  </span>
                </div>

                {selectedEmployee.phone && (
                  <div>
                    <span className="text-slate-400 block font-normal">Phone Number:</span>
                    <span className="text-slate-800 font-semibold mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEmployee.phone}
                    </span>
                  </div>
                )}

                {selectedEmployee.email && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-normal">Email:</span>
                    <span className="text-slate-800 font-medium mt-0.5 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedEmployee.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Working Hours & Days (Editable in Add, Viewable/Configured in Edit) */}
        {!isEdit ? (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Weekly Schedule Configuration
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the default operational hours and active working days for this provider.
              </p>
            </div>

            {/* Start and End Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">
                  Work Start Time
                </Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">
                  Work End Time
                </Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <div
                  className={cn(
                    "rounded-xl border p-3 flex items-center justify-between h-11 transition-all",
                    formData.active
                      ? "border-[#0066d1]/40 bg-blue-50/10"
                      : "border-slate-200/80 bg-white"
                  )}
                >
                  <span className="text-sm font-medium text-slate-700">Active</span>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Working Days Selector */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold text-slate-800">
                {locale === "ar" ? "أيام العمل" : "Working Days"}
              </Label>
              <div className="flex flex-wrap gap-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.workingDays?.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleDay(day.id)}
                      className={`min-w-[80px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all text-center border ${
                        isSelected
                          ? "border-[#0066d1] text-[#0066d1] bg-blue-50/50 shadow-xs font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {locale === "ar" ? (day.labelAr || day.label) : (day.label || day.id)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode: Display Active Weekly Schedule from API */
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  {locale === "ar" ? "الجدول الأسبوعي الحالي" : "Active Weekly Schedule"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Operating schedule loaded from the service provider's backend record.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                7 Days Schedule
              </span>
            </div>

            {/* Weekly Schedule Mini Table */}
            <div className="rounded-xl border border-slate-200/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Day</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Start Time</th>
                    <th className="py-2.5 px-4">End Time</th>
                    <th className="py-2.5 px-4 text-right">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weeklyScheduleList.map((day, idx) => {
                    const isOff = day.isDayOff;
                    const dayLabel = locale === "ar" ? (DAY_TRANSLATIONS[day.dayOfWeek] || day.dayOfWeek) : day.dayOfWeek;
                    return (
                      <tr
                        key={idx}
                        className={isOff ? "bg-slate-50/30" : "hover:bg-blue-50/20"}
                      >
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays
                              className={`w-3.5 h-3.5 ${
                                isOff ? "text-slate-400" : "text-primary"
                              }`}
                            />
                            <span>{dayLabel}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              isOff
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {isOff ? (locale === "ar" ? "عطلة" : "Day Off") : (locale === "ar" ? "يوم عمل" : "Working Day")}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">
                          {isOff ? "—" : day.startTime}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">
                          {isOff ? "—" : day.endTime}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {isOff ? (
                            <span className="text-slate-400 italic">Off</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-primary">
                              <Clock className="w-3 h-3" />
                              {formatDisplayTime(day.startTime)} – {formatDisplayTime(day.endTime)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

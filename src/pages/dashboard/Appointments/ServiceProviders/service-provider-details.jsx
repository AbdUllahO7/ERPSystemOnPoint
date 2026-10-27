import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Pencil,
  Copy,
  Check,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  CalendarClock,
  RefreshCw,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getServiceProviderById, FULL_DAYS_OF_WEEK } from "@/services/appointments";

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

export default function ServiceProviderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(null);

  const {
    data: providerData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["serviceProvider", id],
    queryFn: () => getServiceProviderById(id),
    enabled: Boolean(id),
  });

  const provider = providerData?.data || {};

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Organize weekly schedule strictly according to standard 7 days
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
    return {
      dayOfWeek: dayName,
      isDayOff: true,
      startTime: "00:00:00",
      endTime: "00:00:00",
    };
  });

  const activeDaysCount = weeklyScheduleList.filter((d) => !d.isDayOff).length;
  const daysOffCount = weeklyScheduleList.filter((d) => d.isDayOff).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Service Provider Details"
          breadcrumbs={[
            { label: "Service Providers", href: "/dashboard/appointments/service-providers" },
            { label: "Provider Details" },
          ]}
        />
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="inline-block animate-spin text-primary mb-3">
            <RefreshCw className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Loading service provider details...</p>
        </div>
      </div>
    );
  }

  if (isError || !provider.id) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Service Provider Details"
          breadcrumbs={[
            { label: "Service Providers", href: "/dashboard/appointments/service-providers" },
            { label: "Provider Details" },
          ]}
        />
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-12 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Service Provider Not Found
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Unable to fetch provider information. The provider may not exist or has been removed.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/appointments/service-providers")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            <Button onClick={() => refetch()} className="bg-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title="Service Provider Details"
          breadcrumbs={[
            { label: "Service Providers", href: "/dashboard/appointments/service-providers" },
            { label: "Provider Details" },
          ]}
          infoTooltip="View service provider configuration and weekly working schedule matching backend schema."
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/appointments/service-providers")}
            className="border-slate-200 hover:bg-slate-50 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to List
          </Button>

          <Button
            size="sm"
            onClick={() =>
              navigate(`/dashboard/appointments/service-providers/edit/${provider.id}`)
            }
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit Provider
          </Button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066d1] to-[#0d3963] text-white flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
              <UserCheck className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Service Provider
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    provider.isActive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
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
                Configured with working hours and active appointment scheduling.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center min-w-[110px]">
              <p className="text-xs text-slate-400 font-medium">Working Days</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeDaysCount} Days
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center min-w-[110px]">
              <p className="text-xs text-slate-400 font-medium">Days Off</p>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                {daysOffCount} Days
              </p>
            </div>
          </div>
        </div>

        {/* Identifiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Provider ID */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">Provider ID (System UUID)</span>
              <button
                type="button"
                onClick={() => handleCopy(provider.id, "id")}
                className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                title="Copy ID"
              >
                {copiedKey === "id" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 break-all select-all">
              {provider.id}
            </p>
          </div>

          {/* HR Employee ID */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-500">HR Employee ID</span>
              {provider.hrEmployeeId && (
                <button
                  type="button"
                  onClick={() => handleCopy(provider.hrEmployeeId, "empId")}
                  className="text-xs text-primary hover:text-blue-700 flex items-center gap-1"
                  title="Copy Employee ID"
                >
                  {copiedKey === "empId" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {provider.hrEmployeeId ? (
              <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 break-all select-all">
                {provider.hrEmployeeId}
              </p>
            ) : (
              <p className="text-sm font-normal text-slate-400 italic">
                — Not assigned to an HR employee
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Schedule Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Weekly Working Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Operational working hours and day-off configuration per day of the week.
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
            7 Days Configuration
          </span>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Day of Week</th>
                <th className="py-3.5 px-6">Schedule Status</th>
                <th className="py-3.5 px-6">Start Time</th>
                <th className="py-3.5 px-6">End Time</th>
                <th className="py-3.5 px-6 text-right">Formatted Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {weeklyScheduleList.map((schedule, index) => {
                const isOff = schedule.isDayOff;
                const arabicDay = DAY_TRANSLATIONS[schedule.dayOfWeek] || "";
                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isOff
                        ? "bg-slate-50/30 dark:bg-slate-900/30 hover:bg-slate-50/60"
                        : "hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                    }`}
                  >
                    {/* Day of Week */}
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <CalendarDays
                          className={`w-4 h-4 ${
                            isOff ? "text-slate-400" : "text-[#0066d1]"
                          }`}
                        />
                        <span>{schedule.dayOfWeek}</span>
                        {arabicDay && (
                          <span className="text-xs text-slate-400 font-normal">
                            ({arabicDay})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Schedule Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOff
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                        }`}
                      >
                        {isOff ? "Day Off (عطلة)" : "Working Day (عمل)"}
                      </span>
                    </td>

                    {/* Start Time */}
                    <td className="py-4 px-6 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {isOff ? (
                        <span className="text-slate-400 font-normal">—</span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {schedule.startTime}
                        </span>
                      )}
                    </td>

                    {/* End Time */}
                    <td className="py-4 px-6 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {isOff ? (
                        <span className="text-slate-400 font-normal">—</span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {schedule.endTime}
                        </span>
                      )}
                    </td>

                    {/* Formatted Window */}
                    <td className="py-4 px-6 text-right">
                      {isOff ? (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Closed / No Booking
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066d1] bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {formatDisplayTime(schedule.startTime)} –{" "}
                            {formatDisplayTime(schedule.endTime)}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

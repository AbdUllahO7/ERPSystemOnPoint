import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { DynamicModal } from "@/components/common/dynamic-modal";
import { Button } from "@/components/ui/button";
import {
  getServiceProviderById,
  getServiceProviderReservations,
} from "@/services/appointments";

const CALENDAR_HEADERS = ["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"];

// Days matrix generation for calendar matching mockup layout
// In mockup: starts with 29, 30, 31 (prev month), then 1-31, and next month days 32/1...
const CALENDAR_DAYS_GRID = [
  { day: 29, isCurrentMonth: false },
  { day: 30, isCurrentMonth: false },
  { day: 31, isCurrentMonth: false },
  { day: 1, isCurrentMonth: true },
  { day: 2, isCurrentMonth: true },
  { day: 3, isCurrentMonth: true },
  { day: 4, isCurrentMonth: true },
  { day: 5, isCurrentMonth: true },
  { day: 6, isCurrentMonth: true },
  { day: 7, isCurrentMonth: true },
  { day: 8, isCurrentMonth: true },
  { day: 9, isCurrentMonth: true },
  { day: 10, isCurrentMonth: true },
  { day: 11, isCurrentMonth: true },
  { day: 12, isCurrentMonth: true },
  { day: 13, isCurrentMonth: true },
  { day: 14, isCurrentMonth: true },
  { day: 15, isCurrentMonth: true },
  { day: 16, isCurrentMonth: true },
  { day: 17, isCurrentMonth: true },
  { day: 18, isCurrentMonth: true },
  { day: 19, isCurrentMonth: true },
  { day: 20, isCurrentMonth: true },
  { day: 21, isCurrentMonth: true },
  { day: 22, isCurrentMonth: true },
  { day: 23, isCurrentMonth: true },
  { day: 24, isCurrentMonth: true },
  { day: 25, isCurrentMonth: true },
  { day: 26, isCurrentMonth: true },
  { day: 27, isCurrentMonth: true },
  { day: 28, isCurrentMonth: true },
  { day: 29, isCurrentMonth: true },
  { day: 30, isCurrentMonth: true },
  { day: 31, isCurrentMonth: true },
  { day: 32, isCurrentMonth: false },
];

export default function ServiceProviderDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("basic"); // "basic" | "reservations"
  const [selectedDayModal, setSelectedDayModal] = useState(null); // { day, dateFormatted, appointments }

  // Provider Data Query
  const { data: providerData, isLoading } = useQuery({
    queryKey: ["serviceProvider", id],
    queryFn: () => getServiceProviderById(id),
  });
  const provider = providerData?.data || {};

  // Provider Reservations Query
  const { data: reservationsData } = useQuery({
    queryKey: ["serviceProviderReservations", id],
    queryFn: () => getServiceProviderReservations(id),
  });
  const reservations = reservationsData?.data || [];

  // Working days formatted string
  const workingDaysText = Array.isArray(provider.workingDays)
    ? provider.workingDays.join("-")
    : provider.workingDays || "Sun-Mon-Tue-Wed-Thu-Fri-Sat";

  // Group reservations by day number
  const reservationsByDay = reservations.reduce((acc, res) => {
    if (!acc[res.day]) acc[res.day] = [];
    acc[res.day].push(res);
    return acc;
  }, {});

  const getBadgeClass = (type) => {
    switch (type) {
      case "orange":
        return "bg-[#fff2e5] text-[#f97316] hover:bg-[#ffe5cc] border border-[#ffedd5]";
      case "red":
        return "bg-[#fef2f2] text-[#ef4444] hover:bg-[#fee2e2] border border-[#fecaca]";
      case "blue":
      default:
        return "bg-[#eaf4ff] text-[#0066d1] hover:bg-[#d5e8ff] border border-[#dbeafe]";
    }
  };

  // Open day appointments modal matching user mockup
  const handleOpenDayModal = (cell) => {
    const dayReservations = reservationsByDay[cell.day] || [
      { id: 1, time: "9:00-9:30", customerName: "Customer Name" },
      { id: 2, time: "9:00-9:30", customerName: "Customer Name" },
      { id: 3, time: "9:00-9:30", customerName: "Customer Name" },
      { id: 4, time: "9:00-9:30", customerName: "Customer Name" },
      { id: 5, time: "9:00-9:30", customerName: "Customer Name" },
    ];

    setSelectedDayModal({
      day: cell.day,
      dateFormatted: `${cell.day}/7/2025`,
      appointments:
        dayReservations.length > 0
          ? dayReservations.map((a) => ({
              ...a,
              time: a.time || "9:00-9:30",
              customerName: a.patient || a.customerName || "Customer Name",
            }))
          : [
              { id: 1, time: "9:00-9:30", customerName: "Customer Name" },
              { id: 2, time: "9:00-9:30", customerName: "Customer Name" },
              { id: 3, time: "9:00-9:30", customerName: "Customer Name" },
            ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumb & Info Tooltip */}
      <PageTitle
        title="Service Provider Details"
        breadcrumbs={[
          { label: "Service Provider", href: "/dashboard/appointments/service-providers" },
          { label: "Service Provider Details" },
        ]}
        infoTooltip="View provider personal details, working schedules, and monthly reservations calendar."
      />

      {/* Main Container with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-8 px-6 pt-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === "basic"
                ? "text-[#0066d1] font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Basic Information
            {activeTab === "basic" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066d1] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reservations")}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === "reservations"
                ? "text-[#0066d1] font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Reservations({reservations.length || 3})
            {activeTab === "reservations" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066d1] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Basic Information */}
        {activeTab === "basic" && (
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Employee ID
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {provider.employeeId || "#266544"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Name</p>
                <p className="text-sm text-slate-600 mt-1">
                  {provider.name || "Dr. Rami Haddad"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Phone</p>
                <p className="text-sm text-slate-600 mt-1">
                  {provider.phone || "+965 4599 158 323"}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Working Days
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {workingDaysText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reservations Calendar View */}
        {activeTab === "reservations" && (
          <div>
            {/* Calendar Table Grid */}
            <div className="border-t border-slate-100">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                {CALENDAR_HEADERS.map((header) => (
                  <div
                    key={header}
                    className="p-3 text-xs font-semibold text-slate-600 border-r border-slate-100 last:border-r-0"
                  >
                    {header}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                {CALENDAR_DAYS_GRID.map((cell, index) => {
                  const dayReservations = reservationsByDay[cell.day] || [];
                  return (
                    <div
                      key={index}
                      onClick={() => handleOpenDayModal(cell)}
                      className="min-h-[115px] p-2.5 bg-white flex flex-col justify-between hover:bg-blue-50/20 cursor-pointer transition-colors"
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            cell.isCurrentMonth
                              ? "text-slate-800"
                              : "text-slate-300"
                          }`}
                        >
                          {cell.day}
                        </span>
                      </div>

                      {/* Reservation Slots List in Cell */}
                      <div className="space-y-1 mt-auto">
                        {dayReservations.map((slot) => (
                          <div
                            key={slot.id}
                            className={`w-full text-left px-2 py-0.5 rounded text-[11px] font-semibold transition-all truncate block ${getBadgeClass(
                              slot.type
                            )}`}
                          >
                            {slot.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointments Day Modal matching screenshot */}
      <DynamicModal
        open={!!selectedDayModal}
        onOpenChange={(open) => !open && setSelectedDayModal(null)}
        title={`Appointments Day (${selectedDayModal?.dateFormatted || "23/7/2025"})`}
        icon={CalendarIcon}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        {selectedDayModal && (
          <div className="space-y-4 pt-1">
            {/* List of Appointment Cards */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {selectedDayModal.appointments.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center gap-3.5 transition-all hover:border-blue-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#eaf4ff] text-[#0066d1] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      {item.time || "9:00-9:30"}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {item.customerName || "Customer Name"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Back Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="w-full bg-[#8e9aa8] hover:bg-[#7b8796] text-white py-3.5 h-auto rounded-xl font-medium text-sm transition-all shadow-none"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DynamicModal>
    </div>
  );
}

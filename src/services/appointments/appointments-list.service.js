import { apiHandler } from "@/lib/api-handler";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";

// ==========================================
// Static Initial Data for Appointments List
// ==========================================

export const INITIAL_APPOINTMENT_STATS = [
  {
    title: "Total Appointments",
    value: "0",
    trend: "+0%",
    isUp: true,
    color: "bg-[#0066d1]",
    icon: Calendar,
  },
  {
    title: "Confirmed",
    value: "0",
    trend: "+0%",
    isUp: true,
    color: "bg-[#5ebc93]",
    icon: CheckCircle2,
  },
  {
    title: "Pending",
    value: "0",
    trend: "+0%",
    isUp: true,
    color: "bg-[#ff9548]",
    icon: Clock,
  },
  {
    title: "Canceled",
    value: "0",
    trend: "-0%",
    isUp: false,
    color: "bg-rose-500",
    icon: XCircle,
  },
];

export const INITIAL_APPOINTMENTS_LIST = [];

export async function getAppointmentStats() {
  return {
    data: INITIAL_APPOINTMENT_STATS,
    status: 200,
    message: "Stats retrieved successfully",
  };
}

export async function getAppointments(params = {}) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/GetAllAppointments/all-appointments",
      method: "GET",
      params: {
        PageNumber: params.PageNumber || params.page || 1,
        PageSize: params.PageSize || params.pageSize || 10,
        Search: params.SearchTerm || params.search || undefined,
        IsActive: params.Status === "All" ? undefined : params.Status !== undefined ? true : undefined,
        SortBy: params.SortBy || undefined,
        SortDirection: params.SortDirection || undefined,
      },
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((a) => {
      const dateStr = a.appointmentDate ? a.appointmentDate.split("T")[0] : "";
      const timeStr =
        a.startTime && a.endTime
          ? `${formatTimeSpan(a.startTime)} – ${formatTimeSpan(a.endTime)}`
          : "";

      return {
        id: a.id,
        customerId: a.customerId,
        customerName: a.customerName || "—",
        customer: a.customerName || "—",
        productVariantId: a.productVariantId,
        serviceName: a.serviceName || "—",
        service: a.serviceName || "—",
        serviceProviderId: a.serviceProviderId,
        serviceProviderName: a.serviceProviderName || "—",
        provider: a.serviceProviderName || "—",
        appointmentDate: a.appointmentDate,
        date: dateStr,
        startTime: a.startTime,
        endTime: a.endTime,
        time: timeStr,
        status: a.status || "Pending",
        invoiceId: a.invoiceId || null,
        raw: a,
      };
    });

    return {
      status: 200,
      data: {
        items: mappedItems,
        totalPages,
        totalCount,
        pageNumber: params.PageNumber || 1,
        pageSize: params.PageSize || 10,
      },
      message: "Appointments retrieved successfully",
    };
  } catch (err) {
    console.error("Failed to fetch appointments from API:", err);
    throw err;
  }
}

export const VALID_APPOINTMENT_STATUSES = [
  "Pending",
  "Confirmed",
  "CheckedIn",
  "Completed",
  "Canceled",
  "NoShow",
];

export function formatTimeSpan(val) {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 5);
  if (typeof val === "object" && val !== null) {
    if (val.ticks !== undefined) {
      const totalSec = Math.floor(Number(val.ticks) / 10000000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    if (val.hours !== undefined && val.minutes !== undefined) {
      return `${String(val.hours).padStart(2, "0")}:${String(val.minutes).padStart(2, "0")}`;
    }
  }
  return "";
}

export function normalizeAppointmentStatus(status) {
  if (!status) return "Pending";
  const s = String(status).trim();
  const lower = s.toLowerCase();
  if (lower === "scheduled") return "Pending";
  if (lower === "in progress" || lower === "inprogress") return "CheckedIn";
  if (lower === "cancelled") return "Canceled";
  if (lower === "no show" || lower === "no-show") return "NoShow";
  const match = VALID_APPOINTMENT_STATUSES.find((v) => v.toLowerCase() === lower);
  return match || s;
}

export async function deleteAppointment(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/ServiceAppointment/ChangeAppointmentStatus`,
      method: "POST",
      params: { appointmentId: id, newStatus: "Canceled" },
    });
    return {
      status: 200,
      data: res,
      message: "Appointment canceled/deleted successfully",
    };
  } catch (err) {
    console.error(`Failed to cancel/delete appointment ${id}:`, err);
    throw err;
  }
}

export async function changeAppointmentStatus({ id, appointmentId, status, newStatus }) {
  const targetId = appointmentId || id;
  const targetStatus = normalizeAppointmentStatus(newStatus || status);

  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/ChangeAppointmentStatus",
      method: "POST",
      params: {
        appointmentId: targetId,
        newStatus: targetStatus,
      },
    });
    return {
      status: 200,
      data: res,
      message: "Status updated successfully",
    };
  } catch (err) {
    console.error(`Failed to change appointment status:`, err);
    throw err;
  }
}

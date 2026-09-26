import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Appointments List
// ==========================================

export const INITIAL_APPOINTMENT_STATS = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-[#0066d1]",
    icon: Building2,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#5ebc93]",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-[#0b386a]",
    icon: Building2,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#ff9548]",
    icon: UsersIcon,
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

    const mappedItems = items.map((a, idx) => ({
      id: a.id || idx + 1,
      customer: a.customerName || a.customer?.name || "Customer",
      service: a.serviceName || a.productVariant?.name || "Service",
      provider: a.serviceProviderName || a.serviceProvider?.name || "Dr. Provider",
      date: a.appointmentDate ? a.appointmentDate.split("T")[0] : new Date().toISOString().split("T")[0],
      time: a.startTime && a.endTime ? `${a.startTime} – ${a.endTime}` : (a.time || "09:00 – 09:30"),
      total: `$${a.totalAmount || a.deposit || 60}`,
      price: String(a.totalAmount || a.deposit || "60"),
      currency: a.currency || "USD",
      status: a.status || "Scheduled",
      isInvoiced: Boolean(a.isInvoiced || a.invoiceId),
      notes: a.notes || "",
      billingMethod: a.billingMethod || "per-visit",
      paymentMethod: a.paymentMethod || "Cash",
      costCenter: a.costCenter || "Main Clinic",
      warehouse: a.warehouse || "Central Warehouse",
      amountPaidNow: String(a.deposit || a.amountPaidNow || "0"),
      materialDetails: a.materialDetails || "",
      paymentSchedules: a.paymentSchedules || [],
      raw: a,
    }));

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

export async function changeAppointmentStatus({ id, status }) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/ChangeAppointmentStatus",
      method: "POST",
      params: { appointmentId: id, newStatus: status },
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

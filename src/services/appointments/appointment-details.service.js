import { apiHandler } from "@/lib/api-handler";

import { formatTimeSpan } from "./appointments-list.service";

// ==========================================
// Service Methods: Appointment Details Page
// ==========================================

export async function getAppointmentById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/ServiceAppointment/GetAppointmentById/${id}`,
      method: "GET",
    });

    const a = res?.data || res || {};
    const dateStr = a.appointmentDate ? a.appointmentDate.split("T")[0] : "";
    const timeStr =
      a.startTime && a.endTime
        ? `${formatTimeSpan(a.startTime)} – ${formatTimeSpan(a.endTime)}`
        : "";

    return {
      status: 200,
      data: {
        id: a.id || id,
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
        startTime: a.startTime,
        endTime: a.endTime,
        date: dateStr,
        time: timeStr,
        status: a.status || "Pending",
        invoiceId: a.invoiceId || null,
        raw: a,
      },
      message: "Appointment retrieved successfully",
    };
  } catch (err) {
    console.error(`Failed to get appointment ${id}:`, err);
    throw err;
  }
}

export async function generateInvoiceForAppointment(appointmentId) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/GenerateInvoiceForAppointment",
      method: "POST",
      body: { appointmentId },
    });
    return res;
  } catch (err) {
    console.error(`Failed to generate invoice for appointment ${appointmentId}:`, err);
    throw err;
  }
}

export async function addPaymentSchedule(appointmentId, scheduleData) {
  return {
    data: {
      id: Date.now(),
      amount: scheduleData.amount,
      date: scheduleData.date || new Date().toLocaleDateString("en-US"),
      notes: scheduleData.notes || "",
    },
    status: 201,
    message: "Payment schedule added successfully",
  };
}

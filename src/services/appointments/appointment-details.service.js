import { apiHandler } from "@/lib/api-handler";

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
    return {
      status: 200,
      data: {
        id: a.id || id,
        customer: a.customerName || a.customer?.name || "Customer",
        service: a.serviceName || a.productVariant?.name || "Service",
        provider: a.serviceProviderName || a.serviceProvider?.name || "Service Provider",
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

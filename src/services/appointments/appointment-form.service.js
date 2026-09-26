import { apiHandler } from "@/lib/api-handler";
import { getAllCustomers } from "@/lib/api";

// ==========================================
// Static Lookups & Fallbacks
// ==========================================

export const APPOINTMENT_LOOKUPS = {
  customers: [],
  services: [],
  providers: [],
  statuses: [
    "All",
    "Scheduled",
    "Confirmed",
    "CheckedIn",
    "Completed",
    "Canceled",
    "NoShow",
  ],
  currencies: [
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "SAR (﷼)", value: "SAR" },
    { label: "AED (د.إ)", value: "AED" },
  ],
  paymentMethods: [
    { label: "Cash", value: "Cash" },
    { label: "Credit Card", value: "Credit Card" },
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Insurance", value: "Insurance" },
  ],
  costCenters: [
    { label: "Main Clinic", value: "Main Clinic" },
    { label: "Branch 1", value: "Branch 1" },
    { label: "Outpatient", value: "Outpatient" },
    { label: "Dental Unit", value: "Dental Unit" },
    { label: "Laboratory", value: "Laboratory" },
  ],
  warehouses: [
    { label: "Central Warehouse", value: "Central Warehouse" },
    { label: "Medical Supplies Store", value: "Medical Supplies Store" },
  ],
};

// ==========================================
// Service Methods: Add / Edit Form Page
// ==========================================

export async function getAppointmentLookups() {
  try {
    const [customersRes, servicesRes, providersRes] = await Promise.allSettled([
      apiHandler({ endPoint: "inventory/Customer/GetAllCustomers/all-customers", method: "GET", params: { PageSize: 100 } }),
      apiHandler({ endPoint: "Inventory/Product/GetAll/GetAll", method: "GET", params: { PageSize: 100 } }),
      apiHandler({ endPoint: "inventory/ServiceProvider/GetAllServiceProviders/all-service-providers", method: "GET", params: { PageSize: 100 } }),
    ]);

    const customersRaw = customersRes.status === "fulfilled" ? (customersRes.value?.data?.items || customersRes.value?.data || []) : [];
    const servicesRaw = servicesRes.status === "fulfilled" ? (servicesRes.value?.data?.items || servicesRes.value?.data || []) : [];
    const providersRaw = providersRes.status === "fulfilled" ? (providersRes.value?.data?.items || providersRes.value?.data || []) : [];

    const customers = customersRaw.map((c) => ({
      id: c.id,
      label: c.name || c.companyName || "Unnamed Customer",
      value: c.name || c.companyName || c.id,
    }));

    const services = servicesRaw.map((s) => ({
      id: s.id,
      label: s.name_Product || s.name || "Unnamed Service",
      value: s.name_Product || s.name || s.id,
      price: s.consumer_Price ?? s.consumerPrice ?? 0,
      duration: s.default_Duration_Minutes || 30,
    }));

    const providers = providersRaw.map((p) => ({
      id: p.id,
      label: p.name || p.employeeName || p.hrEmployee?.name || "Service Provider",
      value: p.name || p.employeeName || p.id,
    }));

    return {
      data: {
        ...APPOINTMENT_LOOKUPS,
        customers: customers.length > 0 ? customers : APPOINTMENT_LOOKUPS.customers,
        services: services.length > 0 ? services : APPOINTMENT_LOOKUPS.services,
        providers: providers.length > 0 ? providers : APPOINTMENT_LOOKUPS.providers,
      },
      status: 200,
      message: "Lookups retrieved successfully",
    };
  } catch (err) {
    console.error("Error fetching appointment lookups:", err);
    return {
      data: APPOINTMENT_LOOKUPS,
      status: 200,
      message: "Fallback lookups",
    };
  }
}

export async function getAvailableTimeSlots(params = {}) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/GetAvailableTimeSlots/available-slots",
      method: "GET",
      params: {
        serviceProviderId: params.serviceProviderId,
        date: params.date,
        durationInMinutes: params.durationInMinutes || 30,
      },
    });
    return res;
  } catch (err) {
    console.error("Failed to fetch available time slots:", err);
    return { data: [] };
  }
}

export async function createAppointment(payload) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/CreateAppointment",
      method: "POST",
      body: {
        customerId: payload.customerId || undefined,
        productVariantId: payload.productVariantId || payload.serviceId || undefined,
        serviceProviderId: payload.serviceProviderId || payload.providerId || undefined,
        appointmentDate: payload.appointmentDate || payload.date || new Date().toISOString(),
        startTime: payload.startTime || "09:00:00",
        endTime: payload.endTime || "09:30:00",
        deposit: Number(payload.deposit || payload.amountPaidNow || 0),
        unitOfMeasurementId: payload.unitOfMeasurementId || undefined,
      },
    });

    return {
      status: 201,
      data: res?.data || res,
      message: "Appointment created successfully",
    };
  } catch (err) {
    console.error("Failed to create appointment:", err);
    throw err;
  }
}

export async function updateAppointment(id, payload) {
  try {
    if (payload.status) {
      await apiHandler({
        endPoint: "inventory/ServiceAppointment/ChangeAppointmentStatus",
        method: "POST",
        params: { appointmentId: id, newStatus: payload.status },
      });
    }

    return {
      status: 200,
      data: payload,
      message: "Appointment updated successfully",
    };
  } catch (err) {
    console.error(`Failed to update appointment ${id}:`, err);
    throw err;
  }
}

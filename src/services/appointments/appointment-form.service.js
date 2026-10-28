import { apiHandler } from "@/lib/api-handler";
import { getAllCustomers } from "@/lib/api";

// ==========================================
// Static Lookups & Fallbacks
// ==========================================

export const APPOINTMENT_STATUSES = [
  "Pending",
  "Confirmed",
  "CheckedIn",
  "Completed",
  "Canceled",
  "NoShow",
];

export const APPOINTMENT_LOOKUPS = {
  customers: [],
  services: [],
  providers: [],
  statuses: [
    "Pending",
    "Confirmed",
    "CheckedIn",
    "Completed",
    "Canceled",
    "NoShow",
  ],
};

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function toGuidOrNull(val) {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

// ==========================================
// Service Methods: Add / Edit Form Page
// ==========================================

/**
 * جلب قائمة خدمات المواعيد مع الأسعار والوحدات
 * GET /api/HR/Lookups/GetAppointmentPricing/GetAppointmentPricing
 */
export async function getAppointmentPricingLookup(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetAppointmentPricing/GetAppointmentPricing",
    method: "GET",
    params,
  });
}

export async function getAppointmentLookups() {
  try {
    const [customersRes, pricingRes, providersRes, employeesRes] = await Promise.allSettled([
      apiHandler({ endPoint: "inventory/Customer/GetAllCustomers/all-customers", method: "GET", params: { PageSize: 100 } }),
      getAppointmentPricingLookup(),
      apiHandler({ endPoint: "inventory/ServiceProvider/GetAllServiceProviders/all-service-providers", method: "GET", params: { PageSize: 100 } }),
      apiHandler({ endPoint: "HR/Employees/GetAll", method: "GET", params: { PageSize: 1000 } }),
    ]);

    const customersRaw = customersRes.status === "fulfilled" ? (customersRes.value?.data?.items || customersRes.value?.data || []) : [];
    
    // خدمات المواعيد من GetAppointmentPricing
    let servicesRaw = pricingRes.status === "fulfilled"
      ? (Array.isArray(pricingRes.value?.data) ? pricingRes.value.data : (pricingRes.value?.data?.items || []))
      : [];
    const providersRaw = providersRes.status === "fulfilled" ? (providersRes.value?.data?.items || providersRes.value?.data || []) : [];
    const employeesRaw = employeesRes.status === "fulfilled" ? (employeesRes.value?.data?.items || employeesRes.value?.data || []) : [];

    // Map employees by ID (normalized lowercase) to resolve provider names from hrEmployeeId
    const employeeMap = new Map();
    employeesRaw.forEach((e) => {
      const fullName =
        e.fullName ||
        `${e.first_Name || e.firstName || ""} ${e.last_Name || e.lastName || ""}`.trim() ||
        e.name ||
        e.employeeName ||
        e.user_Name ||
        e.userName ||
        (e.jobNumber ? `Employee #${e.jobNumber}` : "");

      const empObj = {
        name: fullName,
        code: e.jobNumber || e.employee_Code,
        phone: e.phone || e.phoneNumber,
      };

      if (e.id) {
        employeeMap.set(String(e.id).toLowerCase().trim(), empObj);
      }
      if (e.jobNumber) {
        employeeMap.set(String(e.jobNumber).toLowerCase().trim(), empObj);
      }
    });

    // في حال كانت القائمة فارغة أو فشل الطلب، نحاول الفولباك من Inventory/Product/GetAll/GetAll
    if (!servicesRaw || servicesRaw.length === 0) {
      try {
        const fallbackRes = await apiHandler({ endPoint: "Inventory/Product/GetAll/GetAll", method: "GET", params: { ProductType: "Appointment", PageSize: 100 } });
        const allItems = fallbackRes?.data?.items || fallbackRes?.data || [];
        servicesRaw = allItems.filter((item) => {
          const type = (item.product_Type || item.productType || "").toLowerCase();
          return type === "appointment" || type === "service";
        });
      } catch (e) {
        // ignore fallback error
      }
    }

    const customers = customersRaw.map((c) => ({
      id: c.id,
      label: c.name || c.companyName || "Unnamed Customer",
      value: c.id, // Must be UUID
      name: c.name || c.companyName || "",
    }));

    const services = servicesRaw.map((s) => {
      // استخراج المعرف الفعلي لتفريعة الخدمة (productVariantId)
      const variantIds = Array.isArray(s.variant_Ids)
        ? s.variant_Ids
        : Array.isArray(s.variantIds)
        ? s.variantIds
        : [];

      const variantFromList =
        (Array.isArray(s.variants) && s.variants[0]?.id) ||
        (Array.isArray(s.productVariantDtos) && s.productVariantDtos[0]?.id) ||
        null;

      const variantId =
        toGuidOrNull(s.productVariantId) ||
        toGuidOrNull(s.product_Variant_Id) ||
        toGuidOrNull(variantIds[0]) ||
        toGuidOrNull(variantFromList) ||
        toGuidOrNull(s.id);

      const unitDtos = Array.isArray(s.variants?.[0]?.productUnitDtos)
        ? s.variants[0].productUnitDtos
        : Array.isArray(s.productVariantDtos?.[0]?.productUnitDtos)
        ? s.productVariantDtos[0].productUnitDtos
        : [];
      const firstUnit = unitDtos.length > 0 ? unitDtos[0] : null;

      // وحدة قياس الخدمة الافتراضية للنظام ("33333333-3333-3333-3333-333333333333" لخدمة مقطوعة SVC)
      const unitId =
        toGuidOrNull(s.unitOfMeasurementId) ||
        toGuidOrNull(s.unit_Of_Measurement_Id) ||
        toGuidOrNull(firstUnit?.unit_Of_Measurement_Id) ||
        toGuidOrNull(firstUnit?.unitOfMeasurementId) ||
        "33333333-3333-3333-3333-333333333333";

      const unitName = s.unitName || firstUnit?.unit_Name || "خدمة مقطوعة";
      const serviceName = s.productName || s.name_Product || s.name || "Unnamed Service";
      const price = Number(s.consumerPrice ?? s.consumer_Price ?? (Array.isArray(s.prices) ? s.prices[0] : 0));
      const priceSuffix = price > 0 ? ` ($${price})` : "";

      return {
        id: variantId,
        productId: s.productId || s.id || variantId,
        productVariantId: variantId,
        unitOfMeasurementId: unitId,
        unitName: unitName,
        label: `${serviceName}${priceSuffix}`,
        value: variantId, // MUST be the Product Variant UUID
        name: serviceName,
        price: price,
        consumerPrice: price,
        duration: s.default_Duration_Minutes || 30,
        raw: s,
      };
    });

    const isGenericProviderName = (str) => {
      if (!str || typeof str !== "string") return true;
      const s = str.trim().toLowerCase();
      return (
        s === "" ||
        s === "service provider" ||
        s === "provider" ||
        s === "unnamed provider" ||
        s === "unnamed" ||
        s === "n/a" ||
        s === "—"
      );
    };

    const providers = providersRaw.map((p, idx) => {
      const rawEmpId = p.hrEmployeeId || p.employeeId || p.hr_Employee_Id;
      const normalizedEmpId = rawEmpId ? String(rawEmpId).toLowerCase().trim() : null;
      const matchedEmp = normalizedEmpId ? employeeMap.get(normalizedEmpId) : null;

      const directCandidates = [
        p.fullName,
        p.employeeName,
        p.employee_Name,
        p.hrEmployeeName,
        p.hr_Employee_Name,
        p.hrEmployee?.fullName,
        p.hrEmployee?.name,
        p.name,
        p.providerName,
        p.provider_Name,
      ];
      const validDirectName = directCandidates.find((n) => !isGenericProviderName(n));

      const fallbackName = rawEmpId
        ? `Employee (${String(rawEmpId).slice(0, 8)})`
        : p.id
        ? `Provider #${String(p.id).slice(0, 8).toUpperCase()}`
        : `Provider ${idx + 1}`;

      const resolvedName = validDirectName || matchedEmp?.name || fallbackName;

      return {
        id: p.id,
        label: resolvedName,
        value: p.id, // Must be UUID
        name: resolvedName,
        hrEmployeeId: rawEmpId || null,
        raw: p,
      };
    });
    
    return {
      data: {
        customers: customers.length > 0 ? customers : APPOINTMENT_LOOKUPS.customers,
        services: services.length > 0 ? services : APPOINTMENT_LOOKUPS.services,
        providers: providers.length > 0 ? providers : APPOINTMENT_LOOKUPS.providers,
        statuses: APPOINTMENT_LOOKUPS.statuses,
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

/**
 * تنسيق الوقت إلى صيغة TimeSpan القياسية في .NET ("hh:mm:ss")
 * يدعم التحويل من "09:00", "09:00:00", { ticks: ... }, أو كائن التاريخ
 */
export function formatTimeSpan(val) {
  if (!val) return "00:00:00";
  if (typeof val === "object" && val !== null && "ticks" in val) {
    const totalSeconds = Math.floor(Number(val.ticks) / 10000000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  const str = String(val).trim();
  const parts = str.split(":");
  if (parts.length === 2) {
    const h = String(parseInt(parts[0], 10) || 0).padStart(2, "0");
    const m = String(parseInt(parts[1], 10) || 0).padStart(2, "0");
    return `${h}:${m}:00`;
  }
  if (parts.length >= 3) {
    const h = String(parseInt(parts[0], 10) || 0).padStart(2, "0");
    const m = String(parseInt(parts[1], 10) || 0).padStart(2, "0");
    const s = String(parseInt(parts[2], 10) || 0).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  return "00:00:00";
}

/**
 * دالة متوافقة تعيد صيغة TimeSpan كـ hh:mm:ss لـ ASP.NET Core
 */
export function timeToTicks(val) {
  return formatTimeSpan(val);
}

/**
 * تجهيز الـ Payload الصارم المتوافق مع CreateAppointmentDto (8 حقول حصرياً)
 * POST /api/inventory/ServiceAppointment/CreateAppointment
 * Schema:
 * {
 *   customerId: UUID | null,
 *   productVariantId: UUID,
 *   serviceProviderId: UUID | null,
 *   appointmentDate: string (ISO date-time),
 *   startTime: string ("hh:mm:ss"),
 *   endTime: string ("hh:mm:ss"),
 *   deposit: number,
 *   unitOfMeasurementId: UUID | null
 * }
 */
export function buildCreateAppointmentDto(payload = {}) {
  const customerId = toGuidOrNull(payload.customerId || payload.customer);
  const productVariantId =
    toGuidOrNull(payload.productVariantId || payload.serviceId || payload.service) ||
    payload.productVariantId;
  const serviceProviderId = toGuidOrNull(
    payload.serviceProviderId || payload.providerId || payload.provider
  );
  const unitOfMeasurementId = toGuidOrNull(payload.unitOfMeasurementId);

  let appointmentDate = payload.appointmentDate || payload.date;
  if (appointmentDate) {
    if (typeof appointmentDate === "string" && appointmentDate.includes("T")) {
      // already ISO string
    } else {
      appointmentDate = new Date(appointmentDate).toISOString();
    }
  } else {
    appointmentDate = new Date().toISOString();
  }

  const startTime = formatTimeSpan(payload.startTime ?? payload.start ?? "09:00:00");
  const endTime = formatTimeSpan(payload.endTime ?? payload.end ?? "09:30:00");
  const deposit = Number(payload.deposit ?? payload.amountPaidNow ?? payload.despose ?? 0) || 0;

  return {
    customerId: customerId || null,
    productVariantId,
    serviceProviderId: serviceProviderId || null,
    appointmentDate,
    startTime,
    endTime,
    deposit,
    unitOfMeasurementId: unitOfMeasurementId || null,
  };
}

export async function createAppointment(payload) {
  try {
    // Only send the exact 8 fields defined in CreateAppointmentDto Schema - delete / omit anything else
    const body = buildCreateAppointmentDto(payload);

    const res = await apiHandler({
      endPoint: "inventory/ServiceAppointment/CreateAppointment",
      method: "POST",
      body,
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
    const newStatus = payload.newStatus || payload.status;
    if (newStatus) {
      await apiHandler({
        endPoint: "inventory/ServiceAppointment/ChangeAppointmentStatus",
        method: "POST",
        params: {
          appointmentId: id,
          newStatus,
        },
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

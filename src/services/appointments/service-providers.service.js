import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";
import { timeToTicks, formatTimeSpan } from "./appointment-form.service";

// ==========================================
// Initial Data & Constants for Service Providers
// ==========================================

export const INITIAL_SERVICE_PROVIDERS_STATS = [
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
    color: "bg-[#0d3963]",
    icon: Building2,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#f39223]",
    icon: UsersIcon,
  },
];

export const FULL_DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAYS_OF_WEEK = [
  { id: "Sun", label: "Sun", labelAr: "الأحد", full: "Sunday" },
  { id: "Mon", label: "Mon", labelAr: "الإثنين", full: "Monday" },
  { id: "Tue", label: "Tue", labelAr: "الثلاثاء", full: "Tuesday" },
  { id: "Wed", label: "Wed", labelAr: "الأربعاء", full: "Wednesday" },
  { id: "Thu", label: "Thu", labelAr: "الخميس", full: "Thursday" },
  { id: "Fri", label: "Fri", labelAr: "الجمعة", full: "Friday" },
  { id: "Sat", label: "Sat", labelAr: "السبت", full: "Saturday" },
];

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function toGuidOrNull(val) {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

export function normalizeDayOfWeek(day) {
  if (!day) return "Sunday";
  const str = String(day).trim().toLowerCase();
  if (str.startsWith("sun") || str.includes("أحد") || str.includes("احد")) return "Sunday";
  if (str.startsWith("mon") || str.includes("اثنين") || str.includes("إثنين")) return "Monday";
  if (str.startsWith("tue") || str.includes("ثلاثاء")) return "Tuesday";
  if (str.startsWith("wed") || str.includes("أربعاء") || str.includes("اربعاء")) return "Wednesday";
  if (str.startsWith("thu") || str.includes("خميس")) return "Thursday";
  if (str.startsWith("fri") || str.includes("جمعة")) return "Friday";
  if (str.startsWith("sat") || str.includes("سبت")) return "Saturday";
  return "Sunday";
}

export const INITIAL_SERVICE_PROVIDERS_LIST = [];

export async function getServiceProvidersStats() {
  return {
    status: 200,
    data: INITIAL_SERVICE_PROVIDERS_STATS,
  };
}

// ==========================================
// Service Provider API Methods
// ==========================================

export async function getServiceProviders(params = {}) {
  try {
    const [providersRes, employeesRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/ServiceProvider/GetAllServiceProviders/all-service-providers",
        method: "GET",
        params: {
          PageNumber: params.PageNumber || params.page || 1,
          PageSize: params.PageSize || params.pageSize || 10,
          Search: params.SearchTerm || params.search || undefined,
          IsActive: params.Status === "Active" ? true : params.Status === "Inactive" ? false : undefined,
          SortBy: params.SortBy || undefined,
          SortDirection: params.SortDirection || undefined,
        },
      }),
      apiHandler({
        endPoint: "HR/Employees/GetAll",
        method: "GET",
        params: { PageSize: 1000 },
      }),
    ]);

    const res = providersRes.status === "fulfilled" ? providersRes.value : null;
    const employeesRaw = employeesRes.status === "fulfilled"
      ? (employeesRes.value?.data?.items || employeesRes.value?.data || [])
      : [];

    const employeeMap = new Map();
    employeesRaw.forEach((e) => {
      const fullName =
        e.fullName ||
        `${e.first_Name || e.firstName || ""} ${e.last_Name || e.lastName || ""}`.trim() ||
        e.name ||
        e.employeeName ||
        (e.jobNumber ? `Employee #${e.jobNumber}` : "");
      if (e.id) {
        employeeMap.set(e.id, fullName);
      }
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((p, idx) => {
      const schedule = Array.isArray(p.weeklySchedule) ? p.weeklySchedule : [];
      const activeWorkingDays = schedule
        .filter((w) => !w.isDayOff)
        .map((w) => w.dayOfWeek);

      const workingDaysShort = activeWorkingDays.map((day) => {
        const d = DAYS_OF_WEEK.find(
          (item) => item.full.toLowerCase() === (day || "").toLowerCase()
        );
        return d ? d.id : day;
      });

      const empId = p.hrEmployeeId || p.employeeId || null;
      const resolvedName =
        p.name ||
        p.fullName ||
        p.employeeName ||
        p.hrEmployeeName ||
        (empId ? employeeMap.get(empId) : null) ||
        (p.id ? `Provider #${String(p.id).slice(0, 8).toUpperCase()}` : `Provider ${idx + 1}`);

      return {
        id: p.id || idx + 1,
        hrEmployeeId: empId,
        employeeName: resolvedName,
        name: resolvedName,
        isActive: Boolean(p.isActive ?? true),
        status: p.isActive === false ? "Inactive" : "Active",
        weeklySchedule: schedule,
        workingDays: workingDaysShort,
        workingDaysCount: activeWorkingDays.length,
        raw: p,
      };
    });

    return {
      status: 200,
      data: {
        items: mappedItems,
        totalCount,
        totalPages,
        pageNumber: params.PageNumber || 1,
        pageSize: params.PageSize || 10,
      },
    };
  } catch (err) {
    console.error("Failed to fetch service providers from API:", err);
    throw err;
  }
}

export async function getServiceProviderById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/ServiceProvider/GetServiceProviderById/${id}`,
      method: "GET",
    });

    const p = res?.data || res || {};
    const schedule = Array.isArray(p.weeklySchedule) ? p.weeklySchedule : [];
    const activeWorkingDays = schedule
      .filter((w) => !w.isDayOff)
      .map((w) => w.dayOfWeek);

    const workingDaysShort = activeWorkingDays.map((day) => {
      const d = DAYS_OF_WEEK.find(
        (item) => item.full.toLowerCase() === (day || "").toLowerCase()
      );
      return d ? d.id : (day ? day.slice(0, 3) : "");
    });

    const firstWorking = schedule.find((w) => !w.isDayOff);

    return {
      status: 200,
      data: {
        id: p.id || id,
        hrEmployeeId: p.hrEmployeeId || null,
        isActive: Boolean(p.isActive ?? true),
        status: p.isActive === false ? "Inactive" : "Active",
        weeklySchedule: schedule,
        workingDays: workingDaysShort,
        workingDaysFull: activeWorkingDays,
        workingDaysCount: activeWorkingDays.length,
        startTime: firstWorking?.startTime ? firstWorking.startTime.slice(0, 5) : "08:00",
        endTime: firstWorking?.endTime ? firstWorking.endTime.slice(0, 5) : "17:00",
        raw: p,
      },
    };
  } catch (err) {
    console.error(`Failed to get service provider with id ${id}:`, err);
    throw err;
  }
}

export const getProviderById = getServiceProviderById;

/**
 * بناء كائن CreateServiceProviderDto متوافق تماماً مع Swagger (حقلان حصرياً وبدون أي حقول إضافية)
 * POST /api/inventory/ServiceProvider/CreateServiceProvider
 * Schema:
 * {
 *   "hrEmployeeId": "uuid | null",
 *   "weeklySchedule": [
 *     {
 *       "dayOfWeek": "Sunday",
 *       "startTime": { "ticks": 0 },
 *       "endTime": { "ticks": 0 },
 *       "isDayOff": true
 *     }
 *   ]
 * }
 */
export function buildCreateServiceProviderDto(payload = {}) {
  const hrEmployeeId = toGuidOrNull(payload.hrEmployeeId || payload.employeeId);

  let weeklySchedule = [];

  if (Array.isArray(payload.weeklySchedule) && payload.weeklySchedule.length > 0) {
    weeklySchedule = payload.weeklySchedule.map((item) => {
      const isDayOff = Boolean(item.isDayOff ?? item.is_day_off ?? false);
      return {
        dayOfWeek: normalizeDayOfWeek(item.dayOfWeek || item.day),
        startTime: isDayOff ? "00:00:00" : formatTimeSpan(item.startTime ?? item.start ?? "09:00:00"),
        endTime: isDayOff ? "00:00:00" : formatTimeSpan(item.endTime ?? item.end ?? "17:00:00"),
        isDayOff,
      };
    });
  } else if (Array.isArray(payload.workingDays)) {
    const workingSet = new Set(payload.workingDays.map((d) => normalizeDayOfWeek(d)));
    const defaultStart = payload.startTime || "09:00:00";
    const defaultEnd = payload.endTime || "17:00:00";

    weeklySchedule = FULL_DAYS_OF_WEEK.map((day) => {
      const isWorking = workingSet.has(day);
      return {
        dayOfWeek: day,
        startTime: isWorking ? formatTimeSpan(defaultStart) : "00:00:00",
        endTime: isWorking ? formatTimeSpan(defaultEnd) : "00:00:00",
        isDayOff: !isWorking,
      };
    });
  } else {
    weeklySchedule = FULL_DAYS_OF_WEEK.map((day) => {
      const isOff = day === "Friday" || day === "Saturday";
      return {
        dayOfWeek: day,
        startTime: isOff ? "00:00:00" : formatTimeSpan("09:00:00"),
        endTime: isOff ? "00:00:00" : formatTimeSpan("17:00:00"),
        isDayOff: isOff,
      };
    });
  }

  return {
    hrEmployeeId,
    weeklySchedule,
  };
}

/**
 * بناء كائن UpdateServiceProviderDto متوافق مع Swagger
 * POST /api/inventory/ServiceProvider/UpdateServiceProvider
 * Schema:
 * {
 *   "id": "uuid",
 *   "hrEmployeeId": "uuid | null"
 * }
 */
export function buildUpdateServiceProviderDto(id, payload = {}) {
  const providerId = toGuidOrNull(id) || toGuidOrNull(payload?.id) || id;
  const hrEmployeeId = toGuidOrNull(payload?.hrEmployeeId || payload?.employeeId);

  return {
    id: providerId,
    hrEmployeeId,
  };
}

export async function createServiceProvider(data) {
  try {
    const cleanDto = buildCreateServiceProviderDto(data);
    const res = await apiHandler({
      endPoint: "inventory/ServiceProvider/CreateServiceProvider",
      method: "POST",
      body: cleanDto,
    });
    return {
      status: 201,
      data: res?.data || res,
      message: "Service provider created successfully",
    };
  } catch (err) {
    console.error("Failed to create service provider:", err);
    throw err;
  }
}

export async function updateServiceProvider(id, data) {
  try {
    const cleanDto = buildUpdateServiceProviderDto(id, data);
    const res = await apiHandler({
      endPoint: "inventory/ServiceProvider/UpdateServiceProvider",
      method: "POST",
      body: cleanDto,
    });
    return {
      status: 200,
      data: res?.data || res,
      message: "Service provider updated successfully",
    };
  } catch (err) {
    console.error(`Failed to update service provider ${id}:`, err);
    throw err;
  }
}

export async function deleteServiceProvider(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/ServiceProvider/DeleteServiceProvider/${id}`,
      method: "POST",
    });
    return {
      status: 200,
      data: res,
      message: "Service provider deleted successfully",
    };
  } catch (err) {
    console.error(`Failed to delete service provider ${id}:`, err);
    throw err;
  }
}

export async function getServiceProviderLookups() {
  try {
    const res = await apiHandler({
      endPoint: "HR/Employees/GetAll",
      method: "GET",
      params: { PageSize: 1000 },
    });
    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const employees = items.map((e) => {
      const fullName =
        e.fullName ||
        `${e.first_Name || e.firstName || ""} ${e.last_Name || e.lastName || ""}`.trim() ||
        e.name ||
        e.employeeName ||
        e.user_Name ||
        e.userName ||
        (e.jobNumber ? `Employee #${e.jobNumber}` : null) ||
        (e.id ? `Employee (${String(e.id).slice(0, 8)})` : "Employee");

      const code = e.jobNumber || e.employee_Code || e.employeeCode || "";
      const phone = e.phone || e.phoneNumber || e.phone_Number || e.mobileNumber || "";
      const email = e.email || "";

      return {
        id: e.id,
        value: e.id,
        label: fullName,
        fullName,
        phone,
        code,
        jobNumber: code,
        email,
        raw: e,
      };
    });
    return {
      status: 200,
      data: {
        employees,
      },
    };
  } catch (err) {
    console.warn("Could not load employees for provider lookups:", err);
    return {
      status: 200,
      data: {
        employees: [],
      },
    };
  }
}

export async function getServiceProviderReservations(providerId) {
  return {
    status: 200,
    data: [],
  };
}

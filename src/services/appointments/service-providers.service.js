import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

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

export const DAYS_OF_WEEK = [
  { id: "Sat", label: "Sat", full: "Saturday" },
  { id: "Sun", label: "Sun", full: "Sunday" },
  { id: "Mon", label: "Mon", full: "Monday" },
  { id: "Tue", label: "Tue", full: "Tuesday" },
  { id: "Wed", label: "Wed", full: "Wednesday" },
  { id: "Thu", label: "Thu", full: "Thursday" },
  { id: "Fri", label: "Fri", full: "Friday" },
];

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
    const res = await apiHandler({
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
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((p, idx) => ({
      id: p.id || idx + 1,
      employeeId: p.employeeId || p.hrEmployeeId || `#${idx + 101}`,
      name: p.name || p.employeeName || p.hrEmployee?.name || `Provider ${idx + 1}`,
      phone: p.phone || p.phoneNumber || p.hrEmployee?.phone || "-",
      workingDays: Array.isArray(p.workingDays) && p.workingDays.length > 0 
        ? p.workingDays 
        : ["Sun", "Mon", "Tue", "Wed", "Thu"],
      status: p.isActive === false || p.status === "Inactive" ? "Inactive" : "Active",
      raw: p,
    }));

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
    return {
      status: 200,
      data: {
        id: p.id || id,
        employeeId: p.employeeId || p.hrEmployeeId || `#${id}`,
        name: p.name || p.employeeName || p.hrEmployee?.name || "Service Provider",
        phone: p.phone || p.phoneNumber || p.hrEmployee?.phone || "-",
        workingDays: Array.isArray(p.workingDays) && p.workingDays.length > 0
          ? p.workingDays
          : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        status: p.isActive === false || p.status === "Inactive" ? "Inactive" : "Active",
        raw: p,
      },
    };
  } catch (err) {
    console.error(`Failed to get service provider with id ${id}:`, err);
    throw err;
  }
}

export async function createServiceProvider(data) {
  try {
    const res = await apiHandler({
      endPoint: "inventory/ServiceProvider/CreateServiceProvider",
      method: "POST",
      body: {
        hrEmployeeId: data.hrEmployeeId || data.employeeId || undefined,
        weeklySchedule: data.weeklySchedule || [],
        ...data,
      },
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
    const res = await apiHandler({
      endPoint: "inventory/ServiceProvider/UpdateServiceProvider",
      method: "POST",
      body: {
        id: id,
        hrEmployeeId: data.hrEmployeeId || data.employeeId || undefined,
        ...data,
      },
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

export async function getServiceProviderReservations(providerId) {
  return {
    status: 200,
    data: [],
  };
}

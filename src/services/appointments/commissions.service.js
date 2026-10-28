import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Initial Data & Constants for Commissions
// ==========================================

export const INITIAL_COMMISSIONS_STATS = [
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

export const COMMISSION_TYPES = [
  { id: "Percentage", label: "Percentage" },
  { id: "FixedAmount", label: "Fixed Amount" },
];

export const INITIAL_PROVIDER_COMMISSION_RULES = [];
export const INITIAL_COMMISSION_LEDGER_ENTRIES = [];

export async function getCommissionLedgerStats() {
  return {
    status: 200,
    data: INITIAL_COMMISSIONS_STATS,
  };
}

// ==========================================
// Lookups for Provider Commissions
// ==========================================

export async function getCommissionLookups() {
  try {
    const [providersRes, pricingRes, servicesRes, employeesRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/ServiceProvider/GetAllServiceProviders/all-service-providers",
        method: "GET",
        params: { PageSize: 100 },
      }),
      apiHandler({
        endPoint: "HR/Lookups/GetAppointmentPricing/GetAppointmentPricing",
        method: "GET",
      }),
      apiHandler({
        endPoint: "Inventory/Product/GetAll/GetAll",
        method: "GET",
        params: { PageSize: 100 },
      }),
      apiHandler({
        endPoint: "HR/Employees/GetAll",
        method: "GET",
        params: { PageSize: 1000 },
      }),
    ]);

    const providersRaw =
      providersRes.status === "fulfilled"
        ? providersRes.value?.data?.items || providersRes.value?.data || []
        : [];
    const pricingRaw =
      pricingRes.status === "fulfilled"
        ? (Array.isArray(pricingRes.value?.data) ? pricingRes.value.data : (pricingRes.value?.data?.items || []))
        : [];
    const servicesRaw =
      servicesRes.status === "fulfilled"
        ? servicesRes.value?.data?.items || servicesRes.value?.data || []
        : [];
    const employeesRaw =
      employeesRes.status === "fulfilled"
        ? employeesRes.value?.data?.items || employeesRes.value?.data || []
        : [];

    const employeeMap = new Map();
    employeesRaw.forEach((e) => {
      const name =
        e.fullName ||
        `${e.first_Name || e.firstName || ""} ${e.last_Name || e.lastName || ""}`.trim() ||
        e.name ||
        e.employeeName ||
        (e.jobNumber ? `Employee #${e.jobNumber}` : "");
      if (e.id) {
        employeeMap.set(String(e.id).toLowerCase().trim(), name);
      }
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
      const empName = normalizedEmpId ? employeeMap.get(normalizedEmpId) : null;

      const directCandidates = [
        p.fullName,
        p.employeeName,
        p.hrEmployeeName,
        p.name,
      ];
      const validDirectName = directCandidates.find((n) => !isGenericProviderName(n));

      const fallbackName = rawEmpId
        ? `Employee (${String(rawEmpId).slice(0, 8)})`
        : p.id
        ? `Provider #${String(p.id).slice(0, 8).toUpperCase()}`
        : `Provider ${idx + 1}`;

      const name = validDirectName || empName || fallbackName;

      return {
        id: p.id || String(idx + 1),
        name,
        raw: p,
      };
    });

    let services = [];
    if (pricingRaw.length > 0) {
      services = pricingRaw.map((s, idx) => ({
        id: s.productVariantId || s.id || String(idx + 1),
        variantId: s.productVariantId || s.variantId || s.id,
        name: s.productName || s.name_Product || s.name || `Service ${idx + 1}`,
        unitId: s.unitOfMeasurementId,
        unitName: s.unitName,
        price: s.consumerPrice,
        raw: s,
      }));
    } else {
      services = servicesRaw.map((s, idx) => ({
        id: s.id || String(idx + 1),
        variantId: (Array.isArray(s.variant_Ids) && s.variant_Ids.length > 0) ? s.variant_Ids[0] : (s.id || String(idx + 1)),
        name: s.name_Product || s.name || `Service ${idx + 1}`,
        raw: s,
      }));
    }

    return {
      status: 200,
      data: {
        providers,
        services,
        types: COMMISSION_TYPES,
      },
    };
  } catch (err) {
    console.error("Failed to load commission lookups:", err);
    return {
      status: 200,
      data: {
        providers: [],
        services: [],
        types: COMMISSION_TYPES,
      },
    };
  }
}

// ==========================================
// Provider Commission Rules API Methods
// ==========================================

export async function getProviderCommissionRules(params = {}) {
  try {
    const res = await apiHandler({
      endPoint: "Inventory/ServiceProviderCommission/GetAllCommissions",
      method: "GET",
      params: {
        PageNumber: params.PageNumber || params.page || 1,
        PageSize: params.PageSize || params.pageSize || 10,
        Search: params.SearchTerm || params.search || undefined,
        ServiceProviderId: params.Provider !== "all" ? params.Provider : undefined,
        ProductVariantId: params.Service !== "all" ? params.Service : undefined,
        SortBy: params.SortBy || undefined,
        SortDirection: params.SortDirection || undefined,
      },
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((r, idx) => {
      const typeStr = r.commissionType === 1 || r.commissionType === "FixedAmount" ? "Fixed Amount" : "Percentage";
      const displayVal = typeStr === "Percentage" ? `${r.commissionValue || 0}%` : `$${r.commissionValue || 0}`;

      return {
        id: r.id || idx + 1,
        providerId: r.serviceProviderId || "",
        provider:
          r.serviceProviderName ||
          r.serviceProvider?.name ||
          r.serviceProvider?.fullName ||
          (r.serviceProviderId ? `Provider #${String(r.serviceProviderId).slice(0, 8).toUpperCase()}` : `Provider ${idx + 1}`),
        serviceId: r.productVariantId || "",
        service:
          r.productVariantName ||
          r.productName ||
          r.serviceName ||
          (r.productVariantId ? `Service #${String(r.productVariantId).slice(0, 8).toUpperCase()}` : `Service ${idx + 1}`),
        type: typeStr,
        value: displayVal,
        percentageValue: String(r.commissionValue || 0),
        startDate: r.effectiveDate ? r.effectiveDate.split("T")[0] : "-",
        endDate: r.expirationDate ? r.expirationDate.split("T")[0] : "-",
        raw: r,
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
    console.warn("Backend GetAllCommissions returned error (LINQ translation in backend):", err?.message);
    return {
      status: 200,
      data: {
        items: [],
        totalCount: 0,
        totalPages: 1,
        pageNumber: params.PageNumber || 1,
        pageSize: params.PageSize || 10,
      },
    };
  }
}

export async function createCommissionRule(data) {
  try {
    const rawVal = data.percentage !== undefined && data.percentage !== "" ? data.percentage : data.value;
    const cleanValue = Number(String(rawVal || 0).replace(/[^0-9.]/g, "")) || 0;

    const res = await apiHandler({
      endPoint: "Inventory/ServiceProviderCommission/CreateCommission",
      method: "POST",
      body: {
        serviceProviderId: data.providerId || data.provider,
        productVariantId: data.serviceId || data.service,
        commissionType: data.type === "FixedAmount" || data.type === "Fixed Amount" ? "FixedAmount" : "Percentage",
        commissionValue: cleanValue,
        effectiveDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        expirationDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      },
    });

    return {
      status: 201,
      data: res?.data || res,
      message: "Commission rule added successfully",
    };
  } catch (err) {
    console.error("Failed to create commission rule:", err);
    throw err;
  }
}

export async function deleteCommissionRule(id) {
  try {
    const res = await apiHandler({
      endPoint: `Inventory/ServiceProviderCommission/DeleteCommission/${id}`,
      method: "POST",
    });

    return {
      status: 200,
      data: res,
      message: "Commission rule deleted successfully",
    };
  } catch (err) {
    console.error(`Failed to delete commission rule ${id}:`, err);
    throw err;
  }
}

// ==========================================
// Commission Ledger API Methods
// ==========================================

export async function getCommissionLedger(params = {}) {
  try {
    const res = await apiHandler({
      endPoint: "Inventory/CommissionLedger/GetAllLedgers",
      method: "GET",
      params: {
        PageNumber: params.PageNumber || params.page || 1,
        PageSize: params.PageSize || params.pageSize || 10,
        Search: params.SearchTerm || params.search || undefined,
        ServiceProviderId: params.Provider !== "all" ? params.Provider : undefined,
        Status: params.Status !== "all" ? params.Status : undefined,
        DateFrom: params.DateFrom || undefined,
        DateTo: params.DateTo || undefined,
        SortBy: params.SortBy || undefined,
        SortDirection: params.SortDirection || undefined,
      },
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((item, idx) => ({
      id: item.id || idx + 1,
      date: item.date || item.createdAt ? (item.date || item.createdAt).split("T")[0] : "-",
      provider: item.serviceProviderName || item.serviceProvider?.name || "Provider",
      service: item.serviceName || item.productVariantName || "Service",
      customer: item.customerName || item.customer?.name || "Customer",
      amount: typeof item.amount === "number" ? `$${item.amount}` : (String(item.amount || 0).startsWith("$") ? item.amount : `$${item.amount || 0}`),
      numericAmount: Number(item.amount || 0),
      status: item.status || "Unpaid",
      raw: item,
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
    console.error("Failed to fetch commission ledger:", err);
    throw err;
  }
}

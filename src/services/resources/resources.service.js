import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Fallback Data
// ==========================================

export const INITIAL_RESOURCES_STATS = [
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

export const RESOURCE_STATUSES = [
  { id: "Active", name: "Active" },
  { id: "UnderMaintenance", name: "Under Maintenance" },
  { id: "OutOfService", name: "Out of Service" },
  { id: "Rented", name: "Rented" },
];

export const OWNERSHIP_TYPES = [
  { id: "Owned", name: "Owned" },
  { id: "Leased", name: "Leased / Rented" },
];

// ==========================================
// Service API Functions - Connected to Backend
// ==========================================

/**
 * Fetch Lookups for Resources (Suppliers, Fixed Assets, Statuses, Ownerships)
 */
export async function getResourceLookups() {
  try {
    const [suppliersRes, assetsRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "Inventory/Suppliers/GetAllSuppliers/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "accounting/FixedAssets/GetAllFixedAssets/all",
        method: "GET",
        params: { PageSize: 200 },
      }),
    ]);

    // Parse Suppliers
    let suppliers = [];
    if (suppliersRes.status === "fulfilled") {
      const raw = suppliersRes.value?.data || suppliersRes.value || {};
      const list = raw?.items || (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      suppliers = list.map((s) => ({
        id: s.id,
        name: s.supplier_Name || s.name || "Supplier",
        phone: s.phone || s.contact_Number || "",
      }));
    }

    // Parse Fixed Assets
    let fixedAssets = [];
    if (assetsRes.status === "fulfilled") {
      const raw = assetsRes.value?.data || assetsRes.value || {};
      const list = raw?.items || (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      fixedAssets = list.map((a) => ({
        id: a.id || a.asset_Id || a.assetId,
        name: a.asset_Name || a.name || a.assetName || `Asset #${a.asset_Code || a.code || a.id}`,
        code: a.asset_Code || a.code || "",
      }));
    }

    return {
      status: 200,
      data: {
        suppliers,
        fixedAssets,
        statuses: RESOURCE_STATUSES,
        ownerships: OWNERSHIP_TYPES,
      },
    };
  } catch (error) {
    console.error("Error fetching resource lookups:", error);
    return {
      status: 200,
      data: {
        suppliers: [],
        fixedAssets: [],
        statuses: RESOURCE_STATUSES,
        ownerships: OWNERSHIP_TYPES,
      },
    };
  }
}

/**
 * Get Stats for Resources
 */
export async function getResourcesStats() {
  return {
    status: 200,
    data: INITIAL_RESOURCES_STATS,
  };
}

/**
 * Utility to convert values to GUID or null
 */
export function toGuidOrNull(val) {
  if (!val || val === "none" || val === "null" || val === "undefined") return null;
  const str = String(val).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : str || null;
}

/**
 * Build clean CreateResourceDto (Strictly 9 fields matching Swagger schema)
 * Schema:
 * {
 *   "name": "string",
 *   "referenceNumber": "string",
 *   "maxCapacity": 0,
 *   "ownership": "Owned" | "Leased",
 *   "fixedAssetId": "uuid | null",
 *   "supplierId": "uuid | null",
 *   "contractStartDate": "date-time | null",
 *   "contractEndDate": "date-time | null",
 *   "dailyRentalCost": 0
 * }
 */
export function buildCreateResourceDto(data = {}) {
  const isLeased = data.ownership === "Leased";

  const startDateIso = isLeased && data.contractStartDate
    ? (typeof data.contractStartDate === "string" && data.contractStartDate.includes("T")
        ? data.contractStartDate
        : new Date(data.contractStartDate).toISOString())
    : null;

  const endDateIso = isLeased && data.contractEndDate
    ? (typeof data.contractEndDate === "string" && data.contractEndDate.includes("T")
        ? data.contractEndDate
        : new Date(data.contractEndDate).toISOString())
    : null;

  return {
    name: (data.name || "").trim(),
    referenceNumber: (data.referenceNumber || data.code || "").trim(),
    maxCapacity: Number(data.maxCapacity ?? data.capacity) || 0,
    ownership: isLeased ? "Leased" : "Owned",
    fixedAssetId: !isLeased ? toGuidOrNull(data.fixedAssetId) : null,
    supplierId: isLeased ? toGuidOrNull(data.supplierId) : null,
    contractStartDate: startDateIso,
    contractEndDate: endDateIso,
    dailyRentalCost: Number(data.dailyRentalCost) || 0,
  };
}

/**
 * Build clean UpdateResourceDto (Strictly 10 fields matching Swagger schema)
 * Schema:
 * {
 *   "id": "uuid",
 *   "name": "string",
 *   "referenceNumber": "string",
 *   "maxCapacity": 0,
 *   "ownership": "Owned" | "Leased",
 *   "fixedAssetId": "uuid | null",
 *   "supplierId": "uuid | null",
 *   "contractStartDate": "date-time | null",
 *   "contractEndDate": "date-time | null",
 *   "dailyRentalCost": 0
 * }
 */
export function buildUpdateResourceDto(id, data = {}) {
  const baseDto = buildCreateResourceDto(data);
  return {
    id: toGuidOrNull(id || data.id),
    ...baseDto,
  };
}

/**
 * Get Paginated & Filtered Resources List
 * Endpoint: GET /api/inventory/Resource/GetAll
 */
export async function getResources(params = {}) {
  try {
    let isActiveParam = undefined;
    if (params.IsActive === "active" || params.IsActive === true) isActiveParam = true;
    else if (params.IsActive === "inactive" || params.IsActive === false) isActiveParam = false;

    const queryParams = {
      PageNumber: params.PageNumber || 1,
      PageSize: params.PageSize || 10,
      Search: params.SearchTerm || params.Search || undefined,
      Ownership: params.Ownership && params.Ownership !== "all" ? params.Ownership : undefined,
      Status: params.Status && params.Status !== "all" ? params.Status : undefined,
      IsActive: isActiveParam,
      SortBy: params.SortBy || undefined,
      SortDirection: params.SortDirection || undefined,
    };

    const res = await apiHandler({
      endPoint: "inventory/Resource/GetAll",
      method: "GET",
      params: queryParams,
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((r, idx) => {
      const maxCapacity = Number(r.maxCapacity ?? r.capacity ?? 0);
      const isLeased = r.ownership === "Leased";
      const supplierAssetLabel = isLeased
        ? (r.supplierName || r.supplier_Name || "External Supplier")
        : (r.fixedAssetName || r.fixedAsset_Name || (r.fixedAssetId ? `Fixed Asset #${String(r.fixedAssetId).substring(0, 8)}` : "None"));

      const startDateStr = r.contractStartDate
        ? (typeof r.contractStartDate === "string" && r.contractStartDate.includes("T")
            ? r.contractStartDate.split("T")[0]
            : new Date(r.contractStartDate).toISOString().split("T")[0])
        : "";
      const endDateStr = r.contractEndDate
        ? (typeof r.contractEndDate === "string" && r.contractEndDate.includes("T")
            ? r.contractEndDate.split("T")[0]
            : new Date(r.contractEndDate).toISOString().split("T")[0])
        : "";

      return {
        id: r.id || idx + 1,
        name: r.name || r.resource_Name || "Unnamed Resource",
        fullName: r.name || r.resource_Name || "Unnamed Resource",
        referenceNumber: r.referenceNumber || r.code || `RES-${String(r.id || idx + 1).substring(0, 6)}`,
        code: r.referenceNumber || r.code || `RES-${String(r.id || idx + 1).substring(0, 6)}`,
        maxCapacity: maxCapacity,
        capacity: maxCapacity,
        numericCapacity: maxCapacity,
        status: r.status || (r.isActive ? "Active" : "OutOfService"),
        ownership: isLeased ? "Leased" : "Owned",
        fullOwnership: isLeased ? "Leased" : "Owned",
        rawOwnership: r.ownership || "Owned",
        fixedAssetId: r.fixedAssetId || null,
        fixedAssetName: r.fixedAssetName || "",
        supplierId: r.supplierId || null,
        supplierName: r.supplierName || "",
        supplierAsset: supplierAssetLabel,
        supplierAssetName: supplierAssetLabel,
        contractStartDate: startDateStr,
        contractEndDate: endDateStr,
        dailyRentalCost: Number(r.dailyRentalCost) || 0,
        isActive: r.isActive ?? true,
        address: r.address || r.location || "Main Facility",
        fullAddress: r.address || r.location || "Main Facility",
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
  } catch (error) {
    console.error("Error fetching resources:", error);
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

/**
 * Get Resource Details by ID
 * Endpoint: GET /api/inventory/Resource/{id}
 */
export async function getResourceById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/Resource/${id}`,
      method: "GET",
    });
    const r = res?.data || res || {};

    const maxCapacity = Number(r.maxCapacity ?? r.capacity ?? 0);
    const isLeased = r.ownership === "Leased";
    const supplierAssetLabel = isLeased
      ? (r.supplierName || r.supplier_Name || "External Supplier")
      : (r.fixedAssetName || r.fixedAsset_Name || (r.fixedAssetId ? `Fixed Asset #${String(id).substring(0, 8)}` : "None"));

    const startDateStr = r.contractStartDate
      ? (typeof r.contractStartDate === "string" && r.contractStartDate.includes("T")
          ? r.contractStartDate.split("T")[0]
          : new Date(r.contractStartDate).toISOString().split("T")[0])
      : "";
    const endDateStr = r.contractEndDate
      ? (typeof r.contractEndDate === "string" && r.contractEndDate.includes("T")
          ? r.contractEndDate.split("T")[0]
          : new Date(r.contractEndDate).toISOString().split("T")[0])
      : "";

    return {
      status: 200,
      data: {
        id: r.id || id,
        name: r.name || r.resource_Name || "Resource",
        fullName: r.name || r.resource_Name || "Resource",
        referenceNumber: r.referenceNumber || r.code || `RES-${String(id).substring(0, 8)}`,
        code: r.referenceNumber || r.code || `RES-${String(id).substring(0, 8)}`,
        maxCapacity: maxCapacity,
        capacity: maxCapacity,
        numericCapacity: maxCapacity,
        status: r.status || (r.isActive ? "Active" : "OutOfService"),
        ownership: isLeased ? "Leased" : "Owned",
        fullOwnership: isLeased ? "Leased" : "Owned",
        rawOwnership: r.ownership || "Owned",
        fixedAssetId: r.fixedAssetId || "",
        fixedAssetName: r.fixedAssetName || "",
        supplierId: r.supplierId || "",
        supplierName: r.supplierName || "",
        supplierAsset: supplierAssetLabel,
        supplierAssetName: supplierAssetLabel,
        contractStartDate: startDateStr,
        contractEndDate: endDateStr,
        dailyRentalCost: Number(r.dailyRentalCost) || 0,
        isActive: r.isActive ?? true,
        address: r.address || r.location || "Main Facility",
        fullAddress: r.address || r.location || "Main Facility",
        raw: r,
      },
    };
  } catch (error) {
    console.error("Error fetching resource by id:", error);
    throw error;
  }
}

/**
 * Create New Resource
 * Endpoint: POST /api/inventory/Resource/Create
 */
export async function createResource(data) {
  const payload = buildCreateResourceDto(data);

  const res = await apiHandler({
    endPoint: "inventory/Resource/Create",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: res?.message || "Resource created successfully",
  };
}

/**
 * Update Existing Resource
 * Endpoint: POST /api/inventory/Resource/Update
 */
export async function updateResource(id, data) {
  const payload = buildUpdateResourceDto(id, data);

  const res = await apiHandler({
    endPoint: "inventory/Resource/Update",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: res?.message || "Resource updated successfully",
  };
}

/**
 * Change Resource Status
 * Endpoint: POST /api/inventory/Resource/{id}/ChangeStatus?newStatus={status}
 */
export async function changeResourceStatus({ id, status }) {
  let mappedStatus = "Active";
  const s = String(status).toLowerCase();
  if (s === "active") mappedStatus = "Active";
  else if (s.includes("maintenance")) mappedStatus = "UnderMaintenance";
  else if (s.includes("out") || s.includes("inactive")) mappedStatus = "OutOfService";
  else if (s.includes("rented") || s.includes("leased")) mappedStatus = "Rented";

  const res = await apiHandler({
    endPoint: `inventory/Resource/${id}/ChangeStatus`,
    method: "POST",
    params: { newStatus: mappedStatus },
  });

  return {
    status: 200,
    data: res?.data || res,
    message: `Status updated to ${mappedStatus}`,
  };
}

/**
 * Toggle Resource Active Status
 * Endpoint: POST /api/inventory/Resource/{id}/ToggleActive
 */
export async function toggleResourceActive(id) {
  const res = await apiHandler({
    endPoint: `inventory/Resource/${id}/ToggleActive`,
    method: "POST",
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Resource status toggled successfully",
  };
}

export async function deleteResource(id) {
  return toggleResourceActive(id);
}

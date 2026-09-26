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
        params: { PageSize: 100, IsActive: true },
      }),
    ]);

    // Parse Suppliers
    let suppliers = [];
    if (suppliersRes.status === "fulfilled") {
      const raw = suppliersRes.value?.data || suppliersRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
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
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      fixedAssets = list.map((a) => ({
        id: a.id,
        name: a.asset_Name || a.name || `Asset #${a.asset_Code || a.code || a.id}`,
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
 * Get Paginated & Filtered Resources List
 * Endpoint: GET /api/inventory/Resource/GetAll
 */
export async function getResources(params = {}) {
  try {
    const queryParams = {
      PageNumber: params.PageNumber || 1,
      PageSize: params.PageSize || 10,
      Search: params.SearchTerm || params.Search || undefined,
      Ownership: params.Ownership && params.Ownership !== "all" ? params.Ownership : undefined,
      Status: params.Status && params.Status !== "all" ? params.Status : undefined,
      IsActive: params.IsActive !== undefined ? params.IsActive : undefined,
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
      const capacityVal = r.maxCapacity ?? r.capacity ?? 20;
      const ownershipLabel = r.ownership === "Leased" ? "Rented" : (r.ownership || "Owned");
      const supplierAssetLabel = r.ownership === "Leased"
        ? (r.supplierName || r.supplier_Name || "Supplier Asset")
        : (r.fixedAssetName || r.fixedAsset_Name || `Internal Asset #${String(r.id || idx + 1).substring(0, 4)}`);

      return {
        id: r.id || idx + 1,
        code: r.referenceNumber || r.code || `RES-${String(r.id || idx + 1).substring(0, 6)}`,
        name: r.name || r.resource_Name || "Unnamed Resource",
        fullName: r.name || r.resource_Name || "Unnamed Resource",
        address: r.address || r.location || "Main Facility",
        fullAddress: r.address || r.location || "Main Facility",
        capacity: String(capacityVal),
        numericCapacity: capacityVal,
        ownership: ownershipLabel,
        fullOwnership: ownershipLabel,
        rawOwnership: r.ownership || "Owned",
        supplierAsset: supplierAssetLabel,
        supplierAssetName: supplierAssetLabel,
        supplierId: r.supplierId,
        fixedAssetId: r.fixedAssetId,
        status: r.status || (r.isActive ? "Active" : "OutOfService"),
        isActive: r.isActive ?? true,
        dailyRentalCost: r.dailyRentalCost ?? 0,
        contractStartDate: r.contractStartDate ? new Date(r.contractStartDate).toISOString().split("T")[0] : "",
        contractEndDate: r.contractEndDate ? new Date(r.contractEndDate).toISOString().split("T")[0] : "",
        notes: r.notes || "",
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

    const capacityVal = r.maxCapacity ?? r.capacity ?? 20;
    const ownershipLabel = r.ownership === "Leased" ? "Rented" : (r.ownership || "Owned");
    const supplierAssetLabel = r.ownership === "Leased"
      ? (r.supplierName || r.supplier_Name || "Supplier Asset")
      : (r.fixedAssetName || r.fixedAsset_Name || `Internal Asset #${String(id).substring(0, 4)}`);

    return {
      status: 200,
      data: {
        id: r.id || id,
        code: r.referenceNumber || r.code || `RES-${String(id).substring(0, 8)}`,
        name: r.name || r.resource_Name || "Resource",
        fullName: r.name || r.resource_Name || "Resource",
        address: r.address || r.location || "Main Facility",
        fullAddress: r.address || r.location || "Main Facility",
        capacity: String(capacityVal),
        numericCapacity: capacityVal,
        ownership: ownershipLabel,
        fullOwnership: ownershipLabel,
        rawOwnership: r.ownership || "Owned",
        supplierAsset: supplierAssetLabel,
        supplierAssetName: supplierAssetLabel,
        supplierId: r.supplierId || "",
        supplierName: r.supplierName || "",
        fixedAssetId: r.fixedAssetId || "",
        fixedAssetName: r.fixedAssetName || "",
        status: r.status || (r.isActive ? "Active" : "OutOfService"),
        isActive: r.isActive ?? true,
        dailyRentalCost: r.dailyRentalCost ?? 0,
        contractStartDate: r.contractStartDate ? new Date(r.contractStartDate).toISOString().split("T")[0] : "",
        contractEndDate: r.contractEndDate ? new Date(r.contractEndDate).toISOString().split("T")[0] : "",
        notes: r.notes || "Primary facility venue for clinical symposiums and operations.",
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
  const isLeased = data.ownership === "Leased" || data.ownership === "Rented";

  const payload = {
    name: data.name,
    referenceNumber: data.referenceNumber || data.code || `RES-${Date.now().toString().slice(-4)}`,
    maxCapacity: Number(data.capacity || data.maxCapacity) || 20,
    ownership: isLeased ? "Leased" : "Owned",
    supplierId: isLeased && data.supplierId ? data.supplierId : null,
    contractStartDate: isLeased && data.contractStartDate ? new Date(data.contractStartDate).toISOString() : null,
    contractEndDate: isLeased && data.contractEndDate ? new Date(data.contractEndDate).toISOString() : null,
    dailyRentalCost: isLeased && data.dailyRentalCost ? Number(data.dailyRentalCost) : null,
  };

  const res = await apiHandler({
    endPoint: "inventory/Resource/Create",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Resource created successfully",
  };
}

/**
 * Update Existing Resource
 * Endpoint: POST /api/inventory/Resource/Update
 */
export async function updateResource(id, data) {
  const isLeased = data.ownership === "Leased" || data.ownership === "Rented";

  const payload = {
    id: id,
    name: data.name,
    referenceNumber: data.referenceNumber || data.code || `RES-${String(id).slice(0, 6)}`,
    maxCapacity: Number(data.capacity || data.maxCapacity) || 20,
    ownership: isLeased ? "Leased" : "Owned",
    fixedAssetId: !isLeased && data.fixedAssetId ? data.fixedAssetId : null,
    supplierId: isLeased && data.supplierId ? data.supplierId : null,
    contractStartDate: isLeased && data.contractStartDate ? new Date(data.contractStartDate).toISOString() : null,
    contractEndDate: isLeased && data.contractEndDate ? new Date(data.contractEndDate).toISOString() : null,
    dailyRentalCost: isLeased && data.dailyRentalCost ? Number(data.dailyRentalCost) : null,
  };

  const res = await apiHandler({
    endPoint: "inventory/Resource/Update",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Resource updated successfully",
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

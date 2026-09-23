import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Resources matching Figma
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

export const INITIAL_RESOURCES_LIST = [
  {
    id: 1,
    code: "RES-2026-001",
    name: "Name",
    fullName: "Conference Hall A",
    address: "Address",
    fullAddress: "Building 3, Floor 2, Main Campus",
    capacity: "Capacity",
    numericCapacity: 20,
    ownership: "Ownership",
    fullOwnership: "Rented",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Al-Amal Real Estate Asset #101",
    status: "Rented",
    fixedAsset: "Asset #101 - Conference Hall",
    notes: "Primary venue for clinical symposiums and seminars.",
  },
  {
    id: 2,
    code: "RES-2026-002",
    name: "Name",
    fullName: "Auditorium 2",
    address: "Address",
    fullAddress: "North Wing, Floor 1",
    capacity: "Capacity",
    numericCapacity: 50,
    ownership: "Ownership",
    fullOwnership: "Owned",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Hospital Fixed Asset #204",
    status: "Rented",
    fixedAsset: "Asset #204 - Main Auditorium",
    notes: "Tiered seating auditorium equipped with 4K projection.",
  },
  {
    id: 3,
    code: "RES-2026-003",
    name: "Name",
    fullName: "Lab Room 4",
    address: "Address",
    fullAddress: "Clinical Training Center, Room 402",
    capacity: "Capacity",
    numericCapacity: 15,
    ownership: "Ownership",
    fullOwnership: "Rented",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Medical Tech Leasing #305",
    status: "Rented",
    fixedAsset: "Asset #305 - Simulation Lab",
    notes: "Simulation workstations with compressed air and dental units.",
  },
  {
    id: 4,
    code: "RES-2026-004",
    name: "Name",
    fullName: "Grand Ballroom",
    address: "Address",
    fullAddress: "Palace Hotel & Convention Center",
    capacity: "Capacity",
    numericCapacity: 200,
    ownership: "Ownership",
    fullOwnership: "Rented",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Palace Hospitality Group",
    status: "Rented",
    fixedAsset: "Asset #401 - External Ballroom",
    notes: "Annual gala and large congress partner facility.",
  },
  {
    id: 5,
    code: "RES-2026-005",
    name: "Name",
    fullName: "Seminar Room B",
    address: "Address",
    fullAddress: "East Tower, Floor 3",
    capacity: "Capacity",
    numericCapacity: 25,
    ownership: "Ownership",
    fullOwnership: "Owned",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Hospital Fixed Asset #108",
    status: "Rented",
    fixedAsset: "Asset #108 - Seminar Suite",
    notes: "Interactive workshop layout with modular conference tables.",
  },
  {
    id: 6,
    code: "RES-2026-006",
    name: "Name",
    fullName: "Studio 1 - Photography",
    address: "Address",
    fullAddress: "Media Center, Suite 10",
    capacity: "Capacity",
    numericCapacity: 10,
    ownership: "Ownership",
    fullOwnership: "Rented",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Creative Studio Rentals",
    status: "Rented",
    fixedAsset: "Asset #501 - Studio Equipment",
    notes: "Professional studio lighting and facial scanner booth.",
  },
  {
    id: 7,
    code: "RES-2026-007",
    name: "Name",
    fullName: "Simulation Lab 3",
    address: "Address",
    fullAddress: "Academy Building, Floor 2",
    capacity: "Capacity",
    numericCapacity: 30,
    ownership: "Ownership",
    fullOwnership: "Owned",
    supplierAsset: "Supplier / Asset",
    supplierAssetName: "Internal Asset #312",
    status: "Rented",
    fixedAsset: "Asset #312 - Simulation Lab 3",
    notes: "Microscopes and phantom heads for endodontic practice.",
  },
];

// Memory store for dynamic CRUD operations
let memoryResources = [...INITIAL_RESOURCES_LIST];

// ==========================================
// Service API Functions
// ==========================================

export async function getResourcesStats() {
  return {
    status: 200,
    data: INITIAL_RESOURCES_STATS,
  };
}

export async function getResources(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 10,
    SearchTerm,
    Status,
    Ownership,
  } = params;

  let filtered = [...memoryResources];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        String(r.id).includes(term) ||
        r.name?.toLowerCase().includes(term) ||
        r.fullName?.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term) ||
        r.fullAddress?.toLowerCase().includes(term) ||
        r.ownership?.toLowerCase().includes(term) ||
        r.supplierAsset?.toLowerCase().includes(term)
    );
  }

  if (Status && Status.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (r) => r.status?.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Ownership && Ownership.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (r) =>
        r.ownership?.toLowerCase() === Ownership.toLowerCase() ||
        r.fullOwnership?.toLowerCase() === Ownership.toLowerCase()
    );
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PageSize) || 1;
  const startIndex = (PageNumber - 1) * PageSize;
  const items = filtered.slice(startIndex, startIndex + PageSize);

  return {
    status: 200,
    data: {
      items,
      totalCount,
      totalPages,
      pageNumber: PageNumber,
      pageSize: PageSize,
    },
  };
}

export async function getResourceById(id) {
  const resource = memoryResources.find((r) => String(r.id) === String(id));
  if (!resource) {
    return {
      status: 200,
      data: {
        id: Number(id) || 1,
        code: "RES-2026-001",
        name: "Name",
        fullName: "Conference Hall A",
        address: "Address",
        fullAddress: "Building 3, Floor 2",
        capacity: "Capacity",
        numericCapacity: 20,
        ownership: "Ownership",
        fullOwnership: "Rented",
        supplierAsset: "Supplier / Asset",
        supplierAssetName: "Al-Amal Real Estate Asset #101",
        status: "Active",
        fixedAsset: "Fixed Asset",
        notes: "Primary venue for clinical symposiums and seminars.",
      },
    };
  }
  return {
    status: 200,
    data: resource,
  };
}

export async function createResource(payload) {
  const newId = memoryResources.length > 0 ? Math.max(...memoryResources.map((r) => r.id)) + 1 : 1;
  const newResource = {
    id: newId,
    code: `RES-2026-${String(newId).padStart(3, "0")}`,
    name: payload.name || "Name",
    fullName: payload.name || "Resource Name",
    address: payload.address || "Address",
    fullAddress: payload.address || "Main Address",
    capacity: payload.capacity ? String(payload.capacity) : "Capacity",
    numericCapacity: Number(payload.capacity) || 0,
    ownership: payload.ownership || "Ownership",
    fullOwnership: payload.ownership || "Owned",
    supplierAsset: payload.supplierAsset || payload.fixedAsset || "Supplier / Asset",
    supplierAssetName: payload.fixedAsset || "Asset #101",
    status: payload.status || "Rented",
    fixedAsset: payload.fixedAsset || "Fixed Asset",
    notes: payload.notes || "",
  };

  memoryResources = [newResource, ...memoryResources];
  return {
    status: 200,
    data: newResource,
    message: "Resource created successfully!",
  };
}

export async function updateResource(id, payload) {
  const index = memoryResources.findIndex((r) => String(r.id) === String(id));
  if (index !== -1) {
    memoryResources[index] = {
      ...memoryResources[index],
      ...payload,
      numericCapacity: payload.capacity !== undefined ? Number(payload.capacity) : memoryResources[index].numericCapacity,
    };
    return {
      status: 200,
      data: memoryResources[index],
      message: "Resource updated successfully!",
    };
  }
  return {
    status: 200,
    message: "Resource updated!",
  };
}

export async function deleteResource(id) {
  memoryResources = memoryResources.filter((r) => String(r.id) !== String(id));
  return {
    status: 200,
    data: { success: true },
    message: "Resource deleted successfully!",
  };
}

export async function changeResourceStatus({ id, status }) {
  const item = memoryResources.find((r) => String(r.id) === String(id));
  if (item) {
    item.status = status;
  }
  return {
    status: 200,
    data: { id, status },
    message: "Resource status updated successfully!",
  };
}

export async function getResourceLookups() {
  return {
    status: 200,
    data: {
      addresses: [
        { id: "addr-1", name: "Building 3, Floor 2, Main Campus" },
        { id: "addr-2", name: "North Wing, Floor 1" },
        { id: "addr-3", name: "Clinical Training Center, Room 402" },
        { id: "addr-4", name: "Palace Hotel & Convention Center" },
      ],
      ownerships: [
        { id: "owned", name: "Owned" },
        { id: "rented", name: "Rented" },
        { id: "leased", name: "Leased" },
      ],
      fixedAssets: [
        { id: "asset-101", name: "Asset #101 - Conference Hall" },
        { id: "asset-204", name: "Asset #204 - Main Auditorium" },
        { id: "asset-305", name: "Asset #305 - Simulation Lab" },
        { id: "asset-401", name: "Asset #401 - External Ballroom" },
      ],
      statuses: ["Active", "Rented", "Maintenance", "Inactive"],
    },
  };
}

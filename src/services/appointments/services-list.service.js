import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Services
// ==========================================

export const INITIAL_SERVICES_STATS = [
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
    color: "bg-[#0b386a]",
    icon: Building2,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#ff9548]",
    icon: UsersIcon,
  },
];

export const INITIAL_SERVICES_LIST = [
  {
    id: 1,
    name: "Dental Cleaning",
    category: "Dental",
    billingMethod: "per-visit",
    duration: "45 min",
    defaultDuration: 45,
    defaultInsuranceQty: 1,
    cost: "$35",
    costPrice: 35,
    price: "$120",
    consumerPrice: 120,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Dental Services Revenue",
    expenseAccount: "Medical Supplies Expense",
  },
  {
    id: 2,
    name: "General Consultation",
    category: "Consultation",
    billingMethod: "per-visit",
    duration: "30 min",
    defaultDuration: 30,
    defaultInsuranceQty: 1,
    cost: "$20",
    costPrice: 20,
    price: "$60",
    consumerPrice: 60,
    contract: "-",
    requiresContract: false,
    canBeSold: true,
    isActive: true,
    revenueAccount: "General Medical Revenue",
    expenseAccount: "General Medical Expense",
  },
  {
    id: 3,
    name: "Dermatology Screening",
    category: "Dermatology",
    billingMethod: "per-visit",
    duration: "45 min",
    defaultDuration: 45,
    defaultInsuranceQty: 1,
    cost: "$50",
    costPrice: 50,
    price: "$150",
    consumerPrice: 150,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Dermatology Revenue",
    expenseAccount: "Dermatology Supplies Expense",
  },
  {
    id: 4,
    name: "Physiotherapy Session",
    category: "Physical Therapy",
    billingMethod: "per-visit",
    duration: "60 min",
    defaultDuration: 60,
    defaultInsuranceQty: 5,
    cost: "$30",
    costPrice: 30,
    price: "$80",
    consumerPrice: 80,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Therapy Revenue",
    expenseAccount: "Therapy Supplies Expense",
  },
  {
    id: 5,
    name: "Eye Examination",
    category: "Ophthalmology",
    billingMethod: "per-visit",
    duration: "30 min",
    defaultDuration: 30,
    defaultInsuranceQty: 1,
    cost: "$25",
    costPrice: 25,
    price: "$75",
    consumerPrice: 75,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Optical Revenue",
    expenseAccount: "Optical Supplies Expense",
  },
  {
    id: 6,
    name: "Blood Test Analysis",
    category: "Laboratory",
    billingMethod: "per-visit",
    duration: "15 min",
    defaultDuration: 15,
    defaultInsuranceQty: 1,
    cost: "$40",
    costPrice: 40,
    price: "$95",
    consumerPrice: 95,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Lab Revenue",
    expenseAccount: "Lab Reagents Expense",
  },
  {
    id: 7,
    name: "Cardiology Review",
    category: "Cardiology",
    billingMethod: "per-visit",
    duration: "45 min",
    defaultDuration: 45,
    defaultInsuranceQty: 1,
    cost: "$70",
    costPrice: 70,
    price: "$200",
    consumerPrice: 200,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Specialist Revenue",
    expenseAccount: "Specialist Medical Expense",
  },
  {
    id: 8,
    name: "Teeth Whitening",
    category: "Dental",
    billingMethod: "per-visit",
    duration: "60 min",
    defaultDuration: 60,
    defaultInsuranceQty: 0,
    cost: "$60",
    costPrice: 60,
    price: "$250",
    consumerPrice: 250,
    contract: "Required",
    requiresContract: true,
    canBeSold: true,
    isActive: true,
    revenueAccount: "Dental Services Revenue",
    expenseAccount: "Dental Materials Expense",
  },
];

export const SERVICE_LOOKUPS = {
  categories: [
    { id: "1", label: "Dental", value: "Dental" },
    { id: "2", label: "Consultation", value: "Consultation" },
    { id: "3", label: "Dermatology", value: "Dermatology" },
    { id: "4", label: "Physical Therapy", value: "Physical Therapy" },
    { id: "5", label: "Ophthalmology", value: "Ophthalmology" },
    { id: "6", label: "Laboratory", value: "Laboratory" },
    { id: "7", label: "Cardiology", value: "Cardiology" },
  ],
  billingMethods: [
    { label: "per-visit", value: "per-visit" },
    { label: "hourly", value: "hourly" },
    { label: "fixed", value: "fixed" },
    { label: "subscription", value: "subscription" },
  ],
  revenueAccounts: [
    { label: "Dental Services Revenue", value: "Dental Services Revenue" },
    { label: "General Medical Revenue", value: "General Medical Revenue" },
    { label: "Dermatology Revenue", value: "Dermatology Revenue" },
    { label: "Therapy Revenue", value: "Therapy Revenue" },
    { label: "Optical Revenue", value: "Optical Revenue" },
    { label: "Lab Revenue", value: "Lab Revenue" },
    { label: "Specialist Revenue", value: "Specialist Revenue" },
  ],
  expenseAccounts: [
    { label: "Medical Supplies Expense", value: "Medical Supplies Expense" },
    { label: "General Medical Expense", value: "General Medical Expense" },
    { label: "Dermatology Supplies Expense", value: "Dermatology Supplies Expense" },
    { label: "Therapy Supplies Expense", value: "Therapy Supplies Expense" },
    { label: "Optical Supplies Expense", value: "Optical Supplies Expense" },
    { label: "Lab Reagents Expense", value: "Lab Reagents Expense" },
    { label: "Specialist Medical Expense", value: "Specialist Medical Expense" },
    { label: "Dental Materials Expense", value: "Dental Materials Expense" },
  ],
};

let storeServices = [...INITIAL_SERVICES_LIST];

// ==========================================
// Service Methods: Services List & Add/Edit
// ==========================================

export async function getServicesStats() {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Services/GetStats", method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: INITIAL_SERVICES_STATS,
        status: 200,
        message: "Stats retrieved successfully",
      });
    }, 150);
  });
}

export async function getServices(params = {}) {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Services/GetAll", method: "GET", params });

  return new Promise((resolve) => {
    setTimeout(() => {
      const {
        SearchTerm = "",
        Category = "all",
        PageNumber = 1,
        PageSize = 10,
      } = params;

      let filtered = [...storeServices];

      if (Category && Category !== "all") {
        filtered = filtered.filter((item) => item.category === Category);
      }
      if (SearchTerm) {
        const query = SearchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            String(item.id).includes(query) ||
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.billingMethod.toLowerCase().includes(query)
        );
      }

      const totalCount = filtered.length;
      const totalPages = Math.ceil(totalCount / PageSize) || 1;
      const start = (PageNumber - 1) * PageSize;
      const items = filtered.slice(start, start + PageSize);

      resolve({
        data: {
          items,
          totalPages,
          totalCount,
          pageNumber: PageNumber,
          pageSize: PageSize,
        },
        status: 200,
        message: "Services retrieved successfully",
      });
    }, 150);
  });
}

export async function getServiceById(id) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Services/GetById/${id}`, method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      const found = storeServices.find((s) => String(s.id) === String(id));
      resolve({
        data: found || storeServices[0] || INITIAL_SERVICES_LIST[0],
        status: 200,
        message: "Service retrieved successfully",
      });
    }, 150);
  });
}

export async function createService(payload) {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Services/Create", method: "POST", data: payload });

  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = storeServices.length
        ? Math.max(...storeServices.map((s) => s.id)) + 1
        : 1;
      const newRecord = {
        id: newId,
        duration: `${payload.defaultDuration || 0} min`,
        cost: `$${payload.costPrice || 0}`,
        price: `$${payload.consumerPrice || 0}`,
        contract: payload.requiresContract ? "Required" : "-",
        ...payload,
      };
      storeServices = [newRecord, ...storeServices];
      resolve({
        data: newRecord,
        status: 201,
        message: "Service created successfully",
      });
    }, 200);
  });
}

export async function updateService(id, payload) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Services/Update/${id}`, method: "PUT", data: payload });

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = storeServices.findIndex((s) => String(s.id) === String(id));
      if (index !== -1) {
        storeServices[index] = {
          ...storeServices[index],
          ...payload,
          duration: `${payload.defaultDuration ?? storeServices[index].defaultDuration} min`,
          cost: `$${payload.costPrice ?? storeServices[index].costPrice}`,
          price: `$${payload.consumerPrice ?? storeServices[index].consumerPrice}`,
          contract: payload.requiresContract !== undefined
            ? (payload.requiresContract ? "Required" : "-")
            : storeServices[index].contract,
        };
        resolve({
          data: storeServices[index],
          status: 200,
          message: "Service updated successfully",
        });
      } else {
        resolve({
          data: payload,
          status: 200,
          message: "Service updated successfully",
        });
      }
    }, 200);
  });
}

export async function deleteService(id) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Services/Delete/${id}`, method: "DELETE" });

  return new Promise((resolve) => {
    setTimeout(() => {
      storeServices = storeServices.filter((s) => String(s.id) !== String(id));
      resolve({
        status: 200,
        message: "Service deleted successfully",
      });
    }, 150);
  });
}

export async function getServiceLookups() {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Services/GetLookups", method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: SERVICE_LOOKUPS,
        status: 200,
        message: "Lookups retrieved successfully",
      });
    }, 100);
  });
}

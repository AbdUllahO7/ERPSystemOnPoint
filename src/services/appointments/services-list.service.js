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

export const INITIAL_SERVICES_LIST = [];

export const SERVICE_LOOKUPS = {
  categories: [
    { label: "Dental", value: "Dental" },
    { label: "Consultation", value: "Consultation" },
    { label: "Dermatology", value: "Dermatology" },
    { label: "Therapy", value: "Therapy" },
    { label: "Optometry", value: "Optometry" },
    { label: "Laboratory", value: "Laboratory" },
    { label: "Cardiology", value: "Cardiology" },
  ],
  billingMethods: [
    { label: "Per Visit", value: "per-visit" },
    { label: "Hourly", value: "hourly" },
    { label: "Package", value: "package" },
  ],
  revenueAccounts: [
    { label: "Dental Services Revenue", value: "Dental Services Revenue" },
    { label: "General Medical Revenue", value: "General Medical Revenue" },
    { label: "Dermatology Revenue", value: "Dermatology Revenue" },
    { label: "Physiotherapy Revenue", value: "Physiotherapy Revenue" },
    { label: "Laboratory Revenue", value: "Laboratory Revenue" },
    { label: "Cardiology Revenue", value: "Cardiology Revenue" },
  ],
  expenseAccounts: [
    { label: "Medical Supplies Expense", value: "Medical Supplies Expense" },
    { label: "General Medical Expense", value: "General Medical Expense" },
    { label: "Dermatology Supplies Expense", value: "Dermatology Supplies Expense" },
    { label: "Therapy Equipment Expense", value: "Therapy Equipment Expense" },
    { label: "Lab Reagents Expense", value: "Lab Reagents Expense" },
    { label: "Cardiology Supplies Expense", value: "Cardiology Supplies Expense" },
  ],
};

export async function getServicesStats() {
  return {
    status: 200,
    data: INITIAL_SERVICES_STATS,
  };
}

// ==========================================
// Service API Methods
// ==========================================

export async function getServices(params = {}) {
  try {
    const res = await apiHandler({
      endPoint: "Inventory/Product/GetAll/GetAll",
      method: "GET",
      params: {
        PageNumber: params.PageNumber || params.page || 1,
        PageSize: params.PageSize || params.pageSize || 10,
        SearchTerm: params.SearchTerm || params.search || undefined,
        Category: params.Category !== "all" ? params.Category : undefined,
        BillingMethod: params.BillingMethod !== "all" ? params.BillingMethod : undefined,
        RequiresContract: params.RequiresContract !== "all"
          ? params.RequiresContract === "yes"
          : undefined,
        Status: params.Status !== "all" ? params.Status : undefined,
      },
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((s, idx) => {
      const primaryPrice = (Array.isArray(s.prices) && s.prices.length > 0)
        ? s.prices[0]
        : (s.consumer_Price ?? s.cost_Price ?? s.consumerPrice ?? s.price ?? 0);

      const displayPrice = typeof primaryPrice === "number" 
        ? `$${primaryPrice}` 
        : (String(primaryPrice).startsWith("$") ? primaryPrice : `$${primaryPrice}`);

      const primaryUnit = (Array.isArray(s.units) && s.units.length > 0)
        ? s.units[0]
        : (s.billing_Method || s.billingMethod || "per-visit");

      const categoryName = s.category_name || s.categoryName || s.category?.name || s.category || "General Service";

      return {
        id: s.id || idx + 1,
        name: s.name_Product || s.name || `Service ${idx + 1}`,
        productNumber: s.product_Number || s.productNumber || "-",
        productType: s.product_Type || s.productType || "Service",
        category: categoryName,
        billingMethod: primaryUnit,
        units: s.units || [primaryUnit],
        prices: s.prices || [primaryPrice],
        duration: s.default_Duration_Minutes ? `${s.default_Duration_Minutes} min` : "30 min",
        defaultDuration: s.default_Duration_Minutes || 30,
        cost: s.cost_Price !== undefined ? `$${s.cost_Price}` : (s.prices && s.prices[1] !== undefined ? `$${s.prices[1]}` : "-"),
        costPrice: s.cost_Price ?? (s.prices && s.prices[1]) ?? 0,
        price: displayPrice,
        consumerPrice: primaryPrice,
        contract: s.requires_Contract || s.requiresContract ? "Required" : "-",
        requiresContract: Boolean(s.requires_Contract || s.requiresContract),
        canBeSold: Boolean(s.can_Be_Sold ?? s.canBeSold ?? true),
        isActive: s.is_Active ?? s.isActive ?? true,
        revenueAccount: s.revenueAccount || "-",
        expenseAccount: s.expenseAccount || "-",
        raw: s,
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
    console.error("Failed to fetch services from API:", err);
    throw err;
  }
}

export async function getServiceById(id) {
  try {
    const res = await apiHandler({
      endPoint: `Inventory/Product/GetById/GetById/${id}`,
      method: "GET",
    });

    const s = res?.data || res || {};
    
    // Check variant / prices / units if any
    const variant = Array.isArray(s.productVariantDtos) && s.productVariantDtos.length > 0 ? s.productVariantDtos[0] : null;

    const consumerPrice = (Array.isArray(s.prices) && s.prices.length > 0)
      ? s.prices[0]
      : (s.consumer_Price ?? s.consumerPrice ?? variant?.consumer_Price ?? s.price ?? 0);

    const costPrice = (Array.isArray(s.prices) && s.prices.length > 1)
      ? s.prices[1]
      : (s.cost_Price ?? s.costPrice ?? variant?.cost_Price ?? 0);

    const billingMethod = s.billing_Method || s.billingMethod || (Array.isArray(s.units) && s.units.length > 0 ? s.units[0] : "") || "per-visit";
    const category = s.category_Id || s.categoryId || s.category_name || s.categoryName || s.category || "";

    return {
      status: 200,
      data: {
        id: s.id || id,
        name: s.name_Product || s.name || "",
        category: category,
        billingMethod: billingMethod,
        defaultDuration: s.default_Duration_Minutes || s.defaultDuration || 30,
        defaultInsuranceQty: s.default_Deposit_Amount || s.defaultInsuranceQty || 0,
        costPrice: Number(costPrice) || 0,
        consumerPrice: Number(consumerPrice) || 0,
        requiresContract: Boolean(s.requires_Contract ?? s.requiresContract ?? false),
        canBeSold: Boolean(s.can_Be_Sold ?? s.canBeSold ?? true),
        isActive: Boolean(s.is_Active ?? s.isActive ?? true),
        revenueAccount: s.revenue_Account_Id || s.revenueAccount || "",
        expenseAccount: s.expense_Account_Id || s.expenseAccount || "",
        raw: s,
      },
    };
  } catch (err) {
    console.error(`Failed to get service with id ${id}:`, err);
    throw err;
  }
}

export async function createService(payload) {
  try {
    const res = await apiHandler({
      endPoint: "Inventory/Product/CreateAppointmentService/appointment-service",
      method: "POST",
      body: {
        name_Product: payload.name,
        product_Number: payload.productNumber || `SRV-${Date.now()}`,
        has_Expiry_Date: false,
        category_Id: payload.category || undefined,
        can_Be_Sold: payload.canBeSold ?? true,
        requires_Contract: payload.requiresContract ?? false,
        default_Deposit_Amount: Number(payload.defaultInsuranceQty || 0),
        default_Duration_Minutes: Number(payload.defaultDuration || 30),
        has_Variants: false,
        revenue_Account_Id: payload.revenueAccount || undefined,
        expense_Account_Id: payload.expenseAccount || undefined,
        billing_Method: payload.billingMethod || "per-visit",
        cost_Price: Number(payload.costPrice || 0),
        consumer_Price: Number(payload.consumerPrice || 0),
      },
    });

    return {
      status: 201,
      data: res?.data || res,
      message: "Service created successfully",
    };
  } catch (err) {
    console.error("Failed to create service:", err);
    throw err;
  }
}

export async function updateService(id, payload) {
  try {
    const res = await apiHandler({
      endPoint: "Inventory/Product/UpdateProductService/service",
      method: "POST",
      body: {
        id,
        name_Product: payload.name,
        category_Id: payload.category || undefined,
        can_Be_Sold: payload.canBeSold ?? true,
        requires_Contract: payload.requiresContract ?? false,
        default_Deposit_Amount: Number(payload.defaultInsuranceQty || 0),
        default_Duration_Minutes: Number(payload.defaultDuration || 30),
        revenue_Account_Id: payload.revenueAccount || undefined,
        expense_Account_Id: payload.expenseAccount || undefined,
        billing_Method: payload.billingMethod || "per-visit",
        cost_Price: Number(payload.costPrice || 0),
        consumer_Price: Number(payload.consumerPrice || 0),
      },
    });

    return {
      status: 200,
      data: res?.data || res,
      message: "Service updated successfully",
    };
  } catch (err) {
    console.error(`Failed to update service ${id}:`, err);
    throw err;
  }
}

export async function deleteService(id) {
  try {
    const res = await apiHandler({
      endPoint: `Inventory/Product/ToggleStatus`,
      method: "POST",
      params: { id },
    });
    return {
      status: 200,
      data: res,
      message: "Service deleted/toggled successfully",
    };
  } catch (err) {
    console.error(`Failed to delete service ${id}:`, err);
    throw err;
  }
}

export async function getServiceLookups() {
  try {
    const [categoriesRes, accountsRes] = await Promise.allSettled([
      apiHandler({ endPoint: "inventory/Categories/GetAllCategories", method: "GET", params: { PageSize: 100 } }),
      apiHandler({ endPoint: "account/Accounts/GetAllAccountsFlat/flat", method: "GET", params: { PageSize: 100 } }),
    ]);

    const categoriesRaw = categoriesRes.status === "fulfilled" ? (categoriesRes.value?.data?.items || categoriesRes.value?.data || []) : [];
    const accountsRaw = accountsRes.status === "fulfilled" ? (accountsRes.value?.data?.items || accountsRes.value?.data || []) : [];

    const categories = categoriesRaw.map((c) => ({
      id: c.id,
      label: c.name || c.categoryName || "Category",
      value: c.id || c.name,
    }));

    const accounts = accountsRaw.map((a) => ({
      id: a.id,
      label: `${a.accountNumber ? a.accountNumber + " - " : ""}${a.accountName || a.name || "Account"}`,
      value: a.id || a.accountName || a.name,
    }));

    return {
      status: 200,
      data: {
        categories: categories.length > 0 ? categories : SERVICE_LOOKUPS.categories,
        billingMethods: [
          { label: "Per Visit (خدمة مقطوعة)", value: "خدمة مقطوعة" },
          { label: "Hourly (ساعة)", value: "ساعة" },
          { label: "Project (مشروع)", value: "مشروع" },
          { label: "Per Visit", value: "per-visit" },
          { label: "Hourly", value: "hourly" },
          { label: "Package", value: "package" },
        ],
        revenueAccounts: accounts.length > 0 ? accounts : SERVICE_LOOKUPS.revenueAccounts,
        expenseAccounts: accounts.length > 0 ? accounts : SERVICE_LOOKUPS.expenseAccounts,
      },
    };
  } catch (err) {
    console.error("Error loading service lookups:", err);
    return {
      status: 200,
      data: SERVICE_LOOKUPS,
    };
  }
}

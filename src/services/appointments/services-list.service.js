import { apiHandler } from "@/lib/api-handler";
import {
  updateSimpleProductWithoutSpecs,
  updateAssemblyWithoutSpecs,
  updateBundleWithoutSpecs,
  updateSimpleProductWithSpecs,
  updateAppointmentProduct,
  updateReservationProduct,
  updateRentalProduct,
} from "@/services/inventory/inventory.service";
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

// ==========================================
// Billing Methods & Helper Utilities
// ==========================================

export const VALID_BILLING_METHODS = [
  "FixedPrice",
  "Hourly",
  "Daily",
  "Monthly",
  "QuantityBased",
];

export const BILLING_METHODS = [
  { label: "Fixed Price", labelAr: "سعر ثابت", value: "FixedPrice" },
  { label: "Hourly", labelAr: "بالساعة", value: "Hourly" },
  { label: "Daily", labelAr: "باليوم", value: "Daily" },
  { label: "Monthly", labelAr: "شهري", value: "Monthly" },
  { label: "Quantity Based", labelAr: "حسب الكمية", value: "QuantityBased" },
];

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function toGuidOrNull(val) {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

export function normalizeBillingMethod(val) {
  if (!val) return "FixedPrice";
  const str = String(val).trim();
  const lower = str.toLowerCase();

  if (
    lower === "fixedprice" ||
    lower === "fixed" ||
    lower === "per-visit" ||
    lower === "package" ||
    lower === "project" ||
    lower.includes("مقطوع") ||
    lower.includes("ثابت")
  ) {
    return "FixedPrice";
  }
  if (lower === "hourly" || lower === "hour" || lower.includes("ساعة")) {
    return "Hourly";
  }
  if (lower === "daily" || lower === "day" || lower.includes("يوم")) {
    return "Daily";
  }
  if (lower === "monthly" || lower === "month" || lower.includes("شهر")) {
    return "Monthly";
  }
  if (lower === "quantitybased" || lower === "quantity" || lower.includes("كمية")) {
    return "QuantityBased";
  }

  const matched = VALID_BILLING_METHODS.find((m) => m.toLowerCase() === lower);
  return matched || "FixedPrice";
}

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
  billingMethods: BILLING_METHODS,
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
        ProductType: "Appointment",
        PageNumber: params.PageNumber || params.page || 1,
        PageSize: params.PageSize || params.pageSize || 10,
        SearchTerm: params.SearchTerm || params.search || undefined,
        Category: params.Category !== "all" ? params.Category : undefined,
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

      const unitName = (Array.isArray(s.units) && s.units.length > 0)
        ? s.units[0]
        : "—";

      const categoryName = s.category_name || s.categoryName || s.category?.name || s.category || "—";
      const createdDate = s.created_At ? s.created_At.split("T")[0] : "—";

      return {
        id: s.id || idx + 1,
        name_Product: s.name_Product || s.name || `Service ${idx + 1}`,
        name: s.name_Product || s.name || `Service ${idx + 1}`,
        product_Number: s.product_Number || s.productNumber || "—",
        productNumber: s.product_Number || s.productNumber || "—",
        product_Type: s.product_Type || s.productType || "Appointment",
        productType: s.product_Type || s.productType || "Appointment",
        is_Active: Boolean(s.is_Active ?? s.isActive ?? true),
        isActive: Boolean(s.is_Active ?? s.isActive ?? true),
        category_name: categoryName,
        category: categoryName,
        units: s.units || (unitName !== "—" ? [unitName] : []),
        unit: unitName,
        prices: s.prices || (primaryPrice !== undefined ? [primaryPrice] : []),
        price: primaryPrice !== undefined ? `$${primaryPrice}` : "—",
        priceValue: primaryPrice,
        created_At: s.created_At,
        createdDate: createdDate,
        variant_Ids: s.variant_Ids || [],
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

    const s = res?.data?.data || res?.data || res || {};
    
    // Check variant / prices / units from variants array or productVariantDtos
    const variantsList = Array.isArray(s.variants) ? s.variants : (Array.isArray(s.productVariantDtos) ? s.productVariantDtos : []);
    const variant = variantsList.length > 0 ? variantsList[0] : null;

    // Unit DTOs inside variant
    const unitDtos = Array.isArray(variant?.productUnitDtos) ? variant.productUnitDtos : [];
    const firstUnit = unitDtos.length > 0 ? unitDtos[0] : null;

    const consumerPrice = firstUnit?.consumer_Price ?? firstUnit?.consumerPrice
      ?? ((Array.isArray(s.prices) && s.prices.length > 0) ? s.prices[0] : null)
      ?? s.consumer_Price ?? s.consumerPrice ?? variant?.consumer_Price ?? s.price ?? 0;

    const costPrice = firstUnit?.cost_Price ?? firstUnit?.costPrice
      ?? ((Array.isArray(s.prices) && s.prices.length > 1) ? s.prices[1] : null)
      ?? s.cost_Price ?? s.costPrice ?? variant?.cost_Price ?? 0;

    const billingMethod = normalizeBillingMethod(
      s.billing_Method || s.billingMethod 
      || firstUnit?.unit_name || firstUnit?.unitName 
      || (Array.isArray(s.units) && s.units.length > 0 ? s.units[0] : "") || "FixedPrice"
    );
    
    const category = s.category_Id || s.categoryId || s.category_name || s.categoryName || s.category || "";
    const categoryName = s.category_Name || s.category_name || s.categoryName || "";

    return {
      status: 200,
      data: {
        id: s.id || id,
        name: s.name_Product || s.name || "",
        productNumber: s.product_Number || s.productNumber || "",
        category: category,
        categoryName: categoryName,
        billingMethod: billingMethod,
        defaultDuration: s.default_Duration_Minutes ?? s.defaultDuration ?? 30,
        defaultInsuranceQty: s.default_Deposit_Amount ?? s.defaultInsuranceQty ?? 0,
        costPrice: Number(costPrice) || 0,
        consumerPrice: Number(consumerPrice) || 0,
        requiresContract: Boolean(s.requires_Contract ?? s.requiresContract ?? false),
        canBeSold: Boolean(s.can_Be_Sold ?? s.canBeSold ?? true),
        hasExpiryDate: Boolean(s.has_Expiry_Date ?? s.hasExpiryDate ?? false),
        hasVariants: Boolean(s.has_Variants ?? s.hasVariants ?? false),
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

/**
 * بناء كائن CreateProductAppoitmnetDto متوافق تماماً مع Swagger (14 حقل حصرياً وبدون أي حقول إضافية)
 * POST /api/Inventory/Product/CreateAppointmentService/appointment-service
 */
export function buildCreateAppointmentServiceDto(payload = {}) {
  const generatedNum = `SRV-${Date.now().toString().slice(-6)}`;
  return {
    name_Product: (payload.name_Product || payload.name || "").trim(),
    product_Number: (payload.product_Number || payload.productNumber || generatedNum).trim(),
    has_Expiry_Date: Boolean(payload.has_Expiry_Date ?? payload.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(payload.category_Id || payload.categoryId || payload.category),
    can_Be_Sold: Boolean(payload.can_Be_Sold ?? payload.canBeSold ?? true),
    requires_Contract: Boolean(payload.requires_Contract ?? payload.requiresContract ?? false),
    default_Deposit_Amount: Number(payload.default_Deposit_Amount ?? payload.defaultInsuranceQty ?? payload.deposit ?? 0) || 0,
    default_Duration_Minutes: Math.round(Number(payload.default_Duration_Minutes ?? payload.defaultDuration ?? 0)) || 0,
    has_Variants: Boolean(payload.has_Variants ?? payload.hasVariants ?? false),
    revenue_Account_Id: toGuidOrNull(payload.revenue_Account_Id || payload.revenueAccount),
    expense_Account_Id: toGuidOrNull(payload.expense_Account_Id || payload.expenseAccount),
    billing_Method: normalizeBillingMethod(payload.billing_Method || payload.billingMethod),
    cost_Price: Number(payload.cost_Price ?? payload.costPrice ?? 0) || 0,
    consumer_Price: Number(payload.consumer_Price ?? payload.consumerPrice ?? 0) || 0,
  };
}

/**
 * بناء كائن UpdateProductServiceDto متوافق مع Swagger
 * POST /api/Inventory/Product/UpdateProductService/service
 */
export function buildUpdateProductServiceDto(id, payload = {}) {
  const serviceId = toGuidOrNull(id) || toGuidOrNull(payload?.id) || id;
  const generatedNum = `SRV-${Date.now().toString().slice(-6)}`;
  return {
    id: serviceId,
    name_Product: (payload?.name_Product || payload?.name || "").trim(),
    product_Number: (payload?.product_Number || payload?.productNumber || generatedNum).trim(),
    has_Expiry_Date: Boolean(payload?.has_Expiry_Date ?? payload?.hasExpiryDate ?? false),
    billing_Method: normalizeBillingMethod(payload?.billing_Method || payload?.billingMethod),
    can_Be_Sold: Boolean(payload?.can_Be_Sold ?? payload?.canBeSold ?? true),
    requires_Contract: Boolean(payload?.requires_Contract ?? payload?.requiresContract ?? false),
    requires_Scheduling: Boolean(payload?.requires_Scheduling ?? payload?.requiresScheduling ?? true),
    category_Id: toGuidOrNull(payload?.category_Id || payload?.categoryId || payload?.category),
    revenue_Account_Id: toGuidOrNull(payload?.revenue_Account_Id || payload?.revenueAccount),
    expense_Account_Id: toGuidOrNull(payload?.expense_Account_Id || payload?.expenseAccount),
    cost_Price: Number(payload?.cost_Price ?? payload?.costPrice ?? 0) || 0,
    consumer_Price: Number(payload?.consumer_Price ?? payload?.consumerPrice ?? 0) || 0,
  };
}

export async function createService(payload) {
  try {
    const cleanDto = buildCreateAppointmentServiceDto(payload);
    const res = await apiHandler({
      endPoint: "Inventory/Product/CreateAppointmentService/appointment-service",
      method: "POST",
      body: cleanDto,
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

export async function updateService(id, payload = {}) {
  try {
    const pType = payload.product_Type || payload.productType;

    if (pType === "Assembly") {
      return updateAssemblyWithoutSpecs({ id, ...payload });
    }
    if (pType === "Bundle") {
      return updateBundleWithoutSpecs({ id, ...payload });
    }
    if (pType === "Rental") {
      return updateRentalProduct(id, payload);
    }
    if (pType === "Reservation") {
      return updateReservationProduct({ id, ...payload });
    }
    if (pType === "Appointment") {
      return updateAppointmentProduct({ id, ...payload });
    }

    // Default for Appointment / Service:
    return updateAppointmentProduct({ id, ...payload });
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
        billingMethods: BILLING_METHODS,
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

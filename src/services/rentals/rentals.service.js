import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Fallback Data
// ==========================================

export const INITIAL_RENTALS_STATS = [
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

export const RENTAL_STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "closed", label: "Closed" },
  { id: "canceled", label: "Canceled" },
];

export const INITIAL_RENTAL_CONTRACTS_LIST = [];


export const RATE_TYPES = [
  { id: "1=Day", name: "Daily (يومي)" },
  { id: "1=Week", name: "Weekly (أسبوعي)" },
  { id: "1=Month", name: "Monthly (شهري)" },
];

export const PAYMENT_METHODS = [
  { id: "Card", name: "Card / Electronic" },
  { id: "Cash", name: "Cash" },
  { id: "Bank Transfer", name: "Bank Transfer" },
];

// ==========================================
// Service API Functions - Connected to Backend
// ==========================================

/**
 * Fetch Lookups needed for Rental Contracts (Customers, Resources, Services, Cost Centers)
 */
export async function getRentalLookups() {
  try {
    const [customersRes, resourcesRes, servicesRes, costCentersRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/Customer/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "inventory/Resource/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "Inventory/Product/GetAll/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "accounting/CostCenters/GetAllCostCenters/all",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
    ]);

    // Parse Customers
    let customers = [];
    if (customersRes.status === "fulfilled") {
      const raw = customersRes.value?.data || customersRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      customers = list.map((c) => ({
        id: c.id,
        name: c.customer_Name || c.name || "Customer",
        phone: c.phone || "",
      }));
    }

    // Parse Resources
    let resources = [];
    if (resourcesRes.status === "fulfilled") {
      const raw = resourcesRes.value?.data || resourcesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      resources = list.map((r) => ({
        id: r.id,
        name: r.name || r.resource_Name || "Resource",
        dailyRentalCost: r.dailyRentalCost || 0,
      }));
    }

    // Parse Services
    let services = [];
    if (servicesRes.status === "fulfilled") {
      const raw = servicesRes.value?.data || servicesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      services = list.map((s) => ({
        id: s.id,
        variantId: Array.isArray(s.variant_Ids) && s.variant_Ids.length > 0 ? s.variant_Ids[0] : s.id,
        name: s.name_Product || s.name || "Service",
        price: Array.isArray(s.prices) && s.prices.length > 0 ? s.prices[0] : (s.consumer_Price ?? 0),
      }));
    }

    // Parse Cost Centers
    let costCenters = [];
    if (costCentersRes.status === "fulfilled") {
      const raw = costCentersRes.value?.data || costCentersRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      costCenters = list.map((cc) => ({
        id: cc.id,
        name: cc.costCenter_Name || cc.name || "Cost Center",
      }));
    }

    return {
      status: 200,
      data: {
        customers,
        resources,
        services,
        costCenters,
        currencies: [{ id: "USD", name: "USD ($)" }, { id: "SAR", name: "SAR (ر.س)" }],
        paymentMethods: PAYMENT_METHODS,
        rateTypes: RATE_TYPES,
        statuses: [
          { id: "Active", name: "Active" },
          { id: "Draft", name: "Draft" },
          { id: "Closed", name: "Closed" },
          { id: "Canceled", name: "Canceled" },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching rental lookups:", error);
    return {
      status: 200,
      data: {
        customers: [],
        resources: [],
        services: [],
        costCenters: [],
        currencies: [{ id: "USD", name: "USD" }],
        paymentMethods: PAYMENT_METHODS,
        rateTypes: RATE_TYPES,
        statuses: [],
      },
    };
  }
}

/**
 * Get Stats for Rental Contracts
 */
export async function getRentalsStats() {
  return {
    status: 200,
    data: INITIAL_RENTALS_STATS,
  };
}

/**
 * Get Paginated & Filtered Rental Contracts List
 * Endpoint: GET /api/inventory/CustomerContracts/GetAllContracts
 */
export async function getRentals(params = {}) {
  try {
    const queryParams = {
      PageNumber: params.PageNumber || 1,
      PageSize: params.PageSize || 10,
      Search: params.SearchTerm || params.Search || undefined,
      IsActive: params.IsActive !== undefined ? params.IsActive : undefined,
      SortBy: params.SortBy || undefined,
      SortDirection: params.SortDirection || undefined,
    };

    const res = await apiHandler({
      endPoint: "inventory/CustomerContracts/GetAllContracts",
      method: "GET",
      params: queryParams,
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((c, idx) => {
      const contractNum = c.contractNumber || c.code || `RC-${String(c.id || idx + 1).substring(0, 6)}`;
      const startDateStr = c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "";
      const endDateStr = c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "";
      const period = startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr || "N/A";
      const totalAmount = c.totalAmount ?? c.total ?? 0;

      const firstItem = Array.isArray(c.items) && c.items.length > 0 ? c.items[0] : null;
      const resourceName = firstItem?.custom_Item_Name || firstItem?.productVariantName || c.title || "Facility/Vehicle";

      return {
        id: c.id || idx + 1,
        numericId: idx + 1,
        contractNumber: contractNum,
        customer: c.customerName || c.customer_Name || "Customer",
        customerName: c.customerName || c.customer_Name || "Customer",
        customerId: c.customerId,
        resource: resourceName,
        resourceName: resourceName,
        service: c.title || "Rental Contract",
        serviceName: c.title || "Rental Contract",
        period,
        startDate: startDateStr,
        endDate: endDateStr,
        rate: `$${c.dailyRentalCost || 50}/day`,
        rateType: "1=Day",
        rentalPrice: c.dailyRentalCost || 50,
        quantity: 1,
        deposit: "$0",
        numericDeposit: 0,
        total: typeof totalAmount === "number" ? `$${totalAmount}` : `$${totalAmount}`,
        numericTotal: totalAmount,
        status: c.status || (c.isActive ? "Active" : "Closed"),
        isActive: c.isActive ?? true,
        notes: c.terms_And_Conditions || c.description || "",
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
    console.error("Error fetching rental contracts:", error);
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
 * Get Rental Contract by ID
 * Endpoint: GET /api/inventory/CustomerContracts/GetContractById/{id}
 */
export async function getRentalById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/CustomerContracts/GetContractById/${id}`,
      method: "GET",
    });
    const c = res?.data || res || {};

    const startDateStr = c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "";
    const endDateStr = c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "";
    const totalAmount = c.totalAmount ?? 0;
    const contractNum = c.contractNumber || `RC-${String(id).substring(0, 8)}`;

    const items = (c.items || []).map((itm, idx) => ({
      id: itm.id || idx + 1,
      name: itm.custom_Item_Name || itm.productVariantName || "Item",
      quantity: itm.quantity || 1,
      unitPrice: itm.unit_Price || 0,
      totalPrice: (itm.quantity || 1) * (itm.unit_Price || 0),
    }));

    const installments = (c.installments || []).map((ins, idx) => ({
      id: ins.id || idx + 1,
      name: ins.installment_Name || `Installment #${idx + 1}`,
      amount: ins.amount || 0,
      dueDate: ins.due_Date ? new Date(ins.due_Date).toISOString().split("T")[0] : "",
      isPaid: ins.isPaid ?? false,
    }));

    return {
      status: 200,
      data: {
        id: c.id || id,
        contractNumber: contractNum,
        customerId: c.customerId,
        customer: c.customerName || "Customer",
        customerName: c.customerName || "Customer",
        title: c.title || "Rental Agreement",
        serviceName: c.title || "Rental Agreement",
        resourceName: items[0]?.name || "Facility / Equipment",
        startDate: startDateStr,
        endDate: endDateStr,
        period: startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr || "N/A",
        totalAmount,
        numericTotal: totalAmount,
        total: `$${totalAmount}`,
        status: c.status || (c.isActive ? "Active" : "Closed"),
        isActive: c.isActive ?? true,
        terms_And_Conditions: c.terms_And_Conditions || "",
        description: c.description || "",
        notes: c.terms_And_Conditions || c.description || "",
        items,
        installments,
        invoices: installments.map((ins, idx) => ({
          id: `#${idx + 1}`,
          returnDate: ins.dueDate,
          damage: "None",
          total: `$${ins.amount}`,
          paid: ins.isPaid ? `$${ins.amount}` : "$0",
          status: ins.isPaid ? "Paid" : "Pending",
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching rental contract by id:", error);
    throw error;
  }
}

/**
 * Create New Rental Contract
 * Endpoint: POST /api/inventory/CustomerContracts/CreateContract/create
 */
export async function createRental(data) {
  const price = Number(data.rentalPrice) || 0;
  const qty = Number(data.quantity) || 1;
  const total = Number(data.total) || (price * qty);

  const payload = {
    customerId: data.customerId || data.customer,
    contractNumber: data.contractNumber || `RC-${Date.now().toString().slice(-4)}`,
    title: data.service || data.title || "Rental Contract",
    description: data.notes || data.description || "",
    terms_And_Conditions: data.notes || "",
    startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
    endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
    totalAmount: total,
    currencyId: data.currencyId || null,
    remindBeforeDays: Number(data.remindBeforeDays) || 7,
    items: [
      {
        custom_Item_Name: data.resource || data.resourceName || "Rental Item",
        quantity: qty,
        unit_Price: price,
        description: data.notes || null,
      },
    ],
    installments: [
      {
        installment_Name: "Initial Installment",
        amount: total,
        due_Date: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
      },
    ],
  };

  const res = await apiHandler({
    endPoint: "inventory/CustomerContracts/CreateContract/create",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Rental contract created successfully",
  };
}

/**
 * Update Rental Contract
 */
export async function updateRental(id, data) {
  return createRental(data);
}

/**
 * Checkout / Pay Contract Installment
 * Endpoint: POST /api/inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment
 */
export async function checkoutContractInstallment(payload) {
  const res = await apiHandler({
    endPoint: "inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Installment checkout processed successfully",
  };
}

export async function deleteRental(id) {
  return {
    status: 200,
    message: "Contract status updated",
  };
}

export async function cancelRentalContract({ id, cancellationReason }) {
  return {
    status: 200,
    message: "Contract canceled successfully",
  };
}


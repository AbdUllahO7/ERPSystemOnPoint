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
  { id: "Hour", name: "Hourly" },
  { id: "Day", name: "Daily" },
  { id: "Week", name: "Weekly" },
  { id: "Month", name: "Monthly" },
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
 * Fetch Lookups needed for Rental Contracts (Customers, Resources, Services, Cost Centers, Currencies, Accounts, Invoice Patterns)
 */
export async function getRentalLookups() {
  try {
    const [
      customersRes,
      resourcesRes,
      servicesRes,
      costCentersRes,
      currenciesRes,
      accountsRes,
      patternsRes,
    ] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/Customer/GetAllCustomers/all-customers",
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
      apiHandler({
        endPoint: "accounting/Currencies/GetAllCurrencies/all",
        method: "GET",
        params: { PageSize: 100, pageNumber: 1, pageSize: 100 },
      }),
      apiHandler({
        endPoint: "account/Accounts/GetLeafAccounts/leaf-accounts",
        method: "GET",
        params: { PageNumber: 1, PageSize: 500, pageNumber: 1, pageSize: 500 },
      }),
      apiHandler({
        endPoint: "accounting/InvoicePatterns/GetAllPatterns/all",
        method: "GET",
        params: { PageNumber: 1, PageSize: 100, pageNumber: 1, pageSize: 100 },
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

    // Parse Services / Product Variants
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

    // Parse Currencies
    let currencies = [];
    if (currenciesRes.status === "fulfilled") {
      const raw = currenciesRes.value?.data || currenciesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      currencies = list.map((c) => ({
        id: c.id,
        name: c.name || c.currencyCode || c.currency_Name || "Currency",
        code: c.currencyCode || c.code || "",
        symbol: c.symbol || "",
      }));
    }
    if (currencies.length === 0) {
      currencies = [
        { id: "3fa85f64-5717-4562-b3fc-2c963f66afa1", name: "USD", code: "USD", symbol: "$" },
        { id: "3fa85f64-5717-4562-b3fc-2c963f66afa2", name: "SAR", code: "SAR", symbol: "ر.س" },
      ];
    }

    // Parse Payment / Refund Accounts (Leaf Accounts)
    let paymentAccounts = [];
    if (accountsRes.status === "fulfilled") {
      const raw = accountsRes.value?.data || accountsRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      paymentAccounts = list.map((a) => ({
        id: a.id,
        name: a.name || a.account_Name || a.accountName || "Account",
        accountNumber: a.account_Number || a.code || "",
      }));
    }

    // Parse Invoice Patterns
    let invoicePatterns = [];
    if (patternsRes.status === "fulfilled") {
      const raw = patternsRes.value?.data || patternsRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      invoicePatterns = list.map((p) => ({
        id: p.id,
        name: p.pattern_Name || p.name || p.patternName || "Invoice Pattern",
      }));
    }

    return {
      status: 200,
      data: {
        customers,
        resources,
        services,
        costCenters,
        currencies,
        paymentAccounts,
        invoicePatterns,
        paymentMethods: PAYMENT_METHODS,
        rateTypes: RATE_TYPES,
        statuses: [
          { id: "Active", name: "Active" },
          { id: "Settled", name: "Settled" },
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
        currencies: [
          { id: "3fa85f64-5717-4562-b3fc-2c963f66afa1", name: "USD", code: "USD", symbol: "$" },
          { id: "3fa85f64-5717-4562-b3fc-2c963f66afa2", name: "SAR", code: "SAR", symbol: "ر.س" },
        ],
        paymentAccounts: [],
        invoicePatterns: [],
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
    const totalAmount = Number(c.totalAmount ?? 0);
    const contractNum = c.contractNumber || `RC-${String(id).substring(0, 8)}`;

    const items = (c.items || []).map((itm, idx) => {
      const q = Number(itm.quantity || 1);
      const p = Number(itm.unitPrice ?? itm.unit_Price ?? 0);
      const total = Number(itm.totalPrice ?? itm.total_Price ?? q * p);
      return {
        id: itm.id || idx + 1,
        productVariantId: itm.productVariantId || null,
        unitOfMeasurementId: itm.unitOfMeasurementId || null,
        unitOfMeasurementName: itm.unitOfMeasurementName || "N/A",
        customItemName: itm.customItemName || itm.custom_Item_Name || itm.name || itm.productVariantName || "Item",
        name: itm.customItemName || itm.custom_Item_Name || itm.name || itm.productVariantName || "Item",
        description: itm.description || "",
        quantity: q,
        unitPrice: p,
        totalPrice: total,
      };
    });

    const installments = (c.installments || []).map((ins, idx) => ({
      id: ins.id || idx + 1,
      installmentName: ins.installmentName || ins.installment_Name || `Installment #${idx + 1}`,
      name: ins.installmentName || ins.installment_Name || `Installment #${idx + 1}`,
      amount: Number(ins.amount || 0),
      dueDate: ins.dueDate ? new Date(ins.dueDate).toISOString().split("T")[0] : (ins.due_Date ? new Date(ins.due_Date).toISOString().split("T")[0] : ""),
      status: ins.status || (ins.isPaid ? "Paid" : "Pending"),
      invoiceId: ins.invoiceId || null,
      isPaid: ins.isPaid || ins.status === "Paid" || ins.status === "Invoiced",
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
        resourceName: items[0]?.customItemName || items[0]?.name || "Facility / Equipment",
        startDate: startDateStr,
        endDate: endDateStr,
        period: startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr || "N/A",
        totalAmount,
        numericTotal: totalAmount,
        total: `$${totalAmount}`,
        currencyId: c.currencyId || null,
        currencyCode: c.currencyCode || "USD",
        status: c.status || (c.isActive ? "Active" : "Closed"),
        isActive: c.isActive ?? true,
        terms_And_Conditions: c.terms_And_Conditions || "",
        description: c.description || "",
        notes: c.terms_And_Conditions || c.description || "",
        items,
        installments,
        attachments: c.attachments || [],
        invoices: installments.map((ins, idx) => ({
          id: ins.invoiceId ? `#${String(ins.invoiceId).slice(0, 8)}` : `#${idx + 1}`,
          returnDate: ins.dueDate,
          damage: "None",
          total: `$${ins.amount}`,
          paid: ins.isPaid ? `$${ins.amount}` : "$0",
          status: ins.status,
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
 * Endpoint: POST /api/Inventory/RentalContract/CreateContract/create-contract
 */
export async function createRental(data) {
  // If payload contains contract items or title, send to CustomerContracts/CreateContract/create
  if (data.items || data.title) {
    const items = (data.items || []).map((itm) => {
      const q = Number(itm.quantity || 1);
      const p = Number(itm.unitPrice || 0);
      const total = Number(itm.totalPrice || q * p);
      return {
        productVariantId: itm.productVariantId || null,
        customItemName: itm.customItemName || itm.name || "Item",
        description: itm.description || "",
        quantity: q,
        unitPrice: p,
        totalPrice: total,
      };
    });

    const installments = (data.installments || []).map((ins, idx) => ({
      installmentName: ins.installmentName || ins.name || `Installment #${idx + 1}`,
      amount: Number(ins.amount || 0),
      dueDate: ins.dueDate ? new Date(ins.dueDate).toISOString() : new Date().toISOString(),
    }));

    const computedTotal = items.reduce((sum, itm) => sum + itm.totalPrice, 0);

    const payload = {
      id: data.id || undefined,
      customerId: data.customerId,
      contractNumber: data.contractNumber || `CNT-${Date.now().toString().slice(-5)}`,
      title: data.title || "Rental Agreement",
      description: data.description || "",
      terms_And_Conditions: data.terms_And_Conditions || data.notes || "",
      startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date(Date.now() + 86400000 * 30).toISOString(),
      totalAmount: Number(data.totalAmount || computedTotal),
      currencyId: data.currencyId || null,
      status: data.status || "Active",
      items,
      installments,
    };

    const res = await apiHandler({
      endPoint: "inventory/CustomerContracts/CreateContract/create",
      method: "POST",
      body: payload,
    });

    return {
      status: 201,
      data: res?.data || res,
      message: "Customer contract saved successfully",
    };
  }

  const rentalRate = Number(data.rentalRate ?? data.rentalPrice ?? 0);
  const quantity = Number(data.quantity || 1);
  const discount = Number(data.discount || 0);
  const taxAmount = Number(data.taxAmount || 0);
  const securityDeposit = Number(data.securityDeposit || 0);

  const startDate = data.startDate
    ? new Date(data.startDate).toISOString()
    : new Date().toISOString();

  const expectedEndDate = data.expectedEndDate
    ? new Date(data.expectedEndDate).toISOString()
    : data.endDate
    ? new Date(data.endDate).toISOString()
    : new Date(Date.now() + 86400000 * 30).toISOString();

  const payload = {
    customerId: data.customerId || data.customer || null,
    resourceId: data.resourceId || null,
    productVariantId: data.productVariantId || null,
    costCenterId: data.costCenterId || null,
    currencyId: data.currencyId || null,
    startDate,
    expectedEndDate,
    rentalRate,
    rateType: data.rateType || "Day",
    quantity,
    discount,
    taxAmount,
    securityDeposit,
    paymentAccountId: data.paymentAccountId || null,
    notes: data.notes || "",
    dynamicDetails: data.dynamicDetails || {},
  };

  const res = await apiHandler({
    endPoint: "Inventory/RentalContract/CreateContract/create-contract",
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
  return createRental({ ...data, contractId: id, id });
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

/**
 * Settle Rental Contract (Damage, actual end date, refund account, inspection checklist, payment schedules)
 * Endpoint: POST /api/Inventory/RentalContract/SettleContract/settle-contract
 */
export async function settleRentalContract(data) {
  const actualEndDate = data.actualEndDate
    ? new Date(data.actualEndDate).toISOString()
    : new Date().toISOString();

  const payload = {
    contractId: data.contractId || data.id,
    actualEndDate,
    invoicePattern: data.invoicePattern || data.invoicePatternId || null,
    damageCharges: Number(data.damageCharges || 0),
    damageNotes: data.damageNotes || "",
    refundAccountId: data.refundAccountId || null,
    checkInDetails: data.checkInDetails || {},
    paymentSchedules: Array.isArray(data.paymentSchedules)
      ? data.paymentSchedules.map((ps) => ({
          description: ps.description || "Settlement Schedule",
          amountDue: Number(ps.amountDue || 0),
          dueDate: ps.dueDate ? new Date(ps.dueDate).toISOString() : new Date().toISOString(),
        }))
      : [],
  };

  const res = await apiHandler({
    endPoint: "Inventory/RentalContract/SettleContract/settle-contract",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Rental contract settled successfully",
  };
}

/**
 * Direct Rental Contract creation
 * Endpoint: POST /api/Inventory/RentalContract/CreateContract/create-contract
 */
export async function createDirectRentalContract(payload) {
  return createRental(payload);
}

/**
 * Get available items / installments data for invoice creation
 * Endpoint: GET /api/inventory/CustomerContracts/GetAvailableDataForInvoice/GetAvailable/{contractId}
 */
export async function getAvailableDataForInvoice(contractId) {
  const res = await apiHandler({
    endPoint: `inventory/CustomerContracts/GetAvailableDataForInvoice/GetAvailable/${contractId}`,
    method: "GET",
  });

  return {
    status: 200,
    data: res?.data || res,
  };
}

/**
 * Create Customer Contract Invoice
 * Endpoint: POST /api/inventory/CustomerContracts/CreateInvoiceContract/Create-invoice-Contract
 */
export async function createCustomerContractInvoice(payload) {
  const res = await apiHandler({
    endPoint: "inventory/CustomerContracts/CreateInvoiceContract/Create-invoice-Contract",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Invoice created from contract successfully",
  };
}

export async function getRentalPricingLookup() {
  return apiHandler({
    endPoint: "HR/Lookups/GetRentalPricing/GetRentalPricing",
    method: "GET",
  });
}

export {
  createRentalProduct,
  updateRentalProduct,
  buildRentalProductDto,
} from "@/services/inventory/inventory.service";

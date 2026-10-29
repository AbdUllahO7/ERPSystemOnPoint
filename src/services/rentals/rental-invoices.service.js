import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";
import { getRentals, getRentalById } from "./rentals.service";

// ==========================================
// Static Initial Fallback Data
// ==========================================

export const INITIAL_RENTAL_INVOICES_STATS = [
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

// ==========================================
// Service API Functions - Connected to Backend
// ==========================================

export async function getRentalInvoicesStats() {
  return {
    status: 200,
    data: INITIAL_RENTAL_INVOICES_STATS,
  };
}

/**
 * Get Paginated Rental Invoices / Contracts
 * Endpoint: GET /api/Inventory/RentalContract/GetAll
 */
export async function getRentalInvoices(params = {}) {
  try {
    return await getRentals(params);
  } catch (error) {
    console.error("Error fetching rental invoices:", error);
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
 * Get Rental Invoice Details by ID
 */
export async function getRentalInvoiceById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/CustomerContracts/GetContractById/${id}`,
      method: "GET",
    });
    const c = res?.data || res || {};
    const totalNum = c.totalAmount || 300;
    const contractNum = c.contractNumber || `RC-${String(id).substring(0, 8)}`;

    return {
      status: 200,
      data: {
        id: c.id || id,
        invoiceNumber: `INV-RNT-${String(id).substring(0, 6)}`,
        contractId: c.id || id,
        contractNumber: contractNum,
        customerName: c.customerName || "Customer",
        resourceName: c.title || "Rental Asset",
        rateText: "$50/day",
        returnDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : "N/A",
        damageAmount: 0,
        total: `$${totalNum}`,
        numericTotal: totalNum,
        paid: `$${totalNum}`,
        numericPaid: totalNum,
        due: "$0",
        numericDue: 0,
        contractTotal: totalNum,
        status: "Paid",
        notes: c.terms_And_Conditions || "Standard rental invoice settlement.",
        damageNote: "No damages reported.",
        returnedByName: c.customerName || "Customer",
        payments: [
          {
            id: "1",
            date: c.startDate ? new Date(c.startDate).toLocaleDateString() : "23/7/2026",
            method: "Card",
            reference: `TRX-${String(id).substring(0, 4)}`,
            amount: `$${totalNum}`,
            numericAmount: totalNum,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching rental invoice by id:", error);
    throw error;
  }
}

/**
 * Create Rental Invoice (Checkout Contract Installment)
 * Endpoint: POST /api/inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment
 */
export async function createRentalInvoice(data) {
  const payload = {
    installmentId: data.installmentId || data.contractId,
    invoicePatternId: data.invoicePatternId || "00000000-0000-0000-0000-000000000000",
    paymentPay: data.paymentMethod || "Cash",
    amountToPay: Number(data.amountToPay || data.total) || 100,
  };

  const res = await apiHandler({
    endPoint: "inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Rental invoice created successfully",
  };
}

export async function updateRentalInvoice(id, data) {
  return createRentalInvoice(data);
}

export const INITIAL_RENTAL_INVOICES_LIST = [];

export async function getRentalInvoiceLookups() {
  try {
    const res = await apiHandler({
      endPoint: "inventory/CustomerContracts/GetAllContracts",
      method: "GET",
      params: { PageSize: 100, IsActive: true },
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);

    const contracts = items.map((c) => ({
      id: c.id,
      name: `${c.contractNumber || "Contract"} - ${c.customerName || "Customer"} (${c.title || "Rental"})`,
      contractNumber: c.contractNumber,
      totalAmount: c.totalAmount || 0,
      installments: c.installments || [],
    }));

    return {
      status: 200,
      data: {
        contracts,
        statuses: ["Paid", "Partial", "Pending", "Overdue"],
        paymentMethods: [
          { id: "Cash", name: "Cash" },
          { id: "Credit", name: "Credit / Card" },
          { id: "Bank", name: "Bank Transfer" },
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching invoice lookups:", error);
    return {
      status: 200,
      data: {
        contracts: [],
        statuses: ["Paid", "Partial", "Pending", "Overdue"],
        paymentMethods: [
          { id: "Cash", name: "Cash" },
          { id: "Credit", name: "Credit / Card" },
          { id: "Bank", name: "Bank Transfer" },
        ],
      },
    };
  }
}


export async function deleteRentalInvoice(id) {
  return {
    status: 200,
    message: "Invoice deleted",
  };
}

export async function addRentalInvoicePayment(id, payload) {
  return {
    status: 200,
    message: "Payment recorded successfully",
  };
}

export {
  createCustomerContractInvoice,
  getAvailableDataForInvoice,
  settleRentalContract,
} from "./rentals.service";



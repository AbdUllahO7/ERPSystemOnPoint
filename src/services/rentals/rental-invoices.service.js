import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Rental Invoices
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

export const INITIAL_RENTAL_INVOICES_LIST = [
  {
    id: "RC-1001",
    numericId: 1,
    invoiceNumber: "INV-RNT-001",
    contractId: "RC-1003",
    contractNumber: "RC-1003",
    customer: "Customer",
    customerName: "Ahmed Khaled",
    resource: "Resource",
    resourceName: "Toyota Hilux Pick-up",
    rate: "Rate",
    rateText: "USD 45/day",
    returnDate: "2026-07-01",
    mode: "Payment Method",
    damage: "$500",
    damageAmount: 500,
    total: "$300",
    numericTotal: 300,
    due: "$450",
    numericDue: 450,
    paid: "$250",
    numericPaid: 250,
    contractTotal: 300,
    status: "Partial",
    notes:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
    damageNote: "Scratch on passenger door and right bumper alignment required.",
    returnedBy: "ReturnedBy",
    returnedByName: "Sami Al-Otaibi (Driver)",
    additionalData: {
      returnedBy: "ReturnedBy",
    },
    payments: [
      { id: "1", date: "23/7/2025", method: "bank", reference: "TRX-8891", amount: "$250", numericAmount: 250 },
      { id: "2", date: "23/7/2025", method: "bank", reference: "TRX-8891", amount: "$250", numericAmount: 250 },
    ],
  },
  {
    id: "RC-1002",
    numericId: 2,
    invoiceNumber: "INV-RNT-002",
    contractId: "RC-1002",
    contractNumber: "RC-1002",
    customer: "Customer",
    customerName: "Sara Mansoor",
    resource: "Resource",
    resourceName: "Hyundai Tucson SUV",
    rate: "Rate",
    rateText: "USD 50/day",
    returnDate: "2026-07-01",
    mode: "Payment Method",
    damage: "$500",
    damageAmount: 500,
    total: "$300",
    numericTotal: 300,
    due: "$450",
    numericDue: 450,
    paid: "$250",
    numericPaid: 250,
    contractTotal: 300,
    status: "Partial",
    notes: "Vehicle returned in satisfactory condition with standard return inspection.",
    damageNote: "Minor wheel scuff.",
    returnedBy: "ReturnedBy",
    returnedByName: "Sara Mansoor",
    additionalData: {
      returnedBy: "ReturnedBy",
    },
    payments: [
      { id: "1", date: "23/7/2025", method: "bank", reference: "TRX-9901", amount: "$250", numericAmount: 250 },
    ],
  },
  {
    id: "RC-1003",
    numericId: 3,
    invoiceNumber: "INV-RNT-003",
    contractId: "RC-1004",
    contractNumber: "RC-1004",
    customer: "Customer",
    customerName: "Tariq Nasser",
    resource: "Resource",
    resourceName: "Conference Hall A",
    rate: "Rate",
    rateText: "USD 200/day",
    returnDate: "2026-07-01",
    mode: "Payment Method",
    damage: "$500",
    damageAmount: 500,
    total: "$300",
    numericTotal: 300,
    due: "$450",
    numericDue: 450,
    paid: "$250",
    numericPaid: 250,
    contractTotal: 300,
    status: "Partial",
    notes: "Facility inspected post event with lighting and sound checks completed.",
    damageNote: "None",
    returnedBy: "ReturnedBy",
    returnedByName: "Tariq Nasser",
    additionalData: {
      returnedBy: "ReturnedBy",
    },
    payments: [
      { id: "1", date: "23/7/2025", method: "card", reference: "TRX-7712", amount: "$250", numericAmount: 250 },
    ],
  },
];

// Memory store for session CRUD
let memoryRentalInvoices = [...INITIAL_RENTAL_INVOICES_LIST];

// ==========================================
// Service API Functions
// ==========================================

export async function getRentalInvoicesStats() {
  return {
    status: 200,
    data: INITIAL_RENTAL_INVOICES_STATS,
  };
}

export async function getRentalInvoices(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 10,
    SearchTerm,
    Status,
    Contract,
  } = params;

  let filtered = [...memoryRentalInvoices];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        String(inv.id).toLowerCase().includes(term) ||
        inv.contractNumber?.toLowerCase().includes(term) ||
        inv.customer?.toLowerCase().includes(term) ||
        inv.customerName?.toLowerCase().includes(term)
    );
  }

  if (Status && Status.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (inv) => inv.status?.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Contract && Contract.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (inv) =>
        inv.contractId?.toLowerCase() === Contract.toLowerCase() ||
        inv.contractNumber?.toLowerCase() === Contract.toLowerCase()
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

export async function getRentalInvoiceById(id) {
  const invoice = memoryRentalInvoices.find(
    (inv) =>
      String(inv.id).toLowerCase() === String(id).toLowerCase() ||
      String(inv.numericId) === String(id) ||
      String(inv.invoiceNumber).toLowerCase() === String(id).toLowerCase()
  );

  if (!invoice) {
    return {
      status: 200,
      data: {
        id: "RC-1001",
        numericId: 1,
        invoiceNumber: "INV-RNT-001",
        contractId: "RC-1003",
        contractNumber: "RC-1003",
        customer: "Customer",
        customerName: "Ahmed Khaled",
        resource: "Resource",
        resourceName: "Toyota Hilux Pick-up",
        rate: "Rate",
        rateText: "USD 45/day",
        returnDate: "23/9/2025",
        mode: "Payment Method",
        damage: "$500",
        damageAmount: 500,
        total: "$300",
        numericTotal: 300,
        due: "$450",
        numericDue: 450,
        paid: "$250",
        numericPaid: 250,
        contractTotal: 300,
        status: "Partial",
        notes:
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem",
        damageNote: "Damage inspected on return.",
        returnedBy: "ReturnedBy",
        returnedByName: "Sami Al-Otaibi",
        additionalData: {
          returnedBy: "ReturnedBy",
        },
        payments: [
          { id: "1", date: "23/7/2025", method: "bank", reference: "TRX-8891", amount: "$250", numericAmount: 250 },
          { id: "2", date: "23/7/2025", method: "bank", reference: "TRX-8891", amount: "$250", numericAmount: 250 },
        ],
      },
    };
  }

  return {
    status: 200,
    data: invoice,
  };
}

export async function createRentalInvoice(payload) {
  const nextNum = memoryRentalInvoices.length + 1001;
  const invoiceId = `RC-${nextNum}`;
  const damageFee = Number(payload.damageAmount) || 0;
  const contractTotal = 300;
  const total = contractTotal + damageFee;
  const paid = 0;
  const due = total;

  const newInvoice = {
    id: invoiceId,
    numericId: nextNum,
    invoiceNumber: `INV-RNT-${String(nextNum).padStart(3, "0")}`,
    contractId: payload.rentalContract || "RC-1003",
    contractNumber: payload.rentalContract || "RC-1003",
    customer: "Customer",
    customerName: "Customer",
    resource: "Resource",
    resourceName: "Resource",
    rate: "Rate",
    rateText: "USD 45/day",
    returnDate: payload.returnDate || "2026-07-01",
    mode: payload.invoiceMode || "Payment Method",
    damage: `$${damageFee}`,
    damageAmount: damageFee,
    total: `$${total}`,
    numericTotal: total,
    due: `$${due}`,
    numericDue: due,
    paid: `$${paid}`,
    numericPaid: paid,
    contractTotal: contractTotal,
    status: "Partial",
    notes: payload.notes || payload.damageNote || "",
    damageNote: payload.damageNote || "",
    returnedBy: "ReturnedBy",
    returnedByName: payload.returnedBy || "Customer",
    closeContractAfterInvoicing: Boolean(payload.closeContractAfterInvoicing),
    additionalData: {
      returnedBy: "ReturnedBy",
      ...payload.dynamicDetails,
    },
    payments: [],
  };

  memoryRentalInvoices = [newInvoice, ...memoryRentalInvoices];
  return {
    status: 200,
    data: newInvoice,
    message: "Rental invoice created successfully!",
  };
}

export async function addRentalInvoicePayment(invoiceId, paymentPayload) {
  const invoice = memoryRentalInvoices.find(
    (inv) => String(inv.id) === String(invoiceId) || String(inv.numericId) === String(invoiceId)
  );

  if (invoice) {
    const paymentAmount = Number(paymentPayload.amount) || 0;
    const newPayment = {
      id: String((invoice.payments?.length || 0) + 1),
      date: new Date().toLocaleDateString("en-GB"),
      method: paymentPayload.method || "bank",
      reference: paymentPayload.reference || `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: `$${paymentAmount}`,
      numericAmount: paymentAmount,
    };

    invoice.payments = [newPayment, ...(invoice.payments || [])];
    invoice.numericPaid = (invoice.numericPaid || 0) + paymentAmount;
    invoice.paid = `$${invoice.numericPaid}`;
    invoice.numericDue = Math.max(0, (invoice.numericTotal || 0) - invoice.numericPaid);
    invoice.due = `$${invoice.numericDue}`;

    if (invoice.numericDue === 0) {
      invoice.status = "Paid";
    }

    return {
      status: 200,
      data: invoice,
      message: "Payment recorded successfully!",
    };
  }

  return {
    status: 200,
    message: "Payment recorded!",
  };
}

export async function deleteRentalInvoice(id) {
  memoryRentalInvoices = memoryRentalInvoices.filter(
    (inv) => String(inv.id) !== String(id) && String(inv.numericId) !== String(id)
  );
  return {
    status: 200,
    data: { success: true },
    message: "Rental invoice deleted successfully!",
  };
}

export async function getRentalInvoiceLookups() {
  return {
    status: 200,
    data: {
      contracts: [
        { id: "RC-1001", name: "RC-1001 - Ahmed Khaled (Toyota Hilux)" },
        { id: "RC-1002", name: "RC-1002 - Sara Mansoor (Hyundai Tucson)" },
        { id: "RC-1003", name: "RC-1003 - Tariq Nasser (Conference Hall)" },
        { id: "RC-1004", name: "RC-1004 - Layla Hakeem (Dental Chair)" },
      ],
      paymentMethods: [
        { id: "bank", name: "Bank Transfer" },
        { id: "cash", name: "Cash" },
        { id: "card", name: "Card" },
      ],
      statuses: ["Partial", "Paid", "Pending", "Canceled"],
    },
  };
}

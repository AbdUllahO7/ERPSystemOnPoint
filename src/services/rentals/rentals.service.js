import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Rentals matching Figma
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
  { id: "draft", label: "Draft" },
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
  { id: "canceled", label: "Canceled" },
];

export const INITIAL_RENTAL_CONTRACTS_LIST = [
  {
    id: "RC-1001",
    numericId: 1,
    contractNumber: "RC-1001",
    customer: "Ahmed Khaled",
    customerName: "Ahmed Khaled",
    resource: "Toyota Hilux Pic..",
    resourceName: "Toyota Hilux Pick-up (2025)",
    service: "Vehicle Rental",
    serviceName: "Vehicle Rental",
    period: "2026-07-01",
    startDate: "2026-07-01",
    endDate: "2027-07-01",
    rate: "USD 45/day × 10",
    rateType: "1 = Day",
    rentalPrice: 45,
    quantity: 1,
    deposit: "$300",
    numericDeposit: 300,
    total: "$450",
    numericTotal: 450,
    status: "Active",
    costCenter: "Main Branch",
    currency: "USD",
    paymentMethod: "Card",
    discount: 0,
    taxPercent: 5,
    notes: "Contract includes standard comprehensive collision damage waiver.",
    additionalData: {
      driverLicenseNumber: "9876543210",
      currentMileage: "45000 KM",
      fuelLevel: "Full",
    },
    invoices: [
      { id: "#12", returnDate: "23/7/2025", damage: "damaged", total: "$350", paid: "$250", status: "Paid" },
      { id: "#13", returnDate: "23/7/2025", damage: "damaged", total: "$350", paid: "$250", status: "Paid" },
    ],
  },
  {
    id: "RC-1002",
    numericId: 2,
    contractNumber: "RC-1002",
    customer: "Sara Mansoor",
    customerName: "Sara Mansoor",
    resource: "Hyundai Tucson",
    resourceName: "Hyundai Tucson SUV (2024)",
    service: "Vehicle Rental",
    serviceName: "Vehicle Rental",
    period: "2026-08-01",
    startDate: "2026-08-01",
    endDate: "2027-08-01",
    rate: "USD 50/day × 5",
    rateType: "1 = Day",
    rentalPrice: 50,
    quantity: 1,
    deposit: "$300",
    numericDeposit: 300,
    total: "$250",
    numericTotal: 250,
    status: "Active",
    costCenter: "VIP Fleet",
    currency: "USD",
    paymentMethod: "Bank Transfer",
    discount: 0,
    taxPercent: 0,
    notes: "Long term corporate leasing agreement.",
    additionalData: {
      driverLicenseNumber: "1122334455",
      currentMileage: "22000 KM",
      fuelLevel: "Full",
    },
    invoices: [
      { id: "#14", returnDate: "01/8/2025", damage: "None", total: "$250", paid: "$250", status: "Paid" },
    ],
  },
  {
    id: "RC-1003",
    numericId: 3,
    contractNumber: "RC-1003",
    customer: "Tariq Nasser",
    customerName: "Tariq Nasser",
    resource: "Conference Hall A",
    resourceName: "Conference Hall A (Full Day)",
    service: "Facility Rental",
    serviceName: "Facility Rental",
    period: "2026-09-10",
    startDate: "2026-09-10",
    endDate: "2026-09-15",
    rate: "USD 200/day × 5",
    rateType: "1 = Day",
    rentalPrice: 200,
    quantity: 1,
    deposit: "$500",
    numericDeposit: 500,
    total: "$1000",
    numericTotal: 1000,
    status: "Draft",
    costCenter: "Conference Center",
    currency: "USD",
    paymentMethod: "Cash",
    discount: 50,
    taxPercent: 5,
    notes: "Audio/visual equipment and technician support requested.",
    additionalData: {
      driverLicenseNumber: "N/A",
      currentMileage: "N/A",
      fuelLevel: "N/A",
    },
    invoices: [],
  },
  {
    id: "RC-1004",
    numericId: 4,
    contractNumber: "RC-1004",
    customer: "Layla Hakeem",
    customerName: "Layla Hakeem",
    resource: "Dental Chair #3",
    resourceName: "Dental Operatory Chair Unit #3",
    service: "Equipment Rental",
    serviceName: "Equipment Rental",
    period: "2026-06-01",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    rate: "USD 30/day × 30",
    rateType: "1 = Day",
    rentalPrice: 30,
    quantity: 1,
    deposit: "$200",
    numericDeposit: 200,
    total: "$900",
    numericTotal: 900,
    status: "Closed",
    costCenter: "Clinical Suites",
    currency: "USD",
    paymentMethod: "Card",
    discount: 0,
    taxPercent: 5,
    notes: "Monthly doctor operatory rental.",
    additionalData: {
      driverLicenseNumber: "DL-450912",
      currentMileage: "N/A",
      fuelLevel: "N/A",
    },
    invoices: [
      { id: "#15", returnDate: "30/6/2026", damage: "None", total: "$900", paid: "$900", status: "Paid" },
    ],
  },
  {
    id: "RC-1005",
    numericId: 5,
    contractNumber: "RC-1005",
    customer: "Omar Qasim",
    customerName: "Omar Qasim",
    resource: "Toyota Land Cruiser",
    resourceName: "Toyota Land Cruiser 4WD",
    service: "Vehicle Rental",
    serviceName: "Vehicle Rental",
    period: "2026-05-01",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    rate: "USD 120/day × 9",
    rateType: "1 = Day",
    rentalPrice: 120,
    quantity: 1,
    deposit: "$500",
    numericDeposit: 500,
    total: "$1080",
    numericTotal: 1080,
    status: "Canceled",
    costCenter: "VIP Fleet",
    currency: "USD",
    paymentMethod: "Card",
    discount: 0,
    taxPercent: 5,
    notes: "Canceled by customer prior to dispatch.",
    additionalData: {
      driverLicenseNumber: "9988776655",
      currentMileage: "15000 KM",
      fuelLevel: "Full",
    },
    invoices: [],
  },
];

// Memory store for session CRUD
let memoryRentals = [...INITIAL_RENTAL_CONTRACTS_LIST];

// ==========================================
// Service API Functions
// ==========================================

export async function getRentalsStats() {
  return {
    status: 200,
    data: INITIAL_RENTALS_STATS,
  };
}

export async function getRentals(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 10,
    SearchTerm,
    Status,
    Service,
    Resource,
  } = params;

  let filtered = [...memoryRentals];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        String(r.id).toLowerCase().includes(term) ||
        r.contractNumber?.toLowerCase().includes(term) ||
        r.customer?.toLowerCase().includes(term) ||
        r.resource?.toLowerCase().includes(term) ||
        r.service?.toLowerCase().includes(term)
    );
  }

  if (Status && Status.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (r) => r.status?.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Service && Service.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (r) => r.service?.toLowerCase() === Service.toLowerCase()
    );
  }

  if (Resource && Resource.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (r) => r.resource?.toLowerCase() === Resource.toLowerCase()
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

export async function getRentalById(id) {
  const contract = memoryRentals.find(
    (r) => String(r.id) === String(id) || String(r.numericId) === String(id) || String(r.contractNumber) === String(id)
  );

  if (!contract) {
    return {
      status: 200,
      data: {
        id: "RC-1001",
        numericId: 1,
        contractNumber: "RC-1001",
        customer: "Customer",
        customerName: "Ahmed Khaled",
        resource: "Resource",
        resourceName: "Toyota Hilux Pick-up",
        service: "Service",
        serviceName: "Vehicle Rental",
        costCenter: "Cost Center",
        currency: "Currency",
        paymentMethod: "Payment Method",
        contractStart: "23/7/2025",
        contractEnd: "23/7/2026",
        startDate: "2025-07-23",
        endDate: "2026-07-23",
        rateType: "2 = Day",
        rentalPrice: 45,
        quantity: 1,
        deposit: "$300",
        numericDeposit: 300,
        total: "$450",
        numericTotal: 450,
        status: "Active",
        discount: 0,
        taxPercent: 5,
        notes: "Standard contract note.",
        additionalData: {
          driverLicenseNumber: "9876543210",
          currentMileage: "45000 KM",
          fuelLevel: "Full",
        },
        invoices: [
          { id: "#12", returnDate: "23/7/2025", damage: "damaged", total: "$350", paid: "$250", status: "Paid" },
          { id: "#12", returnDate: "23/7/2025", damage: "damaged", total: "$350", paid: "$250", status: "Paid" },
        ],
      },
    };
  }

  return {
    status: 200,
    data: contract,
  };
}

export async function createRental(payload) {
  const nextNum = memoryRentals.length + 1001;
  const contractNum = payload.contractNumber || `RC-${nextNum}`;
  
  const rentalPrice = Number(payload.rentalPrice || payload.rate || 0);
  const qty = Number(payload.quantity || 1);
  const discount = Number(payload.discount || 0);
  const taxPercent = Number(payload.taxPercent || 0);
  const deposit = Number(payload.securityDeposit || payload.deposit || 0);

  const subtotal = rentalPrice * qty - discount;
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = subtotal + taxAmount;

  const newContract = {
    id: contractNum,
    numericId: nextNum,
    contractNumber: contractNum,
    customer: payload.customerName || payload.customer || "Ahmed Khaled",
    customerName: payload.customerName || payload.customer || "Ahmed Khaled",
    resource: payload.resource || "Toyota Hilux Pic..",
    resourceName: payload.resource || "Toyota Hilux Pick-up",
    service: payload.service || "Vehicle Rental",
    serviceName: payload.service || "Vehicle Rental",
    period: payload.startDate || "2026-07-01",
    startDate: payload.startDate || "2026-07-01",
    endDate: payload.endDate || "2027-07-01",
    rate: `USD ${rentalPrice}/${payload.rateType || "day"} × ${qty}`,
    rateType: payload.rateType || "1=Day",
    rentalPrice: rentalPrice,
    quantity: qty,
    deposit: `$${deposit}`,
    numericDeposit: deposit,
    total: `$${total.toFixed(0)}`,
    numericTotal: total,
    status: payload.status || "Active",
    costCenter: payload.costCenter || "Main Branch",
    currency: payload.currency || "USD",
    paymentMethod: payload.paymentMethod || "Card",
    discount: discount,
    taxPercent: taxPercent,
    notes: payload.notes || "",
    additionalData: {
      driverLicenseNumber: payload.driverLicenseNumber || "9876543210",
      currentMileage: payload.currentMileage || "45000 KM",
      fuelLevel: payload.fuelLevel || "Full",
      ...payload.dynamicDetails,
    },
    invoices: [],
  };

  memoryRentals = [newContract, ...memoryRentals];
  return {
    status: 200,
    data: newContract,
    message: "Rental contract created successfully!",
  };
}

export async function updateRental(id, payload) {
  const index = memoryRentals.findIndex(
    (r) => String(r.id) === String(id) || String(r.contractNumber) === String(id)
  );
  if (index !== -1) {
    memoryRentals[index] = {
      ...memoryRentals[index],
      ...payload,
    };
    return {
      status: 200,
      data: memoryRentals[index],
      message: "Rental contract updated successfully!",
    };
  }
  return {
    status: 200,
    message: "Rental contract updated!",
  };
}

export async function cancelRentalContract({ id, cancellationReason, refundAccount, refundAmount }) {
  const contract = memoryRentals.find(
    (r) => String(r.id) === String(id) || String(r.contractNumber) === String(id)
  );
  if (contract) {
    contract.status = "Canceled";
    contract.cancellation = {
      cancellationReason,
      refundAccount,
      refundAmount,
      canceledAt: new Date().toISOString(),
    };
  }
  return {
    status: 200,
    data: { id, status: "Canceled" },
    message: "Contract canceled successfully!",
  };
}

export async function deleteRental(id) {
  memoryRentals = memoryRentals.filter(
    (r) => String(r.id) !== String(id) && String(r.contractNumber) !== String(id)
  );
  return {
    status: 200,
    data: { success: true },
    message: "Contract deleted successfully!",
  };
}

export async function getRentalLookups() {
  return {
    status: 200,
    data: {
      resources: [
        { id: "res-1", name: "Toyota Hilux Pick-up" },
        { id: "res-2", name: "Hyundai Tucson SUV" },
        { id: "res-3", name: "Toyota Land Cruiser 4WD" },
        { id: "res-4", name: "Conference Hall A" },
        { id: "res-5", name: "Dental Operatory Chair #3" },
      ],
      services: [
        { id: "srv-1", name: "Vehicle Rental" },
        { id: "srv-2", name: "Facility Rental" },
        { id: "srv-3", name: "Equipment Rental" },
      ],
      costCenters: [
        { id: "cc-1", name: "Main Branch" },
        { id: "cc-2", name: "VIP Fleet" },
        { id: "cc-3", name: "Conference Center" },
        { id: "cc-4", name: "Clinical Suites" },
      ],
      currencies: [
        { id: "USD", name: "USD - US Dollar" },
        { id: "SAR", name: "SAR - Saudi Riyal" },
        { id: "AED", name: "AED - UAE Dirham" },
        { id: "EUR", name: "EUR - Euro" },
      ],
      paymentMethods: [
        { id: "Card", name: "Card" },
        { id: "Cash", name: "Cash" },
        { id: "Bank Transfer", name: "Bank Transfer" },
      ],
      rateTypes: [
        { id: "1=Day", name: "1=Day" },
        { id: "2=Hour", name: "2=Hour" },
        { id: "3=Week", name: "3=Week" },
        { id: "4=Month", name: "4=Month" },
      ],
      statuses: ["Draft", "Active", "Closed", "Canceled"],
      refundAccounts: [
        { id: "acc-1", name: "Main Cash Box" },
        { id: "acc-2", name: "Al Rajhi Bank - Operating" },
        { id: "acc-3", name: "SNB Bank - Corporate" },
      ],
    },
  };
}

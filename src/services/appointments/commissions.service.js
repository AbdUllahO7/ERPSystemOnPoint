import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Commissions
// ==========================================

export const INITIAL_COMMISSIONS_STATS = [
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

export const COMMISSION_TYPES = [
  { id: "Percentage", label: "Percentage" },
  { id: "Fixed Amount", label: "Fixed Amount" },
];

export const INITIAL_PROVIDER_COMMISSION_RULES = [
  {
    id: 1,
    providerId: "1",
    provider: "Dr. Rami Haddad",
    serviceId: "1",
    service: "Dental Cleaning",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 2,
    providerId: "2",
    provider: "Dr. Sara Al-Mansoor",
    serviceId: "2",
    service: "Teeth Whitening",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 3,
    providerId: "3",
    provider: "Dr. Tariq Nasser",
    serviceId: "3",
    service: "Tooth Extraction",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 4,
    providerId: "4",
    provider: "Dr. Layla Mahmoud",
    serviceId: "4",
    service: "Root Canal",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 5,
    providerId: "5",
    provider: "Dr. Khaled Al-Zahrani",
    serviceId: "5",
    service: "Consultation",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 6,
    providerId: "6",
    provider: "Dr. Mona Al-Ahmad",
    serviceId: "6",
    service: "Crown Fitting",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 7,
    providerId: "7",
    provider: "Dr. Ziad Barakat",
    serviceId: "7",
    service: "Orthodontic Checkup",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
  {
    id: 8,
    providerId: "8",
    provider: "Dr. Reem Al-Khatib",
    serviceId: "8",
    service: "Routine Exam",
    type: "Percentage",
    value: "20%",
    percentageValue: "20",
    startDate: "2026-01-01",
  },
];

export const INITIAL_COMMISSION_LEDGER_ENTRIES = [
  {
    id: 1,
    date: "23/7/2025",
    provider: "Dr. Rami Haddad",
    service: "Dental Cleaning",
    customer: "Ahmed Ali",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 2,
    date: "23/7/2025",
    provider: "Dr. Sara Al-Mansoor",
    service: "Teeth Whitening",
    customer: "Omar Farooq",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 3,
    date: "23/7/2025",
    provider: "Dr. Tariq Nasser",
    service: "Tooth Extraction",
    customer: "Nour Salem",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 4,
    date: "23/7/2025",
    provider: "Dr. Layla Mahmoud",
    service: "Root Canal",
    customer: "Hassan Qasim",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 5,
    date: "23/7/2025",
    provider: "Dr. Khaled Al-Zahrani",
    service: "Consultation",
    customer: "Youssef Nabil",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 6,
    date: "23/7/2025",
    provider: "Dr. Mona Al-Ahmad",
    service: "Crown Fitting",
    customer: "Fatima Zein",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 7,
    date: "23/7/2025",
    provider: "Dr. Ziad Barakat",
    service: "Orthodontic Checkup",
    customer: "Kareem Adel",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
  {
    id: 8,
    date: "23/7/2025",
    provider: "Dr. Reem Al-Khatib",
    service: "Routine Exam",
    customer: "Samir Hanna",
    amount: "$12",
    numericAmount: 12,
    status: "Pending",
  },
];

// In-memory state
let _commissionRules = [...INITIAL_PROVIDER_COMMISSION_RULES];
let _commissionLedger = [...INITIAL_COMMISSION_LEDGER_ENTRIES];

// ==========================================
// Service Methods
// ==========================================

export async function getCommissionLookups() {
  return {
    status: 200,
    data: {
      providers: [
        { id: "1", name: "Dr. Rami Haddad" },
        { id: "2", name: "Dr. Sara Al-Mansoor" },
        { id: "3", name: "Dr. Tariq Nasser" },
        { id: "4", name: "Dr. Layla Mahmoud" },
        { id: "5", name: "Dr. Khaled Al-Zahrani" },
      ],
      services: [
        { id: "1", name: "Dental Cleaning" },
        { id: "2", name: "Teeth Whitening" },
        { id: "3", name: "Tooth Extraction" },
        { id: "4", name: "Root Canal" },
        { id: "5", name: "Consultation" },
      ],
      types: COMMISSION_TYPES,
    },
  };
}

export async function getProviderCommissionRules(params = {}) {
  const { PageNumber = 1, PageSize = 10, SearchTerm, Provider, Service } = params;

  let filtered = [..._commissionRules];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.provider.toLowerCase().includes(term) ||
        r.service.toLowerCase().includes(term) ||
        r.type.toLowerCase().includes(term)
    );
  }

  if (Provider && Provider !== "all") {
    filtered = filtered.filter((r) => r.providerId === Provider || r.provider === Provider);
  }

  if (Service && Service !== "all") {
    filtered = filtered.filter((r) => r.serviceId === Service || r.service === Service);
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PageSize) || 1;
  const start = (PageNumber - 1) * PageSize;
  const items = filtered.slice(start, start + PageSize);

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

export async function createCommissionRule(data) {
  const newId = _commissionRules.length > 0
    ? Math.max(..._commissionRules.map((r) => r.id)) + 1
    : 1;

  const newRule = {
    id: newId,
    providerId: data.providerId || "1",
    provider: data.provider || "Dr. Rami Haddad",
    serviceId: data.serviceId || "1",
    service: data.service || "Dental Cleaning",
    type: data.type || "Percentage",
    value: data.type === "Percentage" ? `${data.percentage || "20"}%` : `$${data.value || "20"}`,
    percentageValue: data.percentage || "20",
    startDate: data.startDate || new Date().toISOString().split("T")[0],
  };

  _commissionRules.unshift(newRule);

  return {
    status: 201,
    data: newRule,
    message: "Commission rule added successfully",
  };
}

export async function deleteCommissionRule(id) {
  _commissionRules = _commissionRules.filter((r) => String(r.id) !== String(id));
  return {
    status: 200,
    message: "Commission rule deleted successfully",
  };
}

export async function getCommissionLedgerStats() {
  return {
    status: 200,
    data: INITIAL_COMMISSIONS_STATS,
  };
}

export async function getCommissionLedger(params = {}) {
  const { PageNumber = 1, PageSize = 10, SearchTerm, Status, Provider } = params;

  let filtered = [..._commissionLedger];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.provider.toLowerCase().includes(term) ||
        item.service.toLowerCase().includes(term) ||
        item.customer.toLowerCase().includes(term) ||
        item.date.includes(term)
    );
  }

  if (Status && Status !== "all") {
    filtered = filtered.filter(
      (item) => item.status.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Provider && Provider !== "all") {
    filtered = filtered.filter((item) => item.provider === Provider);
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PageSize) || 1;
  const start = (PageNumber - 1) * PageSize;
  const items = filtered.slice(start, start + PageSize);

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

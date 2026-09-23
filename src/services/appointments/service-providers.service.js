import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Service Providers
// ==========================================

export const INITIAL_SERVICE_PROVIDERS_STATS = [
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

export const DAYS_OF_WEEK = [
  { id: "Sat", label: "Sat", full: "Saturday" },
  { id: "Sun", label: "Sun", full: "Sunday" },
  { id: "Mon", label: "Mon", full: "Monday" },
  { id: "Tue", label: "Tue", full: "Tuesday" },
  { id: "Wed", label: "Wed", full: "Wednesday" },
  { id: "Thu", label: "Thu", full: "Thursday" },
  { id: "Fri", label: "Fri", full: "Friday" },
];

export const INITIAL_SERVICE_PROVIDERS_LIST = [
  {
    id: 1,
    employeeId: "EMP-101",
    name: "Dr. Rami Haddad",
    phone: "+963991000101",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 2,
    employeeId: "EMP-102",
    name: "Dr. Sara Al-Mansoor",
    phone: "+963991000102",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 3,
    employeeId: "EMP-103",
    name: "Dr. Tariq Nasser",
    phone: "+963991000103",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 4,
    employeeId: "EMP-104",
    name: "Dr. Layla Mahmoud",
    phone: "+963991000104",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 5,
    employeeId: "EMP-105",
    name: "Dr. Khaled Al-Zahrani",
    phone: "+963991000105",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 6,
    employeeId: "EMP-106",
    name: "Dr. Mona Al-Ahmad",
    phone: "+963991000106",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 7,
    employeeId: "EMP-107",
    name: "Dr. Ziad Barakat",
    phone: "+963991000107",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
  {
    id: 8,
    employeeId: "EMP-108",
    name: "Dr. Reem Al-Khatib",
    phone: "+963991000108",
    workingDays: ["Sun", "Mon", "Tue", "Wed"],
    status: "Active",
  },
];

// Sample reservations data for calendar matching screenshot
export const INITIAL_PROVIDER_RESERVATIONS = [
  {
    id: 101,
    day: 29,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Ahmed Ali",
    type: "blue", // blue badge
    status: "Confirmed",
  },
  {
    id: 102,
    day: 1,
    time: "9:00-9:30",
    service: "Consultation",
    patient: "Omar Farooq",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 103,
    day: 3,
    time: "9:00-9:30",
    service: "Teeth Whitening",
    patient: "Nour Salem",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 104,
    day: 3,
    time: "9:00-9:30",
    service: "Root Canal Follow-up",
    patient: "Hassan Qasim",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 105,
    day: 5,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Youssef Nabil",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 106,
    day: 5,
    time: "9:00-9:30",
    service: "Orthodontic Checkup",
    patient: "Fatima Zein",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 107,
    day: 7,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Kareem Adel",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 108,
    day: 9,
    time: "9:00-9:30",
    service: "Tooth Extraction",
    patient: "Samir Hanna",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 109,
    day: 9,
    time: "9:00-9:30",
    service: "Crown Fitting",
    patient: "Salma Mansour",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 110,
    day: 11,
    time: "9:00-9:30",
    service: "Routine Exam",
    patient: "Ibrahim Khalil",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 111,
    day: 13,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Hana Shaker",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 112,
    day: 17,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Majid Al-Otaibi",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 113,
    day: 19,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Layla Murad",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 114,
    day: 19,
    time: "9:00-9:30",
    service: "Orthodontic Adjustment",
    patient: "Bassam Tariq",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 115,
    day: 19,
    time: "9:00-9:30",
    service: "Urgent Consultation",
    patient: "Dina Hamed",
    type: "red",
    status: "No Show",
  },
  {
    id: 116,
    day: 23,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Tarek Younis",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 117,
    day: 25,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Amal Saad",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 118,
    day: 25,
    time: "9:00-9:30",
    service: "Filling Replacement",
    patient: "Fahad Al-Harbi",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 119,
    day: 25,
    time: "9:00-9:30",
    service: "Root Canal",
    patient: "Nasser Al-Subaie",
    type: "red",
    status: "Cancelled",
  },
  {
    id: 120,
    day: 27,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Rana Jameel",
    type: "blue",
    status: "Confirmed",
  },
  {
    id: 121,
    day: 27,
    time: "9:00-9:30",
    service: "Checkup",
    patient: "Walid Rasheed",
    type: "orange",
    status: "Scheduled",
  },
  {
    id: 122,
    day: 27,
    time: "9:00-9:30",
    service: "Emergency Pain Relief",
    patient: "Mazen Al-Ghamdi",
    type: "red",
    status: "Cancelled",
  },
  {
    id: 123,
    day: 31,
    time: "9:00-9:30",
    service: "Dental Cleaning",
    patient: "Ghassan Tawfiq",
    type: "blue",
    status: "Confirmed",
  },
];

// In-memory state store
let _serviceProviders = [...INITIAL_SERVICE_PROVIDERS_LIST];
let _providerReservations = [...INITIAL_PROVIDER_RESERVATIONS];

// ==========================================
// Service Provider Service Methods
// ==========================================

export async function getServiceProvidersStats() {
  return {
    status: 200,
    data: INITIAL_SERVICE_PROVIDERS_STATS,
  };
}

export async function getServiceProviders(params = {}) {
  const { PageNumber = 1, PageSize = 10, SearchTerm, Status, Day } = params;

  let filtered = [..._serviceProviders];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.employeeId.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.phone.toLowerCase().includes(term)
    );
  }

  if (Status && Status !== "all") {
    filtered = filtered.filter(
      (p) => p.status.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Day && Day !== "all") {
    filtered = filtered.filter((p) => p.workingDays.includes(Day));
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

export async function getServiceProviderById(id) {
  const provider = _serviceProviders.find((p) => String(p.id) === String(id));
  if (!provider) {
    // Default fallback mock provider
    return {
      status: 200,
      data: {
        id: Number(id),
        employeeId: "#266544",
        name: "Dr. Rami Haddad",
        phone: "+965 4599 158 323",
        workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        status: "Active",
      },
    };
  }

  return {
    status: 200,
    data: {
      ...provider,
      // If full days needed for details view matching mockup
      workingDays: provider.workingDays || [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ],
    },
  };
}

export async function getServiceProviderReservations(providerId, monthYear = "2026-09") {
  return {
    status: 200,
    data: _providerReservations,
  };
}

export async function createServiceProvider(data) {
  const newId = _serviceProviders.length > 0
    ? Math.max(..._serviceProviders.map((p) => p.id)) + 1
    : 1;

  const newProvider = {
    id: newId,
    employeeId: data.employeeId || `EMP-${100 + newId}`,
    name: data.name || "",
    phone: data.phone || "",
    workingDays: data.workingDays || ["Sun", "Mon", "Tue", "Wed"],
    status: data.active ? "Active" : "Inactive",
  };

  _serviceProviders.unshift(newProvider);

  return {
    status: 201,
    data: newProvider,
    message: "Service provider created successfully",
  };
}

export async function updateServiceProvider(id, data) {
  const index = _serviceProviders.findIndex((p) => String(p.id) === String(id));
  if (index === -1) {
    return {
      status: 404,
      message: "Service provider not found",
    };
  }

  _serviceProviders[index] = {
    ..._serviceProviders[index],
    employeeId: data.employeeId || _serviceProviders[index].employeeId,
    name: data.name || _serviceProviders[index].name,
    phone: data.phone || _serviceProviders[index].phone,
    workingDays: data.workingDays || _serviceProviders[index].workingDays,
    status: data.active !== undefined
      ? data.active ? "Active" : "Inactive"
      : _serviceProviders[index].status,
  };

  return {
    status: 200,
    data: _serviceProviders[index],
    message: "Service provider updated successfully",
  };
}

export async function deleteServiceProvider(id) {
  _serviceProviders = _serviceProviders.filter((p) => String(p.id) !== String(id));
  return {
    status: 200,
    message: "Service provider deleted successfully",
  };
}

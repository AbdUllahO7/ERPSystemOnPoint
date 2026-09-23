import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Appointments List
// ==========================================

export const INITIAL_APPOINTMENT_STATS = [
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

export const INITIAL_APPOINTMENTS_LIST = [
  {
    id: 1,
    customer: "Ahmed Khaled",
    service: "General Consultation",
    provider: "Dr. Rami Haddad",
    date: "2026-07-08",
    time: "09:00 – 09:30",
    total: "$60",
    price: "60",
    currency: "USD",
    status: "Completed",
    isInvoiced: true,
    notes: "Regular follow-up consultation and vital statistics review.",
    billingMethod: "per-visit",
    paymentMethod: "Credit Card",
    costCenter: "Main Clinic",
    warehouse: "Medical Supplies Store",
    amountPaidNow: "60",
    materialDetails: "Standard consultation materials and disposables.",
    paymentSchedules: [
      {
        id: 1,
        amount: 500,
        date: "June 21, 2026",
        notes:
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
      },
      {
        id: 2,
        amount: 500,
        date: "June 21, 2026",
        notes:
          "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
      },
    ],
  },
  {
    id: 2,
    customer: "Sarah Jenkins",
    service: "Dental Checkup",
    provider: "Dr. Michael Chen",
    date: "2026-07-08",
    time: "09:30 – 10:00",
    total: "$120",
    price: "120",
    currency: "USD",
    status: "Scheduled",
    isInvoiced: false,
    notes: "First time visit for dental cleaning.",
    billingMethod: "per-visit",
    paymentMethod: "Cash",
    costCenter: "Dental Unit",
    warehouse: "Central Warehouse",
    amountPaidNow: "0",
    materialDetails: "Dental hygiene kit.",
    paymentSchedules: [],
  },
  {
    id: 3,
    customer: "Omar Al-Mansoor",
    service: "Dermatology Screening",
    provider: "Dr. Layla Nour",
    date: "2026-07-08",
    time: "10:00 – 10:45",
    total: "$150",
    price: "150",
    currency: "USD",
    status: "Confirmed",
    isInvoiced: true,
    notes: "Follow-up after topical treatment.",
    billingMethod: "per-visit",
    paymentMethod: "Bank Transfer",
    costCenter: "Outpatient",
    warehouse: "Central Warehouse",
    amountPaidNow: "150",
    materialDetails: "Dermatology scan reagents.",
    paymentSchedules: [],
  },
  {
    id: 4,
    customer: "Mona Salem",
    service: "Physiotherapy Session",
    provider: "Dr. Karim Zaid",
    date: "2026-07-08",
    time: "11:00 – 11:30",
    total: "$80",
    price: "80",
    currency: "USD",
    status: "In Progress",
    isInvoiced: false,
    notes: "Shoulder rehabilitation session.",
    billingMethod: "per-visit",
    paymentMethod: "Insurance",
    costCenter: "Rehab Center",
    warehouse: "Central Warehouse",
    amountPaidNow: "0",
    materialDetails: "Kinesiology tape and band.",
    paymentSchedules: [],
  },
  {
    id: 5,
    customer: "David Miller",
    service: "Eye Exam",
    provider: "Dr. Rami Haddad",
    date: "2026-07-08",
    time: "11:30 – 12:00",
    total: "$60",
    price: "60",
    currency: "USD",
    status: "Completed",
    isInvoiced: true,
    notes: "Routine prescription check.",
    billingMethod: "per-visit",
    paymentMethod: "Credit Card",
    costCenter: "Main Clinic",
    warehouse: "Central Warehouse",
    amountPaidNow: "60",
    materialDetails: "Vision test lens set.",
    paymentSchedules: [],
  },
  {
    id: 6,
    customer: "Fatima Al-Sayed",
    service: "General Consultation",
    provider: "Dr. Layla Nour",
    date: "2026-07-08",
    time: "12:00 – 12:30",
    total: "$60",
    price: "60",
    currency: "USD",
    status: "No Show",
    isInvoiced: false,
    notes: "Client did not attend.",
    billingMethod: "per-visit",
    paymentMethod: "Cash",
    costCenter: "Main Clinic",
    warehouse: "Central Warehouse",
    amountPaidNow: "0",
    materialDetails: "",
    paymentSchedules: [],
  },
  {
    id: 7,
    customer: "Ali Hassan",
    service: "Blood Test Analysis",
    provider: "Dr. Michael Chen",
    date: "2026-07-08",
    time: "13:00 – 13:30",
    total: "$95",
    price: "95",
    currency: "USD",
    status: "Completed",
    isInvoiced: true,
    notes: "Lab results review and prescription update.",
    billingMethod: "per-visit",
    paymentMethod: "Credit Card",
    costCenter: "Laboratory",
    warehouse: "Medical Supplies Store",
    amountPaidNow: "95",
    materialDetails: "Lab blood sample tubes.",
    paymentSchedules: [],
  },
  {
    id: 8,
    customer: "Elena Rostova",
    service: "Cardiology Review",
    provider: "Dr. Karim Zaid",
    date: "2026-07-08",
    time: "14:00 – 14:45",
    total: "$200",
    price: "200",
    currency: "USD",
    status: "Confirmed",
    isInvoiced: true,
    notes: "ECG routine review.",
    billingMethod: "per-visit",
    paymentMethod: "Insurance",
    costCenter: "Cardiology Clinic",
    warehouse: "Medical Supplies Store",
    amountPaidNow: "200",
    materialDetails: "ECG electrodes.",
    paymentSchedules: [],
  },
];

// Memory store shared across service modules
export let appointmentsDataStore = [...INITIAL_APPOINTMENTS_LIST];

export function setAppointmentsDataStore(newData) {
  appointmentsDataStore = newData;
}

// ==========================================
// Service Methods: Appointments List Page
// ==========================================

export async function getAppointmentStats() {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Appointments/GetStats", method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: INITIAL_APPOINTMENT_STATS,
        status: 200,
        message: "Stats retrieved successfully",
      });
    }, 150);
  });
}

export async function getAppointments(params = {}) {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Appointments/GetAll", method: "GET", params });

  return new Promise((resolve) => {
    setTimeout(() => {
      const {
        SearchTerm = "",
        Status = "All",
        Provider = "all",
        Service = "all",
        PageNumber = 1,
        PageSize = 10,
      } = params;

      let filtered = [...appointmentsDataStore];

      if (Status && Status !== "All") {
        filtered = filtered.filter((item) => item.status === Status);
      }
      if (Provider && Provider !== "all") {
        filtered = filtered.filter((item) => item.provider === Provider);
      }
      if (Service && Service !== "all") {
        filtered = filtered.filter((item) => item.service === Service);
      }
      if (SearchTerm) {
        const query = SearchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            String(item.id).includes(query) ||
            item.customer.toLowerCase().includes(query) ||
            item.provider.toLowerCase().includes(query) ||
            item.service.toLowerCase().includes(query)
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
        message: "Appointments retrieved successfully",
      });
    }, 150);
  });
}

export async function deleteAppointment(id) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Appointments/Delete/${id}`, method: "DELETE" });

  return new Promise((resolve) => {
    setTimeout(() => {
      appointmentsDataStore = appointmentsDataStore.filter(
        (a) => String(a.id) !== String(id)
      );
      resolve({
        status: 200,
        message: "Appointment deleted successfully",
      });
    }, 150);
  });
}

export async function changeAppointmentStatus({ id, status }) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Appointments/ChangeStatus/${id}`, method: "PATCH", data: { status } });

  return new Promise((resolve) => {
    setTimeout(() => {
      appointmentsDataStore = appointmentsDataStore.map((a) =>
        String(a.id) === String(id) ? { ...a, status } : a
      );
      resolve({
        status: 200,
        message: "Status updated successfully",
      });
    }, 150);
  });
}

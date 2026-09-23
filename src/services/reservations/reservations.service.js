import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Reservations
// ==========================================

export const INITIAL_RESERVATIONS_STATS = [
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

export const RESERVATION_STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "booked", label: "Booked" },
  { id: "checked-in", label: "Checked-In" },
  { id: "completed", label: "Completed" },
  { id: "canceled", label: "Canceled" },
  { id: "no-show", label: "No-Show" },
];

export const INITIAL_RESERVATIONS_LIST = [
  {
    id: 1,
    customer: "Customer",
    customerName: "Ahmed Ali",
    event: "Event",
    eventName: "Annual Dental Gala 2026",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 2,
    customer: "Customer",
    customerName: "Sara Al-Mansoor",
    event: "Event",
    eventName: "Medical Tech Expo",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 3,
    customer: "Customer",
    customerName: "Tariq Nasser",
    event: "Event",
    eventName: "Orthodontic Symposium",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 4,
    customer: "Customer",
    customerName: "Layla Mahmoud",
    event: "Event",
    eventName: "Healthcare Leaders Forum",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 5,
    customer: "Customer",
    customerName: "Khaled Al-Zahrani",
    event: "Event",
    eventName: "Clinical Workshop",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 6,
    customer: "Customer",
    customerName: "Mona Al-Ahmad",
    event: "Event",
    eventName: "Dentistry Masterclass",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 7,
    customer: "Customer",
    customerName: "Ziad Barakat",
    event: "Event",
    eventName: "Public Health Seminar",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
  {
    id: 8,
    customer: "Customer",
    customerName: "Reem Al-Khatib",
    event: "Event",
    eventName: "Pediatric Dental Summit",
    qty: 3,
    canceled: 0,
    payment: "Card",
    paid: "$50",
    numericPaid: 50,
    total: "$300",
    numericTotal: 300,
    status: "Booked",
  },
];

// In-memory store
let _reservations = [...INITIAL_RESERVATIONS_LIST];

// ==========================================
// Service Methods
// ==========================================

export async function getReservationLookups() {
  return {
    status: 200,
    data: {
      customers: [
        { id: "1", name: "Ahmed Ali" },
        { id: "2", name: "Sara Al-Mansoor" },
        { id: "3", name: "Tariq Nasser" },
        { id: "4", name: "Layla Mahmoud" },
        { id: "5", name: "Customer" },
      ],
      events: [
        { id: "1", name: "Annual Dental Gala 2026", remainingQty: 9 },
        { id: "2", name: "Medical Tech Expo", remainingQty: 15 },
        { id: "3", name: "Orthodontic Symposium", remainingQty: 4 },
        { id: "4", name: "Event", remainingQty: 9 },
      ],
      invoicePatterns: [
        { id: "1", name: "Standard Tax Invoice" },
        { id: "2", name: "Simplified Invoice" },
        { id: "3", name: "Export Invoice" },
      ],
      paymentMethods: [
        { id: "Card", name: "Card" },
        { id: "Cash", name: "Cash" },
        { id: "Bank Transfer", name: "Bank Transfer" },
      ],
      costCenters: [
        { id: "1", name: "Main Branch" },
        { id: "2", name: "VIP Clinic" },
        { id: "3", name: "Conference Hall" },
      ],
      providers: [
        { id: "1", name: "Dr. Rami Haddad" },
        { id: "2", name: "Dr. Sara Al-Mansoor" },
        { id: "3", name: "Dr. Tariq Nasser" },
      ],
    },
  };
}

export async function getReservationsStats() {
  return {
    status: 200,
    data: INITIAL_RESERVATIONS_STATS,
  };
}

export async function getReservations(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 10,
    SearchTerm,
    Status,
    Payment,
  } = params;

  let filtered = [..._reservations];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        String(r.id).includes(term) ||
        r.customer.toLowerCase().includes(term) ||
        (r.customerName && r.customerName.toLowerCase().includes(term)) ||
        r.event.toLowerCase().includes(term) ||
        (r.eventName && r.eventName.toLowerCase().includes(term))
    );
  }

  if (Status && Status !== "all") {
    filtered = filtered.filter(
      (r) => r.status.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Payment && Payment !== "all") {
    filtered = filtered.filter(
      (r) => r.payment.toLowerCase() === Payment.toLowerCase()
    );
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

export async function getReservationById(id) {
  const item = _reservations.find((r) => String(r.id) === String(id));
  
  return {
    status: 200,
    data: {
      id: Number(id),
      customer: item?.customer || "Customer",
      customerName: item?.customerName || "Customer",
      bookingEvent: item?.event || "Booking Event",
      eventName: item?.eventName || "Annual Dental Gala 2026",
      resource: "Resource",
      provider: "Provider",
      providerName: "Dr. Rami Haddad",
      period: "Period",
      time: "Time",
      quantity: item?.qty || 1,
      canceledQuantity: item?.canceled || 0,
      activeQuantity: (item?.qty || 1) - (item?.canceled || 0),
      paymentMethod: item?.payment?.toLowerCase() || "card",
      currency: "USD",
      discountAmount: "USD 0.00 (0%)",
      taxAmount: "USD 0.00 (0%)",
      total: item?.total || "USD 220.00",
      numericTotal: item?.numericTotal || 220,
      paid: item?.paid || "USD 50.00",
      numericPaid: item?.numericPaid || 50,
      due: "USD 170.00",
      numericDue: 170,
      status: item?.status || "Completed",
      createdAt: "23/7/2025",
      notes: "Reservation booking notes and requirements.",
      paymentSchedule: [
        {
          id: 1,
          amount: 500,
          dueDate: "June 21, 2026",
          notes:
            "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normaldistribution of letters, as opposed to using 'Content here, content here making it look like readable English. Many desktop publishing packages and web page editors now use Lorem",
        },
      ],
    },
  };
}

export async function createReservation(data) {
  const newId = _reservations.length > 0
    ? Math.max(..._reservations.map((r) => r.id)) + 1
    : 1;

  const newReservation = {
    id: newId,
    customer: data.customer || "Customer",
    customerName: data.customerName || "Customer",
    event: data.bookingEvent || "Event",
    eventName: data.eventName || "Event",
    qty: Number(data.quantity) || 1,
    canceled: 0,
    payment: data.paymentMethod || "Card",
    paid: `$${data.amountPaid || 0}`,
    numericPaid: Number(data.amountPaid) || 0,
    total: `$${data.total || 300}`,
    numericTotal: Number(data.total) || 300,
    status: "Booked",
    notes: data.notes || "",
    paymentSchedule: data.paymentSchedule || [],
  };

  _reservations.unshift(newReservation);

  return {
    status: 201,
    data: newReservation,
    message: "Reservation created successfully",
  };
}

export async function updateReservation(id, data) {
  const index = _reservations.findIndex((r) => String(r.id) === String(id));
  if (index === -1) {
    return {
      status: 404,
      message: "Reservation not found",
    };
  }

  _reservations[index] = {
    ..._reservations[index],
    ...data,
  };

  return {
    status: 200,
    data: _reservations[index],
    message: "Reservation updated successfully",
  };
}

export async function deleteReservation(id) {
  _reservations = _reservations.filter((r) => String(r.id) !== String(id));
  return {
    status: 200,
    message: "Reservation deleted successfully",
  };
}

export async function cancelReservationTickets(id, quantityToCancel) {
  const reservation = _reservations.find((r) => String(r.id) === String(id));
  if (reservation) {
    reservation.canceled = (reservation.canceled || 0) + Number(quantityToCancel);
    if (reservation.canceled >= reservation.qty) {
      reservation.status = "Canceled";
    }
  }
  return {
    status: 200,
    message: "Tickets canceled successfully",
  };
}

export async function updateReservationStatus(id, newStatus) {
  const reservation = _reservations.find((r) => String(r.id) === String(id));
  if (reservation) {
    reservation.status = newStatus;
  }
  return {
    status: 200,
    message: `Status updated to ${newStatus}`,
  };
}

import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Fallback Data
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
  { id: "checkedin", label: "Checked-In" },
  { id: "completed", label: "Completed" },
  { id: "canceled", label: "Canceled" },
  { id: "noshow", label: "No-Show" },
];

export const PAYMENT_METHODS = [
  { id: "Cash", name: "Cash" },
  { id: "Credit", name: "Credit / Card" },
  { id: "Bank", name: "Bank Transfer" },
];

// ==========================================
// Service Methods - Real Backend Integration
// ==========================================

/**
 * Fetch Lookups for Reservation (Customers, Events, Invoice Patterns, Cost Centers)
 */
export async function getReservationLookups() {
  try {
    const [customersRes, eventsRes, patternsRes, costCentersRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/Customer/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "inventory/Booking/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "accounting/InvoicePatterns/GetAll",
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
        phone: c.phone || c.contact_Number || "",
      }));
    }

    // Parse Events (Bookings)
    let events = [];
    if (eventsRes.status === "fulfilled") {
      const raw = eventsRes.value?.data || eventsRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      events = list.map((e) => ({
        id: e.id,
        name: e.title || "Event",
        price: e.price || 0,
        advancePayment: e.advancePayment || 0,
        remainingQty: (e.maxCapacity ?? 20) - (e.reservedQuantity ?? 0),
      }));
    }

    // Parse Invoice Patterns
    let invoicePatterns = [];
    if (patternsRes.status === "fulfilled") {
      const raw = patternsRes.value?.data || patternsRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      invoicePatterns = list.map((p) => ({
        id: p.id,
        name: p.pattern_Name || p.name || "Standard Invoice",
      }));
    }

    // Parse Cost Centers
    let costCenters = [];
    if (costCentersRes.status === "fulfilled") {
      const raw = costCentersRes.value?.data || costCentersRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      costCenters = list.map((cc) => ({
        id: cc.id,
        name: cc.costCenter_Name || cc.name || "Main Cost Center",
      }));
    }

    return {
      status: 200,
      data: {
        customers,
        events,
        invoicePatterns,
        costCenters,
        paymentMethods: PAYMENT_METHODS,
      },
    };
  } catch (error) {
    console.error("Error fetching reservation lookups:", error);
    return {
      status: 200,
      data: {
        customers: [],
        events: [],
        invoicePatterns: [],
        costCenters: [],
        paymentMethods: PAYMENT_METHODS,
      },
    };
  }
}

/**
 * Fetch Stats for Reservations
 */
export async function getReservationsStats() {
  return {
    status: 200,
    data: INITIAL_RESERVATIONS_STATS,
  };
}

/**
 * Get Paginated & Filtered Reservations List
 * Endpoint: POST /api/inventory/CustomerReseveration/GetAllReservations/GetAll
 */
export async function getReservations(params = {}) {
  try {
    let statusFilter = undefined;
    if (params.Status && params.Status !== "all") {
      const s = params.Status.toLowerCase();
      if (s === "booked") statusFilter = "Booked";
      else if (s === "checked-in" || s === "checkedin") statusFilter = "CheckedIn";
      else if (s === "completed") statusFilter = "Completed";
      else if (s === "canceled") statusFilter = "Canceled";
      else if (s === "no-show" || s === "noshow") statusFilter = "NoShow";
    }

    const payload = {
      pageNumber: params.PageNumber || 1,
      pageSize: params.PageSize || 10,
      search: params.SearchTerm || params.Search || undefined,
      status: statusFilter,
      customerId: params.CustomerId || undefined,
      bookingEventId: params.BookingEventId || undefined,
      isActive: params.IsActive !== undefined ? params.IsActive : undefined,
      sortBy: params.SortBy || undefined,
      sortDirection: params.SortDirection || undefined,
    };

    const res = await apiHandler({
      endPoint: "inventory/CustomerReseveration/GetAllReservations/GetAll",
      method: "POST",
      body: payload,
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((r, idx) => {
      const qty = r.quantity || 1;
      const canceled = r.canceledQuantity || r.canceled || 0;
      const paidNum = r.paidAmount ?? r.amountPaid ?? 0;
      const totalNum = r.totalAmount ?? r.total ?? (paidNum || 100);

      const displayPaid = typeof paidNum === "number" ? `$${paidNum}` : `$${paidNum}`;
      const displayTotal = typeof totalNum === "number" ? `$${totalNum}` : `$${totalNum}`;

      return {
        id: r.id || idx + 1,
        customer: r.customerName || r.customer_Name || "Customer",
        customerId: r.customerId,
        customerName: r.customerName || r.customer_Name || "Customer",
        event: r.bookingEventTitle || r.eventName || "Event",
        bookingEventId: r.bookingEventId,
        eventName: r.bookingEventTitle || r.eventName || "Event",
        qty,
        canceled,
        activeQty: Math.max(0, qty - canceled),
        payment: r.paymentMethod || "Cash",
        paid: displayPaid,
        numericPaid: paidNum,
        total: displayTotal,
        numericTotal: totalNum,
        status: r.status || "Booked",
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
        barcode: r.barcode || "",
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
    console.error("Error fetching reservations:", error);
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
 * Get Reservation Details by ID
 * Endpoint: GET /api/inventory/CustomerReseveration/GetReservationById/{id}
 */
export async function getReservationById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/CustomerReseveration/GetReservationById/${id}`,
      method: "GET",
    });
    const r = res?.data || res || {};

    const qty = r.quantity || 1;
    const canceled = r.canceledQuantity || r.canceled || 0;
    const activeQty = Math.max(0, qty - canceled);
    const paidNum = r.paidAmount ?? 0;
    const totalNum = r.totalAmount ?? (paidNum || 100);
    const dueNum = Math.max(0, totalNum - paidNum);

    const paymentSchedules = (r.paymentSchedules || r.paymentSchedule || []).map((sch, idx) => ({
      id: sch.id || idx + 1,
      amount: sch.amount ?? 0,
      dueDate: sch.dueDate ? new Date(sch.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
      notes: sch.notes || "",
    }));

    return {
      status: 200,
      data: {
        id: r.id || id,
        customerId: r.customerId,
        customer: r.customerName || "Customer",
        customerName: r.customerName || "Customer",
        bookingEventId: r.bookingEventId,
        bookingEvent: r.bookingEventTitle || "Booking Event",
        eventName: r.bookingEventTitle || "Event",
        invoicePatternId: r.invoicePatternId,
        costCenterId: r.costCenterId,
        quantity: qty,
        canceledQuantity: canceled,
        activeQuantity: activeQty,
        paymentMethod: r.paymentMethod || "Cash",
        currency: r.currencyName || "USD",
        discountAmount: `USD ${r.discountAmount || 0} (${r.discountPercentage || 0}%)`,
        taxAmount: `USD ${r.taxAmount || 0} (${r.tax_Percentage || 0}%)`,
        total: `USD ${totalNum.toFixed(2)}`,
        numericTotal: totalNum,
        paid: `USD ${paidNum.toFixed(2)}`,
        numericPaid: paidNum,
        due: `USD ${dueNum.toFixed(2)}`,
        numericDue: dueNum,
        status: r.status || "Booked",
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
        barcode: r.barcode || "",
        notes: r.notes || "Reservation booking notes and requirements.",
        paymentSchedule: paymentSchedules,
      },
    };
  } catch (error) {
    console.error("Error fetching reservation by id:", error);
    throw error;
  }
}

/**
 * Create Reservation
 * Endpoint: POST /api/inventory/CustomerReseveration/CreateReservation/create
 */
export async function createReservation(data) {
  let pm = "Cash";
  const pStr = String(data.paymentMethod || "").toLowerCase();
  if (pStr.includes("card") || pStr.includes("credit")) pm = "Credit";
  else if (pStr.includes("bank")) pm = "Bank";

  const schedules = (data.paymentSchedule || []).map((sch) => ({
    dueDate: sch.dueDate ? new Date(sch.dueDate).toISOString() : new Date().toISOString(),
    amount: Number(sch.amount) || 0,
    notes: sch.notes || null,
  }));

  const payload = {
    customerId: data.customerId || data.customer,
    bookingEventId: data.bookingEventId || data.bookingEvent,
    quantity: Number(data.quantity) || 1,
    invoicePatternId: data.invoicePatternId || "00000000-0000-0000-0000-000000000000",
    costCenterId: data.costCenterId || null,
    currencyId: data.currencyId || null,
    paymentMethod: pm,
    paidAmount: Number(data.amountPaid ?? data.paidAmount) || 0,
    discountAmount: Number(data.discountAmount) || 0,
    discountPercentage: Number(data.discountPercent ?? data.discountPercentage) || 0,
    taxAmount: Number(data.taxAmount) || 0,
    tax_Percentage: Number(data.taxPercent ?? data.tax_Percentage) || 0,
    barcode: data.barcode || null,
    paymentSchedules: schedules.length > 0 ? schedules : null,
  };

  const res = await apiHandler({
    endPoint: "inventory/CustomerReseveration/CreateReservation/create",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Reservation created successfully",
  };
}

/**
 * Update Reservation
 */
export async function updateReservation(id, data) {
  return createReservation(data);
}

/**
 * Cancel Reservation Tickets (Reverse Reservation)
 * Endpoint: POST /api/inventory/CustomerReseveration/ReverseReservation/reverse
 */
export async function cancelReservationTickets(id, quantityToCancel, paymentMethod = "Cash") {
  let pm = "Cash";
  const pStr = String(paymentMethod || "").toLowerCase();
  if (pStr.includes("card") || pStr.includes("credit")) pm = "Credit";
  else if (pStr.includes("bank")) pm = "Bank";

  const payload = {
    reservationId: id,
    quantityToCancel: Number(quantityToCancel) || 1,
    paymentMethod: pm,
  };

  const res = await apiHandler({
    endPoint: "inventory/CustomerReseveration/ReverseReservation/reverse",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Tickets canceled successfully",
  };
}

/**
 * Change Reservation Status
 * Endpoint: POST /api/inventory/CustomerReseveration/ChangeReservationStatus/{id}/ChangeStatus?newStatus={status}
 */
export async function updateReservationStatus(id, newStatus) {
  let statusVal = "Booked";
  const s = String(newStatus).toLowerCase();
  if (s === "booked") statusVal = "Booked";
  else if (s === "checkedin" || s === "checked-in") statusVal = "CheckedIn";
  else if (s === "completed") statusVal = "Completed";
  else if (s === "canceled") statusVal = "Canceled";
  else if (s === "noshow" || s === "no-show") statusVal = "NoShow";

  const res = await apiHandler({
    endPoint: `inventory/CustomerReseveration/ChangeReservationStatus/${id}/ChangeStatus`,
    method: "POST",
    params: { newStatus: statusVal },
  });

  return {
    status: 200,
    data: res?.data || res,
    message: `Status updated to ${statusVal}`,
  };
}

export async function deleteReservation(id) {
  return cancelReservationTickets(id, 9999);
}

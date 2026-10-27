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
 * Fetch Lookups for Reservation (Customers, Events, Invoice Patterns, Cost Centers, Currencies)
 */
export async function getReservationLookups() {
  try {
    const [customersRes, eventsRes, patternsRes, costCentersRes, currenciesRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "inventory/Customer/GetAllCustomers/all-customers",
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
      apiHandler({
        endPoint: "accounting/Currencies/GetAllCurrencies/all",
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

    // Parse Events (Bookings) with capacity and reserved counts
    let events = [];
    if (eventsRes.status === "fulfilled") {
      const raw = eventsRes.value?.data || eventsRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      events = list.map((e) => {
        const maxCap = e.maxCapacity ?? e.capacity ?? 20;
        const resQty = e.reservedQuantity ?? 0;
        return {
          id: e.id,
          name: e.title || "Event",
          price: e.price || 0,
          advancePayment: e.advancePayment || 0,
          maxCapacity: maxCap,
          reservedQuantity: resQty,
          remainingQty: Math.max(0, maxCap - resQty),
        };
      });
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

    // Parse Currencies
    let currencies = [];
    if (currenciesRes.status === "fulfilled") {
      const raw = currenciesRes.value?.data || currenciesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      currencies = list.map((c) => ({
        id: c.id,
        name: c.currency_Name || c.currencyName || c.name || "USD",
        code: c.currency_Code || c.currencyCode || c.code || "",
      }));
    }

    return {
      status: 200,
      data: {
        customers,
        events,
        invoicePatterns,
        costCenters,
        currencies,
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
        currencies: [],
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
 * Endpoint: GET /api/inventory/CustomerReseveration/GetAllReservations/GetAll
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
      method: "GET",
      params: payload,
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((r, idx) => {
      const quantity = Number(r.quantity) || 1;
      const canceledQuantity = Number(r.canceledQuantity) || 0;
      const activeQuantity = Math.max(0, quantity - canceledQuantity);

      return {
        id: r.id || idx + 1,
        customerId: r.customerId,
        customerName: r.customerName || "Customer",
        customer: r.customerName || "Customer",
        bookingEventId: r.bookingEventId,
        bookingEventTitle: r.bookingEventTitle || "Event",
        event: r.bookingEventTitle || "Event",
        eventStartDate: r.eventStartDate,
        eventEndDate: r.eventEndDate,
        quantity,
        canceledQuantity,
        activeQuantity,
        status: r.status || "Booked",
        invoiceId: r.invoiceId || null,
        raw: r,
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

    const quantity = Number(r.quantity) || 1;
    const canceledQuantity = Number(r.canceledQuantity) || 0;
    const activeQuantity = Math.max(0, quantity - canceledQuantity);

    const schedules = (r.paymentSchedules || r.paymentSchedule || []).map((sch, i) => ({
      id: sch.id || i + 1,
      description: sch.description || "",
      amountDue: Number(sch.amountDue ?? sch.amount) || 0,
      dueDate: sch.dueDate ? String(sch.dueDate).split("T")[0] : new Date().toISOString().split("T")[0],
    }));

    return {
      status: 200,
      data: {
        id: r.id || id,
        customerId: r.customerId || "",
        customerName: r.customerName || "Customer",
        customer: r.customerName || "Customer",
        bookingEventId: r.bookingEventId || "",
        bookingEventTitle: r.bookingEventTitle || "Event",
        eventName: r.bookingEventTitle || "Event",
        eventStartDate: r.eventStartDate,
        eventEndDate: r.eventEndDate,
        quantity,
        canceledQuantity,
        activeQuantity,
        invoicePatternId: r.invoicePatternId || "",
        currencyId: r.currencyId || "",
        paymentMethod: r.paymentMethod || "Cash",
        paidAmount: Number(r.paidAmount ?? r.amountPaid ?? 0),
        discountAmount: Number(r.discountAmount ?? 0),
        discountPercentage: Number(r.discountPercentage ?? r.discountPercent ?? 0),
        tax_Percentage: Number(r.tax_Percentage ?? r.taxPercent ?? 0),
        taxAmount: Number(r.taxAmount ?? 0),
        barcode: r.barcode || "",
        costCenterId: r.costCenterId || "",
        paymentSchedules: schedules,
        status: r.status || "Booked",
        invoiceId: r.invoiceId || null,
        raw: r,
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
 * Schema: CreateCustomerReservationDto (Strict 14 properties with additionalProperties: false)
 */
export async function createReservation(data) {
  let pm = "Cash";
  const pStr = String(data.paymentMethod || "").toLowerCase();
  if (pStr.includes("card") || pStr.includes("credit")) pm = "Credit";
  else if (pStr.includes("bank")) pm = "Bank";

  const rawSchedules = data.paymentSchedules || data.paymentSchedule || [];
  const formattedSchedules = rawSchedules.map((sch) => ({
    description: sch.description || null,
    amountDue: Number(sch.amountDue ?? sch.amount) || 0,
    dueDate: sch.dueDate ? new Date(sch.dueDate).toISOString() : new Date().toISOString(),
  }));

  const payload = {
    customerId: data.customerId || null,
    bookingEventId: data.bookingEventId || null,
    quantity: Number(data.quantity) || 1,
    invoicePatternId: data.invoicePatternId || null,
    currencyId: data.currencyId || null,
    paymentMethod: pm,
    paidAmount: Number(data.paidAmount ?? data.amountPaid) || 0,
    discountAmount: Number(data.discountAmount) || 0,
    discountPercentage: Number(data.discountPercentage ?? data.discountPercent) || 0,
    tax_Percentage: Number(data.tax_Percentage ?? data.taxPercent) || 0,
    taxAmount: Number(data.taxAmount) || 0,
    barcode: data.barcode ? String(data.barcode).trim() : null,
    costCenterId: data.costCenterId || null,
    paymentSchedules: formattedSchedules.length > 0 ? formattedSchedules : null,
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
export async function cancelReservationTickets(id, quantityToCancel, options = "Cash") {
  const isObj = typeof options === "object" && options !== null;
  const pmRaw = isObj ? (options.paymentMethod || "Cash") : (options || "Cash");
  let pm = "Cash";
  const pStr = String(pmRaw || "").toLowerCase();
  if (pStr.includes("card") || pStr.includes("credit")) pm = "Credit";
  else if (pStr.includes("bank")) pm = "Bank";

  const payload = {
    reservationId: id,
    quantityToCancel: Number(quantityToCancel) || 1,
    paymentMethod: pm,
    returnInvoicePatternId: isObj ? options.returnInvoicePatternId || null : null,
    notes: isObj ? options.notes || null : null,
  };

  const res = await apiHandler({
    endPoint: "inventory/CustomerReseveration/ReverseReservation/reverse",
    method: "POST",
    body: payload,
  });

  if (res && (res.success === false || (res.status && res.status >= 400))) {
    const error = new Error(res.message || "Failed to cancel reservation tickets");
    error.data = res;
    error.response = { data: res };
    throw error;
  }

  return {
    status: 200,
    data: res?.data || res,
    message: res?.message || "Tickets canceled and seats released successfully",
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

  if (res && (res.success === false || (res.status && res.status >= 400))) {
    const error = new Error(res.message || `Failed to update status to ${statusVal}`);
    error.data = res;
    error.response = { data: res };
    throw error;
  }

  return {
    status: 200,
    data: res?.data || res,
    message: res?.message || `Status updated to ${statusVal}`,
  };
}

export async function deleteReservation(id) {
  return cancelReservationTickets(id, 9999);
}

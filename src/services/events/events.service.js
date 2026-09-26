import { apiHandler } from "@/lib/api-handler";
import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Fallback Data
// ==========================================

export const INITIAL_EVENTS_STATS = [
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

export const EVENT_STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "booked", label: "Booked" },
  { id: "checked-in", label: "Checked-In" },
  { id: "completed", label: "Completed" },
  { id: "canceled", label: "Canceled" },
  { id: "no-show", label: "No-Show" },
];

export const DAYS_OF_WEEK = ["Sat", "Sun", "Mon", "Wed", "Thu", "Fri"];

// ==========================================
// Service Methods - Connected to Real Backend
// ==========================================

/**
 * Fetch Lookups needed for Event forms (Services, Resources, Providers, Days)
 */
export async function getEventLookups() {
  try {
    const [servicesRes, resourcesRes, providersRes] = await Promise.allSettled([
      apiHandler({
        endPoint: "Inventory/Product/GetAll/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "inventory/Resource/GetAll",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
      apiHandler({
        endPoint: "inventory/ServiceProvider/GetAllServiceProviders",
        method: "GET",
        params: { PageSize: 100, IsActive: true },
      }),
    ]);

    // Parse Services (Products)
    let services = [];
    if (servicesRes.status === "fulfilled") {
      const raw = servicesRes.value?.data || servicesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      services = list.map((item) => {
        const variantId = Array.isArray(item.variant_Ids) && item.variant_Ids.length > 0
          ? item.variant_Ids[0]
          : item.id;
        const primaryPrice = Array.isArray(item.prices) && item.prices.length > 0
          ? item.prices[0]
          : (item.consumer_Price ?? item.price ?? 0);
        return {
          id: variantId,
          productId: item.id,
          name: item.name_Product || item.name || "Unnamed Service",
          price: primaryPrice,
        };
      });
    }

    // Parse Resources (Halls, Rooms, Equipments)
    let resources = [];
    if (resourcesRes.status === "fulfilled") {
      const raw = resourcesRes.value?.data || resourcesRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      resources = list.map((item) => ({
        id: item.id,
        name: item.resource_Name || item.name || item.resourceName || "Unnamed Resource",
        capacity: item.capacity || item.maxCapacity || 20,
      }));
    }

    // Parse Providers
    let providers = [];
    if (providersRes.status === "fulfilled") {
      const raw = providersRes.value?.data || providersRes.value || {};
      const list = raw?.items || (Array.isArray(raw) ? raw : []);
      providers = list.map((item) => ({
        id: item.id,
        name: item.name || item.fullName || "Unnamed Provider",
        phone: item.phone || item.contact_Number || "",
      }));
    }

    return {
      status: 200,
      data: {
        services,
        resources,
        providers,
        statuses: [
          { id: "Booked", name: "Booked" },
          { id: "CheckedIn", name: "Checked-In" },
          { id: "Completed", name: "Completed" },
          { id: "Canceled", name: "Canceled" },
          { id: "NoShow", name: "No-Show" },
        ],
        days: DAYS_OF_WEEK,
      },
    };
  } catch (error) {
    console.error("Error fetching event lookups:", error);
    return {
      status: 200,
      data: {
        services: [],
        resources: [],
        providers: [],
        statuses: [],
        days: DAYS_OF_WEEK,
      },
    };
  }
}

/**
 * Fetch Stats for Events
 */
export async function getEventsStats() {
  return {
    status: 200,
    data: INITIAL_EVENTS_STATS,
  };
}

/**
 * Get Paginated & Filtered Events List
 * Endpoint: GET /api/inventory/Booking/GetAll
 */
export async function getEvents(params = {}) {
  try {
    const queryParams = {
      PageNumber: params.PageNumber || 1,
      PageSize: params.PageSize || 10,
      Search: params.SearchTerm || params.Search || undefined,
      SearchTerm: params.SearchTerm || undefined,
      ResourceId: params.Resource && params.Resource !== "all" ? params.Resource : undefined,
      ServiceProviderId: params.Provider && params.Provider !== "all" ? params.Provider : undefined,
      IsActive: params.IsActive !== undefined ? params.IsActive : undefined,
      SortBy: params.SortBy || undefined,
      SortDirection: params.SortDirection || undefined,
    };

    const res = await apiHandler({
      endPoint: "inventory/Booking/GetAll",
      method: "GET",
      params: queryParams,
    });

    const raw = res?.data || res || {};
    const items = raw?.items || (Array.isArray(raw) ? raw : []);
    const totalCount = raw?.totalCount || items.length;
    const totalPages = raw?.totalPages || Math.ceil(totalCount / (params.PageSize || 10)) || 1;

    const mappedItems = items.map((e, idx) => {
      const startDateStr = e.startDate ? new Date(e.startDate).toISOString().split("T")[0] : "";
      const endDateStr = e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : "";
      const period = startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr || "N/A";

      const startTimeStr = e.startTime ? (typeof e.startTime === "string" ? e.startTime.substring(0, 5) : String(e.startTime)) : "09:00";
      const endTimeStr = e.endTime ? (typeof e.endTime === "string" ? e.endTime.substring(0, 5) : String(e.endTime)) : "12:00";
      const time = `${startTimeStr} - ${endTimeStr}`;

      const priceVal = e.price ?? 0;
      const displayPrice = typeof priceVal === "number" ? `$${priceVal}` : `$${priceVal}`;

      return {
        id: e.id || idx + 1,
        code: e.code || `EVT-${String(e.id || idx + 1).substring(0, 6)}`,
        title: e.title || "Untitled Event",
        fullTitle: e.title || "Untitled Event",
        resource: e.resourceName || e.resource_Name || e.resourceId || "Resource",
        resourceId: e.resourceId,
        resourceName: e.resourceName || "Resource",
        provider: e.serviceProviderName || e.serviceProviderId || "Provider",
        providerId: e.serviceProviderId,
        providerName: e.serviceProviderName || "Provider",
        service: e.productVariantName || e.product_Name || "Service",
        productVariantId: e.productVariantId,
        period,
        startDate: startDateStr,
        endDate: endDateStr,
        time,
        startTime: startTimeStr,
        endTime: endTimeStr,
        price: displayPrice,
        numericPrice: priceVal,
        deposit: e.advancePayment ? `$${e.advancePayment}` : "$0",
        numericDeposit: e.advancePayment || 0,
        reserved: e.reservedQuantity ?? e.reserved ?? 0,
        maxCapacity: e.maxCapacity ?? e.capacity ?? 20,
        status: e.status || (e.isActive ? "Booked" : "Canceled"),
        isActive: e.isActive ?? true,
        recurringDays: typeof e.recurringDays === "string" ? e.recurringDays.split(",").filter(Boolean) : (e.recurringDays || []),
        notes: e.notes || "",
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
    console.error("Error fetching events:", error);
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
 * Get Event By ID
 * Endpoint: GET /api/inventory/Booking/{id}
 */
export async function getEventById(id) {
  try {
    const res = await apiHandler({
      endPoint: `inventory/Booking/${id}`,
      method: "GET",
    });
    const e = res?.data || res || {};

    const startDateStr = e.startDate ? new Date(e.startDate).toISOString().split("T")[0] : "";
    const endDateStr = e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : "";
    const startTimeStr = e.startTime ? (typeof e.startTime === "string" ? e.startTime.substring(0, 5) : String(e.startTime)) : "09:00";
    const endTimeStr = e.endTime ? (typeof e.endTime === "string" ? e.endTime.substring(0, 5) : String(e.endTime)) : "12:00";

    // Fetch linked attendee reservations if available
    let linkedReservations = [];
    try {
      const attendeesRes = await apiHandler({
        endPoint: "inventory/CustomerReseveration/GetAllReservations/GetAll",
        method: "POST",
        body: {
          bookingEventId: id,
          pageNumber: 1,
          pageSize: 50,
        },
      });
      const rawAttendees = attendeesRes?.data || attendeesRes || {};
      const attendeesList = rawAttendees?.items || (Array.isArray(rawAttendees) ? rawAttendees : []);
      linkedReservations = attendeesList.map((att, idx) => ({
        id: att.id || `#${idx + 1}`,
        customer: att.customerName || "Customer",
        customerName: att.customerName || "Customer",
        qty: att.quantity || 1,
        status: att.status || "Booked",
      }));
    } catch {
      // Ignored if no attendees found
    }

    return {
      status: 200,
      data: {
        id: e.id || id,
        code: e.code || `EVT-${String(id).substring(0, 8)}`,
        title: e.title || "Untitled Event",
        fullTitle: e.title || "Untitled Event",
        productVariantId: e.productVariantId || "",
        service: e.productVariantName || "",
        serviceName: e.productVariantName || "Service",
        resourceId: e.resourceId || "",
        resource: e.resourceName || "",
        resourceName: e.resourceName || "Resource",
        serviceProviderId: e.serviceProviderId || "",
        provider: e.serviceProviderName || "",
        providerName: e.serviceProviderName || "Provider",
        startDate: startDateStr,
        endDate: endDateStr,
        period: startDateStr && endDateStr ? `${startDateStr} - ${endDateStr}` : startDateStr || "N/A",
        startTime: startTimeStr,
        endTime: endTimeStr,
        time: `${startTimeStr} - ${endTimeStr}`,
        price: e.price ? `$${e.price}` : "$0",
        numericPrice: e.price ?? 0,
        deposit: e.advancePayment ? `$${e.advancePayment}` : "$0",
        numericDeposit: e.advancePayment ?? 0,
        reserved: e.reservedQuantity ?? linkedReservations.reduce((sum, r) => sum + (r.qty || 1), 0),
        maxCapacity: e.maxCapacity ?? e.capacity ?? 20,
        status: e.status || (e.isActive ? "Booked" : "Canceled"),
        isActive: e.isActive ?? true,
        recurringDays: typeof e.recurringDays === "string" ? e.recurringDays.split(",").filter(Boolean) : (e.recurringDays || []),
        notes: e.notes || "",
        reservations: linkedReservations,
      },
    };
  } catch (error) {
    console.error("Error fetching event by id:", error);
    throw error;
  }
}

/**
 * Create New Event (Booking)
 * Endpoint: POST /api/inventory/Booking/Create
 */
export async function createEvent(data) {
  const formatTimeSpan = (t) => {
    if (!t) return "00:00:00";
    const parts = String(t).split(":");
    if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
    if (parts.length === 3) return t;
    return "00:00:00";
  };

  const payload = {
    title: data.title,
    productVariantId: data.productVariantId || data.service,
    resourceId: data.resourceId || data.resource,
    serviceProviderId: data.serviceProviderId || data.provider || null,
    startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
    endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date().toISOString(),
    startTime: formatTimeSpan(data.startTime),
    endTime: formatTimeSpan(data.endTime),
    recurringDays: Array.isArray(data.recurringDays) ? data.recurringDays.join(",") : (data.recurringDays || null),
    price: Number(data.price) || 0,
    advancePayment: data.deposit !== undefined ? Number(data.deposit) : (Number(data.advancePayment) || 0),
  };

  const res = await apiHandler({
    endPoint: "inventory/Booking/Create",
    method: "POST",
    body: payload,
  });

  return {
    status: 201,
    data: res?.data || res,
    message: "Event created successfully",
  };
}

/**
 * Update Existing Event
 * Endpoint: POST /api/inventory/Booking/Update
 */
export async function updateEvent(id, data) {
  const formatTimeSpan = (t) => {
    if (!t) return "00:00:00";
    const parts = String(t).split(":");
    if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
    if (parts.length === 3) return t;
    return "00:00:00";
  };

  const payload = {
    id: id,
    title: data.title,
    productVariantId: data.productVariantId || data.service,
    resourceId: data.resourceId || data.resource,
    serviceProviderId: data.serviceProviderId || data.provider || null,
    startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
    endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date().toISOString(),
    startTime: formatTimeSpan(data.startTime),
    endTime: formatTimeSpan(data.endTime),
    recurringDays: Array.isArray(data.recurringDays) ? data.recurringDays.join(",") : (data.recurringDays || null),
    price: Number(data.price) || 0,
    advancePayment: data.deposit !== undefined ? Number(data.deposit) : (Number(data.advancePayment) || 0),
  };

  const res = await apiHandler({
    endPoint: "inventory/Booking/Update",
    method: "POST",
    body: payload,
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Event updated successfully",
  };
}

/**
 * Toggle Status / Delete Event
 * Endpoint: POST /api/inventory/Booking/{id}/ToggleStatus
 */
export async function toggleEventStatus(id) {
  const res = await apiHandler({
    endPoint: `inventory/Booking/${id}/ToggleStatus`,
    method: "POST",
  });

  return {
    status: 200,
    data: res?.data || res,
    message: "Status updated successfully",
  };
}

export async function deleteEvent(id) {
  return toggleEventStatus(id);
}

export async function changeEventStatus({ id, status }) {
  return toggleEventStatus(id);
}

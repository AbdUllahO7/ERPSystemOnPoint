import { Building2, Users as UsersIcon } from "lucide-react";

// ==========================================
// Static Initial Data for Events matching Figma
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

export const INITIAL_EVENTS_LIST = [
  {
    id: 1,
    code: "EVT-2026-001",
    title: "Title",
    fullTitle: "Global Health & Dental Symposium",
    resource: "Resource",
    resourceName: "Conference Hall A",
    provider: "Provider",
    providerName: "Dr. Alexander Wright",
    service: "Service",
    serviceName: "Advanced Dental Surgery Workshop",
    period: "Period",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    time: "Time",
    startTime: "09:00",
    endTime: "12:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 1,
    maxCapacity: 20,
    status: "Booked",
    recurringDays: ["Sat", "Mon", "Wed"],
    notes: "Main stage keynote and hands-on clinical breakout sessions.",
    reservations: [
      { id: "#12", customer: "Customer", customerName: "Ahmed Ali", qty: 1, status: "Booked" },
      { id: "#12", customer: "Customer", customerName: "Sara Mansoor", qty: 1, status: "Canceled" },
      { id: "#12", customer: "Customer", customerName: "Tariq Nasser", qty: 1, status: "Booked" },
      { id: "#12", customer: "Customer", customerName: "Layla Hakeem", qty: 1, status: "Booked" },
      { id: "#12", customer: "Customer", customerName: "Omar Qasim", qty: 1, status: "Booked" },
    ],
  },
  {
    id: 2,
    code: "EVT-2026-002",
    title: "Title",
    fullTitle: "Orthodontics Clinical Masterclass",
    resource: "Resource",
    resourceName: "Auditorium 2",
    provider: "Provider",
    providerName: "Dr. Elena Rostova",
    service: "Service",
    serviceName: "Aligners & Braces Masterclass",
    period: "Period",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    time: "Time",
    startTime: "10:00",
    endTime: "14:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 4,
    maxCapacity: 20,
    status: "Booked",
    recurringDays: ["Sun", "Tue", "Thu"],
    notes: "Hands-on diagnostic imaging and appliance fitting tutorials.",
    reservations: [
      { id: "#21", customer: "Customer", customerName: "Zaid Hassan", qty: 2, status: "Booked" },
      { id: "#22", customer: "Customer", customerName: "Mona Adel", qty: 2, status: "Booked" },
    ],
  },
  {
    id: 3,
    code: "EVT-2026-003",
    title: "Title",
    fullTitle: "Laser Dentistry Innovations",
    resource: "Resource",
    resourceName: "Lab Room 4",
    provider: "Provider",
    providerName: "Dr. Marcus Vance",
    service: "Service",
    serviceName: "Laser Soft-Tissue Management",
    period: "Period",
    startDate: "2026-07-15",
    endDate: "2026-07-16",
    time: "Time",
    startTime: "09:00",
    endTime: "13:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 8,
    maxCapacity: 20,
    status: "Checked-In",
    recurringDays: ["Sat", "Sun"],
    notes: "Laser certification and clinical practical demonstration.",
    reservations: [
      { id: "#31", customer: "Customer", customerName: "Nour Al-Sabah", qty: 1, status: "Checked-In" },
      { id: "#32", customer: "Customer", customerName: "Hani Shaker", qty: 2, status: "Booked" },
    ],
  },
  {
    id: 4,
    code: "EVT-2026-004",
    title: "Title",
    fullTitle: "Implantology Annual Summit",
    resource: "Resource",
    resourceName: "Grand Ballroom",
    provider: "Provider",
    providerName: "Dr. Sarah Jenkins",
    service: "Service",
    serviceName: "Full-Arch Rehabilitation",
    period: "Period",
    startDate: "2026-08-20",
    endDate: "2026-08-22",
    time: "Time",
    startTime: "08:30",
    endTime: "17:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 18,
    maxCapacity: 20,
    status: "Completed",
    recurringDays: ["Mon", "Tue", "Wed", "Thu"],
    notes: "Live surgical demonstration broadcast and panel discussion.",
    reservations: [
      { id: "#41", customer: "Customer", customerName: "Dr. Bilal Kamel", qty: 3, status: "Completed" },
    ],
  },
  {
    id: 5,
    code: "EVT-2026-005",
    title: "Title",
    fullTitle: "Pediatric Dentistry Workshop",
    resource: "Resource",
    resourceName: "Seminar Room B",
    provider: "Provider",
    providerName: "Dr. Maya Lin",
    service: "Service",
    serviceName: "Behavioral Management in Children",
    period: "Period",
    startDate: "2026-09-05",
    endDate: "2026-09-06",
    time: "Time",
    startTime: "11:00",
    endTime: "15:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 0,
    maxCapacity: 20,
    status: "Canceled",
    recurringDays: ["Fri", "Sat"],
    notes: "Specialized preventive treatment and behavior guidance.",
    reservations: [],
  },
  {
    id: 6,
    code: "EVT-2026-006",
    title: "Title",
    fullTitle: "Digital Smile Design Live Clinic",
    resource: "Resource",
    resourceName: "Studio 1",
    provider: "Provider",
    providerName: "Dr. Julian Croft",
    service: "Service",
    serviceName: "Aesthetic Smile Design",
    period: "Period",
    startDate: "2026-10-12",
    endDate: "2026-10-13",
    time: "Time",
    startTime: "13:00",
    endTime: "18:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 5,
    maxCapacity: 20,
    status: "No-Show",
    recurringDays: ["Sun", "Mon"],
    notes: "3D intraoral scanning, facial photography, and smile mockup printing.",
    reservations: [
      { id: "#61", customer: "Customer", customerName: "Farah Salem", qty: 1, status: "No-Show" },
    ],
  },
  {
    id: 7,
    code: "EVT-2026-007",
    title: "Title",
    fullTitle: "Endodontic Mastery Hands-On",
    resource: "Resource",
    resourceName: "Simulation Lab 3",
    provider: "Provider",
    providerName: "Dr. Alexander Wright",
    service: "Service",
    serviceName: "Rotary Instrumentation & Obturation",
    period: "Period",
    startDate: "2026-11-01",
    endDate: "2026-11-02",
    time: "Time",
    startTime: "09:00",
    endTime: "12:00",
    price: "$300",
    numericPrice: 300,
    deposit: "USD 50.00",
    numericDeposit: 50,
    reserved: 12,
    maxCapacity: 20,
    status: "Booked",
    recurringDays: ["Sat", "Sun"],
    notes: "Microscope-assisted endodontics and complex anatomy navigation.",
    reservations: [],
  },
];

// Memory store for dynamic updates during session
let memoryEvents = [...INITIAL_EVENTS_LIST];

// ==========================================
// Service API Functions
// ==========================================

export async function getEventsStats() {
  return {
    status: 200,
    data: INITIAL_EVENTS_STATS,
  };
}

export async function getEvents(params = {}) {
  const {
    PageNumber = 1,
    PageSize = 10,
    SearchTerm,
    Status,
    Service,
    Provider,
    Resource,
  } = params;

  let filtered = [...memoryEvents];

  if (SearchTerm) {
    const term = SearchTerm.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        String(e.id).includes(term) ||
        e.title?.toLowerCase().includes(term) ||
        e.fullTitle?.toLowerCase().includes(term) ||
        e.resource?.toLowerCase().includes(term) ||
        e.provider?.toLowerCase().includes(term) ||
        e.service?.toLowerCase().includes(term)
    );
  }

  if (Status && Status.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (e) => e.status?.toLowerCase() === Status.toLowerCase()
    );
  }

  if (Service && Service.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (e) =>
        e.service?.toLowerCase() === Service.toLowerCase() ||
        e.serviceName?.toLowerCase() === Service.toLowerCase()
    );
  }

  if (Provider && Provider.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (e) =>
        e.provider?.toLowerCase() === Provider.toLowerCase() ||
        e.providerName?.toLowerCase() === Provider.toLowerCase()
    );
  }

  if (Resource && Resource.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (e) =>
        e.resource?.toLowerCase() === Resource.toLowerCase() ||
        e.resourceName?.toLowerCase() === Resource.toLowerCase()
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

export async function getEventById(id) {
  const event = memoryEvents.find((e) => String(e.id) === String(id));
  if (!event) {
    return {
      status: 200,
      data: {
        id: Number(id) || 1,
        code: "EVT-2026-001",
        title: "Title",
        fullTitle: "Global Health & Dental Symposium",
        resource: "Resource",
        resourceName: "Conference Hall A",
        provider: "Provider",
        providerName: "Dr. Alexander Wright",
        service: "Service",
        serviceName: "Advanced Dental Surgery Workshop",
        period: "Period",
        startDate: "2026-05-10",
        endDate: "2026-05-12",
        time: "Time",
        startTime: "09:00",
        endTime: "12:00",
        price: "$300",
        numericPrice: 300,
        deposit: "USD 50.00",
        numericDeposit: 50,
        reserved: 1,
        maxCapacity: 10,
        status: "Booked",
        recurringDays: ["Sat", "Mon", "Wed"],
        notes: "Annual workshop event with hands-on practice session.",
        reservations: [
          { id: "#12", customer: "Customer", customerName: "Ahmed Ali", qty: 1, status: "Booked" },
          { id: "#12", customer: "Customer", customerName: "Sara Mansoor", qty: 1, status: "Canceled" },
          { id: "#12", customer: "Customer", customerName: "Tariq Nasser", qty: 1, status: "Booked" },
          { id: "#12", customer: "Customer", customerName: "Layla Hakeem", qty: 1, status: "Booked" },
          { id: "#12", customer: "Customer", customerName: "Omar Qasim", qty: 1, status: "Booked" },
        ],
      },
    };
  }
  return {
    status: 200,
    data: event,
  };
}

export async function createEvent(payload) {
  const newId = memoryEvents.length > 0 ? Math.max(...memoryEvents.map((e) => e.id)) + 1 : 1;
  const newEvent = {
    id: newId,
    code: `EVT-2026-${String(newId).padStart(3, "0")}`,
    title: payload.title || "Title",
    fullTitle: payload.title || "Event Title",
    service: payload.service || "Service",
    serviceName: payload.serviceName || payload.service || "Service",
    resource: payload.resource || "Resource",
    resourceName: payload.resourceName || payload.resource || "Resource",
    provider: payload.provider || "Provider",
    providerName: payload.providerName || payload.provider || "Provider",
    period: payload.startDate ? `${payload.startDate} - ${payload.endDate || payload.startDate}` : "Period",
    startDate: payload.startDate || "2026-05-10",
    endDate: payload.endDate || "2026-05-12",
    time: payload.startTime ? `${payload.startTime} - ${payload.endTime || payload.startTime}` : "Time",
    startTime: payload.startTime || "09:00",
    endTime: payload.endTime || "12:00",
    price: `$${payload.price || 0}`,
    numericPrice: Number(payload.price) || 0,
    deposit: `USD ${Number(payload.deposit || 0).toFixed(2)}`,
    numericDeposit: Number(payload.deposit) || 0,
    reserved: 0,
    maxCapacity: Number(payload.maxCapacity) || 20,
    status: "Booked",
    recurringDays: payload.recurringDays || ["Sat", "Mon", "Wed"],
    notes: payload.notes || "",
    reservations: [],
  };

  memoryEvents = [newEvent, ...memoryEvents];
  return {
    status: 200,
    data: newEvent,
    message: "Event created successfully!",
  };
}

export async function updateEvent(id, payload) {
  const index = memoryEvents.findIndex((e) => String(e.id) === String(id));
  if (index !== -1) {
    memoryEvents[index] = {
      ...memoryEvents[index],
      ...payload,
      price: payload.price !== undefined ? `$${payload.price}` : memoryEvents[index].price,
      numericPrice: payload.price !== undefined ? Number(payload.price) : memoryEvents[index].numericPrice,
      deposit: payload.deposit !== undefined ? `USD ${Number(payload.deposit).toFixed(2)}` : memoryEvents[index].deposit,
      numericDeposit: payload.deposit !== undefined ? Number(payload.deposit) : memoryEvents[index].numericDeposit,
    };
    return {
      status: 200,
      data: memoryEvents[index],
      message: "Event updated successfully!",
    };
  }
  return {
    status: 200,
    message: "Event updated!",
  };
}

export async function deleteEvent(id) {
  memoryEvents = memoryEvents.filter((e) => String(e.id) !== String(id));
  return {
    status: 200,
    data: { success: true },
    message: "Event deleted successfully!",
  };
}

export async function changeEventStatus({ id, status }) {
  const item = memoryEvents.find((e) => String(e.id) === String(id));
  if (item) {
    item.status = status;
  }
  return {
    status: 200,
    data: { id, status },
    message: "Event status updated successfully!",
  };
}

export async function getEventLookups() {
  return {
    status: 200,
    data: {
      services: [
        { id: "dental-surgery", name: "Dental Surgery Workshop" },
        { id: "orthodontics", name: "Orthodontics Masterclass" },
        { id: "laser-clinic", name: "Laser Dentistry Innovations" },
        { id: "implant-summit", name: "Implantology Annual Summit" },
      ],
      resources: [
        { id: "hall-a", name: "Conference Hall A" },
        { id: "auditorium-2", name: "Auditorium 2" },
        { id: "lab-4", name: "Lab Room 4" },
        { id: "ballroom", name: "Grand Ballroom" },
      ],
      providers: [
        { id: "dr-wright", name: "Dr. Alexander Wright" },
        { id: "dr-rostova", name: "Dr. Elena Rostova" },
        { id: "dr-vance", name: "Dr. Marcus Vance" },
        { id: "dr-jenkins", name: "Dr. Sarah Jenkins" },
      ],
      statuses: ["All", "Booked", "Checked-In", "Completed", "Canceled", "No-Show"],
      days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  };
}

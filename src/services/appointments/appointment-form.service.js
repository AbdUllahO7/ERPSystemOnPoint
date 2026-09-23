import { apiHandler } from "@/lib/api-handler";
import {
  appointmentsDataStore,
  setAppointmentsDataStore,
} from "./appointments-list.service";

// ==========================================
// Static Lookups for Add / Edit Appointments
// ==========================================

export const APPOINTMENT_LOOKUPS = {
  customers: [
    { id: "1", label: "Ahmed Khaled", value: "Ahmed Khaled" },
    { id: "2", label: "Sarah Jenkins", value: "Sarah Jenkins" },
    { id: "3", label: "Omar Al-Mansoor", value: "Omar Al-Mansoor" },
    { id: "4", label: "Mona Salem", value: "Mona Salem" },
    { id: "5", label: "David Miller", value: "David Miller" },
    { id: "6", label: "Fatima Al-Sayed", value: "Fatima Al-Sayed" },
    { id: "7", label: "Ali Hassan", value: "Ali Hassan" },
    { id: "8", label: "Elena Rostova", value: "Elena Rostova" },
  ],
  services: [
    { id: "1", label: "General Consultation", value: "General Consultation" },
    { id: "2", label: "Dental Checkup", value: "Dental Checkup" },
    { id: "3", label: "Dermatology Screening", value: "Dermatology Screening" },
    { id: "4", label: "Physiotherapy Session", value: "Physiotherapy Session" },
    { id: "5", label: "Eye Exam", value: "Eye Exam" },
    { id: "6", label: "Blood Test Analysis", value: "Blood Test Analysis" },
    { id: "7", label: "Cardiology Review", value: "Cardiology Review" },
  ],
  providers: [
    { id: "1", label: "Dr. Rami Haddad", value: "Dr. Rami Haddad" },
    { id: "2", label: "Dr. Michael Chen", value: "Dr. Michael Chen" },
    { id: "3", label: "Dr. Layla Nour", value: "Dr. Layla Nour" },
    { id: "4", label: "Dr. Karim Zaid", value: "Dr. Karim Zaid" },
  ],
  statuses: [
    "All",
    "Scheduled",
    "Confirmed",
    "In Progress",
    "Completed",
    "No Show",
  ],
  currencies: [
    { label: "USD ($)", value: "USD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "SAR (﷼)", value: "SAR" },
    { label: "AED (د.إ)", value: "AED" },
  ],
  paymentMethods: [
    { label: "Cash", value: "Cash" },
    { label: "Credit Card", value: "Credit Card" },
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Insurance", value: "Insurance" },
  ],
  costCenters: [
    { label: "Main Clinic", value: "Main Clinic" },
    { label: "Branch 1", value: "Branch 1" },
    { label: "Outpatient", value: "Outpatient" },
    { label: "Dental Unit", value: "Dental Unit" },
    { label: "Laboratory", value: "Laboratory" },
  ],
  warehouses: [
    { label: "Central Warehouse", value: "Central Warehouse" },
    { label: "Medical Supplies Store", value: "Medical Supplies Store" },
  ],
};

// ==========================================
// Service Methods: Add / Edit Form Page
// ==========================================

export async function getAppointmentLookups() {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Appointments/GetLookups", method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: APPOINTMENT_LOOKUPS,
        status: 200,
        message: "Lookups retrieved successfully",
      });
    }, 100);
  });
}

export async function createAppointment(payload) {
  // Real API call when ready:
  // return apiHandler({ endPoint: "Appointments/Create", method: "POST", data: payload });

  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = appointmentsDataStore.length
        ? Math.max(...appointmentsDataStore.map((a) => a.id)) + 1
        : 1;
      const newRecord = {
        id: newId,
        total: `$${payload.amountPaidNow || payload.price || 60}`,
        price: payload.amountPaidNow || payload.price || "60",
        currency: payload.currency || "USD",
        isInvoiced: true,
        paymentSchedules: payload.paymentSchedules || [],
        ...payload,
      };
      setAppointmentsDataStore([newRecord, ...appointmentsDataStore]);
      resolve({
        data: newRecord,
        status: 201,
        message: "Appointment created successfully",
      });
    }, 200);
  });
}

export async function updateAppointment(id, payload) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Appointments/Update/${id}`, method: "PUT", data: payload });

  return new Promise((resolve) => {
    setTimeout(() => {
      const index = appointmentsDataStore.findIndex(
        (a) => String(a.id) === String(id)
      );
      if (index !== -1) {
        appointmentsDataStore[index] = {
          ...appointmentsDataStore[index],
          ...payload,
        };
        resolve({
          data: appointmentsDataStore[index],
          status: 200,
          message: "Appointment updated successfully",
        });
      } else {
        resolve({
          data: payload,
          status: 200,
          message: "Appointment updated successfully",
        });
      }
    }, 200);
  });
}

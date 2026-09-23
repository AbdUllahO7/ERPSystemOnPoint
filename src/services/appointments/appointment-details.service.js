import { apiHandler } from "@/lib/api-handler";
import {
  appointmentsDataStore,
  INITIAL_APPOINTMENTS_LIST,
} from "./appointments-list.service";

// ==========================================
// Service Methods: Appointment Details Page
// ==========================================

export async function getAppointmentById(id) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Appointments/GetById/${id}`, method: "GET" });

  return new Promise((resolve) => {
    setTimeout(() => {
      const found = appointmentsDataStore.find((a) => String(a.id) === String(id));
      if (found) {
        resolve({
          data: found,
          status: 200,
          message: "Appointment retrieved successfully",
        });
      } else {
        resolve({
          data: appointmentsDataStore[0] || INITIAL_APPOINTMENTS_LIST[0],
          status: 200,
          message: "Appointment retrieved successfully",
        });
      }
    }, 150);
  });
}

export async function addPaymentSchedule(appointmentId, scheduleData) {
  // Real API call when ready:
  // return apiHandler({ endPoint: `Appointments/${appointmentId}/PaymentSchedule`, method: "POST", data: scheduleData });

  return new Promise((resolve) => {
    setTimeout(() => {
      const scheduleItem = {
        id: Date.now(),
        amount: scheduleData.amount,
        date:
          scheduleData.date ||
          new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        notes: scheduleData.notes || "",
      };

      const target = appointmentsDataStore.find(
        (a) => String(a.id) === String(appointmentId)
      );
      if (target) {
        target.paymentSchedules = [
          ...(target.paymentSchedules || []),
          scheduleItem,
        ];
      }

      resolve({
        data: scheduleItem,
        status: 201,
        message: "Payment schedule added successfully",
      });
    }, 150);
  });
}

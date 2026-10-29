// Export all Appointments list services & initial data
export * from "./appointments-list.service";

// Export all Appointment details services
export * from "./appointment-details.service";

// Export all Appointment form & lookup services
export * from "./appointment-form.service";

// Export all Services section services & initial data
export * from "./services-list.service";

// Export all Service Providers section services & initial data
export * from "./service-providers.service";

// Export all Provider Commissions & Ledger services & initial data
export * from "./commissions.service";

import {
  getAppointments,
  getAppointmentStats,
  deleteAppointment,
  changeAppointmentStatus,
} from "./appointments-list.service";
import { getAppointmentById } from "./appointment-details.service";
import {
  createAppointment,
  updateAppointment,
  getAppointmentLookups,
  getAppointmentPricingLookup,
} from "./appointment-form.service";
import {
  getServices,
  getServicesStats,
  getServiceLookups,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "./services-list.service";
import {
  getServiceProviders,
  getServiceProvidersStats,
  getServiceProviderById,
  createServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
} from "./service-providers.service";

/**
 * كائن appointmentsApi لتوفير واجهة موحدة متوافقة مع قطاع المواعيد
 */
export const appointmentsApi = {
  getAppointments,
  getAppointmentById,
  getStats: getAppointmentStats,
  getLookups: getAppointmentLookups,
  getAppointmentPricingLookup,
  createAppointment,
  updateAppointment,
  changeStatus: (arg1, arg2) => {
    if (typeof arg1 === "object" && arg1 !== null) {
      return changeAppointmentStatus(arg1);
    }
    return changeAppointmentStatus({ appointmentId: arg1, newStatus: arg2 });
  },

  services: {
    getServices,
    getServiceById,
    getStats: getServicesStats,
    getLookups: getServiceLookups,
    createService,
    updateService,
    deleteService,
  },

  providers: {
    getProviders: getServiceProviders,
    getProviderById: getServiceProviderById,
    getServiceProviderById,
    getStats: getServiceProvidersStats,
    createProvider: createServiceProvider,
    updateProvider: updateServiceProvider,
    deleteProvider: deleteServiceProvider,
  },
};

export default appointmentsApi;

import * as legacyAppointments from "@/services/appointments";
import { getAppointmentById } from "@/services/appointments/appointment-details.service";
import { getServiceById } from "@/services/appointments/services-list.service";
import { getServiceProviderById } from "@/services/appointments/service-providers.service";

// تصدير الثوابت
export {
  INITIAL_APPOINTMENT_STATS,
  INITIAL_APPOINTMENTS_LIST,
  INITIAL_SERVICES_STATS,
  INITIAL_SERVICES_LIST,
  INITIAL_SERVICE_PROVIDERS_STATS,
  INITIAL_SERVICE_PROVIDERS_LIST,
  APPOINTMENT_LOOKUPS,
  SERVICE_LOOKUPS,
} from "@/services/appointments";

/**
 * واجهة API قطاع المواعيد والخدمات (Appointments Feature API)
 */
export const appointmentsApi = {
  getAppointments: async (params = {}) => legacyAppointments.getAppointments(params),
  getAppointmentById: async (id) => getAppointmentById(id),
  getStats: async () => legacyAppointments.getAppointmentStats(),
  getLookups: async () => legacyAppointments.getAppointmentLookups(),
  createAppointment: async (data) => legacyAppointments.createAppointment(data),
  updateAppointment: async (id, data) => legacyAppointments.updateAppointment(id, data),
  deleteAppointment: async (id) => legacyAppointments.deleteAppointment(id),
  changeStatus: async (id, status) => legacyAppointments.changeAppointmentStatus({ id, status }),

  services: {
    getServices: async (params = {}) => legacyAppointments.getServices(params),
    getServiceById: async (id) => getServiceById(id),
    getStats: async () => legacyAppointments.getServicesStats(),
    getLookups: async () => legacyAppointments.getServiceLookups(),
    createService: async (data) => legacyAppointments.createService(data),
    updateService: async (id, data) => legacyAppointments.updateService(id, data),
    deleteService: async (id) => legacyAppointments.deleteService(id),
  },

  providers: {
    getProviders: async (params = {}) => legacyAppointments.getServiceProviders(params),
    getProviderById: async (id) => getServiceProviderById(id),
    getStats: async () => legacyAppointments.getServiceProvidersStats(),
    createProvider: async (data) => legacyAppointments.createServiceProvider(data),
    updateProvider: async (id, data) => legacyAppointments.updateServiceProvider(id, data),
    deleteProvider: async (id) => legacyAppointments.deleteServiceProvider(id),
  },
};

export const getAppointments = appointmentsApi.getAppointments;
export const getAppointmentDetails = appointmentsApi.getAppointmentById;
export const getAppointmentStats = appointmentsApi.getStats;
export const getAppointmentLookups = appointmentsApi.getLookups;
export const createAppointment = appointmentsApi.createAppointment;
export const updateAppointment = appointmentsApi.updateAppointment;
export const deleteAppointment = appointmentsApi.deleteAppointment;
export const changeAppointmentStatus = appointmentsApi.changeStatus;

export default appointmentsApi;

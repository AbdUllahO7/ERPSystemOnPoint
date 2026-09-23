import * as legacyReservationService from "@/services/reservations/reservations.service";

/**
 * واجهة API قطاع الحجوزات (Reservations Feature API)
 */
export const reservationsApi = {
  getReservations: async (params = {}) => {
    return legacyReservationService.fetchReservations(params);
  },
  getReservationById: async (id) => {
    return legacyReservationService.fetchReservationDetails(id);
  },
  getLookups: async () => {
    return legacyReservationService.fetchReservationLookups();
  },
  createReservation: async (data) => {
    return legacyReservationService.createReservation(data);
  },
  updateReservation: async (id, data) => {
    return legacyReservationService.updateReservation(id, data);
  },
  deleteReservation: async (id) => {
    return legacyReservationService.deleteReservation(id);
  },
};

export default reservationsApi;

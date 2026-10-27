import * as reservationsService from "./reservations.service";

export * from "./reservations.service";

export const reservationsApi = {
  getReservations: reservationsService.getReservations,
  getReservationById: reservationsService.getReservationById,
  getLookups: reservationsService.getReservationLookups,
  getStats: reservationsService.getReservationsStats,
  createReservation: reservationsService.createReservation,
  updateReservation: reservationsService.updateReservation,
  deleteReservation: reservationsService.deleteReservation,
};

export default reservationsApi;

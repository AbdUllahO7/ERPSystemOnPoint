import * as legacyEventsService from "@/services/events/events.service";

/**
 * واجهة API قطاع الفعاليات (Events Feature API)
 */
export const eventsApi = {
  getEvents: async (params = {}) => {
    return legacyEventsService.fetchEvents(params);
  },
  getEventById: async (id) => {
    return legacyEventsService.fetchEventDetails(id);
  },
  createEvent: async (data) => {
    return legacyEventsService.createEvent(data);
  },
  updateEvent: async (id, data) => {
    return legacyEventsService.updateEvent(id, data);
  },
  deleteEvent: async (id) => {
    return legacyEventsService.deleteEvent(id);
  },
};

export default eventsApi;

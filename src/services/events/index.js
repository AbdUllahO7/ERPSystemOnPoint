import * as eventsService from "./events.service";

export * from "./events.service";

export const eventsApi = {
  getEvents: eventsService.getEvents,
  getEventById: eventsService.getEventById,
  getStats: eventsService.getEventsStats,
  getLookups: eventsService.getEventLookups,
  createEvent: eventsService.createEvent,
  updateEvent: eventsService.updateEvent,
  deleteEvent: eventsService.deleteEvent,
  changeStatus: eventsService.changeEventStatus,
};

export default eventsApi;

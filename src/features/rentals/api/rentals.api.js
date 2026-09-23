import * as legacyRentalService from "@/services/rentals/rentals.service";
import * as legacyInvoiceService from "@/services/rentals/rental-invoices.service";

// تصدير الثوابت
export {
  INITIAL_RENTALS_STATS,
  RENTAL_STATUS_TABS,
  INITIAL_RENTAL_CONTRACTS_LIST,
} from "@/services/rentals/rentals.service";

export {
  INITIAL_RENTAL_INVOICES_STATS,
  INITIAL_RENTAL_INVOICES_LIST,
} from "@/services/rentals/rental-invoices.service";

/**
 * واجهة API قطاع الإيجارات (Rentals Feature API)
 */
export const rentalsApi = {
  // 🏢 الإيجارات
  getRentals: async (params = {}) => legacyRentalService.getRentals(params),
  getRentalById: async (id) => legacyRentalService.getRentalById(id),
  getStats: async () => legacyRentalService.getRentalsStats(),
  getLookups: async () => legacyRentalService.getRentalLookups(),
  createRental: async (data) => legacyRentalService.createRental(data),
  updateRental: async (id, data) => legacyRentalService.updateRental(id, data),
  deleteRental: async (id) => legacyRentalService.deleteRental(id),

  // 🧾 فواتير الإيجار
  invoices: {
    getInvoices: async (params = {}) => legacyInvoiceService.getRentalInvoices(params),
    getInvoiceById: async (id) => legacyInvoiceService.getRentalInvoiceById(id),
    getStats: async () => legacyInvoiceService.getRentalInvoicesStats(),
    getLookups: async () => legacyInvoiceService.getRentalInvoiceLookups(),
    createInvoice: async (data) => legacyInvoiceService.createRentalInvoice(data),
    deleteInvoice: async (id) => legacyInvoiceService.deleteRentalInvoice(id),
  },
};

// دوال متوافقة بالاسم القديم
export const getRentals = rentalsApi.getRentals;
export const getRentalDetails = rentalsApi.getRentalById;
export const getRentalsStats = rentalsApi.getStats;
export const getRentalLookups = rentalsApi.getLookups;
export const createRental = rentalsApi.createRental;
export const updateRental = rentalsApi.updateRental;
export const deleteRental = rentalsApi.deleteRental;

export default rentalsApi;

import * as rentalService from "./rentals.service";
import * as rentalInvoiceService from "./rental-invoices.service";

export * from "./rentals.service";
export * from "./rental-invoices.service";

/**
 * كائن rentalsApi لتوفير واجهة موحدة متوافقة مع قطاع الإيجارات
 */
export const rentalsApi = {
  getRentals: rentalService.getRentals,
  getRentalById: rentalService.getRentalById,
  getStats: rentalService.getRentalsStats,
  getLookups: rentalService.getRentalLookups,
  createRental: rentalService.createRental,
  createDirectRental: rentalService.createDirectRentalContract,
  settleRentalContract: rentalService.settleRentalContract,
  updateRental: rentalService.updateRental,
  deleteRental: rentalService.deleteRental,
  createRentalProduct: rentalService.createRentalProduct,
  updateRentalProduct: rentalService.updateRentalProduct,

  invoices: {
    getInvoices: rentalInvoiceService.getRentalInvoices,
    getInvoiceById: rentalInvoiceService.getRentalInvoiceById,
    getStats: rentalInvoiceService.getRentalInvoicesStats,
    getLookups: rentalInvoiceService.getRentalInvoiceLookups,
    createInvoice: rentalInvoiceService.createRentalInvoice,
    createCustomerContractInvoice: rentalInvoiceService.createCustomerContractInvoice,
    getAvailableDataForInvoice: rentalInvoiceService.getAvailableDataForInvoice,
    deleteInvoice: rentalInvoiceService.deleteRentalInvoice,
  },
};

export default rentalsApi;

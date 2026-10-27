import * as accountingService from "./accounting.service";

export * from "./accounting.service";

/**
 * كائن accountingApi لتوفير واجهة موحدة متوافقة مع جميع المكونات
 */
export const accountingApi = {
  invoices: {
    getAll: accountingService.getAllInvoices,
    getById: accountingService.getInvoiceById,
    createSales: accountingService.createSalesInvoice,
    createPurchase: accountingService.createPurchaseInvoice,
  },
  expenses: {
    getAll: accountingService.getAllExpenses,
    getById: accountingService.getExpenseById,
    create: accountingService.createExpense,
  },
  cashBoxes: {
    getAll: accountingService.getAllCashBoxes,
    getById: accountingService.getCashBoxById,
    create: accountingService.createCashBox,
    addMovement: accountingService.createCashBoxTransaction,
  },
  banks: {
    getAll: accountingService.getAllBanks,
    getById: accountingService.getBankById,
    create: accountingService.createBank,
    addMovement: accountingService.createBankTransaction,
  },
  journalEntries: {
    getAll: accountingService.getAllVouchers,
    getById: accountingService.getVoucherById,
    create: accountingService.createJournalVoucher,
  },
};

export default accountingApi;

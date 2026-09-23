import { apiHandler } from "@/lib/api-handler";

/**
 * واجهة API قطاع المحاسبة والمالية (Accounting Feature API)
 */
export const accountingApi = {
  // 🧾 الفواتير (Invoices)
  invoices: {
    getAll: async (params = {}) => apiHandler({ endPoint: "accounting/invoices", params }),
    getById: async (id) => apiHandler({ endPoint: `accounting/invoices/${id}` }),
    create: async (data) => apiHandler({ endPoint: "accounting/invoices", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `accounting/invoices/${id}`, method: "PUT", body: data }),
    delete: async (id) => apiHandler({ endPoint: `accounting/invoices/${id}`, method: "DELETE" }),
  },

  // 💸 المصروفات (Expenses)
  expenses: {
    getAll: async (params = {}) => apiHandler({ endPoint: "accounting/expenses", params }),
    getById: async (id) => apiHandler({ endPoint: `accounting/expenses/${id}` }),
    create: async (data) => apiHandler({ endPoint: "accounting/expenses", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `accounting/expenses/${id}`, method: "PUT", body: data }),
    delete: async (id) => apiHandler({ endPoint: `accounting/expenses/${id}`, method: "DELETE" }),
  },

  // 💵 الصناديق النقدية (Cash Boxes)
  cashBoxes: {
    getAll: async (params = {}) => apiHandler({ endPoint: "accounting/cash-boxes", params }),
    getById: async (id) => apiHandler({ endPoint: `accounting/cash-boxes/${id}` }),
    addMovement: async (data) => apiHandler({ endPoint: "accounting/cash-boxes/movement", method: "POST", body: data }),
  },

  // 🏦 البنوك (Banks)
  banks: {
    getAll: async (params = {}) => apiHandler({ endPoint: "accounting/banks", params }),
    getById: async (id) => apiHandler({ endPoint: `accounting/banks/${id}` }),
    addMovement: async (data) => apiHandler({ endPoint: "accounting/banks/movement", method: "POST", body: data }),
  },

  // 📑 القيود اليومية (Journal Entries)
  journalEntries: {
    getAll: async (params = {}) => apiHandler({ endPoint: "accounting/journal-entries", params }),
    getById: async (id) => apiHandler({ endPoint: `accounting/journal-entries/${id}` }),
    create: async (data) => apiHandler({ endPoint: "accounting/journal-entries", method: "POST", body: data }),
  },
};

export default accountingApi;

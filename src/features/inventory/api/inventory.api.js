import { apiHandler } from "@/lib/api-handler";

/**
 * واجهة API قطاع المخزون والمستودعات (Inventory Feature API)
 */
export const inventoryApi = {
  // 📦 الأصناف (Items)
  items: {
    getAll: async (params = {}) => apiHandler({ endPoint: "inventory/items", params }),
    getById: async (id) => apiHandler({ endPoint: `inventory/items/${id}` }),
    create: async (data) => apiHandler({ endPoint: "inventory/items", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `inventory/items/${id}`, method: "PUT", body: data }),
    delete: async (id) => apiHandler({ endPoint: `inventory/items/${id}`, method: "DELETE" }),
  },

  // 🏬 المستودعات (Warehouses)
  warehouses: {
    getAll: async (params = {}) => apiHandler({ endPoint: "inventory/warehouses", params }),
    getById: async (id) => apiHandler({ endPoint: `inventory/warehouses/${id}` }),
    create: async (data) => apiHandler({ endPoint: "inventory/warehouses", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `inventory/warehouses/${id}`, method: "PUT", body: data }),
  },

  // 🔀 المناقلات (Transfers)
  transfers: {
    getAll: async (params = {}) => apiHandler({ endPoint: "inventory/transfers", params }),
    getById: async (id) => apiHandler({ endPoint: `inventory/transfers/${id}` }),
    create: async (data) => apiHandler({ endPoint: "inventory/transfers", method: "POST", body: data }),
  },
};

export default inventoryApi;

import { apiHandler } from "@/lib/api-handler";

/**
 * واجهة API قطاع إدارة علاقات العملاء (CRM Feature API)
 */
export const crmApi = {
  // 🏢 العملاء (Customers)
  customers: {
    getAll: async (params = {}) => {
      return apiHandler({ endPoint: "crm/customers", params });
    },
    getById: async (id) => {
      return apiHandler({ endPoint: `crm/customers/${id}` });
    },
    create: async (data) => {
      return apiHandler({ endPoint: "crm/customers", method: "POST", body: data });
    },
    update: async (id, data) => {
      return apiHandler({ endPoint: `crm/customers/${id}`, method: "PUT", body: data });
    },
    delete: async (id) => {
      return apiHandler({ endPoint: `crm/customers/${id}`, method: "DELETE" });
    },
  },

  // 🎯 العملاء المحتملين (Leads)
  leads: {
    getAll: async (params = {}) => {
      return apiHandler({ endPoint: "crm/leads", params });
    },
    getById: async (id) => {
      return apiHandler({ endPoint: `crm/leads/${id}` });
    },
    create: async (data) => {
      return apiHandler({ endPoint: "crm/leads", method: "POST", body: data });
    },
    update: async (id, data) => {
      return apiHandler({ endPoint: `crm/leads/${id}`, method: "PUT", body: data });
    },
    delete: async (id) => {
      return apiHandler({ endPoint: `crm/leads/${id}`, method: "DELETE" });
    },
  },

  // 🚚 الموردين (Suppliers)
  suppliers: {
    getAll: async (params = {}) => {
      return apiHandler({ endPoint: "crm/suppliers", params });
    },
    getById: async (id) => {
      return apiHandler({ endPoint: `crm/suppliers/${id}` });
    },
    create: async (data) => {
      return apiHandler({ endPoint: "crm/suppliers", method: "POST", body: data });
    },
    update: async (id, data) => {
      return apiHandler({ endPoint: `crm/suppliers/${id}`, method: "PUT", body: data });
    },
    delete: async (id) => {
      return apiHandler({ endPoint: `crm/suppliers/${id}`, method: "DELETE" });
    },
  },

  // 📁 المشاريع (Projects)
  projects: {
    getAll: async (params = {}) => {
      return apiHandler({ endPoint: "crm/projects", params });
    },
    getById: async (id) => {
      return apiHandler({ endPoint: `crm/projects/${id}` });
    },
    create: async (data) => {
      return apiHandler({ endPoint: "crm/projects", method: "POST", body: data });
    },
    update: async (id, data) => {
      return apiHandler({ endPoint: `crm/projects/${id}`, method: "PUT", body: data });
    },
    delete: async (id) => {
      return apiHandler({ endPoint: `crm/projects/${id}`, method: "DELETE" });
    },
  },
};

export default crmApi;

import { apiHandler } from "@/lib/api-handler";

/**
 * واجهة API قطاع الموارد البشرية (HR Feature API)
 */
export const hrApi = {
  // 👔 الموظفين (Employees)
  employees: {
    getAll: async (params = {}) => apiHandler({ endPoint: "hr/employees", params }),
    getById: async (id) => apiHandler({ endPoint: `hr/employees/${id}` }),
    create: async (data) => apiHandler({ endPoint: "hr/employees", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `hr/employees/${id}`, method: "PUT", body: data }),
    delete: async (id) => apiHandler({ endPoint: `hr/employees/${id}`, method: "DELETE" }),
  },

  // 🏢 الأقسام (Departments)
  departments: {
    getAll: async (params = {}) => apiHandler({ endPoint: "hr/departments", params }),
    getById: async (id) => apiHandler({ endPoint: `hr/departments/${id}` }),
    create: async (data) => apiHandler({ endPoint: "hr/departments", method: "POST", body: data }),
    update: async (id, data) => apiHandler({ endPoint: `hr/departments/${id}`, method: "PUT", body: data }),
    delete: async (id) => apiHandler({ endPoint: `hr/departments/${id}`, method: "DELETE" }),
  },

  // 🏖️ الإجازات (Leaves)
  leaves: {
    getAll: async (params = {}) => apiHandler({ endPoint: "hr/leaves", params }),
    create: async (data) => apiHandler({ endPoint: "hr/leaves", method: "POST", body: data }),
  },

  // 💵 الرواتب (Salaries)
  salaries: {
    getAll: async (params = {}) => apiHandler({ endPoint: "hr/salaries", params }),
  },

  // 📝 العقود (Contracts)
  contracts: {
    getAll: async (params = {}) => apiHandler({ endPoint: "hr/contracts", params }),
  },
};

export default hrApi;

import * as crmService from "./crm.service";

export * from "./crm.service";

export const crmApi = {
  customers: {
    getAll: crmService.getAllCustomers,
    getById: crmService.getCustomerById,
    create: crmService.createCustomer,
    update: crmService.updateCustomer,
    delete: crmService.deleteCustomer,
  },
  leads: {
    getAll: crmService.getLeads,
    getById: crmService.getLeadById,
    create: crmService.createLead,
    update: crmService.updateLead,
    delete: (id) => crmService.deleteLeadDocument?.(id),
  },
  suppliers: {
    getAll: crmService.getAllSuppliers,
    getById: crmService.getSupplierById,
    create: crmService.createSupplier,
    update: crmService.updateSupplier,
    delete: crmService.toggleSupplierStatus,
  },
  projects: {
    getAll: crmService.getCustomerProjects,
    getById: crmService.getCustomerProjectById,
    create: crmService.createCustomerProject,
    update: crmService.updateCustomerProject,
    delete: crmService.deleteCustomerProject,
  },
};

export default crmApi;

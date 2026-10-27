import * as hrService from "./hr.service";

export * from "./hr.service";

export const hrApi = {
  employees: {
    getAll: hrService.getEmployees,
    getById: hrService.getEmployeeById,
    create: hrService.createEmployee,
    update: hrService.updateEmployee,
    delete: hrService.deleteEmployee,
  },
  departments: {
    getAll: hrService.getDepartments,
    getById: hrService.getDepartmentById,
    create: hrService.createDepartment,
    update: hrService.updateDepartment,
    delete: hrService.deleteDepartment,
  },
  leaves: {
    getAll: hrService.getAllLeaveRequests,
    create: hrService.applyForLeave,
  },
  salaries: {
    getAll: hrService.getSalaries,
  },
  contracts: {
    getAll: hrService.getAllContracts,
  },
};

export default hrApi;

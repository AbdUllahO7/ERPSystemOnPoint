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
  leaveTypes: {
    getAll: hrService.getLeaveTypes,
    getById: hrService.getLeaveTypeById,
    create: hrService.createLeaveType,
    update: hrService.updateLeaveType,
    toggleStatus: hrService.toggleLeaveTypeStatus,
    delete: hrService.deleteLeaveType,
  },
  shiftRules: {
    getAll: hrService.getShiftRules,
    getById: hrService.getShiftRuleById,
    create: hrService.createShiftRule,
    update: hrService.updateShiftRule,
    delete: hrService.deleteShiftRule,
  },
  salaries: {
    getAll: hrService.getSalaries,
  },
  contracts: {
    getAll: hrService.getAllContracts,
  },
};

export default hrApi;

import { apiHandler } from "@/lib/api-handler";

// ==========================================
// DEPARTMENTS
// ==========================================

export async function getDepartments(data) {
  return apiHandler({
    endPoint: "HR/Departments/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getDepartmentEmployees(departmentId, data) {
  return apiHandler({
    endPoint: `HR/Departments/GetEmployees/${departmentId}/Employees`,
    method: "GET",
    params: data,
  });
}

export async function getDepartmentById(id) {
  return apiHandler({
    endPoint: `HR/Departments/GetById/${id}`,
    method: "GET",
  });
}

export async function getDepartmentArchive(id, data) {
  return apiHandler({
    endPoint: `HR/Departments/GetArchive/${id}/Archive`,
    method: "GET",
    params: data,
  });
}

export async function getDepartmentSections(data) {
  return apiHandler({
    endPoint: `HR/Lookups/Sections`,
    method: "GET",
    params: data,
  });
}

export async function createDepartment(data) {
  return apiHandler({
    endPoint: "HR/Departments/Create/create",
    method: "POST",
    body: data,
  });
}

export async function updateDepartment(data) {
  return apiHandler({
    endPoint: "HR/Departments/Update/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteDepartment(id) {
  return apiHandler({
    endPoint: `HR/Departments/Delete/${id}`,
    method: "POST",
  });
}

export async function getAllManagers(data) {
  return apiHandler({
    endPoint: "HR/Departments/GetAllManagers",
    method: "GET",
    params: data,
  });
}

export async function getBranches(params) {
  return apiHandler({
    endPoint: "Branch",
    method: "GET",
    params,
  });
}

// ==========================================
// SECTIONS
// ==========================================

export async function getSections(data) {
  return apiHandler({
    endPoint: "HR/Section/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getSectionById(id) {
  return apiHandler({
    endPoint: `HR/Section/GetById/${id}`,
    method: "GET",
  });
}

export async function createSection(data) {
  return apiHandler({
    endPoint: "HR/Section/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSection(data) {
  return apiHandler({
    endPoint: "HR/Section/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteSection(id) {
  return apiHandler({
    endPoint: `HR/Section/Delete/${id}`,
    method: "POST",
  });
}

export async function getSectionEmployees(sectionId, data) {
  return apiHandler({
    endPoint: `HR/Section/GetSectionEmployees/employees/${sectionId}`,
    method: "GET",
    params: data,
  });
}

export async function getSectionOffices(sectionId, data) {
  return apiHandler({
    endPoint: `HR/Section/GetSectionOffices/offices/${sectionId}`,
    method: "GET",
    params: data,
  });
}

// ==========================================
// OFFICES
// ==========================================

export async function getOffices(data) {
  return apiHandler({
    endPoint: "HR/Office/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getOfficeById(id) {
  return apiHandler({
    endPoint: `HR/Office/GetById/${id}`,
    method: "GET",
  });
}

export async function createOffice(data) {
  return apiHandler({
    endPoint: "HR/Office/Create",
    method: "POST",
    body: data,
  });
}

export async function updateOffice(data) {
  return apiHandler({
    endPoint: "HR/Office/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteOffice(id) {
  return apiHandler({
    endPoint: `HR/Office/Delete/${id}`,
    method: "POST",
  });
}

export async function getOfficeEmployees(officeId, data) {
  return apiHandler({
    endPoint: `HR/Office/GetOfficeEmployees/${officeId}/Employees`,
    method: "GET",
    params: data,
  });
}

// ==========================================
// POSITIONS
// ==========================================

export async function getPositions(data) {
  return apiHandler({
    endPoint: "Position/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getPositionById(id) {
  return apiHandler({
    endPoint: `Position/GetById/${id}`,
    method: "GET",
  });
}

export async function getPositionEmployees(positionId, data) {
  return apiHandler({
    endPoint: `Position/GetPositionEmployees/${positionId}/Employees`,
    method: "GET",
    params: data,
  });
}

export async function createPosition(data) {
  return apiHandler({
    endPoint: "Position/Create",
    method: "POST",
    body: data,
  });
}

export async function updatePosition(data) {
  return apiHandler({
    endPoint: "Position/Update",
    method: "POST",
    body: data,
  });
}

export async function deletePosition(id) {
  return apiHandler({
    endPoint: `Position/Delete/${id}`,
    method: "POST",
  });
}

export async function getLookupPositions(data) {
  return apiHandler({
    endPoint: "HR/Lookups/Positions",
    method: "GET",
    params: data,
  });
}

// ==========================================
// EMPLOYEES
// ==========================================

export async function getEmployees(data) {
  return apiHandler({
    endPoint: "HR/Employees/GetAll",
    method: "GET",
    params: data,
  });
}

export async function createEmployee(data) {
  return apiHandler({
    endPoint: "HR/Employees/Create",
    method: "POST",
    body: data,
  });
}

export async function updateEmployee(data) {
  return apiHandler({
    endPoint: "HR/Employees/Update",
    method: "POST",
    body: data,
  });
}

export async function getEmployeeById(id) {
  return apiHandler({
    endPoint: `HR/Employees/GetById/${id}`,
    method: "GET",
  });
}

export async function deleteEmployee(id) {
  return apiHandler({
    endPoint: `Employee/Delete/${id}`,
    method: "POST",
  });
}

export async function getJobTitles(data) {
  return apiHandler({
    endPoint: "HR/JobTitles/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getShiftRules(data) {
  return apiHandler({
    endPoint: "HR/ShiftRule/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getEmployeeStatus(data) {
  return apiHandler({
    endPoint: "HR/EmployeeStatus/GetAll",
    method: "GET",
    params: data,
  });
}

// ==========================================
// LEAVES
// ==========================================

export async function getAllLeaveRequests(data) {
  return apiHandler({
    endPoint: "HR/Leave/GetAllLeaveRequests/all",
    method: "GET",
    params: data,
  });
}

export async function applyForLeave(data) {
  return apiHandler({
    endPoint: "HR/Leave/ApplyForLeave/apply",
    method: "POST",
    body: data,
  });
}

export async function approveLeave(id) {
  return apiHandler({
    endPoint: `HR/Leave/ApproveLeave/approve/${id}`,
    method: "POST",
  });
}

export async function rejectLeave(id) {
  return apiHandler({
    endPoint: `HR/Leave/RejectLeave/reject/${id}`,
    method: "POST",
  });
}

export async function getLeaveTypes(data) {
  return apiHandler({
    endPoint: "LeaveTypes/getAll",
    method: "GET",
    params: data,
  });
}

// ==========================================
// CONTRACTS
// ==========================================

export async function getContractsByEmployeeId(id, data) {
  return apiHandler({
    endPoint: `HR/Contract/GetByEmployee/${id}/contracts`,
    method: "GET",
    params: data,
  });
}

export async function createContract(data) {
  return apiHandler({
    endPoint: "HR/Contract/CreateContract",
    method: "POST",
    body: data,
    isMultipart: true,
  });
}

export async function updateContract(data) {
  return apiHandler({
    endPoint: "HR/Contract/Update",
    method: "POST",
    body: data,
    isMultipart: true,
  });
}

export async function deleteContract(id) {
  return apiHandler({
    endPoint: `HR/Contract/Delete/${id}`,
    method: "POST",
  });
}

export async function getAllContracts(data) {
  return apiHandler({
    endPoint: "HR/Contract/GetAllContracts/all",
    method: "GET",
    params: data,
  });
}

export async function getContractById(id) {
  return apiHandler({
    endPoint: `HR/Contract/GetById/${id}`,
    method: "GET",
  });
}

export async function restoreContract(id) {
  return apiHandler({
    endPoint: `HR/Contract/RestoreContract/Restore/${id}`,
    method: "POST",
  });
}

// ==========================================
// ATTENDANCE
// ==========================================

export async function getEmployeeAttendanceHistory(id, data) {
  return apiHandler({
    endPoint: `HR/AttendanceLog/GetHistory/${id}/history`,
    method: "GET",
    params: data,
  });
}

export async function getMonthlySummary(data) {
  return apiHandler({
    endPoint: "HR/Attendance/GetMonthlySummary/monthly-summary",
    method: "GET",
    params: data,
  });
}

export async function getDailySummary(year, month, data) {
  return apiHandler({
    endPoint: `HR/Attendance/GetDailySummary/daily-summary/${year}/${month}`,
    method: "GET",
    params: data,
  });
}

export async function getEmployeeDayDetails(date, data) {
  return apiHandler({
    endPoint: `HR/Attendance/GetEmployeeDayDetails/employee-day-details/${date}`,
    method: "GET",
    params: data,
  });
}

export async function getMonthStats(year, month) {
  return apiHandler({
    endPoint: "HR/Attendance/GetMonthStats/month-stats",
    method: "GET",
    params: { year, month },
  });
}

export async function getMonthErrors(year, month) {
  return apiHandler({
    endPoint: "HR/Attendance/GetMonthErrors/month-errors",
    method: "GET",
    params: { year, month },
  });
}

export async function manualUpdateAttendance(data) {
  return apiHandler({
    endPoint: "HR/Attendance/ManualUpdateAttendance/manual-update",
    method: "POST",
    body: data,
  });
}

// ==========================================
// DISCOUNTS & REWARDS & SALARIES
// ==========================================

export async function getDiscounts(data) {
  return apiHandler({
    endPoint: "HR/Discount/GetAllDiscounts/all",
    method: "GET",
    params: data,
  });
}

export async function addDiscount(data) {
  return apiHandler({
    endPoint: "HR/Discount/Add",
    method: "POST",
    body: data,
  });
}

export async function deleteDiscount(id) {
  return apiHandler({
    endPoint: `HR/Discount/Delete/${id}`,
    method: "POST",
  });
}

export async function getRewards(data) {
  return apiHandler({
    endPoint: "HR/Reward/GetAllRewards/all",
    method: "GET",
    params: data,
  });
}

export async function addReward(data) {
  return apiHandler({
    endPoint: "HR/Reward/Add",
    method: "POST",
    body: data,
  });
}

export async function deleteReward(id) {
  return apiHandler({
    endPoint: `HR/Reward/Delete/${id}`,
    method: "POST",
  });
}

export async function getSalaries(data) {
  return apiHandler({
    endPoint: "HR/Salary/GetSalaries",
    method: "GET",
    params: data,
  });
}

// ==========================================
// DOCUMENTS & PERFORMANCE
// ==========================================

export async function getDocumentsByEmployee(employeeId) {
  return apiHandler({
    endPoint: `HR/Document/GetByEmployee/${employeeId}`,
    method: "GET",
  });
}

export async function deleteDocument(id) {
  return apiHandler({
    endPoint: `HR/Document/Delete/${id}`,
    method: "POST",
  });
}

export async function uploadDocument(formData) {
  return apiHandler({
    endPoint: "HR/Document/Upload",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function getPerformance(employeeId, data) {
  return apiHandler({
    endPoint: "HR/Performance/GetAll",
    method: "GET",
    params: { EmployeeId: employeeId, ...data },
  });
}

export async function addPerformance(data) {
  return apiHandler({
    endPoint: "HR/Performance/Add",
    method: "POST",
    body: data,
  });
}

export async function updatePerformance(data) {
  return apiHandler({
    endPoint: "HR/Performance/Update",
    method: "POST",
    body: data,
  });
}

export async function deletePerformance(id) {
  return apiHandler({
    endPoint: `HR/Performance/Delete/${id}`,
    method: "POST",
  });
}

// ==========================================
// HR DASHBOARD
// ==========================================

export async function getHrDashboardSummary() {
  return apiHandler({
    endPoint: "HR/HrDashboard/GetDashboardSummary/summary",
    method: "GET",
  });
}

// ==========================================
// HR AUTH / USERS MANAGEMENT
// ==========================================

export async function getAllUsers(data = {}) {
  return apiHandler({
    endPoint: "Hr/Auth/GetAllUsers/GetAll",
    method: "POST",
    body: data,
    params: data,
  });
}

export async function toggleUserStatus(id) {
  return apiHandler({
    endPoint: `Hr/Auth/ToggleUserStatus/ToggleStatus/${id}`,
    method: "POST",
  });
}

export async function deleteUserPermanently(id) {
  return apiHandler({
    endPoint: `Hr/Auth/DeleteUserPermanently/DeletePermanently/${id}`,
    method: "POST",
  });
}

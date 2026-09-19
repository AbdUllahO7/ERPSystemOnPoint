import { apiHandler } from "./api-handler";

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

export async function getBranches(params) {
  return apiHandler({
    endPoint: "Branch",
    method: "GET",
    params,
  });
}

export async function getAllManagers(data) {
  return apiHandler({
    endPoint: "HR/Departments/GetAllManagers",
    method: "GET",
    params: data,
  });
}

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
    method: "POST", // assuming POST like other updates
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

export async function getLookupPositions(data) {
  return apiHandler({
    endPoint: "HR/Lookups/Positions",
    method: "GET",
    params: data,
  });
}

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

export async function getContractsByEmployeeId(id, data) {
  return apiHandler({
    endPoint: `HR/Contract/GetByEmployee/${id}/contracts`,
    method: "GET",
    params: data,
  });
}

export async function createContract(data) {
  return apiHandler({
    endPoint: "/HR/Contract/CreateContract",
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

export async function getEmployeeAttendanceHistory(id, data) {
  return apiHandler({
    endPoint: `HR/AttendanceLog/GetHistory/${id}/history`,
    method: "GET",
    params: data,
  });
}

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

export async function getWarehouses(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/GetAll/GetAll",
    method: "GET",
    params: data,
  });
}

export async function createWarehouse(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/Create/Create",
    method: "POST",
    body: data,
  });
}

export async function updateWarehouse(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/Update/Update",
    method: "POST", // assuming POST like other updates unless specified
    body: data,
  });
}

export async function getWarehouseById(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetById/GetById/${id}`,
    method: "GET",
  });
}

export async function getWarehouseItems(id, data) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetWarehouseProducts/${id}/products`,
    method: "GET",
    params: data,
  });
}

// ==========================================
// INVENTORY TRANSFERS
// ==========================================

export async function getAllTransfers(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryTransfer/GetAllTransfers",
    method: "GET",
    params: data,
  });
}

export async function getTransferDetails(id) {
  return apiHandler({
    endPoint: `Inventory/InventoryTransfer/GetTransferDetails?id=${id}`,
    method: "GET",
  });
}

export async function getProductsByWarehouse(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetWarehouseProducts/${id}/products`,
    method: "GET",
  });
}

export async function addTransfer(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryTransfer/CreateTransfer",
    method: "POST",
    body: data,
  });
}

export async function getAllCategories(params) {
  return apiHandler({
    endPoint: "inventory/Categories/GetAllCategories",
    method: "GET",
    params,
  });
}

export async function getCategoryById(id) {
  return apiHandler({
    endPoint: `inventory/Categories/GetById/${id}`,
    method: "GET",
  });
}

export async function createCategory(data) {
  return apiHandler({
    endPoint: "inventory/Categories/CreateCategory",
    method: "POST",
    body: data,
  });
}

export async function updateCategory(id, data) {
  return apiHandler({
    endPoint: `inventory/Categories/UpdateCategory/${id}`,
    method: "POST",
    body: data,
  });
}

export async function deleteCategory(id) {
  return apiHandler({
    endPoint: `inventory/Categories/DeleteCategory/${id}`,
    method: "POST",
  });
}

export async function getLeafAccounts(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetLeafAccounts/leaf-accounts",
    method: "GET",
    params,
  });
}

export async function searchMaterialsForInvoice(params) {
  return apiHandler({
    endPoint: "Inventory/Product/SearchMaterialsForInvoice/search-for-invoice",
    method: "GET",
    params,
  });
}

export async function getAllUnitOfMeasurements(params) {
  return apiHandler({
    endPoint: "Inventory/UnitOfMeasurements/GetAllUnitOfMeasurements",
    method: "GET",
    params,
  });
}

export async function getAllProductAttributes(params) {
  return apiHandler({
    endPoint: "Inventory/ProductAttributes/GetAllProductAttributes",
    method: "GET",
    params,
  });
}

export async function createService(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateService",
    method: "POST",
    body: data,
  });
}

export async function getProductById(id) {
  return apiHandler({
    endPoint: `Inventory/Product/GetById/GetById/${id}`,
    method: "GET",
  });
}

export async function updateService(data) {
  return apiHandler({
    endPoint: "Inventory/Product/UpdateProductService/service",
    method: "POST",
    body: data,
  });
}
export async function createBundleWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateBundleWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateBundleWithoutSpecs(data) {
  return apiHandler({
    endPoint: "/Inventory/Product/UpdateProductBundle/bundle",
    method: "POST",
    body: data,
  });
}

export async function createAssemblyWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateAssemblyWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateAssemblyWithoutSpecs(data) {
  return apiHandler({
    endPoint:
      "/Inventory/Product/UpdateProductAssemblyWithoutSpecifications/assembly-without-specifications",
    method: "POST",
    body: data,
  });
}

export async function createSimpleProductWithSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateSimpleProductWithSpecs(data) {
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductInventoryWithSpecifications/inventory-with-specifications",
    method: "POST",
    body: data,
  });
}

export async function createSimpleProductWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateSimpleProductWithoutSpecs(data) {
  return apiHandler({
    endPoint:
      "/Inventory/Product/UpdateProductInventoryWithoutSpecifications/inventory-without-specifications",
    method: "POST",
    body: data,
  });
}

export async function getAllProducts(params) {
  return apiHandler({
    endPoint: "Inventory/Product/GetAll/GetAll",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY DASHBOARD
// ==========================================

export async function getInventoryKpiCards() {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetKpiCards/KpiCards",
    method: "GET",
  });
}

export async function getInventoryCategoryDistribution() {
  return apiHandler({
    endPoint:
      "Inventory/DashboardInvantory/GetCategoryDistribution/CategoryDistribution",
    method: "GET",
  });
}

export async function getInventoryStockMovement() {
  return apiHandler({
    endPoint:
      "Inventory/DashboardInvantory/GetStockMovementByCategory/stock-movement-by-category",
    method: "GET",
  });
}

export async function getInventoryTopTrendingProducts(params) {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetTopTrendingProducts/TopTrending",
    method: "GET",
    params,
  });
}

export async function getInventoryStockAlerts(params) {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetStockAlerts/StockAlerts",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY RECORDS (MATERIAL REPORTS)
// ==========================================

export async function getInventoryRecords(params) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/GetAllRecords",
    method: "GET",
    params,
  });
}

export async function getInventoryRecordDetails(id) {
  return apiHandler({
    endPoint: `Inventory/InventoryRecord/GetRecordDetails/${id}`,
    method: "GET",
  });
}

export async function createInventoryRecord(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/CreateInventoryRecord",
    method: "POST",
    body: data,
  });
}

export async function importPhysicalCountFromExcel(formData) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/ImportPhysicalCountFromExcel",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}
export async function getHrDashboardSummary() {
  return apiHandler({
    endPoint: "HR/HrDashboard/GetDashboardSummary/summary",
    method: "GET",
  });
}

// ==========================================
// ACCOUNTING COST CENTERS
// ==========================================

export async function getAllCostCenters(params) {
  return apiHandler({
    endPoint: "accounting/CostCenters/GetAllCostCenters/all",
    method: "GET",
    params,
  });
}

export async function getCostCenterById(id) {
  return apiHandler({
    endPoint: `accounting/CostCenters/GetCostCenterById/${id}`,
    method: "GET",
  });
}

export async function createCostCenter(data) {
  return apiHandler({
    endPoint: "accounting/CostCenters/CreateCostCenter/create",
    method: "POST",
    body: data,
  });
}

export async function updateCostCenter(data) {
  return apiHandler({
    endPoint: "accounting/CostCenters/UpdateCostCenter/update",
    method: "POST",
    body: data,
  });
}

export async function deleteCostCenter(id) {
  return apiHandler({
    endPoint: `accounting/CostCenters/DeleteCostCenter/delete/${id}`,
    method: "POST",
  });
}

// ==========================================
// ACCOUNTING ACCOUNTS
// ==========================================

export async function getAllAccountsFlat(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetAllAccountsFlat/flat",
    method: "GET",
    params,
  });
}

export async function getAccountById(id) {
  return apiHandler({
    endPoint: `account/Accounts/GetAccountById/${id}`,
    method: "GET",
  });
}

export async function createAccount(data) {
  return apiHandler({
    endPoint: "account/Accounts/CreateAccount/create",
    method: "POST",
    body: data,
  });
}

export async function updateAccount(data) {
  return apiHandler({
    endPoint: "account/Accounts/UpdateAccount/update",
    method: "POST",
    body: data,
  });
}

export async function getChildAccounts(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChildAccounts/accounts/children",
    method: "GET",
    params,
  });
}

export async function getChildCostCenters(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChildCostCenters/costcenters/children",
    method: "GET",
    params,
  });
}

export async function getChartOfAccounts(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChartOfAccounts/chart",
    method: "GET",
    params,
  });
}

// ==========================================
// ACCOUNTING INVOICE PATTERNS
// ==========================================

export async function getAllInvoicePatterns(params) {
  return apiHandler({
    endPoint: "accounting/InvoicePatterns/GetAll",
    method: "GET",
    params,
  });
}

export async function getInvoicePatternById(id) {
  return apiHandler({
    endPoint: `accounting/InvoicePatterns/GetPatternById/${id}`,
    method: "GET",
  });
}

export async function createInvoicePattern(data) {
  return apiHandler({
    endPoint: "accounting/InvoicePatterns/CreatePattern/create",
    method: "POST",
    body: data,
  });
}

export async function updateInvoicePattern(data) {
  return apiHandler({
    endPoint: "accounting/InvoicePatterns/UpdatePattern/update",
    method: "POST",
    body: data,
  });
}

export async function deleteInvoicePattern(id) {
  return apiHandler({
    endPoint: `accounting/InvoicePatterns/TogglePatternStatus/toggle-status/${id}`,
    method: "POST",
  });
}

// ==========================================
// ACCOUNTING INVOICES
// ==========================================

export async function getAllInvoices(params) {
  return apiHandler({
    endPoint: "accounting/Invoices/GetAllInvoices/all",
    method: "GET",
    params,
  });
}

export async function getInvoiceById(id) {
  return apiHandler({
    endPoint: `accounting/Invoices/GetInvoiceById/${id}`,
    method: "GET",
  });
}

export async function createPurchaseInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreatePurchases/purchases",
    method: "POST",
    body: data,
  });
}

export async function createSalesInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreateSales/sales",
    method: "POST",
    body: data,
  });
}

export async function createPurchaseReturnInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreatePurchasesReturns/purchases-returns",
    method: "POST",
    body: data,
  });
}

export async function createSalesReturnInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreateSalesReturns/sales-returns",
    method: "POST",
    body: data,
  });
}

// ==========================================
// ACCOUNTING CURRENCIES
// ==========================================

export async function getAllCurrencies(params) {
  return apiHandler({
    endPoint: "accounting/Currencies/GetAllCurrencies/all",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY SUPPLIERS
// ==========================================

export async function getAllSuppliers(params) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/GetAllSuppliers/GetAll",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY CUSTOMERS
// ==========================================

export async function getAllCustomers(params) {
  return apiHandler({
    endPoint: "inventory/Customer/GetAllCustomers/all-customers",
    method: "GET",
    params,
  });
}

// ==========================================
// OPERATION EXPENSES
// ==========================================

export async function getAllOperationExpenses(params) {
  return apiHandler({
    endPoint: "account/OperationExpense/GetAllExpenses/list",
    method: "GET",
    params,
  });
}

export async function getOperationExpenseById(id) {
  return apiHandler({
    endPoint: `account/OperationExpense/GetExpenseById/${id}`,
    method: "GET",
  });
}

// ==========================================
// VOUCHERS
// ==========================================

export async function getAllVouchers(params) {
  return apiHandler({
    endPoint: "accounting/Vouchers/GetAllVouchers/all",
    method: "GET",
    params,
  });
}

export async function getVoucherById(id) {
  return apiHandler({
    endPoint: `accounting/Vouchers/GetVoucherById/${id}`,
    method: "GET",
  });
}

export async function createJournalVoucher(data) {
  return apiHandler({
    endPoint: "accounting/Vouchers/CreateJournalVoucher/create-journal",
    method: "POST",
    body: data,
  });
}

export async function createOperationExpense(data) {
  return apiHandler({
    endPoint: "account/OperationExpense/CreateExpense/create",
    method: "POST",
    body: data,
  });
}

export async function getOperationExpenseLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetOperationExpenseLookUp/operation-expenses",
    method: "GET",
    params,
  });
}

export async function getCashLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetCashLookUp/cash",
    method: "GET",
    params,
  });
}

export async function getCardLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetCardLookUp/card",
    method: "GET",
    params,
  });
}

// ==========================================
// FIXED EXPENSES
// ==========================================

export async function getAllFixedExpenses(params) {
  return apiHandler({
    endPoint: "account/FixedExpenses/List",
    method: "GET",
    params,
  });
}

export async function getFixedExpenseById(id) {
  return apiHandler({
    endPoint: `account/FixedExpenses/GetById/${id}`,
    method: "GET",
  });
}

export async function createFixedExpense(data) {
  return apiHandler({
    endPoint: "account/FixedExpenses/Create",
    method: "POST",
    body: data,
  });
}

// ==========================================
// CASH BOXES
// ==========================================

export async function getAllCashBoxes(params) {
  return apiHandler({
    endPoint: "account/CashBoxes/GetAllCashBoxes/list",
    method: "GET",
    params,
  });
}

export async function getCashBoxById(id) {
  return apiHandler({
    endPoint: `account/CashBoxes/GetCashBoxById/${id}`,
    method: "GET",
  });
}

export async function createCashBox(data) {
  return apiHandler({
    endPoint: "account/CashBoxes/CreateCashBox/create",
    method: "POST",
    body: data,
  });
}

export async function createCashBoxTransaction(data) {
  return apiHandler({
    endPoint: "account/CashBoxes/CreateAddTransaction/add-transaction",
    method: "POST",
    body: data,
  });
}

export async function getAllCashBoxTransactions(params) {
  return apiHandler({
    endPoint: "account/CashBoxes/GetAllTransactions/transactions",
    method: "GET",
    params,
  });
}

// ==========================================
// Banks
// ==========================================
export async function getAllBanks(params) {
  return apiHandler({
    endPoint: "account/Banks/GetAllBanks/list",
    method: "GET",
    params,
  });
}

export async function getBankById(id) {
  return apiHandler({
    endPoint: `account/Banks/GetBankById/${id}`,
    method: "GET",
  });
}

export async function createBank(data) {
  return apiHandler({
    endPoint: "account/Banks/CreateBank/create",
    method: "POST",
    body: data,
  });
}

export async function createBankTransaction(data) {
  return apiHandler({
    endPoint: "account/Banks/CreateBankTransaction/add-transaction",
    method: "POST",
    body: data,
  });
}

export async function getAllBankTransactions(params) {
  return apiHandler({
    endPoint: "account/Banks/GetAllBankTransactions/transactions",
    method: "GET",
    params,
  });
}

// ==========================================
// Revenues
// ==========================================
export async function getAllRevenues(params) {
  return apiHandler({
    endPoint: "account/Revenues/GetAllRevenues/list",
    method: "GET",
    params,
  });
}

export async function getRevenueById(id) {
  return apiHandler({
    endPoint: `account/Revenues/GetRevenueById/${id}`,
    method: "GET",
  });
}

export async function createDirectRevenue(data) {
  return apiHandler({
    endPoint: "account/Revenues/CreateDirectRevenue/create-direct",
    method: "POST",
    body: data,
  });
}

// ==========================================
// General Expenses
// ==========================================
export async function getAllExpenses(params) {
  return apiHandler({
    endPoint: "account/Expenses/GetAllExpenses/list",
    method: "GET",
    params,
  });
}

export async function getExpenseById(id) {
  return apiHandler({
    endPoint: `account/Expenses/GetExpenseById/${id}`,
    method: "GET",
  });
}

export async function createExpense(data) {
  return apiHandler({
    endPoint: "account/Expenses/CreateExpense/create",
    method: "POST",
    body: data,
  });
}

// ==========================================
// INVENTORY PRODUCT
// ==========================================

export async function toggleProductStatus(id) {
  return apiHandler({
    endPoint: `Inventory/Product/ToggleStatus?id=${id}`,
    method: "POST",
  });
}

export async function createCustomer(data) {
  return apiHandler({
    endPoint: "inventory/Customer/CreateCustomer",
    method: "POST",
    body: data,
  });
}

export async function updateCustomer(data) {
  return apiHandler({
    endPoint: "inventory/Customer/UpdateCustomer",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomer(id) {
  return apiHandler({
    endPoint: `inventory/Customer/DeleteCustomer/${id}`,
    method: "POST",
  });
}

export async function getCustomerById(id) {
  return apiHandler({
    endPoint: `inventory/Customer/GetCustomerById/${id}`,
    method: "GET",
  });
}

// ==========================================
// CUSTOMER CONTACTS
// ==========================================

export async function createCustomerContact(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/Create",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerContact(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomerContact(id) {
  return apiHandler({
    endPoint: `crm/CustomerContact/${id}/ToggleStatus`,
    method: "POST",
  });
}

export async function getCustomerContacts(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/GetAll",
    method: "POST",
    body: data,
  });
}

export async function createSupplier(data) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/CreateSupplier/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplier(data) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/UpdateSupplier/Update",
    method: "POST",
    body: data,
  });
}

export async function toggleSupplierStatus(id) {
  return apiHandler({
    endPoint: `Inventory/Suppliers/ToggleSupplierStatus/ToggleStatus/${id}`,
    method: "POST",
  });
}

export async function getSupplierById(id) {
  return apiHandler({
    endPoint: `Inventory/Suppliers/GetSupplierById/GetById/${id}`,
    method: "GET",
  });
}

// ==========================================
// SUPPLIER CONTACTS
// ==========================================

export async function getSupplierContactsBySupplierId(supplierId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/BySupplier/${supplierId}`,
    method: "GET",
  });
}

export async function getSupplierContactById(contactId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/${contactId}`,
    method: "GET",
  });
}

export async function createSupplierContact(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContact/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierContact(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContact/Update",
    method: "POST",
    body: data,
  });
}

export async function toggleSupplierContactStatus(contactId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/${contactId}/ToggleStatus`,
    method: "POST",
  });
}

// ==========================================
// SUPPLIER CONTRACTS
// ==========================================

export async function getSupplierContracts(params) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/GetAll",
    method: "GET",
    params,
  });
}

export async function createSupplierContract(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierContract(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/Update",
    method: "POST",
    body: data,
  });
}

export async function changeSupplierContractStatus(id, newStatus) {
  return apiHandler({
    endPoint: `inventory/SupplierContract/${id}/ChangeStatus`,
    method: "POST",
    params: { newStatus },
  });
}
export async function getSupplierNotes(params) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/GetAll",
    method: "GET",
    params,
  });
}

export async function createSupplierNote(data) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierNote(data) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/Update",
    method: "POST",
    body: data,
  });
}

export async function getSupplierNoteById(id) {
  return apiHandler({
    endPoint: `inventory/SupplierNote/${id}`,
    method: "GET",
  });
}

export async function deleteSupplierNote(id) {
  return apiHandler({
    endPoint: `inventory/SupplierNote/${id}`,
    method: "POST",
  });
}

export async function getSupplierDocuments(params) {
  return apiHandler({
    endPoint: "inventory/SupplierDocument/GetAll",
    method: "GET",
    params,
  });
}

export async function uploadSupplierDocument(formData) {
  return apiHandler({
    endPoint: "inventory/SupplierDocument/Upload",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function deleteSupplierDocument(id) {
  return apiHandler({
    endPoint: `inventory/SupplierDocument/${id}`,
    method: "POST",
  });
}

export async function getAllPosSalesInvoices(params) {
  return apiHandler({
    endPoint: "Pos/SalesInvoices/GetAllInvoices/all",
    method: "GET",
    params,
  });
}

export async function getLeads(params) {
  return apiHandler({
    endPoint: "crm/Lead/GetAll",
    method: "GET",
    params,
  });
}

export async function createLead(data) {
  return apiHandler({
    endPoint: "crm/Lead/Create",
    method: "POST",
    body: data,
  });
}

export async function updateLead(data) {
  return apiHandler({
    endPoint: "crm/Lead/Update",
    method: "POST",
    body: data,
  });
}

export async function getLeadById(id) {
  return apiHandler({
    endPoint: `crm/Lead/${id}`,
    method: "GET",
  });
}

export async function changeLeadStatus(data) {
  return apiHandler({
    endPoint: "crm/Lead/ChangeStatus",
    method: "POST",
    body: data,
  });
}

export async function createFollowUpLead(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/Create",
    method: "POST",
    body: data,
  });
}

export async function updateFollowUpStatus(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/CompleteOrCancel",
    method: "POST",
    body: data,
  });
}
// ================== projectes tab ====================
export async function getCustomerProjects(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/GetAllProjects/GetAll",
    method: "GET",
    body: data,
  });
}

export async function createCustomerProject(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/CreateProject/create",
    method: "POST",
    body: data,
  });
}
export async function deleteCustomerProject(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/DeleteProject/Delete",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerProject(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/UpdateProject/update",
    method: "POST",
    body: data,
  });
}
export async function getCustomerNotes(data) {
  return apiHandler({
    endPoint: "inventory/CustomerNote/GetAll",
    method: "GET",
    params: data,
  });
}

export async function createCustomerNote(data) {
  return apiHandler({
    endPoint: "inventory/CustomerNote/Create",
    method: "POST",
    body: data,
  });
}

export async function getCustomerDocuments(data) {
  return apiHandler({
    endPoint: "inventory/CustomerDocument/GetAll",
    method: "GET",
    params: data,
  });
}

export async function uploadCustomerDocument(formData) {
  return apiHandler({
    endPoint: "inventory/CustomerDocument/Upload",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function getCustomerFollowUpsTimeline(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/GetTimeline",
    method: "GET",
    params: data,
  });
}

export async function createCustomerFollowUp(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/Create",
    method: "POST",
    body: data,
  });
}

export async function completeOrCancelCustomerFollowUp(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/CompleteOrCancel",
    method: "POST",
    body: data,
  });
}

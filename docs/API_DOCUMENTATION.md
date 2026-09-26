# ERP System API Documentation & Endpoints Reference

> **API Title:** ERPSystemBachEndProject
> **API Version:** 1.0
> **Base URL:** `https://apierp.onpoint-teasting.com`
> **Swagger JSON Source:** `https://apierp.onpoint-teasting.com/swagger/v1/swagger.json`
> **Local Spec File:** `swagger.json`

---

## 📑 Quick Navigation (All 91 Modules / 477 Endpoints)

- [AccountingSettings](#accountingsettings) (3 endpoints)
- [Accounts](#accounts) (11 endpoints)
- [Attendance](#attendance) (10 endpoints)
- [AttendanceLog](#attendancelog) (2 endpoints)
- [Auth](#auth) (4 endpoints)
- [Availability](#availability) (1 endpoints)
- [Banks](#banks) (6 endpoints)
- [Booking](#booking) (5 endpoints)
- [Branch](#branch) (4 endpoints)
- [CashBoxes](#cashboxes) (5 endpoints)
- [CashFlow](#cashflow) (1 endpoints)
- [Categories](#categories) (7 endpoints)
- [CommissionLedger](#commissionledger) (2 endpoints)
- [Contract](#contract) (8 endpoints)
- [CostCenters](#costcenters) (6 endpoints)
- [Currencies](#currencies) (8 endpoints)
- [Customer](#customer) (6 endpoints)
- [CustomerContact](#customercontact) (6 endpoints)
- [CustomerContracts](#customercontracts) (5 endpoints)
- [CustomerDocument](#customerdocument) (3 endpoints)
- [CustomerEvaluations](#customerevaluations) (4 endpoints)
- [CustomerNote](#customernote) (5 endpoints)
- [CustomerProjects](#customerprojects) (6 endpoints)
- [CustomerReseveration](#customerreseveration) (5 endpoints)
- [CustomerServiceSubscriptions](#customerservicesubscriptions) (3 endpoints)
- [DashboardInvantory](#dashboardinvantory) (5 endpoints)
- [Departments](#departments) (11 endpoints)
- [Discount](#discount) (5 endpoints)
- [Document](#document) (5 endpoints)
- [EmployeeStatus](#employeestatus) (6 endpoints)
- [Employees](#employees) (7 endpoints)
- [Expenses](#expenses) (5 endpoints)
- [FinancialDashboard](#financialdashboard) (8 endpoints)
- [FixedAssets](#fixedassets) (6 endpoints)
- [FixedExpenses](#fixedexpenses) (4 endpoints)
- [FollowUpCustomer](#followupcustomer) (5 endpoints)
- [FollowUpLead](#followuplead) (5 endpoints)
- [HrDashboard](#hrdashboard) (1 endpoints)
- [InventoryMovement](#inventorymovement) (9 endpoints)
- [InventoryRecord](#inventoryrecord) (5 endpoints)
- [InventorySettings](#inventorysettings) (2 endpoints)
- [InventoryTransfer](#inventorytransfer) (4 endpoints)
- [InvoicePatterns](#invoicepatterns) (6 endpoints)
- [Invoices](#invoices) (9 endpoints)
- [JobTitles](#jobtitles) (6 endpoints)
- [Lead](#lead) (6 endpoints)
- [LeadDocument](#leaddocument) (3 endpoints)
- [Leave](#leave) (5 endpoints)
- [LeaveBalance](#leavebalance) (4 endpoints)
- [LeaveTypes](#leavetypes) (5 endpoints)
- [Lookups](#lookups) (13 endpoints)
- [LoyaltyLevels](#loyaltylevels) (6 endpoints)
- [LoyaltySettings](#loyaltysettings) (2 endpoints)
- [Notifications](#notifications) (6 endpoints)
- [Office](#office) (8 endpoints)
- [OperationExpense](#operationexpense) (3 endpoints)
- [Package](#package) (4 endpoints)
- [PaymentMethods](#paymentmethods) (5 endpoints)
- [Performance](#performance) (6 endpoints)
- [Position](#position) (8 endpoints)
- [Product](#product) (21 endpoints)
- [ProductAttributes](#productattributes) (6 endpoints)
- [ProductRecipe](#productrecipe) (3 endpoints)
- [ProductUnit](#productunit) (5 endpoints)
- [ProductVariant](#productvariant) (4 endpoints)
- [Reports](#reports) (1 endpoints)
- [Resource](#resource) (6 endpoints)
- [Revenues](#revenues) (3 endpoints)
- [Reward](#reward) (5 endpoints)
- [Role](#role) (6 endpoints)
- [Salary](#salary) (5 endpoints)
- [SalesInvoices](#salesinvoices) (4 endpoints)
- [Section](#section) (9 endpoints)
- [ServiceAppointment](#serviceappointment) (7 endpoints)
- [ServiceProvider](#serviceprovider) (5 endpoints)
- [ServiceProviderCommission](#serviceprovidercommission) (5 endpoints)
- [ShiftRule](#shiftrule) (5 endpoints)
- [Subscriptions](#subscriptions) (3 endpoints)
- [SupplierContact](#suppliercontact) (5 endpoints)
- [SupplierContract](#suppliercontract) (5 endpoints)
- [SupplierDocument](#supplierdocument) (3 endpoints)
- [SupplierNote](#suppliernote) (5 endpoints)
- [Suppliers](#suppliers) (5 endpoints)
- [SupportTickets](#supporttickets) (3 endpoints)
- [SystemFeatures](#systemfeatures) (4 endpoints)
- [SystemResources](#systemresources) (4 endpoints)
- [TenantAccounting](#tenantaccounting) (1 endpoints)
- [Tenants](#tenants) (4 endpoints)
- [TrialBalance](#trialbalance) (1 endpoints)
- [UnitOfMeasurements](#unitofmeasurements) (5 endpoints)
- [Vouchers](#vouchers) (3 endpoints)
- [Warehouses](#warehouses) (6 endpoints)

---

## 🔐 Authentication
Most endpoints require JWT Bearer Authentication:
```http
Authorization: Bearer <your_jwt_token>
```

---

## AccountingSettings

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounting/AccountingSettings/GetSettings` | - | - |
| `POST` | `/api/accounting/AccountingSettings/UpdateSettings/update` | - | - |
| `POST` | `/api/accounting/AccountingSettings/InitializeSettings` | - | - |

---

## Accounts

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/Accounts/CreateAccount/create` | - | - |
| `GET` | `/api/account/Accounts/GetAllAccountsFlat/flat` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/account/Accounts/UpdateAccount/update` | - | - |
| `GET` | `/api/account/Accounts/GetChildAccounts/accounts/children` | - | `ParentAccountId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Accounts/GetChildCostCenters/costcenters/children` | - | `AccountId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/account/Accounts/RestoreAccount/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/account/Accounts/DeleteAccount/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/account/Accounts/GetAccountById/{id}` | - | `id` (path, required) |
| `GET` | `/api/account/Accounts/GetChartOfAccounts/chart` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Accounts/GetLeafAccounts/leaf-accounts` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Accounts/GetExpensesTree/GetExpensesTree` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Attendance

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Attendance/ImportExcel` | - | - |
| `POST` | `/api/HR/Attendance/ProcessBiometricExcel` | - | - |
| `POST` | `/api/HR/Attendance/CalculateDaily/calculate` | - | - |
| `GET` | `/api/HR/Attendance/GetAttendanceRecords/{employeeId}/attendances` | - | `employeeId` (path, required), `Month` (query), `Year` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Attendance/ManualUpdateAttendance/manual-update` | - | - |
| `GET` | `/api/HR/Attendance/GetMonthlySummary/monthly-summary` | - | `Year` (query), `IsFinalized` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Attendance/GetDailySummary/daily-summary/{year}/{month}` | - | `year` (path, required), `month` (path, required), `IsFinalized` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Attendance/GetEmployeeDayDetails/employee-day-details/{date}` | - | `date` (path, required), `Status` (query), `IsFinalized` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Attendance/GetMonthStats/month-stats` | - | `year` (query), `month` (query) |
| `GET` | `/api/HR/Attendance/GetMonthErrors/month-errors` | - | `year` (query), `month` (query) |

---

## AttendanceLog

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/AttendanceLog/RegisterLog/register` | - | - |
| `GET` | `/api/HR/AttendanceLog/GetHistory/{employeeId}/history` | - | `employeeId` (path, required), `LogDate` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Auth

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Hr/Auth/Register/Register` | - | - |
| `POST` | `/api/Hr/Auth/Login/Login` | - | - |
| `POST` | `/api/Hr/Auth/ToggleUserStatus/ToggleStatus/{id}` | - | `id` (path, required) |
| `POST` | `/api/Hr/Auth/DeleteUserPermanently/DeletePermanently/{id}` | - | `id` (path, required) |

---

## Availability

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/Availability/GetAvailableSlots` | - | `providerId` (query), `date` (query), `durationMinutes` (query) |

---

## Banks

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/Banks/CreateBank/create` | - | - |
| `POST` | `/api/account/Banks/CreateBankTransaction/add-transaction` | - | - |
| `POST` | `/api/account/Banks/ProcessBankReconciliation/reconciliation/{bankId}` | - | `bankId` (path, required) |
| `GET` | `/api/account/Banks/GetAllBanks/list` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Banks/GetAllBankTransactions/transactions` | - | `SpecificBankId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Banks/GetBankById/{id}` | - | `id` (path, required) |

---

## Booking

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/Booking/Create` | - | - |
| `POST` | `/api/inventory/Booking/Update` | - | - |
| `GET` | `/api/inventory/Booking/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Booking/GetAll` | - | `SearchTerm` (query), `ResourceId` (query), `ServiceProviderId` (query), `FromDate` (query), `ToDate` (query), `IsActive` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/Booking/{id}/ToggleStatus` | - | `id` (path, required) |

---

## Branch

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Branch` | - | - |
| `GET` | `/api/Branch` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Branch/{id}` | - | `id` (path, required) |
| `POST` | `/api/Branch/{id}/toggle-status` | - | `id` (path, required) |

---

## CashBoxes

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/CashBoxes/CreateCashBox/create` | - | - |
| `GET` | `/api/account/CashBoxes/GetCashBoxById/{id}` | - | `id` (path, required) |
| `GET` | `/api/account/CashBoxes/GetAllCashBoxes/list` | - | `BranchId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/CashBoxes/GetAllTransactions/transactions` | - | `SpecificCashBoxId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/account/CashBoxes/CreateAddTransaction/add-transaction` | - | - |

---

## CashFlow

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounting/CashFlow/GetReport` | - | `fromDate` (query), `toDate` (query) |

---

## Categories

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/Categories/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/Categories/CreateCategory` | - | - |
| `GET` | `/api/inventory/Categories/GetAllCategories` | - | `categories_id` (query), `category_parents` (query), `code_Categories` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/Categories/GetCategoryTree/tree` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/Categories/UpdateCategory/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/Categories/DeleteCategory/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Categories/GetAllCategoriesWithItem/{categoryId}/items` | - | `categoryId` (path, required), `searchtearm` (query), `ProductType` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## CommissionLedger

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/CommissionLedger/GetLedgerById/{id}` | - | `id` (path, required) |
| `GET` | `/api/Inventory/CommissionLedger/GetAllLedgers` | - | `ServiceProviderId` (query), `CustomerId` (query), `Status` (query), `DateFrom` (query), `DateTo` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Contract

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Contract/CreateContract` | - | - |
| `POST` | `/api/HR/Contract/FixActiveContracts/fix-active-contracts` | - | - |
| `POST` | `/api/HR/Contract/Update` | - | - |
| `POST` | `/api/HR/Contract/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Contract/GetAllContracts/all` | - | `MinSalary` (query), `MaxSalary` (query), `StartDateFrom` (query), `StartDateTo` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Contract/GetByEmployee/{employeeId}/contracts` | - | `employeeId` (path, required), `MinSalary` (query), `MaxSalary` (query), `StartDateFrom` (query), `StartDateTo` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Contract/RestoreContract/Restore/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Contract/GetById/{id}` | - | `id` (path, required) |

---

## CostCenters

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/CostCenters/CreateCostCenter/create` | - | - |
| `POST` | `/api/accounting/CostCenters/RestoreCostCenter/restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/accounting/CostCenters/UpdateCostCenter/update` | - | - |
| `POST` | `/api/accounting/CostCenters/DeleteCostCenter/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/CostCenters/GetCostCenterById/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/CostCenters/GetAllCostCenters/all` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Currencies

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/Currencies/CreateCurrency/create` | - | - |
| `POST` | `/api/accounting/Currencies/RestoreCurrency/restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/accounting/Currencies/UpdateCurrency/update` | - | - |
| `POST` | `/api/accounting/Currencies/DeleteCurrency/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/Currencies/GetCurrencyById/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/Currencies/GetAllCurrencies/all` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/accounting/Currencies/GetActiveCurrenciesDropdown/dropdown` | - | - |
| `POST` | `/api/accounting/Currencies/SyncCurrenciesWithApi/SyncWithGlobalRates` | - | - |

---

## Customer

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/Customer/GetAllCustomers/all-customers` | - | `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/Customer/GetCustomerById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/Customer/CreateCustomer` | - | - |
| `POST` | `/api/inventory/Customer/UpdateCustomer` | - | - |
| `POST` | `/api/inventory/Customer/DeleteCustomer/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Customer/GetCustomerCrmProfile/crm-profile/{id}` | - | `id` (path, required) |

---

## CustomerContact

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/crm/CustomerContact/Create` | - | - |
| `POST` | `/api/crm/CustomerContact/Update` | - | - |
| `GET` | `/api/crm/CustomerContact/{id}` | - | `id` (path, required) |
| `POST` | `/api/crm/CustomerContact/{id}` | - | `id` (path, required) |
| `POST` | `/api/crm/CustomerContact/GetAll` | - | - |
| `POST` | `/api/crm/CustomerContact/{id}/ToggleStatus` | - | `id` (path, required) |

---

## CustomerContracts

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerContracts/CreateContract/create` | - | - |
| `GET` | `/api/inventory/CustomerContracts/GetAllContracts` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment` | - | - |
| `GET` | `/api/inventory/CustomerContracts/GetContractById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/CustomerContracts/ProcessExpiringContractsAlerts/process-alerts` | - | - |

---

## CustomerDocument

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerDocument/Upload` | - | - |
| `GET` | `/api/inventory/CustomerDocument/GetAll` | - | `CustomerId` (query), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/CustomerDocument/{id}` | - | `id` (path, required) |

---

## CustomerEvaluations

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerEvaluations/CreateEvaluation/create` | - | - |
| `POST` | `/api/inventory/CustomerEvaluations/UpdateEvaluation/update` | - | - |
| `GET` | `/api/inventory/CustomerEvaluations/GetEvaluationsByCustomerId/by-customer/{customerId}` | - | `customerId` (path, required) |
| `GET` | `/api/inventory/CustomerEvaluations/GetLatestEvaluationByCustomerId/latest-by-customer/{customerId}` | - | `customerId` (path, required) |

---

## CustomerNote

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerNote/Create` | - | - |
| `POST` | `/api/inventory/CustomerNote/Update` | - | - |
| `POST` | `/api/inventory/CustomerNote/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/CustomerNote/GetById/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/CustomerNote/GetAll` | - | `CustomerId` (query), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## CustomerProjects

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerProjects/CreateProject/create` | - | - |
| `GET` | `/api/inventory/CustomerProjects/GetProjectsByCustomerId/by-customer/{customerId}` | - | `customerId` (path, required) |
| `POST` | `/api/inventory/CustomerProjects/UpdateProjectPercentage/update-percentage` | - | - |
| `GET` | `/api/inventory/CustomerProjects/GetAllProjects/GetAll` | - | `CustomerId` (query), `SearchTerm` (query), `Status` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/CustomerProjects/GetProjectById/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/CustomerProjects/DeleteProject/Delete/{id}` | - | `id` (path, required) |

---

## CustomerReseveration

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerReseveration/CreateReservation/create` | - | - |
| `POST` | `/api/inventory/CustomerReseveration/ReverseReservation/reverse` | - | - |
| `GET` | `/api/inventory/CustomerReseveration/GetReservationById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/CustomerReseveration/GetAllReservations/GetAll` | - | - |
| `POST` | `/api/inventory/CustomerReseveration/ChangeReservationStatus/{id}/ChangeStatus` | - | `id` (path, required), `newStatus` (query) |

---

## CustomerServiceSubscriptions

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/CustomerServiceSubscriptions/CreateSubscription/create` | - | - |
| `GET` | `/api/inventory/CustomerServiceSubscriptions/GetSubscriptionsByCustomerId/by-customer/{customerId}` | - | `customerId` (path, required) |
| `POST` | `/api/inventory/CustomerServiceSubscriptions/ProcessExpiredSubscriptions/process-expired` | - | - |

---

## DashboardInvantory

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/DashboardInvantory/GetKpiCards/KpiCards` | - | - |
| `GET` | `/api/Inventory/DashboardInvantory/GetCategoryDistribution/CategoryDistribution` | - | - |
| `GET` | `/api/Inventory/DashboardInvantory/GetStockMovementByCategory/stock-movement-by-category` | - | - |
| `GET` | `/api/Inventory/DashboardInvantory/GetTopTrendingProducts/TopTrending` | - | `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/DashboardInvantory/GetStockAlerts/StockAlerts` | - | `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Departments

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Departments/GetAll` | - | `DepartmentId` (query), `ManagerId` (query), `BranchId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Departments/GetAllManagers` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Departments/GetStatistics` | - | - |
| `GET` | `/api/HR/Departments/GetById/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Departments/GetEmployees/{id}/Employees` | - | `id` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Departments/GetArchive/{id}/Archive` | - | `id` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Departments/Create/create` | - | - |
| `POST` | `/api/HR/Departments/Update/Update` | - | - |
| `POST` | `/api/HR/Departments/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Departments/ExportDepartments/export` | - | `DepartmentId` (query), `ManagerId` (query), `BranchId` (query), `SearchTerm` (query) |
| `POST` | `/api/HR/Departments/Restore/{id}` | - | `id` (path, required) |

---

## Discount

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Discount/GetAllDiscounts/all` | - | `EmployeeId` (query), `DiscountType` (query), `MinAmount` (query), `MaxAmount` (query), `DateFrom` (query), `DateTo` (query), `IsProcessed` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Discount/Add` | - | - |
| `GET` | `/api/HR/Discount/GetByEmployee/{employeeId}` | - | `employeeId` (path, required) |
| `POST` | `/api/HR/Discount/Delete/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Discount/RestoreDiscount/Restore/{id}` | - | `id` (path, required) |

---

## Document

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Document/Upload` | - | - |
| `POST` | `/api/HR/Document/Restore/REstore/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Document/GetByEmployee/{employeeId}` | - | `employeeId` (path, required) |
| `POST` | `/api/HR/Document/RestoreDocument/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Document/Delete/{id}` | - | `id` (path, required) |

---

## EmployeeStatus

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/EmployeeStatus/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/EmployeeStatus/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/EmployeeStatus/RestoreEmployeeStatus/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/EmployeeStatus/Create` | - | - |
| `POST` | `/api/HR/EmployeeStatus/Update` | - | - |
| `POST` | `/api/HR/EmployeeStatus/Delete/{id}` | - | `id` (path, required) |

---

## Employees

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Employees/GetAll` | - | `dep_id` (query), `section_id` (query), `position_id` (query), `office_id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Employees/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Employees/Create` | - | - |
| `POST` | `/api/HR/Employees/Update` | - | - |
| `POST` | `/api/HR/Employees/RestoreEmployee/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Employees/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Employees/ExportEmployees/export` | - | `dep_id` (query), `section_id` (query), `position_id` (query), `office_id` (query), `searchTerm` (query) |

---

## Expenses

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/Expenses/CreateExpense/create` | - | - |
| `POST` | `/api/account/Expenses/CreateExpenseAccount/create-account` | - | - |
| `POST` | `/api/account/Expenses/PostExpense/post/{expenseId}` | - | `expenseId` (path, required) |
| `GET` | `/api/account/Expenses/GetAllExpenses/list` | - | `Status` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Expenses/GetExpenseById/{id}` | - | `id` (path, required) |

---

## FinancialDashboard

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounting/FinancialDashboard/GetDashboard` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GeneralStatistics` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetProjectedCashFlow` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetSmartAlerts` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetRevenueDashboards` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetExpenseIntelligence` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetDebtsReceivableAging` | - | - |
| `GET` | `/api/accounting/FinancialDashboard/GetCostCentersPerformance` | - | - |

---

## FixedAssets

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/FixedAssets/CreateFixedAsset/create` | - | - |
| `GET` | `/api/accounting/FixedAssets/GetAllFixedAssets/all` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/accounting/FixedAssets/GetFixedAssetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/accounting/FixedAssets/ChangeAssetStatus/change-status/{id}` | - | `id` (path, required), `newStatus` (query) |
| `POST` | `/api/accounting/FixedAssets/CalculateAndPostDepreciation/calculate-depreciation` | - | `depreciationDate` (query) |
| `POST` | `/api/accounting/FixedAssets/SellOrDisposeFixedAsset/sell-or-dispose` | - | - |

---

## FixedExpenses

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/FixedExpenses/Create` | - | - |
| `GET` | `/api/account/FixedExpenses/List` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/FixedExpenses/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/account/FixedExpenses/ToggleActive/{id}` | - | `id` (path, required) |

---

## FollowUpCustomer

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/crm/FollowUpCustomer/Create` | - | - |
| `POST` | `/api/crm/FollowUpCustomer/Update` | - | - |
| `POST` | `/api/crm/FollowUpCustomer/CompleteOrCancel` | - | - |
| `POST` | `/api/crm/FollowUpCustomer/delete{id}` | - | `id` (path, required) |
| `GET` | `/api/crm/FollowUpCustomer/GetTimeline` | - | `CustomerId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## FollowUpLead

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/crm/FollowUpLead/Create` | - | - |
| `POST` | `/api/crm/FollowUpLead/Update` | - | - |
| `POST` | `/api/crm/FollowUpLead/CompleteOrCancel` | - | - |
| `POST` | `/api/crm/FollowUpLead/delete{id}` | - | `id` (path, required) |
| `GET` | `/api/crm/FollowUpLead/GetTimeline` | - | `LeadId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## HrDashboard

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hr/HrDashboard/GetDashboardSummary/summary` | - | `year` (query), `month` (query) |

---

## InventoryMovement

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/InventoryMovement/GetAllMaterialRecords/AllMaterialRecords` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/InventoryMovement/GetMaterialMovement/Movement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/ExportMaterialMovement/ExportMaterialMovement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/GetCustomerMovement/CustomerMovement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/ExportCustomerMovement/ExportCustomerMovement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/GetSupplierMovement/SupplierMovement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/ExportSupplierMovement/ExportSupplierMovement` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/GetInventoryBalance/InventoryBalance` | - | - |
| `POST` | `/api/Inventory/InventoryMovement/ExportInventoryBalance/ExportInventoryBalance` | - | - |

---

## InventoryRecord

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/InventoryRecord/CreateInventoryRecord` | - | - |
| `GET` | `/api/Inventory/InventoryRecord/GetRecordDetails/{id}` | - | `id` (path, required) |
| `POST` | `/api/Inventory/InventoryRecord/ImportPhysicalCountFromExcel` | - | - |
| `GET` | `/api/Inventory/InventoryRecord/GetAllRecords` | - | `WarehouseId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/InventoryRecord/CalculateSettlement/{id}/calculate-settlement` | - | `id` (path, required) |

---

## InventorySettings

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/InventorySettings/GetSettings/get` | - | - |
| `POST` | `/api/inventory/InventorySettings/UpdateSettings/update` | - | - |

---

## InventoryTransfer

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/InventoryTransfer/CreateTransfer` | - | - |
| `GET` | `/api/Inventory/InventoryTransfer/GetAllTransfers` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/InventoryTransfer/GetTransferDetails` | - | `id` (query) |
| `POST` | `/api/Inventory/InventoryTransfer/ExecuteTransfer` | - | `id` (query) |

---

## InvoicePatterns

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/InvoicePatterns/CreatePattern/create` | - | - |
| `POST` | `/api/accounting/InvoicePatterns/RestorePattern/restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/accounting/InvoicePatterns/UpdatePattern/update` | - | - |
| `POST` | `/api/accounting/InvoicePatterns/TogglePatternStatus/toggle-status/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/InvoicePatterns/GetPatternById/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/InvoicePatterns/GetAll` | - | `Type` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Invoices

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounting/Invoices/GetInvoiceById/{id}` | - | `id` (path, required) |
| `GET` | `/api/accounting/Invoices/GetAllInvoices/all` | - | `Invoice_Number` (query), `FromDate` (query), `ToDate` (query), `Customer_Id` (query), `Supplier_Id` (query), `Payment_Method` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/accounting/Invoices/CreatePurchases/purchases` | - | - |
| `POST` | `/api/accounting/Invoices/CreateSales/sales` | - | - |
| `POST` | `/api/accounting/Invoices/CreatePurchasesReturns/purchases-returns` | - | - |
| `POST` | `/api/accounting/Invoices/CreateSalesReturns/sales-returns` | - | - |
| `POST` | `/api/accounting/Invoices/PayInstallment/pay-installment` | - | - |
| `GET` | `/api/accounting/Invoices/getallInstallment/getAll-installment` | - | `InvoiceId` (query), `Status` (query), `FromDueDate` (query), `ToDueDate` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/accounting/Invoices/GetInstallmentById/{id}` | - | `id` (path, required) |

---

## JobTitles

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/JobTitles/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/JobTitles/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/JobTitles/Create` | - | - |
| `POST` | `/api/HR/JobTitles/RestoreJopTitle/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/JobTitles/Update` | - | - |
| `POST` | `/api/HR/JobTitles/Delete/{id}` | - | `id` (path, required) |

---

## Lead

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/crm/Lead/Create` | - | - |
| `POST` | `/api/crm/Lead/Update` | - | - |
| `GET` | `/api/crm/Lead/{id}` | - | `id` (path, required) |
| `GET` | `/api/crm/Lead/GetAll` | - | `SearchTerm` (query), `Status` (query), `ResponsibleId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/crm/Lead/ChangeStatus` | - | - |
| `POST` | `/api/crm/Lead/delete{id}` | - | `id` (path, required) |

---

## LeadDocument

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/crm/LeadDocument/Upload` | - | - |
| `GET` | `/api/crm/LeadDocument/GetAll` | - | `LeadId` (query), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/crm/LeadDocument/Delete/{id}` | - | `id` (path, required) |

---

## Leave

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Leave/GetAllLeaveRequests/all` | - | `EmployeeId` (query), `LeaveTypeId` (query), `Status` (query), `StartDateFrom` (query), `StartDateTo` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Leave/ApplyForLeave/apply` | - | - |
| `POST` | `/api/HR/Leave/RejectLeave/reject/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Leave/ApproveLeave/approve/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Leave/GetEmployeeRequests/{employeeId}` | - | `employeeId` (path, required), `LeaveTypeId` (query), `Year` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## LeaveBalance

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/LeaveBalance/GetEmployeeBalances/{employeeId}` | - | `employeeId` (path, required), `LeaveTypeId` (query), `Year` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/LeaveBalance/InitializeBalance/initialize` | - | - |
| `POST` | `/api/HR/LeaveBalance/UpdateBalance/update` | - | - |
| `POST` | `/api/HR/LeaveBalance/DeleteBalance/delete/{id}` | - | `id` (path, required) |

---

## LeaveTypes

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/LeaveTypes/getAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/LeaveTypes/{id}` | - | `id` (path, required) |
| `POST` | `/api/LeaveTypes/{id}` | - | `id` (path, required) |
| `POST` | `/api/LeaveTypes/create` | - | - |
| `POST` | `/api/LeaveTypes/Update` | - | - |

---

## Lookups

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Lookups/Departments` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/Sections` | - | `department_id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/Positions` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/Offices` | - | `section_id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/Employees` | - | `department_id` (query), `section_id` (query), `office_id` (query), `position` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/UnitOfMeasurements` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/Products` | - | `category_Id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/ProductVariants` | - | `product_Id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/ProductUnits` | - | `productVariant_Id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/ProductComponents` | - | `productVariant_Id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/GetCashLookUp/cash` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/GetCardLookUp/card` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Lookups/GetOperationExpenseLookUp/operation-expenses` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## LoyaltyLevels

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/LoyaltyLevels/CreateLoyaltyLevel/create` | - | - |
| `POST` | `/api/account/LoyaltyLevels/RestoreLoyaltyLevel/restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/account/LoyaltyLevels/UpdateLoyaltyLevel/update` | - | - |
| `POST` | `/api/account/LoyaltyLevels/DeleteLoyaltyLevel/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/account/LoyaltyLevels/GetLoyaltyLevelById/{id}` | - | `id` (path, required) |
| `GET` | `/api/account/LoyaltyLevels/GetAllLoyaltyLevels/all` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## LoyaltySettings

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounting/LoyaltySettings/GetSettings` | - | - |
| `POST` | `/api/accounting/LoyaltySettings/UpdateSettings/update` | - | - |

---

## Notifications

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/saas/notifications/GetMyNotifications` | - | `IsRead` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/saas/notifications/MarkAsRead/{id}` | - | `id` (path, required) |
| `POST` | `/api/saas/notifications/MarkAllAsRead` | - | - |
| `POST` | `/api/saas/notifications/Delete/{id}` | - | `id` (path, required) |
| `POST` | `/api/saas/notifications/CreateSystemNotification` | - | - |
| `POST` | `/api/saas/notifications/SendAdminAlert` | - | - |

---

## Office

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Office/Create` | - | - |
| `POST` | `/api/HR/Office/RestoreRestoreOffice/Restore/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Office/GetAll` | - | `section_id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Office/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Office/Update` | - | - |
| `POST` | `/api/HR/Office/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Office/GetOfficeEmployees/{officeId}/Employees` | - | `officeId` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Office/ExportOffices/export` | - | `section_id` (query), `Search` (query), `is_Active` (query) |

---

## OperationExpense

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/OperationExpense/CreateExpense/create` | - | - |
| `GET` | `/api/account/OperationExpense/GetAllExpenses/list` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/OperationExpense/GetExpenseById/{id}` | - | `id` (path, required) |

---

## Package

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saas/Package/CreatePackage` | - | - |
| `POST` | `/api/saas/Package/Update` | - | - |
| `POST` | `/api/saas/Package/ToggleStatus/{id}` | - | `id` (path, required) |
| `GET` | `/api/saas/Package/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## PaymentMethods

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Pos/PaymentMethods/CreatePaymentMethod/create` | - | - |
| `POST` | `/api/Pos/PaymentMethods/UpdatePaymentMethod/update` | - | - |
| `POST` | `/api/Pos/PaymentMethods/DeletePaymentMethod/delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/Pos/PaymentMethods/GetPaymentMethodById/{id}` | - | `id` (path, required) |
| `GET` | `/api/Pos/PaymentMethods/GetAllPaymentMethods/all` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Performance

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Performance/Add` | - | - |
| `POST` | `/api/HR/Performance/Update` | - | - |
| `POST` | `/api/HR/Performance/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Performance/GetbyId/{employeeId}` | - | `employeeId` (path, required) |
| `GET` | `/api/HR/Performance/GetAll` | - | `EmployeeId` (query), `Month` (query), `Year` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Performance/RestorePerformanceOffice/Restore/{id}` | - | `id` (path, required) |

---

## Position

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Position/Create` | - | - |
| `GET` | `/api/Position/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Position/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/Position/RestorePositioneOffice/Restore/{id}` | - | `id` (path, required) |
| `POST` | `/api/Position/Update` | - | - |
| `POST` | `/api/Position/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/Position/GetPositionEmployees/{positionId}/Employees` | - | `positionId` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Position/ExportPositions/export` | - | `searchTerm` (query) |

---

## Product

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/Product/CreateProduct/Create` | - | - |
| `GET` | `/api/Inventory/Product/SearchMaterialsForInvoice/search-materials` | - | `searchTerm` (query) |
| `POST` | `/api/Inventory/Product/UpdateProduct/Update` | - | - |
| `GET` | `/api/Inventory/Product/SearchMaterialsForInvoice/search-for-invoice` | - | `ProductType` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/Product/ToggleStatus` | - | `id` (query) |
| `GET` | `/api/Inventory/Product/GetAll/GetAll` | - | `Category_Id` (query), `product_id` (query), `SearchTerm` (query), `HasSpecifications` (query), `IsTrackingInventory` (query), `ProductType` (query), `WithOutCategory` (query), `WithOutSalles` (query), `IsDescending` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/Product/GetById/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/Inventory/Product/CreateService` | - | - |
| `POST` | `/api/Inventory/Product/CreateSimpleProductWithSpecs` | - | - |
| `POST` | `/api/Inventory/Product/CreateReservationProductWithSpecs` | - | - |
| `POST` | `/api/Inventory/Product/CreateAppointmentProductWithSpecs` | - | - |
| `POST` | `/api/Inventory/Product/CreateSimpleProductWithoutSpecs` | - | - |
| `POST` | `/api/Inventory/Product/CreateAssemblyWithoutSpecs` | - | - |
| `POST` | `/api/Inventory/Product/CreateBundleWithoutSpecs` | - | - |
| `POST` | `/api/Inventory/Product/UpdateProductService/service` | - | - |
| `POST` | `/api/Inventory/Product/UpdateProductInventoryWithoutSpecifications/inventory-without-specifications` | - | - |
| `POST` | `/api/Inventory/Product/UpdateProductAssemblyWithoutSpecifications/assembly-without-specifications` | - | - |
| `POST` | `/api/Inventory/Product/UpdateProductBundle/bundle` | - | - |
| `POST` | `/api/Inventory/Product/UpdateProductInventoryWithSpecifications/inventory-with-specifications` | - | - |
| `POST` | `/api/Inventory/Product/CreateReservationService/reservation-service` | - | - |
| `POST` | `/api/Inventory/Product/CreateAppointmentService/appointment-service` | - | - |

---

## ProductAttributes

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/ProductAttributes/CreateAttribute` | - | - |
| `POST` | `/api/Inventory/ProductAttributes/UpdateAttribute` | - | - |
| `GET` | `/api/Inventory/ProductAttributes/GetAllProductAttributes` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/ProductAttributes/DeleteAttribute/{id}` | - | `id` (path, required) |
| `GET` | `/api/Inventory/ProductAttributes/GetAllAttributeName` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/ProductAttributes/GetallattributevalueName/{id}` | - | `id` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## ProductRecipe

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/ProductRecipe/AddRecipe/{productId}` | - | `productId` (path, required) |
| `POST` | `/api/Inventory/ProductRecipe/UpdateRecipeComponent` | - | - |
| `POST` | `/api/Inventory/ProductRecipe/DeleteRecipeComponent/{recipeComponentId}` | - | `recipeComponentId` (path, required) |

---

## ProductUnit

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/ProductUnit/GetAllUnits` | - | `variantId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/ProductUnit/AddUnitToVariant/AddUnitToVariant` | - | - |
| `POST` | `/api/Inventory/ProductUnit/UpdatePrices/UpdatePrices` | - | - |
| `POST` | `/api/Inventory/ProductUnit/UpdateDetails/UpdateDetails` | - | - |
| `POST` | `/api/Inventory/ProductUnit/ToggleStatus/ToggleStatus` | - | `id` (query), `updatedBy` (query) |

---

## ProductVariant

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/ProductVariant/AddVariantToProduct/AddVariantToProduct` | - | - |
| `GET` | `/api/Inventory/ProductVariant/GetAllVariants` | - | `productId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/Inventory/ProductVariant/UpdateVariant/UpdateVariant` | - | - |
| `POST` | `/api/Inventory/ProductVariant/ToggleStatus/ToggleStatus` | - | `id` (query), `updatedBy` (query) |

---

## Reports

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/Reports/GetAccountStatement/account-statement` | - | - |

---

## Resource

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/Resource/Create` | - | - |
| `POST` | `/api/inventory/Resource/Update` | - | - |
| `GET` | `/api/inventory/Resource/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Resource/GetAll` | - | `Ownership` (query), `Status` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/Resource/{id}/ChangeStatus` | - | `id` (path, required), `newStatus` (query) |
| `POST` | `/api/inventory/Resource/{id}/ToggleActive` | - | `id` (path, required) |

---

## Revenues

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/Revenues/CreateDirectRevenue/create-direct` | - | - |
| `GET` | `/api/account/Revenues/GetAllRevenues/list` | - | `Status` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/account/Revenues/GetRevenueById/{id}` | - | `id` (path, required) |

---

## Reward

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/HR/Reward/GetAllRewards/all` | - | `EmployeeId` (query), `RewardCategory` (query), `MinAmount` (query), `MaxAmount` (query), `DateFrom` (query), `DateTo` (query), `IsProcessed` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Reward/Add` | - | - |
| `GET` | `/api/HR/Reward/GetByEmployee/{employeeId}` | - | `employeeId` (path, required) |
| `POST` | `/api/HR/Reward/Delete/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Reward/RestoreRewardOffice/Restore/{id}` | - | `id` (path, required) |

---

## Role

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hr/Role/GetAllRoles/GetAll` | - | - |
| `GET` | `/api/hr/Role/GetRoleById/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/hr/Role/CreateRole/Create` | - | - |
| `POST` | `/api/hr/Role/UpdateRole/Update` | - | - |
| `POST` | `/api/hr/Role/DeleteRole/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/hr/Role/GetAvailablePermissions/GetAvailablePermissions` | - | - |

---

## Salary

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Salary/Generate` | - | - |
| `POST` | `/api/HR/Salary/GenerateAll` | - | - |
| `GET` | `/api/HR/Salary/GetSalaries` | - | `EmployeeId` (query), `DepartmentId` (query), `Month` (query), `Year` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/HR/Salary/ChangeStatus/ChangeStatus` | - | - |
| `POST` | `/api/HR/Salary/PaySalary/PaySalary` | - | - |

---

## SalesInvoices

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Pos/SalesInvoices/SearchProductsByWarehouse/search-by-warehouse/{warehouseId}` | - | `warehouseId` (path, required), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Pos/SalesInvoices/GetPosProductsByCategory/pos-products/{warehouseId}/{categoryId}` | - | `categoryId` (path, required), `warehouseId` (path, required), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Pos/SalesInvoices/GetInvoiceById/{id}` | - | `id` (path, required) |
| `GET` | `/api/Pos/SalesInvoices/GetAllInvoices/all` | - | `Category_Id` (query), `FromDate` (query), `ToDate` (query), `PaymentMethodId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Section

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/Section/Create` | - | - |
| `GET` | `/api/HR/Section/GetAll` | - | `department_Id` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Section/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Section/Update` | - | - |
| `POST` | `/api/HR/Section/Delete/{id}` | - | `id` (path, required) |
| `POST` | `/api/HR/Section/RestoreSectionOffice/Restore/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/Section/GetSectionOffices/offices/{id}` | - | `id` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Section/GetSectionEmployees/employees/{id}` | - | `id` (path, required), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/Section/ExportSections/export` | - | `department_Id` (query), `searchTerm` (query) |

---

## ServiceAppointment

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/ServiceAppointment/CreateAppointment` | - | - |
| `GET` | `/api/inventory/ServiceAppointment/GetAvailableTimeSlots/available-slots` | - | `serviceProviderId` (query), `date` (query), `durationInMinutes` (query) |
| `GET` | `/api/inventory/ServiceAppointment/GetAppointmentById/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/ServiceAppointment/GetAllAppointments/all-appointments` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/ServiceAppointment/GetCustomerAppointmentsHistory/customer/{customerId}/history` | - | `customerId` (path, required) |
| `POST` | `/api/inventory/ServiceAppointment/ChangeAppointmentStatus` | - | `appointmentId` (query), `newStatus` (query) |
| `POST` | `/api/inventory/ServiceAppointment/GenerateInvoiceForAppointment` | - | - |

---

## ServiceProvider

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/inventory/ServiceProvider/GetAllServiceProviders/all-service-providers` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/ServiceProvider/GetServiceProviderById/{id}` | - | `id` (path, required) |
| `POST` | `/api/inventory/ServiceProvider/CreateServiceProvider` | - | - |
| `POST` | `/api/inventory/ServiceProvider/UpdateServiceProvider` | - | - |
| `POST` | `/api/inventory/ServiceProvider/DeleteServiceProvider/{id}` | - | `id` (path, required) |

---

## ServiceProviderCommission

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/ServiceProviderCommission/CreateCommission` | - | - |
| `POST` | `/api/Inventory/ServiceProviderCommission/UpdateCommission` | - | - |
| `POST` | `/api/Inventory/ServiceProviderCommission/DeleteCommission/{id}` | - | `id` (path, required) |
| `GET` | `/api/Inventory/ServiceProviderCommission/GetCommissionById/{id}` | - | `id` (path, required) |
| `GET` | `/api/Inventory/ServiceProviderCommission/GetAllCommissions` | - | `ServiceProviderId` (query), `ProductVariantId` (query), `CommissionType` (query), `ActiveOnDate` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## ShiftRule

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/HR/ShiftRule/Create` | - | - |
| `POST` | `/api/HR/ShiftRule/Update` | - | - |
| `POST` | `/api/HR/ShiftRule/Delete/{id}` | - | `id` (path, required) |
| `GET` | `/api/HR/ShiftRule/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/HR/ShiftRule/GetById/{id}` | - | `id` (path, required) |

---

## Subscriptions

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saas/Subscriptions/SubscribeTenant` | - | - |
| `POST` | `/api/saas/Subscriptions/TopUpResource` | - | - |
| `POST` | `/api/saas/Subscriptions/UpgradePackage` | - | - |

---

## SupplierContact

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/SupplierContact/Create` | - | - |
| `POST` | `/api/inventory/SupplierContact/Update` | - | - |
| `GET` | `/api/inventory/SupplierContact/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/SupplierContact/BySupplier/{supplierId}` | - | `supplierId` (path, required) |
| `POST` | `/api/inventory/SupplierContact/{id}/ToggleStatus` | - | `id` (path, required) |

---

## SupplierContract

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/SupplierContract/Create` | - | - |
| `POST` | `/api/inventory/SupplierContract/Update` | - | - |
| `GET` | `/api/inventory/SupplierContract/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/SupplierContract/GetAll` | - | `SearchTerm` (query), `SupplierId` (query), `Status` (query), `FromDate` (query), `ToDate` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/SupplierContract/{id}/ChangeStatus` | - | `id` (path, required), `newStatus` (query) |

---

## SupplierDocument

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/SupplierDocument/Upload` | - | - |
| `GET` | `/api/inventory/SupplierDocument/GetAll` | - | `SupplierId` (query), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/inventory/SupplierDocument/{id}` | - | `id` (path, required) |

---

## SupplierNote

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/SupplierNote/Create` | - | - |
| `POST` | `/api/inventory/SupplierNote/Update` | - | - |
| `POST` | `/api/inventory/SupplierNote/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/SupplierNote/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/SupplierNote/GetAll` | - | `SupplierId` (query), `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## Suppliers

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Inventory/Suppliers/CreateSupplier/Create` | - | - |
| `POST` | `/api/Inventory/Suppliers/UpdateSupplier/Update` | - | - |
| `GET` | `/api/Inventory/Suppliers/GetAllSuppliers/GetAll` | - | `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/Suppliers/GetSupplierById/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/Inventory/Suppliers/ToggleSupplierStatus/ToggleStatus/{id}` | - | `id` (path, required), `updatedBy` (query) |

---

## SupportTickets

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/SupportTickets/categories` | - | - |
| `POST` | `/api/SupportTickets/tickets` | - | - |
| `GET` | `/api/SupportTickets/tickets/{id}` | - | `id` (path, required) |

---

## SystemFeatures

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saas/catalog/features/Create` | - | - |
| `POST` | `/api/saas/catalog/features/Update` | - | - |
| `POST` | `/api/saas/catalog/features/ToggleStatus/{id}` | - | `id` (path, required) |
| `GET` | `/api/saas/catalog/features/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## SystemResources

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saas/catalog/resources/Create` | - | - |
| `POST` | `/api/saas/catalog/resources/Update` | - | - |
| `POST` | `/api/saas/catalog/resources/ToggleStatus/{id}` | - | `id` (path, required) |
| `GET` | `/api/saas/catalog/resources/GetAll` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---

## TenantAccounting

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/TenantAccounting/InitializeTenantAccounting/initialize` | - | - |

---

## Tenants

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/saas/Tenants/GetById/{id}` | - | `id` (path, required) |
| `POST` | `/api/saas/Tenants/RegisterTenant` | - | - |
| `GET` | `/api/saas/Tenants/GetAllTenants` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `POST` | `/api/saas/Tenants/ToggleStatus/{id}` | - | `id` (path, required) |

---

## TrialBalance

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/account/TrialBalance/GenerateTrialBalance/generate` | - | - |

---

## UnitOfMeasurements

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Inventory/UnitOfMeasurements/GetAllUnitOfMeasurements` | - | `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/Inventory/UnitOfMeasurements/GetUnitOfMeasurementsById/{id}` | - | `id` (path, required) |
| `POST` | `/api/Inventory/UnitOfMeasurements/CreateUnitOfMeasurements` | - | - |
| `POST` | `/api/Inventory/UnitOfMeasurements/UpdateUnitOfMeasurements` | - | - |
| `POST` | `/api/Inventory/UnitOfMeasurements/DeleteUnitOfMeasurements/{id}` | - | `id` (path, required) |

---

## Vouchers

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/accounting/Vouchers/CreateJournalVoucher/create-journal` | - | - |
| `GET` | `/api/accounting/Vouchers/GetAllVouchers/all` | - | `voucher_Type` (query), `from_Date` (query), `to_Date` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/accounting/Vouchers/GetVoucherById/{id}` | - | `id` (path, required) |

---

## Warehouses

| Method | Endpoint Path | Description | Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inventory/Warehouses/Create/Create` | - | - |
| `POST` | `/api/inventory/Warehouses/Update/Update` | - | - |
| `POST` | `/api/inventory/Warehouses/ToggleStatus/ToggleStatus/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Warehouses/GetById/GetById/{id}` | - | `id` (path, required) |
| `GET` | `/api/inventory/Warehouses/GetAll/GetAll` | - | `SearchTerm` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |
| `GET` | `/api/inventory/Warehouses/GetWarehouseProducts/{warehouseId}/products` | - | `warehouseId` (path, required), `categoryId` (query), `PageNumber` (query), `PageSize` (query), `Search` (query), `IsActive` (query), `SortBy` (query), `SortDirection` (query) |

---


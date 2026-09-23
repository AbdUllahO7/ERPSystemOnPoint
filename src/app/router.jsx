import { createBrowserRouter } from "react-router-dom"
import WebsiteLayout from "@/layouts/WebsiteLayout"
import DashboardLayout from "@/layouts/DashboardLayout"

import Home from "@/pages/website/Home"
import About from "@/pages/website/About"

import Users from "../pages/dashboard/Users/Users"
import DashboardHome from "../pages/dashboard/DashboardHome/dashboard-home"
import HrDashboardPage from "../pages/dashboard/HrDashboard/hr-dashboard-page"
import Depatments from "../pages/dashboard/Depatments/depatments-page"
import DepartmentDetail from "../pages/dashboard/Depatments/_components/deapartment-detail"
import AddEditDepartment from "../pages/dashboard/Depatments/add-edit-department"
import Sections from "../pages/dashboard/Sections/sections-page"
import SectionDetail from "../pages/dashboard/Sections/_components/section-detail"
import AddEditSection from "../pages/dashboard/Sections/add-edit-section"
import Offices from "../pages/dashboard/Offices/offices-page"
import OfficeDetail from "../pages/dashboard/Offices/_components/office-detail"
import AddEditOffice from "../pages/dashboard/Offices/add-edit-office"
import Positions from "../pages/dashboard/Positions/positions-page"
import PositionDetail from "../pages/dashboard/Positions/_components/position-detail"
import AddEditPosition from "../pages/dashboard/Positions/add-edit-position"
import NotFound from "../pages/not-found"
import Employees from "../pages/dashboard/Employees/employees-page"
import EmployeeDetail from "../pages/dashboard/Employees/_components/employee-detail"
import ContractDetailPage from "../pages/dashboard/Employees/contract-detail-page"
import PerformanceDetailPage from "../pages/dashboard/Employees/performance-detail-page"
import AddEditPerformance from "../pages/dashboard/Employees/add-edit-performance"
import AddLeavePage from "../pages/dashboard/Employees/add-leave-page"
import AddEditEmployee from "../pages/dashboard/Employees/add-edit-employee"
import LeavesPage from "../pages/dashboard/Leaves/leaves-page"
import AddGlobalLeavePage from "../pages/dashboard/Leaves/add-leave-page"
import BonusesPage from "../pages/dashboard/Bonuses/bonuses-page"
import AddBonusPage from "../pages/dashboard/Bonuses/add-bonus-page"
import DeductionsPage from "../pages/dashboard/Deductions/deductions-page"
import AddDeductionPage from "../pages/dashboard/Deductions/add-deduction-page"
import SalariesPage from "../pages/dashboard/Salaries/salaries-page"
import ContractsPage from "../pages/dashboard/Contracts/contracts-page"
import AddEditContractPage from "../pages/dashboard/Contracts/add-edit-contract"
import AttendanceMonthly from "../pages/dashboard/Attendance/AttendanceMonthly"
import AttendanceDaily from "../pages/dashboard/Attendance/AttendanceDaily"
import AttendanceErrors from "../pages/dashboard/Attendance/AttendanceErrors"
import EmployeeDayDetails from "../pages/dashboard/Attendance/EmployeeDayDetails"
import AttendanceCount from "../pages/dashboard/Attendance/AttendanceCount"
// import Users from "@/pages/dashboard/Users"

import ItemCategoriesPage from "../pages/dashboard/Inventory/ItemCategories/item-categories-page"
import AddCategoryPage from "../pages/dashboard/Inventory/ItemCategories/add-category-page"
import SubcategoriesPage from "../pages/dashboard/Inventory/ItemCategories/subcategories-page"
import ItemsPage from "../pages/dashboard/Inventory/Items/items-page"
import AddItemPage from "../pages/dashboard/Inventory/Items/add-item/add-item-page"
import WarehousesPage from "../pages/dashboard/Inventory/Warehouses/warehouses-page"
import AddEditWarehouse from "../pages/dashboard/Inventory/Warehouses/add-edit-warehouse"
import WarehouseDetails from "../pages/dashboard/Inventory/Warehouses/warehouse-details"

import TransfersPage from "../pages/dashboard/Inventory/Transfers/transfers-page"
import TransferDetails from "../pages/dashboard/Inventory/Transfers/transfer-details"
import AddEditTransfer from "../pages/dashboard/Inventory/Transfers/add-edit-transfer"
import InventoryDashboard from "../pages/dashboard/Inventory/dashboard/inventory-dashboard"
import MaterialReportsPage from "../pages/dashboard/Inventory/MaterialReports/material-reports-page"
import AddMaterialReport from "../pages/dashboard/Inventory/MaterialReports/add-material-report"
import MaterialReportDetails from "../pages/dashboard/Inventory/MaterialReports/material-report-details"

import CostCentersPage from "../pages/dashboard/accounting/CostCenters/cost-centers-page"
import AddEditCostCenter from "../pages/dashboard/accounting/CostCenters/add-edit-cost-center"
import CostCenterDetails from "../pages/dashboard/accounting/CostCenters/cost-center-details"

import AccountsPage from "../pages/dashboard/accounting/Accounts/accounts-page"
import AddEditAccount from "../pages/dashboard/accounting/Accounts/add-edit-account"
import AccountDetails from "../pages/dashboard/accounting/Accounts/account-details"

import ChartOfAccountsPage from "../pages/dashboard/accounting/ChartOfAccounts/chart-of-accounts-page"

import InvoicePatternsPage from "../pages/dashboard/accounting/InvoicePatterns/invoice-patterns-page"
import AddEditInvoicePattern from "../pages/dashboard/accounting/InvoicePatterns/add-edit-invoice-pattern"
import InvoicePatternDetails from "../pages/dashboard/accounting/InvoicePatterns/invoice-pattern-details"

import InvoicesPage from "../pages/dashboard/accounting/Invoices/invoices-page"
import AddEditInvoice from "../pages/dashboard/accounting/Invoices/add-edit-invoice"
import InvoiceDetails from "../pages/dashboard/accounting/Invoices/invoice-details"

import OperatingExpensesPage from "../pages/dashboard/accounting/OperatingExpenses/operating-expenses-page"
import AddEditOperatingExpense from "../pages/dashboard/accounting/OperatingExpenses/add-edit-operating-expense"
import OperatingExpenseDetails from "../pages/dashboard/accounting/OperatingExpenses/operating-expense-details"

import FixedExpensesPage from "../pages/dashboard/accounting/FixedExpenses/fixed-expenses-page"
import AddEditFixedExpense from "../pages/dashboard/accounting/FixedExpenses/add-edit-fixed-expense"
import FixedExpenseDetails from "../pages/dashboard/accounting/FixedExpenses/fixed-expense-details"

import CashBoxesPage from "../pages/dashboard/accounting/CashBoxes/cash-boxes-page"
import AddCashBox from "../pages/dashboard/accounting/CashBoxes/add-cash-box"
import CashBoxDetails from "../pages/dashboard/accounting/CashBoxes/cash-box-details"
import AddMovement from "../pages/dashboard/accounting/CashBoxes/add-movement"
import AllTransactionsPage from "../pages/dashboard/accounting/CashBoxes/all-transactions-page"

import BanksPage from "../pages/dashboard/accounting/Banks/banks-page"
import AddBank from "../pages/dashboard/accounting/Banks/add-bank"
import BankDetails from "../pages/dashboard/accounting/Banks/bank-details"
import AddBankMovement from "../pages/dashboard/accounting/Banks/add-movement"
import AllBankTransactionsPage from "../pages/dashboard/accounting/Banks/all-transactions-page"

import RevenuesPage from "../pages/dashboard/accounting/Revenues/revenues-page"
import RevenueDetails from "../pages/dashboard/accounting/Revenues/revenue-details"
import AddRevenue from "../pages/dashboard/accounting/Revenues/add-revenue"

import AddExpense from "../pages/dashboard/accounting/Expenses/add-expense"
import ExpensesPage from "../pages/dashboard/accounting/Expenses/expenses-page"
import ExpenseDetails from "../pages/dashboard/accounting/Expenses/expense-details"

import JournalEntryPage from "../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-page"
import AddEditJournalEntry from "../pages/dashboard/accounting/Bonds/JournalEntry/add-edit-journal-entry"
import JournalEntryDetails from "../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-details"

import SettingsPage from "../pages/dashboard/settings/settings-page"

import LeadsPage from "../pages/dashboard/crm/leads/leads-page"
import AddEditLead from "../pages/dashboard/crm/leads/add-edit-lead"
import LeadDetails from "../pages/dashboard/crm/leads/lead-details"

import CustomersPage from "../pages/dashboard/crm/customers/customers-page"
import AddEditCustomers from "../pages/dashboard/crm/customers/add-edit-customers"
import CustomerDetails from "../pages/dashboard/crm/customers/customer-details"

import FollowUpsPage from "../pages/dashboard/crm/follow-up-list/follow-ups-page"
import SupplierPage from "../pages/dashboard/crm/suppliers/supplier-page"
import ProjectsPage from "../pages/dashboard/crm/projects/projects-page"
import AddEditProject from "../pages/dashboard/crm/projects/add-edit-project"
import ProjectDetails from "../pages/dashboard/crm/projects/project-details"
import AddEditSupplier from "../pages/dashboard/crm/suppliers/add-edit-supplier"
import SupplierDetails from "../pages/dashboard/crm/suppliers/supplier-details"

import AppointmentsPage from "../pages/dashboard/Appointments/appointments-page"
import AppointmentDetails from "../pages/dashboard/Appointments/appointment-details"
import AddEditAppointment from "../pages/dashboard/Appointments/add-edit-appointment"
import ServicesPage from "../pages/dashboard/Appointments/Services/services-page"
import AddEditService from "../pages/dashboard/Appointments/Services/add-edit-service"
import ServiceProvidersPage from "../pages/dashboard/Appointments/ServiceProviders/service-providers-page"
import AddEditServiceProvider from "../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider"
import ServiceProviderDetails from "../pages/dashboard/Appointments/ServiceProviders/service-provider-details"
import ProviderCommissionsPage from "../pages/dashboard/Appointments/Commissions/provider-commissions-page"
import CommissionLedgerPage from "../pages/dashboard/Appointments/Commissions/commission-ledger-page"
import ReservationsPage from "../pages/dashboard/Reservations/reservations-page"
import AddEditReservation from "../pages/dashboard/Reservations/add-edit-reservation"
import ReservationDetails from "../pages/dashboard/Reservations/reservation-details"
import EventsPage from "../pages/dashboard/Events/events-page"
import AddEditEvent from "../pages/dashboard/Events/add-edit-event"
import EventDetails from "../pages/dashboard/Events/event-details"
import ResourcesPage from "../pages/dashboard/Resources/resources-page"
import AddEditResource from "../pages/dashboard/Resources/add-edit-resource"
import ResourceDetails from "../pages/dashboard/Resources/resource-details"
import RentalsPage from "../pages/dashboard/Rentals/rentals-page"
import AddEditRental from "../pages/dashboard/Rentals/add-edit-rental"
import RentalDetails from "../pages/dashboard/Rentals/rental-details"
import RentalInvoicesPage from "../pages/dashboard/Rentals/Invoices/rental-invoices-page"
import AddEditRentalInvoice from "../pages/dashboard/Rentals/Invoices/add-edit-rental-invoice"
import RentalInvoiceDetails from "../pages/dashboard/Rentals/Invoices/rental-invoice-details"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HrDashboardPage /> },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HrDashboardPage /> },
      { path: "users", element: <Users /> },
      { path: "/dashboard/hr", element: <HrDashboardPage /> },
      { path: "/dashboard/hr/departments", element: <Depatments /> },
      { path: "/dashboard/hr/departments/add", element: <AddEditDepartment /> },
      { path: "/dashboard/hr/departments/edit/:id", element: <AddEditDepartment /> },
      { path: "/dashboard/hr/departments/:id", element: <DepartmentDetail /> },
      { path: "/dashboard/hr/sections", element: <Sections /> },
      { path: "/dashboard/hr/sections/add", element: <AddEditSection /> },
      { path: "/dashboard/hr/sections/edit/:id", element: <AddEditSection /> },
      { path: "/dashboard/hr/sections/:id", element: <SectionDetail /> },
      { path: "/dashboard/hr/offices", element: <Offices /> },
      { path: "/dashboard/hr/offices/add", element: <AddEditOffice /> },
      { path: "/dashboard/hr/offices/edit/:id", element: <AddEditOffice /> },
      { path: "/dashboard/hr/offices/:id", element: <OfficeDetail /> },
      { path: "/dashboard/hr/positions", element: <Positions /> },
      { path: "/dashboard/hr/positions/add", element: <AddEditPosition /> },
      { path: "/dashboard/hr/positions/edit/:id", element: <AddEditPosition /> },
      { path: "/dashboard/hr/positions/:id", element: <PositionDetail /> },
      { path: "/dashboard/hr/employees", element: <Employees /> },
      { path: "/dashboard/hr/employees/add", element: <AddEditEmployee /> },
      { path: "/dashboard/hr/employees/edit/:id", element: <AddEditEmployee /> },
      { path: "/dashboard/hr/employees/:id", element: <EmployeeDetail /> },
      { path: "/dashboard/hr/employees/:id/add-leave", element: <AddLeavePage /> },
      { path: "/dashboard/hr/employees/:id/contracts/:contractId", element: <ContractDetailPage /> },
      { path: "/dashboard/hr/employees/:id/performance/add", element: <AddEditPerformance /> },
      { path: "/dashboard/hr/employees/:id/performance/:performanceId", element: <PerformanceDetailPage /> },
      { path: "/dashboard/hr/leaves", element: <LeavesPage /> },
      { path: "/dashboard/hr/leaves/add", element: <AddGlobalLeavePage /> },
      { path: "/dashboard/hr/bounces", element: <BonusesPage /> },
      { path: "/dashboard/hr/bounces/add", element: <AddBonusPage /> },
      { path: "/dashboard/hr/deductions", element: <DeductionsPage /> },
      { path: "/dashboard/hr/deductions/add", element: <AddDeductionPage /> },
      { path: "/dashboard/hr/salaries", element: <SalariesPage /> },
      { path: "/dashboard/hr/contractes", element: <ContractsPage /> },
      { path: "/dashboard/hr/contracts/add", element: <AddEditContractPage /> },
      { path: "/dashboard/hr/contracts/edit/:id", element: <AddEditContractPage /> },
      { path: "/dashboard/hr/attendance", element: <AttendanceMonthly /> },
      { path: "/dashboard/hr/attendance/:year/:month", element: <AttendanceDaily /> },
      { path: "/dashboard/hr/attendance/:year/:month/count", element: <AttendanceCount /> },
      { path: "/dashboard/hr/attendance/:year/:month/errors", element: <AttendanceErrors /> },
      { path: "/dashboard/hr/attendance/:year/:month/:date", element: <EmployeeDayDetails /> },

      { path: "/dashboard/inventory", element: <InventoryDashboard /> },
      { path: "/dashboard/inventory/items-management/categories", element: <ItemCategoriesPage /> },
      { path: "/dashboard/inventory/items-management/categories/add", element: <AddCategoryPage /> },
      { path: "/dashboard/inventory/items-management/categories/edit/:id", element: <AddCategoryPage /> },
      { path: "/dashboard/inventory/items-management/categories/:id/subcategories", element: <SubcategoriesPage /> },
      { path: "/dashboard/inventory/items-management/categories/:id/related-items", element: <ItemsPage /> },

      { path: "/dashboard/inventory/items-management/items", element: <ItemsPage /> },
      { path: "/dashboard/inventory/items-management/items/add", element: <AddItemPage /> },
      { path: "/dashboard/inventory/items-management/items/edit/:id", element: <AddItemPage /> },

      { path: "/dashboard/inventory/warehouses", element: <WarehousesPage /> },
      { path: "/dashboard/inventory/warehouses/add", element: <AddEditWarehouse /> },
      { path: "/dashboard/inventory/warehouses/edit/:id", element: <AddEditWarehouse /> },
      { path: "/dashboard/inventory/warehouses/:id", element: <WarehouseDetails /> },

      { path: "/dashboard/inventory/transfers", element: <TransfersPage /> },
      { path: "/dashboard/inventory/transfers/add", element: <AddEditTransfer /> },
      { path: "/dashboard/inventory/transfers/edit/:id", element: <AddEditTransfer /> },
      { path: "/dashboard/inventory/transfers/:id", element: <TransferDetails /> },

      { path: "/dashboard/inventory/material-reports", element: <MaterialReportsPage /> },
      { path: "/dashboard/inventory/material-reports/add", element: <AddMaterialReport /> },
      { path: "/dashboard/inventory/material-reports/:id", element: <MaterialReportDetails /> },

      { path: "/dashboard/accounting/cost-centers", element: <CostCentersPage /> },
      { path: "/dashboard/accounting/cost-centers/add", element: <AddEditCostCenter /> },
      { path: "/dashboard/accounting/cost-centers/edit/:id", element: <AddEditCostCenter /> },
      { path: "/dashboard/accounting/cost-centers/:id", element: <CostCenterDetails /> },

      { path: "/dashboard/accounting/accounts", element: <AccountsPage /> },
      { path: "/dashboard/accounting/accounts/add", element: <AddEditAccount /> },
      { path: "/dashboard/accounting/accounts/edit/:id", element: <AddEditAccount /> },
      { path: "/dashboard/accounting/accounts/:id", element: <AccountDetails /> },
      
      { path: "/dashboard/accounting/chart-of-accounts", element: <ChartOfAccountsPage /> },

      { path: "/dashboard/accounting/basics/invoicing-patterns", element: <InvoicePatternsPage /> },
      { path: "/dashboard/accounting/invoice-patterns/add", element: <AddEditInvoicePattern /> },
      { path: "/dashboard/accounting/invoice-patterns/edit/:id", element: <AddEditInvoicePattern /> },
      { path: "/dashboard/accounting/invoice-patterns/:id", element: <InvoicePatternDetails /> },

      { path: "/dashboard/accounting/invoices", element: <InvoicesPage /> },
      { path: "/dashboard/accounting/invoices/add", element: <AddEditInvoice /> },
      { path: "/dashboard/accounting/invoices/:id", element: <InvoiceDetails /> },

      { path: "/dashboard/accounting/operating-expenses", element: <OperatingExpensesPage /> },
      { path: "/dashboard/accounting/operating-expenses/add", element: <AddEditOperatingExpense /> },
      { path: "/dashboard/accounting/operating-expenses/edit/:id", element: <AddEditOperatingExpense /> },
      { path: "/dashboard/accounting/operating-expenses/:id", element: <OperatingExpenseDetails /> },

      { path: "/dashboard/accounting/fixed-expenses", element: <FixedExpensesPage /> },
      { path: "/dashboard/accounting/fixed-expenses/add", element: <AddEditFixedExpense /> },
      { path: "/dashboard/accounting/fixed-expenses/edit/:id", element: <AddEditFixedExpense /> },
      { path: "/dashboard/accounting/fixed-expenses/:id", element: <FixedExpenseDetails /> },

      { path: "/dashboard/accounting/cash-boxes", element: <CashBoxesPage /> },
      { path: "/dashboard/accounting/cash-boxes/add", element: <AddCashBox /> },
      { path: "/dashboard/accounting/cash-boxes/add-movement", element: <AddMovement /> },
      { path: "/dashboard/accounting/cash-boxes/transactions", element: <AllTransactionsPage /> },
      { path: "/dashboard/accounting/cash-boxes/:id", element: <CashBoxDetails /> },
      { path: "/dashboard/accounting/cash-boxes/:id/add-movement", element: <AddMovement /> },

      { path: "/dashboard/accounting/banks", element: <BanksPage /> },
      { path: "/dashboard/accounting/banks/add", element: <AddBank /> },
      { path: "/dashboard/accounting/banks/add-movement", element: <AddBankMovement /> },
      { path: "/dashboard/accounting/banks/transactions", element: <AllBankTransactionsPage /> },
      { path: "/dashboard/accounting/banks/:id", element: <BankDetails /> },
      { path: "/dashboard/accounting/banks/:id/add-movement", element: <AddBankMovement /> },

      { path: "/dashboard/accounting/revenues", element: <RevenuesPage /> },
      { path: "/dashboard/accounting/revenues/add", element: <AddRevenue /> },
      { path: "/dashboard/accounting/revenues/:id", element: <RevenueDetails /> },

      { path: "/dashboard/accounting/expenses", element: <ExpensesPage /> },
      { path: "/dashboard/accounting/expenses/add", element: <AddExpense /> },
      { path: "/dashboard/accounting/expenses/:id", element: <ExpenseDetails /> },

      { path: "/dashboard/accounting/bonds/journal-entry", element: <JournalEntryPage /> },
      { path: "/dashboard/accounting/bonds/journal-entry/add", element: <AddEditJournalEntry /> },
      { path: "/dashboard/accounting/bonds/journal-entry/edit/:id", element: <AddEditJournalEntry /> },
      { path: "/dashboard/accounting/bonds/journal-entry/:id", element: <JournalEntryDetails /> },

      { path: "/dashboard/settings", element: <SettingsPage /> },

      { path: "/dashboard/crm/leads", element: <LeadsPage /> },
      { path: "/dashboard/crm/leads/add", element: <AddEditLead /> },
      { path: "/dashboard/crm/leads/edit/:id", element: <AddEditLead /> },
      { path: "/dashboard/crm/leads/:id", element: <LeadDetails /> },

      { path: "/dashboard/crm/customers", element: <CustomersPage /> },
      { path: "/dashboard/crm/customers/add", element: <AddEditCustomers /> },
      { path: "/dashboard/crm/customers/edit/:id", element: <AddEditCustomers /> },
      { path: "/dashboard/crm/customers/:id", element: <CustomerDetails /> },

      { path: "/dashboard/crm/follow-up-list", element: <FollowUpsPage /> },

      { path: "/dashboard/crm/suppliers", element: <SupplierPage /> },
      { path: "/dashboard/crm/suppliers/add", element: <AddEditSupplier /> },
      { path: "/dashboard/crm/suppliers/edit/:id", element: <AddEditSupplier /> },
      { path: "/dashboard/crm/suppliers/:id", element: <SupplierDetails /> },

      { path: "/dashboard/crm/projects", element: <ProjectsPage /> },
      { path: "/dashboard/crm/projects/add", element: <AddEditProject /> },
      { path: "/dashboard/crm/projects/edit/:id", element: <AddEditProject /> },
      { path: "/dashboard/crm/projects/:id", element: <SupplierDetails /> },

      { path: "/dashboard/appointments", element: <AppointmentsPage /> },
      { path: "/dashboard/appointments/add", element: <AddEditAppointment /> },
      { path: "/dashboard/appointments/edit/:id", element: <AddEditAppointment /> },
      { path: "/dashboard/appointments/:id", element: <AppointmentDetails /> },

      { path: "/dashboard/appointments/services", element: <ServicesPage /> },
      { path: "/dashboard/appointments/services/add", element: <AddEditService /> },
      { path: "/dashboard/appointments/services/edit/:id", element: <AddEditService /> },
      { path: "/dashboard/services", element: <ServicesPage /> },
      { path: "/dashboard/services/add", element: <AddEditService /> },
      { path: "/dashboard/services/edit/:id", element: <AddEditService /> },

      { path: "/dashboard/appointments/service-providers", element: <ServiceProvidersPage /> },
      { path: "/dashboard/appointments/service-providers/add", element: <AddEditServiceProvider /> },
      { path: "/dashboard/appointments/service-providers/edit/:id", element: <AddEditServiceProvider /> },
      { path: "/dashboard/appointments/service-providers/:id", element: <ServiceProviderDetails /> },
      { path: "/dashboard/service-providers", element: <ServiceProvidersPage /> },
      { path: "/dashboard/service-providers/add", element: <AddEditServiceProvider /> },
      { path: "/dashboard/service-providers/edit/:id", element: <AddEditServiceProvider /> },
      { path: "/dashboard/service-providers/:id", element: <ServiceProviderDetails /> },

      { path: "/dashboard/appointments/provider-commissions", element: <ProviderCommissionsPage /> },
      { path: "/dashboard/provider-commissions", element: <ProviderCommissionsPage /> },

      { path: "/dashboard/appointments/commission-ledger", element: <CommissionLedgerPage /> },
      { path: "/dashboard/commission-ledger", element: <CommissionLedgerPage /> },

      { path: "/dashboard/reservations", element: <ReservationsPage /> },
      { path: "/dashboard/reservations/add", element: <AddEditReservation /> },
      { path: "/dashboard/reservations/edit/:id", element: <AddEditReservation /> },
      { path: "/dashboard/reservations/:id", element: <ReservationDetails /> },

      { path: "/dashboard/events", element: <EventsPage /> },
      { path: "/dashboard/events/add", element: <AddEditEvent /> },
      { path: "/dashboard/events/edit/:id", element: <AddEditEvent /> },
      { path: "/dashboard/events/:id", element: <EventDetails /> },

      { path: "/dashboard/resources", element: <ResourcesPage /> },
      { path: "/dashboard/resources/add", element: <AddEditResource /> },
      { path: "/dashboard/resources/edit/:id", element: <AddEditResource /> },
      { path: "/dashboard/resources/:id", element: <ResourceDetails /> },

      { path: "/dashboard/rentals", element: <RentalsPage /> },
      { path: "/dashboard/rentals/add", element: <AddEditRental /> },
      { path: "/dashboard/rentals/edit/:id", element: <AddEditRental /> },
      { path: "/dashboard/rentals/:id", element: <RentalDetails /> },

      { path: "/dashboard/rentals/invoices", element: <RentalInvoicesPage /> },
      { path: "/dashboard/rentals/invoices/add", element: <AddEditRentalInvoice /> },
      { path: "/dashboard/rentals/invoices/edit/:id", element: <AddEditRentalInvoice /> },
      { path: "/dashboard/rentals/invoices/:id", element: <RentalInvoiceDetails /> },

      { path: "*", element: <NotFound /> },
    ],
  },
])

import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import DashboardLayout from "@/layouts/DashboardLayout"
import WebsiteLayout from "@/layouts/WebsiteLayout"
import PageSkeleton from "@/components/feedback/PageSkeleton"

// ✨ دالة مساعدة لتغليف المكونات بالتحميل الكسول وشاشة التحميل الأنيقة
const lazyLoad = (importFn) => {
  const Component = lazy(importFn)
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  )
}

// 🌐 صفحات الموقع والمتجر الإلكتروني
const Home = lazy(() => import("@/pages/website/store/Home"))
const About = lazy(() => import("@/pages/website/profile/About"))
const NotFound = lazy(() => import("../pages/not-found"))

// 👥 المستخدمين واللوحة الرئيسية
const Users = lazy(() => import("../pages/dashboard/Users/Users"))
const HrDashboardPage = lazy(() => import("../pages/dashboard/HrDashboard/hr-dashboard-page"))

// 👔 الموارد البشرية (HR)
const Depatments = lazy(() => import("../pages/dashboard/Depatments/depatments-page"))
const DepartmentDetail = lazy(() => import("../pages/dashboard/Depatments/_components/deapartment-detail"))
const AddEditDepartment = lazy(() => import("../pages/dashboard/Depatments/add-edit-department"))
const Sections = lazy(() => import("../pages/dashboard/Sections/sections-page"))
const SectionDetail = lazy(() => import("../pages/dashboard/Sections/_components/section-detail"))
const AddEditSection = lazy(() => import("../pages/dashboard/Sections/add-edit-section"))
const Offices = lazy(() => import("../pages/dashboard/Offices/offices-page"))
const OfficeDetail = lazy(() => import("../pages/dashboard/Offices/_components/office-detail"))
const AddEditOffice = lazy(() => import("../pages/dashboard/Offices/add-edit-office"))
const Positions = lazy(() => import("../pages/dashboard/Positions/positions-page"))
const PositionDetail = lazy(() => import("../pages/dashboard/Positions/_components/position-detail"))
const AddEditPosition = lazy(() => import("../pages/dashboard/Positions/add-edit-position"))
const Employees = lazy(() => import("../pages/dashboard/Employees/employees-page"))
const EmployeeDetail = lazy(() => import("../pages/dashboard/Employees/_components/employee-detail"))
const ContractDetailPage = lazy(() => import("../pages/dashboard/Employees/contract-detail-page"))
const PerformanceDetailPage = lazy(() => import("../pages/dashboard/Employees/performance-detail-page"))
const AddEditPerformance = lazy(() => import("../pages/dashboard/Employees/add-edit-performance"))
const AddLeavePage = lazy(() => import("../pages/dashboard/Employees/add-leave-page"))
const AddEditEmployee = lazy(() => import("../pages/dashboard/Employees/add-edit-employee"))
const LeavesPage = lazy(() => import("../pages/dashboard/Leaves/leaves-page"))
const AddGlobalLeavePage = lazy(() => import("../pages/dashboard/Leaves/add-leave-page"))
const BonusesPage = lazy(() => import("../pages/dashboard/Bonuses/bonuses-page"))
const AddBonusPage = lazy(() => import("../pages/dashboard/Bonuses/add-bonus-page"))
const DeductionsPage = lazy(() => import("../pages/dashboard/Deductions/deductions-page"))
const AddDeductionPage = lazy(() => import("../pages/dashboard/Deductions/add-deduction-page"))
const SalariesPage = lazy(() => import("../pages/dashboard/Salaries/salaries-page"))
const ContractsPage = lazy(() => import("../pages/dashboard/Contracts/contracts-page"))
const AddEditContractPage = lazy(() => import("../pages/dashboard/Contracts/add-edit-contract"))
const AttendanceMonthly = lazy(() => import("../pages/dashboard/Attendance/AttendanceMonthly"))
const AttendanceDaily = lazy(() => import("../pages/dashboard/Attendance/AttendanceDaily"))
const AttendanceErrors = lazy(() => import("../pages/dashboard/Attendance/AttendanceErrors"))
const EmployeeDayDetails = lazy(() => import("../pages/dashboard/Attendance/EmployeeDayDetails"))
const AttendanceCount = lazy(() => import("../pages/dashboard/Attendance/AttendanceCount"))

// 📦 المخزون (Inventory)
const InventoryDashboard = lazy(() => import("../pages/dashboard/Inventory/dashboard/inventory-dashboard"))
const ItemCategoriesPage = lazy(() => import("../pages/dashboard/Inventory/ItemCategories/item-categories-page"))
const AddCategoryPage = lazy(() => import("../pages/dashboard/Inventory/ItemCategories/add-category-page"))
const SubcategoriesPage = lazy(() => import("../pages/dashboard/Inventory/ItemCategories/subcategories-page"))
const ItemsPage = lazy(() => import("../pages/dashboard/Inventory/Items/items-page"))
const AddItemPage = lazy(() => import("../pages/dashboard/Inventory/Items/add-item/add-item-page"))
const WarehousesPage = lazy(() => import("../pages/dashboard/Inventory/Warehouses/warehouses-page"))
const AddEditWarehouse = lazy(() => import("../pages/dashboard/Inventory/Warehouses/add-edit-warehouse"))
const WarehouseDetails = lazy(() => import("../pages/dashboard/Inventory/Warehouses/warehouse-details"))
const TransfersPage = lazy(() => import("../pages/dashboard/Inventory/Transfers/transfers-page"))
const TransferDetails = lazy(() => import("../pages/dashboard/Inventory/Transfers/transfer-details"))
const AddEditTransfer = lazy(() => import("../pages/dashboard/Inventory/Transfers/add-edit-transfer"))
const MaterialReportsPage = lazy(() => import("../pages/dashboard/Inventory/MaterialReports/material-reports-page"))
const AddMaterialReport = lazy(() => import("../pages/dashboard/Inventory/MaterialReports/add-material-report"))
const MaterialReportDetails = lazy(() => import("../pages/dashboard/Inventory/MaterialReports/material-report-details"))

// 💰 المحاسبة (Accounting)
const CostCentersPage = lazy(() => import("../pages/dashboard/accounting/CostCenters/cost-centers-page"))
const AddEditCostCenter = lazy(() => import("../pages/dashboard/accounting/CostCenters/add-edit-cost-center"))
const CostCenterDetails = lazy(() => import("../pages/dashboard/accounting/CostCenters/cost-center-details"))
const AccountsPage = lazy(() => import("../pages/dashboard/accounting/Accounts/accounts-page"))
const AddEditAccount = lazy(() => import("../pages/dashboard/accounting/Accounts/add-edit-account"))
const AccountDetails = lazy(() => import("../pages/dashboard/accounting/Accounts/account-details"))
const ChartOfAccountsPage = lazy(() => import("../pages/dashboard/accounting/ChartOfAccounts/chart-of-accounts-page"))
const InvoicePatternsPage = lazy(() => import("../pages/dashboard/accounting/InvoicePatterns/invoice-patterns-page"))
const AddEditInvoicePattern = lazy(() => import("../pages/dashboard/accounting/InvoicePatterns/add-edit-invoice-pattern"))
const InvoicePatternDetails = lazy(() => import("../pages/dashboard/accounting/InvoicePatterns/invoice-pattern-details"))
const InvoicesPage = lazy(() => import("../pages/dashboard/accounting/Invoices/invoices-page"))
const AddEditInvoice = lazy(() => import("../pages/dashboard/accounting/Invoices/add-edit-invoice"))
const InvoiceDetails = lazy(() => import("../pages/dashboard/accounting/Invoices/invoice-details"))
const OperatingExpensesPage = lazy(() => import("../pages/dashboard/accounting/OperatingExpenses/operating-expenses-page"))
const AddEditOperatingExpense = lazy(() => import("../pages/dashboard/accounting/OperatingExpenses/add-edit-operating-expense"))
const OperatingExpenseDetails = lazy(() => import("../pages/dashboard/accounting/OperatingExpenses/operating-expense-details"))
const FixedExpensesPage = lazy(() => import("../pages/dashboard/accounting/FixedExpenses/fixed-expenses-page"))
const AddEditFixedExpense = lazy(() => import("../pages/dashboard/accounting/FixedExpenses/add-edit-fixed-expense"))
const FixedExpenseDetails = lazy(() => import("../pages/dashboard/accounting/FixedExpenses/fixed-expense-details"))
const CashBoxesPage = lazy(() => import("../pages/dashboard/accounting/CashBoxes/cash-boxes-page"))
const AddCashBox = lazy(() => import("../pages/dashboard/accounting/CashBoxes/add-cash-box"))
const CashBoxDetails = lazy(() => import("../pages/dashboard/accounting/CashBoxes/cash-box-details"))
const AddMovement = lazy(() => import("../pages/dashboard/accounting/CashBoxes/add-movement"))
const AllTransactionsPage = lazy(() => import("../pages/dashboard/accounting/CashBoxes/all-transactions-page"))
const BanksPage = lazy(() => import("../pages/dashboard/accounting/Banks/banks-page"))
const AddBank = lazy(() => import("../pages/dashboard/accounting/Banks/add-bank"))
const BankDetails = lazy(() => import("../pages/dashboard/accounting/Banks/bank-details"))
const AddBankMovement = lazy(() => import("../pages/dashboard/accounting/Banks/add-movement"))
const AllBankTransactionsPage = lazy(() => import("../pages/dashboard/accounting/Banks/all-transactions-page"))
const RevenuesPage = lazy(() => import("../pages/dashboard/accounting/Revenues/revenues-page"))
const RevenueDetails = lazy(() => import("../pages/dashboard/accounting/Revenues/revenue-details"))
const AddRevenue = lazy(() => import("../pages/dashboard/accounting/Revenues/add-revenue"))
const AddExpense = lazy(() => import("../pages/dashboard/accounting/Expenses/add-expense"))
const ExpensesPage = lazy(() => import("../pages/dashboard/accounting/Expenses/expenses-page"))
const ExpenseDetails = lazy(() => import("../pages/dashboard/accounting/Expenses/expense-details"))
const JournalEntryPage = lazy(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-page"))
const AddEditJournalEntry = lazy(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/add-edit-journal-entry"))
const JournalEntryDetails = lazy(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-details"))

// ⚙️ الإعدادات (Settings)
const SettingsPage = lazy(() => import("../pages/dashboard/settings/settings-page"))

// 🤝 إدارة علاقات العملاء (CRM)
const LeadsPage = lazy(() => import("../pages/dashboard/crm/leads/leads-page"))
const AddEditLead = lazy(() => import("../pages/dashboard/crm/leads/add-edit-lead"))
const LeadDetails = lazy(() => import("../pages/dashboard/crm/leads/lead-details"))
const CustomersPage = lazy(() => import("../pages/dashboard/crm/customers/customers-page"))
const AddEditCustomers = lazy(() => import("../pages/dashboard/crm/customers/add-edit-customers"))
const CustomerDetails = lazy(() => import("../pages/dashboard/crm/customers/customer-details"))
const FollowUpsPage = lazy(() => import("../pages/dashboard/crm/follow-up-list/follow-ups-page"))
const SupplierPage = lazy(() => import("../pages/dashboard/crm/suppliers/supplier-page"))
const ProjectsPage = lazy(() => import("../pages/dashboard/crm/projects/projects-page"))
const AddEditProject = lazy(() => import("../pages/dashboard/crm/projects/add-edit-project"))
const AddEditSupplier = lazy(() => import("../pages/dashboard/crm/suppliers/add-edit-supplier"))
const SupplierDetails = lazy(() => import("../pages/dashboard/crm/suppliers/supplier-details"))

// 📅 المواعيد والخدمات (Appointments)
const AppointmentsPage = lazy(() => import("../pages/dashboard/Appointments/appointments-page"))
const AppointmentDetails = lazy(() => import("../pages/dashboard/Appointments/appointment-details"))
const AddEditAppointment = lazy(() => import("../pages/dashboard/Appointments/add-edit-appointment"))
const ServicesPage = lazy(() => import("../pages/dashboard/Appointments/Services/services-page"))
const AddEditService = lazy(() => import("../pages/dashboard/Appointments/Services/add-edit-service"))
const ServiceProvidersPage = lazy(() => import("../pages/dashboard/Appointments/ServiceProviders/service-providers-page"))
const AddEditServiceProvider = lazy(() => import("../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider"))
const ServiceProviderDetails = lazy(() => import("../pages/dashboard/Appointments/ServiceProviders/service-provider-details"))
const ProviderCommissionsPage = lazy(() => import("../pages/dashboard/Appointments/Commissions/provider-commissions-page"))
const CommissionLedgerPage = lazy(() => import("../pages/dashboard/Appointments/Commissions/commission-ledger-page"))

// 🛎️ الحجوزات والفعاليات والموارد (Reservations & Events)
const ReservationsPage = lazy(() => import("../pages/dashboard/Reservations/reservations-page"))
const AddEditReservation = lazy(() => import("../pages/dashboard/Reservations/add-edit-reservation"))
const ReservationDetails = lazy(() => import("../pages/dashboard/Reservations/reservation-details"))
const EventsPage = lazy(() => import("../pages/dashboard/Events/events-page"))
const AddEditEvent = lazy(() => import("../pages/dashboard/Events/add-edit-event"))
const EventDetails = lazy(() => import("../pages/dashboard/Events/event-details"))
const ResourcesPage = lazy(() => import("../pages/dashboard/Resources/resources-page"))
const AddEditResource = lazy(() => import("../pages/dashboard/Resources/add-edit-resource"))
const ResourceDetails = lazy(() => import("../pages/dashboard/Resources/resource-details"))

// 🏢 الإيجارات وفواتيرها (Rentals)
const RentalsPage = lazy(() => import("../pages/dashboard/Rentals/rentals-page"))
const AddEditRental = lazy(() => import("../pages/dashboard/Rentals/add-edit-rental"))
const RentalDetails = lazy(() => import("../pages/dashboard/Rentals/rental-details"))
const RentalInvoicesPage = lazy(() => import("../pages/dashboard/Rentals/Invoices/rental-invoices-page"))
const AddEditRentalInvoice = lazy(() => import("../pages/dashboard/Rentals/Invoices/add-edit-rental-invoice"))
const RentalInvoiceDetails = lazy(() => import("../pages/dashboard/Rentals/Invoices/rental-invoice-details"))

export const router = createBrowserRouter([
  // 🏢 موقع وبروفايل الشركة التعريفي المستقل (Standalone Company Profile)
  {
    path: "/profile",
    element: lazyLoad(() => import("@/pages/website/profile/CompanyProfile")),
  },
  {
    path: "/company-profile",
    element: lazyLoad(() => import("@/pages/website/profile/CompanyProfile")),
  },
  {
    path: "/about",
    element: lazyLoad(() => import("@/pages/website/profile/CompanyProfile")),
  },

  // 🛒 المتجر الإلكتروني (Storefront with Store Header & Footer)
  {
    path: "/",
    element: <WebsiteLayout />,
    children: [
      { index: true, element: lazyLoad(() => import("@/pages/website/store/Home")) },
      { path: "shop", element: lazyLoad(() => import("@/pages/website/store/Shop")) },
      { path: "search", element: lazyLoad(() => import("@/pages/website/store/Shop")) },
      { path: "product/:id", element: lazyLoad(() => import("@/pages/website/store/ProductDetails")) },
      { path: "cart", element: lazyLoad(() => import("@/pages/website/store/Cart")) },
      { path: "wishlist", element: lazyLoad(() => import("@/pages/website/store/Wishlist")) },
      { path: "saved-items", element: lazyLoad(() => import("@/pages/website/store/Wishlist")) },
      { path: "account", element: lazyLoad(() => import("@/pages/website/store/Account")) },
      { path: "account/profile", element: lazyLoad(() => import("@/pages/website/store/Account")) },
      { path: "account/orders", element: lazyLoad(() => import("@/pages/website/store/Account")) },
      { path: "login", element: lazyLoad(() => import("@/pages/website/auth/Login")) },
      { path: "auth/sign-in", element: lazyLoad(() => import("@/pages/website/auth/Login")) },
      { path: "sign-up", element: lazyLoad(() => import("@/pages/website/auth/SignUp")) },
      { path: "register", element: lazyLoad(() => import("@/pages/website/auth/SignUp")) },
      { path: "auth/sign-up", element: lazyLoad(() => import("@/pages/website/auth/SignUp")) },
      { path: "privacy-policy", element: lazyLoad(() => import("@/pages/website/legal/PrivacyPolicy")) },
      { path: "return-policy", element: lazyLoad(() => import("@/pages/website/legal/ReturnPolicy")) },
      { path: "terms", element: lazyLoad(() => import("@/pages/website/legal/Terms")) },
      { path: "*", element: lazyLoad(() => import("../pages/not-found")) },
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: lazyLoad(() => import("../pages/dashboard/HrDashboard/hr-dashboard-page")) },
      { path: "users", element: lazyLoad(() => import("../pages/dashboard/Users/Users")) },
      { path: "web-service", element: lazyLoad(() => import("../pages/dashboard/WebsiteBuilder/WebsitesListPage")) },
      { path: "web-service/create", element: lazyLoad(() => import("../pages/dashboard/WebsiteBuilder/WebsiteBuilderPage")) },
      { path: "web-service/builder", element: lazyLoad(() => import("../pages/dashboard/WebsiteBuilder/WebsiteBuilderPage")) },
      { path: "website-builder", element: lazyLoad(() => import("../pages/dashboard/WebsiteBuilder/WebsiteBuilderPage")) },
      { path: "/dashboard/hr", element: lazyLoad(() => import("../pages/dashboard/HrDashboard/hr-dashboard-page")) },
      { path: "/dashboard/hr/departments", element: lazyLoad(() => import("../pages/dashboard/Depatments/depatments-page")) },
      { path: "/dashboard/hr/departments/add", element: lazyLoad(() => import("../pages/dashboard/Depatments/add-edit-department")) },
      { path: "/dashboard/hr/departments/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Depatments/add-edit-department")) },
      { path: "/dashboard/hr/departments/:id", element: lazyLoad(() => import("../pages/dashboard/Depatments/_components/deapartment-detail")) },
      { path: "/dashboard/hr/sections", element: lazyLoad(() => import("../pages/dashboard/Sections/sections-page")) },
      { path: "/dashboard/hr/sections/add", element: lazyLoad(() => import("../pages/dashboard/Sections/add-edit-section")) },
      { path: "/dashboard/hr/sections/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Sections/add-edit-section")) },
      { path: "/dashboard/hr/sections/:id", element: lazyLoad(() => import("../pages/dashboard/Sections/_components/section-detail")) },
      { path: "/dashboard/hr/offices", element: lazyLoad(() => import("../pages/dashboard/Offices/offices-page")) },
      { path: "/dashboard/hr/offices/add", element: lazyLoad(() => import("../pages/dashboard/Offices/add-edit-office")) },
      { path: "/dashboard/hr/offices/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Offices/add-edit-office")) },
      { path: "/dashboard/hr/offices/:id", element: lazyLoad(() => import("../pages/dashboard/Offices/_components/office-detail")) },
      { path: "/dashboard/hr/positions", element: lazyLoad(() => import("../pages/dashboard/Positions/positions-page")) },
      { path: "/dashboard/hr/positions/add", element: lazyLoad(() => import("../pages/dashboard/Positions/add-edit-position")) },
      { path: "/dashboard/hr/positions/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Positions/add-edit-position")) },
      { path: "/dashboard/hr/positions/:id", element: lazyLoad(() => import("../pages/dashboard/Positions/_components/position-detail")) },
      { path: "/dashboard/hr/employees", element: lazyLoad(() => import("../pages/dashboard/Employees/employees-page")) },
      { path: "/dashboard/hr/employees/add", element: lazyLoad(() => import("../pages/dashboard/Employees/add-edit-employee")) },
      { path: "/dashboard/hr/employees/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Employees/add-edit-employee")) },
      { path: "/dashboard/hr/employees/:id", element: lazyLoad(() => import("../pages/dashboard/Employees/_components/employee-detail")) },
      { path: "/dashboard/hr/employees/:id/add-leave", element: lazyLoad(() => import("../pages/dashboard/Employees/add-leave-page")) },
      { path: "/dashboard/hr/employees/:id/contracts/:contractId", element: lazyLoad(() => import("../pages/dashboard/Employees/contract-detail-page")) },
      { path: "/dashboard/hr/employees/:id/performance/add", element: lazyLoad(() => import("../pages/dashboard/Employees/add-edit-performance")) },
      { path: "/dashboard/hr/employees/:id/performance/:performanceId", element: lazyLoad(() => import("../pages/dashboard/Employees/performance-detail-page")) },
      { path: "/dashboard/hr/leaves", element: lazyLoad(() => import("../pages/dashboard/Leaves/leaves-page")) },
      { path: "/dashboard/hr/leaves/add", element: lazyLoad(() => import("../pages/dashboard/Leaves/add-leave-page")) },
      { path: "/dashboard/hr/bounces", element: lazyLoad(() => import("../pages/dashboard/Bonuses/bonuses-page")) },
      { path: "/dashboard/hr/bounces/add", element: lazyLoad(() => import("../pages/dashboard/Bonuses/add-bonus-page")) },
      { path: "/dashboard/hr/deductions", element: lazyLoad(() => import("../pages/dashboard/Deductions/deductions-page")) },
      { path: "/dashboard/hr/deductions/add", element: lazyLoad(() => import("../pages/dashboard/Deductions/add-deduction-page")) },
      { path: "/dashboard/hr/salaries", element: lazyLoad(() => import("../pages/dashboard/Salaries/salaries-page")) },
      { path: "/dashboard/hr/contractes", element: lazyLoad(() => import("../pages/dashboard/Contracts/contracts-page")) },
      { path: "/dashboard/hr/contracts/add", element: lazyLoad(() => import("../pages/dashboard/Contracts/add-edit-contract")) },
      { path: "/dashboard/hr/contracts/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Contracts/add-edit-contract")) },
      { path: "/dashboard/hr/attendance", element: lazyLoad(() => import("../pages/dashboard/Attendance/AttendanceMonthly")) },
      { path: "/dashboard/hr/attendance/:year/:month", element: lazyLoad(() => import("../pages/dashboard/Attendance/AttendanceDaily")) },
      { path: "/dashboard/hr/attendance/:year/:month/count", element: lazyLoad(() => import("../pages/dashboard/Attendance/AttendanceCount")) },
      { path: "/dashboard/hr/attendance/:year/:month/errors", element: lazyLoad(() => import("../pages/dashboard/Attendance/AttendanceErrors")) },
      { path: "/dashboard/hr/attendance/:year/:month/:date", element: lazyLoad(() => import("../pages/dashboard/Attendance/EmployeeDayDetails")) },

      { path: "/dashboard/inventory", element: lazyLoad(() => import("../pages/dashboard/Inventory/dashboard/inventory-dashboard")) },
      { path: "/dashboard/inventory/items-management/categories", element: lazyLoad(() => import("../pages/dashboard/Inventory/ItemCategories/item-categories-page")) },
      { path: "/dashboard/inventory/items-management/categories/add", element: lazyLoad(() => import("../pages/dashboard/Inventory/ItemCategories/add-category-page")) },
      { path: "/dashboard/inventory/items-management/categories/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/ItemCategories/add-category-page")) },
      { path: "/dashboard/inventory/items-management/categories/:id/subcategories", element: lazyLoad(() => import("../pages/dashboard/Inventory/ItemCategories/subcategories-page")) },
      { path: "/dashboard/inventory/items-management/categories/:id/related-items", element: lazyLoad(() => import("../pages/dashboard/Inventory/Items/items-page")) },

      { path: "/dashboard/inventory/items-management/items", element: lazyLoad(() => import("../pages/dashboard/Inventory/Items/items-page")) },
      { path: "/dashboard/inventory/items-management/items/add", element: lazyLoad(() => import("../pages/dashboard/Inventory/Items/add-item/add-item-page")) },
      { path: "/dashboard/inventory/items-management/items/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/Items/add-item/add-item-page")) },

      { path: "/dashboard/inventory/warehouses", element: lazyLoad(() => import("../pages/dashboard/Inventory/Warehouses/warehouses-page")) },
      { path: "/dashboard/inventory/warehouses/add", element: lazyLoad(() => import("../pages/dashboard/Inventory/Warehouses/add-edit-warehouse")) },
      { path: "/dashboard/inventory/warehouses/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/Warehouses/add-edit-warehouse")) },
      { path: "/dashboard/inventory/warehouses/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/Warehouses/warehouse-details")) },

      { path: "/dashboard/inventory/transfers", element: lazyLoad(() => import("../pages/dashboard/Inventory/Transfers/transfers-page")) },
      { path: "/dashboard/inventory/transfers/add", element: lazyLoad(() => import("../pages/dashboard/Inventory/Transfers/add-edit-transfer")) },
      { path: "/dashboard/inventory/transfers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/Transfers/add-edit-transfer")) },
      { path: "/dashboard/inventory/transfers/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/Transfers/transfer-details")) },

      { path: "/dashboard/inventory/material-reports", element: lazyLoad(() => import("../pages/dashboard/Inventory/MaterialReports/material-reports-page")) },
      { path: "/dashboard/inventory/material-reports/add", element: lazyLoad(() => import("../pages/dashboard/Inventory/MaterialReports/add-material-report")) },
      { path: "/dashboard/inventory/material-reports/:id", element: lazyLoad(() => import("../pages/dashboard/Inventory/MaterialReports/material-report-details")) },

      { path: "/dashboard/accounting/cost-centers", element: lazyLoad(() => import("../pages/dashboard/accounting/CostCenters/cost-centers-page")) },
      { path: "/dashboard/accounting/cost-centers/add", element: lazyLoad(() => import("../pages/dashboard/accounting/CostCenters/add-edit-cost-center")) },
      { path: "/dashboard/accounting/cost-centers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/CostCenters/add-edit-cost-center")) },
      { path: "/dashboard/accounting/cost-centers/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/CostCenters/cost-center-details")) },

      { path: "/dashboard/accounting/accounts", element: lazyLoad(() => import("../pages/dashboard/accounting/Accounts/accounts-page")) },
      { path: "/dashboard/accounting/accounts/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Accounts/add-edit-account")) },
      { path: "/dashboard/accounting/accounts/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Accounts/add-edit-account")) },
      { path: "/dashboard/accounting/accounts/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Accounts/account-details")) },
      
      { path: "/dashboard/accounting/chart-of-accounts", element: lazyLoad(() => import("../pages/dashboard/accounting/ChartOfAccounts/chart-of-accounts-page")) },

      { path: "/dashboard/accounting/basics/invoicing-patterns", element: lazyLoad(() => import("../pages/dashboard/accounting/InvoicePatterns/invoice-patterns-page")) },
      { path: "/dashboard/accounting/invoice-patterns/add", element: lazyLoad(() => import("../pages/dashboard/accounting/InvoicePatterns/add-edit-invoice-pattern")) },
      { path: "/dashboard/accounting/invoice-patterns/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/InvoicePatterns/add-edit-invoice-pattern")) },
      { path: "/dashboard/accounting/invoice-patterns/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/InvoicePatterns/invoice-pattern-details")) },

      { path: "/dashboard/accounting/invoices", element: lazyLoad(() => import("../pages/dashboard/accounting/Invoices/invoices-page")) },
      { path: "/dashboard/accounting/invoices/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Invoices/add-edit-invoice")) },
      { path: "/dashboard/accounting/invoices/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Invoices/invoice-details")) },

      { path: "/dashboard/accounting/operating-expenses", element: lazyLoad(() => import("../pages/dashboard/accounting/OperatingExpenses/operating-expenses-page")) },
      { path: "/dashboard/accounting/operating-expenses/add", element: lazyLoad(() => import("../pages/dashboard/accounting/OperatingExpenses/add-edit-operating-expense")) },
      { path: "/dashboard/accounting/operating-expenses/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/OperatingExpenses/add-edit-operating-expense")) },
      { path: "/dashboard/accounting/operating-expenses/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/OperatingExpenses/operating-expense-details")) },

      { path: "/dashboard/accounting/fixed-expenses", element: lazyLoad(() => import("../pages/dashboard/accounting/FixedExpenses/fixed-expenses-page")) },
      { path: "/dashboard/accounting/fixed-expenses/add", element: lazyLoad(() => import("../pages/dashboard/accounting/FixedExpenses/add-edit-fixed-expense")) },
      { path: "/dashboard/accounting/fixed-expenses/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/FixedExpenses/add-edit-fixed-expense")) },
      { path: "/dashboard/accounting/fixed-expenses/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/FixedExpenses/fixed-expense-details")) },

      { path: "/dashboard/accounting/cash-boxes", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/cash-boxes-page")) },
      { path: "/dashboard/accounting/cash-boxes/add", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/add-cash-box")) },
      { path: "/dashboard/accounting/cash-boxes/add-movement", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/add-movement")) },
      { path: "/dashboard/accounting/cash-boxes/transactions", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/all-transactions-page")) },
      { path: "/dashboard/accounting/cash-boxes/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/cash-box-details")) },
      { path: "/dashboard/accounting/cash-boxes/:id/add-movement", element: lazyLoad(() => import("../pages/dashboard/accounting/CashBoxes/add-movement")) },

      { path: "/dashboard/accounting/banks", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/banks-page")) },
      { path: "/dashboard/accounting/banks/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/add-bank")) },
      { path: "/dashboard/accounting/banks/add-movement", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/add-movement")) },
      { path: "/dashboard/accounting/banks/transactions", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/all-transactions-page")) },
      { path: "/dashboard/accounting/banks/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/bank-details")) },
      { path: "/dashboard/accounting/banks/:id/add-movement", element: lazyLoad(() => import("../pages/dashboard/accounting/Banks/add-movement")) },

      { path: "/dashboard/accounting/revenues", element: lazyLoad(() => import("../pages/dashboard/accounting/Revenues/revenues-page")) },
      { path: "/dashboard/accounting/revenues/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Revenues/add-revenue")) },
      { path: "/dashboard/accounting/revenues/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Revenues/revenue-details")) },

      { path: "/dashboard/accounting/expenses", element: lazyLoad(() => import("../pages/dashboard/accounting/Expenses/expenses-page")) },
      { path: "/dashboard/accounting/expenses/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Expenses/add-expense")) },
      { path: "/dashboard/accounting/expenses/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Expenses/expense-details")) },

      { path: "/dashboard/accounting/bonds/journal-entry", element: lazyLoad(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-page")) },
      { path: "/dashboard/accounting/bonds/journal-entry/add", element: lazyLoad(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/add-edit-journal-entry")) },
      { path: "/dashboard/accounting/bonds/journal-entry/edit/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/add-edit-journal-entry")) },
      { path: "/dashboard/accounting/bonds/journal-entry/:id", element: lazyLoad(() => import("../pages/dashboard/accounting/Bonds/JournalEntry/journal-entry-details")) },

      { path: "/dashboard/settings", element: lazyLoad(() => import("../pages/dashboard/settings/settings-page")) },

      { path: "/dashboard/crm/leads", element: lazyLoad(() => import("../pages/dashboard/crm/leads/leads-page")) },
      { path: "/dashboard/crm/leads/add", element: lazyLoad(() => import("../pages/dashboard/crm/leads/add-edit-lead")) },
      { path: "/dashboard/crm/leads/edit/:id", element: lazyLoad(() => import("../pages/dashboard/crm/leads/add-edit-lead")) },
      { path: "/dashboard/crm/leads/:id", element: lazyLoad(() => import("../pages/dashboard/crm/leads/lead-details")) },

      { path: "/dashboard/crm/customers", element: lazyLoad(() => import("../pages/dashboard/crm/customers/customers-page")) },
      { path: "/dashboard/crm/customers/add", element: lazyLoad(() => import("../pages/dashboard/crm/customers/add-edit-customers")) },
      { path: "/dashboard/crm/customers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/crm/customers/add-edit-customers")) },
      { path: "/dashboard/crm/customers/:id", element: lazyLoad(() => import("../pages/dashboard/crm/customers/customer-details")) },

      { path: "/dashboard/crm/follow-up-list", element: lazyLoad(() => import("../pages/dashboard/crm/follow-up-list/follow-ups-page")) },

      { path: "/dashboard/crm/suppliers", element: lazyLoad(() => import("../pages/dashboard/crm/suppliers/supplier-page")) },
      { path: "/dashboard/crm/suppliers/add", element: lazyLoad(() => import("../pages/dashboard/crm/suppliers/add-edit-supplier")) },
      { path: "/dashboard/crm/suppliers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/crm/suppliers/add-edit-supplier")) },
      { path: "/dashboard/crm/suppliers/:id", element: lazyLoad(() => import("../pages/dashboard/crm/suppliers/supplier-details")) },

      { path: "/dashboard/crm/projects", element: lazyLoad(() => import("../pages/dashboard/crm/projects/projects-page")) },
      { path: "/dashboard/crm/projects/add", element: lazyLoad(() => import("../pages/dashboard/crm/projects/add-edit-project")) },
      { path: "/dashboard/crm/projects/edit/:id", element: lazyLoad(() => import("../pages/dashboard/crm/projects/add-edit-project")) },
      { path: "/dashboard/crm/projects/:id", element: lazyLoad(() => import("../pages/dashboard/crm/suppliers/supplier-details")) },

      { path: "/dashboard/appointments", element: lazyLoad(() => import("../pages/dashboard/Appointments/appointments-page")) },
      { path: "/dashboard/appointments/add", element: lazyLoad(() => import("../pages/dashboard/Appointments/add-edit-appointment")) },
      { path: "/dashboard/appointments/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/add-edit-appointment")) },
      { path: "/dashboard/appointments/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/appointment-details")) },

      { path: "/dashboard/appointments/services", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/services-page")) },
      { path: "/dashboard/appointments/services/add", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/add-edit-service")) },
      { path: "/dashboard/appointments/services/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/add-edit-service")) },
      { path: "/dashboard/services", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/services-page")) },
      { path: "/dashboard/services/add", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/add-edit-service")) },
      { path: "/dashboard/services/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/Services/add-edit-service")) },

      { path: "/dashboard/appointments/service-providers", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/service-providers-page")) },
      { path: "/dashboard/appointments/service-providers/add", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider")) },
      { path: "/dashboard/appointments/service-providers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider")) },
      { path: "/dashboard/appointments/service-providers/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/service-provider-details")) },
      { path: "/dashboard/service-providers", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/service-providers-page")) },
      { path: "/dashboard/service-providers/add", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider")) },
      { path: "/dashboard/service-providers/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/add-edit-service-provider")) },
      { path: "/dashboard/service-providers/:id", element: lazyLoad(() => import("../pages/dashboard/Appointments/ServiceProviders/service-provider-details")) },

      { path: "/dashboard/appointments/provider-commissions", element: lazyLoad(() => import("../pages/dashboard/Appointments/Commissions/provider-commissions-page")) },
      { path: "/dashboard/provider-commissions", element: lazyLoad(() => import("../pages/dashboard/Appointments/Commissions/provider-commissions-page")) },

      { path: "/dashboard/appointments/commission-ledger", element: lazyLoad(() => import("../pages/dashboard/Appointments/Commissions/commission-ledger-page")) },
      { path: "/dashboard/commission-ledger", element: lazyLoad(() => import("../pages/dashboard/Appointments/Commissions/commission-ledger-page")) },

      { path: "/dashboard/reservations", element: lazyLoad(() => import("../pages/dashboard/Reservations/reservations-page")) },
      { path: "/dashboard/reservations/add", element: lazyLoad(() => import("../pages/dashboard/Reservations/add-edit-reservation")) },
      { path: "/dashboard/reservations/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Reservations/add-edit-reservation")) },
      { path: "/dashboard/reservations/:id", element: lazyLoad(() => import("../pages/dashboard/Reservations/reservation-details")) },

      { path: "/dashboard/events", element: lazyLoad(() => import("../pages/dashboard/Events/events-page")) },
      { path: "/dashboard/events/add", element: lazyLoad(() => import("../pages/dashboard/Events/add-edit-event")) },
      { path: "/dashboard/events/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Events/add-edit-event")) },
      { path: "/dashboard/events/:id", element: lazyLoad(() => import("../pages/dashboard/Events/event-details")) },

      { path: "/dashboard/resources", element: lazyLoad(() => import("../pages/dashboard/Resources/resources-page")) },
      { path: "/dashboard/resources/add", element: lazyLoad(() => import("../pages/dashboard/Resources/add-edit-resource")) },
      { path: "/dashboard/resources/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Resources/add-edit-resource")) },
      { path: "/dashboard/resources/:id", element: lazyLoad(() => import("../pages/dashboard/Resources/resource-details")) },

      { path: "/dashboard/rentals", element: lazyLoad(() => import("../pages/dashboard/Rentals/rentals-page")) },
      { path: "/dashboard/rentals/add", element: lazyLoad(() => import("../pages/dashboard/Rentals/add-edit-rental")) },
      { path: "/dashboard/rentals/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Rentals/add-edit-rental")) },
      { path: "/dashboard/rentals/:id", element: lazyLoad(() => import("../pages/dashboard/Rentals/rental-details")) },

      { path: "/dashboard/rentals/invoices", element: lazyLoad(() => import("../pages/dashboard/Rentals/Invoices/rental-invoices-page")) },
      { path: "/dashboard/rentals/invoices/add", element: lazyLoad(() => import("../pages/dashboard/Rentals/Invoices/add-edit-rental-invoice")) },
      { path: "/dashboard/rentals/invoices/edit/:id", element: lazyLoad(() => import("../pages/dashboard/Rentals/Invoices/add-edit-rental-invoice")) },
      { path: "/dashboard/rentals/invoices/:id", element: lazyLoad(() => import("../pages/dashboard/Rentals/Invoices/rental-invoice-details")) },

      { path: "*", element: lazyLoad(() => import("../pages/not-found")) },
    ],
  },
])

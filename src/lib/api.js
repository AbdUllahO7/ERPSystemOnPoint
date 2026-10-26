/**
 * ============================================================================
 * Central API Aggregator (Re-export Barrel)
 * ============================================================================
 * This file preserves 100% backward compatibility for all existing imports
 * from "@/lib/api", while the actual implementations are cleanly organized into
 * modular domain-driven services under "@/services/":
 *
 *   ├── @/services/hr          # Departments, Sections, Offices, Employees, Attendance, Payroll, Auth
 *   ├── @/services/accounting  # Invoices, Accounts, Cost Centers, Vouchers, CashBoxes, Banks
 *   ├── @/services/inventory   # Warehouses, Transfers, Products, Categories, Dashboard, Reports
 *   ├── @/services/crm         # Customers, Contacts, Contracts, Leads, FollowUps, Projects, Suppliers
 *   ├── @/services/settings    # System, Accounting, Fiscal Year, Alerts, Language, Tenants
 *   ├── @/services/rentals     # Rental Contracts & Invoices
 *   ├── @/services/events      # Events & Service Providers
 *   └── @/services/appointments# Appointments & Commissions
 * ============================================================================
 */

export * from "@/services/hr";
export * from "@/services/accounting";
export * from "@/services/inventory";
export * from "@/services/crm";
export * from "@/services/settings";
export * from "@/services/rentals";
export * from "@/services/events";

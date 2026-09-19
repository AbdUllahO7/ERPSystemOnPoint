import { useState, useEffect } from "react";
import { href, Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Home,
  Building2,
  SquareDashedBottom,
  Waypoints,
  Users,
  Diamond,
  GitFork,
  FileText,
  WalletCards,
  Files,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  Crosshair,
  MessageSquare,
  CalendarDays,
  Layers,
  Warehouse,
  ArrowRightLeft,
  FileSearch,
  Landmark,
} from "lucide-react";
import { useSidebar } from "./dashboard-providers";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { useI18n } from "../context/translate-api";
import iconDashboard from "../assets/icon-dashbord.svg";
import { ModeToggle } from "../components/common/mode-toggel";

// ===== Nav Data (matches sidebar design) =====
const sidebarLinks = [
  {
    label: "Main",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutGrid }],
  },
  {
    label: "HR",
    items: [
      { title: "Dashboard", href: "/dashboard/hr", icon: LayoutGrid },
      { title: "Departments", href: "/dashboard/hr/departments", icon: Home },
      { title: "Offices", href: "/dashboard/hr/offices", icon: Building2 },
      {
        title: "Sectors",
        href: "/dashboard/hr/sections",
        icon: SquareDashedBottom,
      },
      { title: "Positions", href: "/dashboard/hr/positions", icon: Waypoints },
      { title: "Employees", href: "/dashboard/hr/employees", icon: Users  , submenu: [
        { title: "All employees", href: "/dashboard/hr/employees", icon: Users },
        { title: "Leaves", href: "/dashboard/hr/leaves", icon: Users },
        { title: "Bounces", href: "/dashboard/hr/bounces", icon: Users },
        { title: "Deductions", href: "/dashboard/hr/deductions", icon: Users },
        { title: "Contractes", href: "/dashboard/hr/contractes", icon: Users },
        { title: "Salaries", href: "/dashboard/hr/salaries", icon: Users },
        { title: "Attendance", href: "/dashboard/hr/attendance", icon: CalendarDays },
      ]},
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/inventory",
        icon: LayoutGrid,
      },
      {
        title: "Items Management",
        icon: Layers,
        submenu: [
          { title: "Items Categories", href: "/dashboard/inventory/items-management/categories" },
          { title: "Items", href: "/dashboard/inventory/items-management/items" },
        ],
      },
      { title: "Warehouses", href: "/dashboard/inventory/warehouses", icon: Warehouse },
      { title: "Transfers", href: "/dashboard/inventory/transfers", icon: ArrowRightLeft },
      { title: "Material Reports", href: "/dashboard/inventory/material-reports", icon: FileSearch },
    ],
  },
  {
    label: "Accounting",
    items: [
      // {
      //   title: "Dashboard",
      //   href: "/dashboard/accounting",
      //   icon: LayoutGrid,
      // },
      {
        title: "Basics",
        icon: Diamond,
        submenu: [
          {
            title: "Invoicing Patterns",
            href: "/dashboard/accounting/basics/invoicing-patterns",
          },
          {
            title: "Cost Centers",
            href: "/dashboard/accounting/cost-centers",
          },
          { title: "Accounts", href: "/dashboard/accounting/accounts" },
          // {
          //   title: "Currencies",
          //   href: "/dashboard/accounting/basics/currencies",
          // },
        ],
      },
      {
        title: "Chart Of Accounts",
        href: "/dashboard/accounting/chart-of-accounts",
        icon: GitFork,
      },
      {
        title: "Journal Entry",
        href: "/dashboard/accounting/bonds/journal-entry",
        icon: Files,
      },
      {
        title: "Operating Expenses",
        href: "/dashboard/accounting/operating-expenses",
        icon: FileText,
      },
      {
        title: "Fixed Expenses",
        href: "/dashboard/accounting/fixed-expenses",
        icon: FileText,
      },
      {
        title: "Cash Boxes",
        icon: WalletCards,
        submenu: [
          { title: "Cash Boxes", href: "/dashboard/accounting/cash-boxes" },
          { title: "All Transactions", href: "/dashboard/accounting/cash-boxes/transactions" },
          { title: "Add Movment", href: "/dashboard/accounting/cash-boxes/add-movement" },
        ],
      },
      {
        title: "Banks",
        icon: Landmark,
        submenu: [
          { title: "Banks", href: "/dashboard/accounting/banks" },
          { title: "All Transactions", href: "/dashboard/accounting/banks/transactions" },
          { title: "Add Movment", href: "/dashboard/accounting/banks/add-movement" },
        ],
      },
      {
        title: "Revenues",
        icon: FileText,
        href: "/dashboard/accounting/revenues",
      },
      {
        title: "Expenses",
        icon: FileText,
        href:"/dashboard/accounting/expenses",
        // submenu: [
        //   { title: "Expenses", href: "/dashboard/accounting/expenses" },
          
        // ],
      },
      {
        title: "Invoices",
        href: "/dashboard/accounting/invoices",
        icon: FileText,
      },
      // {
      //   title: "Bonds",
      //   icon: Files,
      //   submenu: [
      //     {
      //       title: "Promissory Notes",
      //       href: "/dashboard/accounting/bonds/promissory-notes",
      //     },
      //     {
      //       title: "Payment Vouchers",
      //       href: "/dashboard/accounting/bonds/payment-vouchers",
      //     },
        
      //     {
      //       title: "Journal Voucher",
      //       href: "/dashboard/accounting/bonds/journal-voucher",
      //     },
      //   ],
      // },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        title: "Leads",
        href: "/dashboard/crm/leads",
        icon: Users,
      },
      {
        title: "Customers",
        href: "/dashboard/crm/customers",
        icon: Users,
      },
      {
        title: "Follow-Ups",
        href: "/dashboard/crm/follow-up-list",
        icon: Users,
      },
      {
        title: "Suppliers",
        href: "/dashboard/crm/suppliers",
        icon: Users,
      },
      {
        title: "Projects",
        href: "/dashboard/crm/projects",
        icon: Users,
      },
    ],
  },
];

function NavIconBox({ icon: Icon, active, danger }) {
  return (
    <span
      className={`sidebar-icon-box ${active ? "bg-primary/15" : ""} ${danger ? "bg-red-500/10" : ""}`}
    >
      <Icon
        size={20}
        strokeWidth={1.75}
        className={
          danger ? "text-red-500" : active ? "text-primary" : "text-primary/80"
        }
      />
    </span>
  );
}

function SubNavPanel({ open, children }) {
  return (
    <div
      className="sidebar-sub-panel"
      data-open={open ? "true" : "false"}
      aria-hidden={!open}
    >
      <div className="overflow-hidden">
        <div className="sidebar-sub-list">{children}</div>
      </div>
    </div>
  );
}

function HeaderActionButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ===== Nav Item =====
function NavItem({ item, collapsed, onMobileClose }) {
  const location = useLocation();
  const childActive = item.submenu?.some((s) => location.pathname === s.href);
  const [open, setOpen] = useState(childActive);

  const isActive = item.href
    ? location.pathname === item.href
    : Boolean(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  if (item.submenu) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          title={collapsed ? item.title : undefined}
          className={`sidebar-route group ${
            isActive ? "sidebar-route-active" : "sidebar-route-inactive"
          } ${collapsed ? "justify-center px-2" : ""}`}
        >
          <NavIconBox icon={item.icon} active={isActive} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-start">{item.title}</span>
              <ChevronRight
                size={16}
                strokeWidth={2}
                className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-out ${
                  open ? "rotate-90" : ""
                }`}
              />
            </>
          )}
        </button>

        {!collapsed && (
          <SubNavPanel open={open}>
            {item.submenu.map((sub, subIndex) => {
              const subActive = location.pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  to={sub.href}
                  onClick={onMobileClose}
                  style={{ "--sub-index": subIndex }}
                  className={`sidebar-sub-link ${
                    subActive
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`sidebar-sub-dot ${subActive ? "sidebar-sub-dot-active" : ""}`}
                    aria-hidden
                  />
                  <span className="truncate">{sub.title}</span>
                </Link>
              );
            })}
          </SubNavPanel>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      onClick={onMobileClose}
      title={collapsed ? item.title : undefined}
      className={`sidebar-route group ${
        item.danger
          ? "text-red-500 hover:bg-red-500/10"
          : isActive
            ? "sidebar-route-active"
            : "sidebar-route-inactive"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <NavIconBox icon={item.icon} active={isActive} danger={item.danger} />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </Link>
  );
}

// ===== Sidebar =====
function AppSidebar({ collapsed, onMobileClose, isMobile, onToggle }) {
  const showLabels = !collapsed || isMobile;

  return (
    <aside
      className={`flex h-full flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out select-none ${
        collapsed && !isMobile ? "w-[72px]" : "w-[280px]"
      }`}
    >
      <div
        className={`flex h-[68px] shrink-0 items-center border-b border-sidebar-border px-4 ${
          collapsed && !isMobile
            ? "flex-col justify-center gap-2 py-3"
            : "justify-between gap-2"
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${showLabels ? "gap-3" : "justify-center"}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            P
          </div>
          {showLabels && (
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              Platform
            </span>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Toggle sidebar"
          >
            <img src={iconDashboard} alt="" className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="sidebar-nav-scroll flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-4">
        {sidebarLinks.map((group) => (
          <div key={group.label}>
            {showLabels && (
              <p className="sidebar-section-label">{group.label}</p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  collapsed={collapsed && !isMobile}
                  onMobileClose={onMobileClose}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ===== Header =====
function AppHeader({ onMobileMenuOpen }) {
  return (
    <header className="flex h-[68px] w-full shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onMobileMenuOpen && (
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="relative w-full max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-border bg-input ps-10 pe-14 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <LanguageSwitcher />
        <HeaderActionButton aria-label="Focus mode">
          <Crosshair size={18} />
        </HeaderActionButton>
        <ModeToggle />
        <HeaderActionButton className="relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-sidebar" />
        </HeaderActionButton>
        <HeaderActionButton aria-label="Messages">
          <MessageSquare size={18} />
        </HeaderActionButton>
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-linear-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white"
          title="Admin User"
        >
          A
        </div>
      </div>
    </header>
  );
}

// ===== Mobile Overlay =====
function MobileOverlay({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    />
  );
}

// ===== Dashboard Client Wrapper =====
export function DashboardClientWrapper({ children }) {
  const {
    sidebarOpen,
    setSidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useSidebar();
  const { locale } = useI18n();
  const dir = locale === "en" ? "ltr" : "rtl";

  function handleSidebarToggle() {
    setSidebarOpen((prev) => !prev);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f7fa]  dark:bg-background">
      <div className="hidden h-full shrink-0 lg:flex">
        <AppSidebar collapsed={!sidebarOpen} onToggle={handleSidebarToggle} />
      </div>

      <MobileOverlay
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 z-40 transition-transform duration-300 ease-in-out lg:hidden ${
          dir === "rtl" ? "right-0" : "left-0"
        } ${
          mobileSidebarOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="relative h-full shadow-2xl">
          <AppSidebar
            collapsed={false}
            isMobile
            onMobileClose={() => setMobileSidebarOpen(false)}
            onToggle={() => setMobileSidebarOpen(false)}
          />
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute top-4 inset-e-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMobileMenuOpen={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-200 dark:bg-gray-900 ">{children}</main>
      </div>
    </div>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

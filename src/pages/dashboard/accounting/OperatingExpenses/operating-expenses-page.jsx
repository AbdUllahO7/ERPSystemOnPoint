import { useMemo, useState } from "react";
import {
  Pencil,
  Eye,
  Building,
  Users as UsersIcon,
  Plus,
  FileText,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { useQuery } from "@tanstack/react-query";
import { getAllOperationExpenses, getOperationExpenseLookUp } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

export default function OperatingExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ category: "", paymentMethod: "" });

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllOperationExpenses", params],
    queryFn: () => getAllOperationExpenses(params),
  });

  const { data: lookupsData } = useQuery({
    queryKey: ["getOperationExpenseLookUp"],
    queryFn: () => getOperationExpenseLookUp({ PageNumber: 1, PageSize: 100 }),
  });

  const rawRows = data?.data?.items || [];

  const categoryOptions = useMemo(() => {
    const fromLookups = (lookupsData?.data?.items || []).map((c) => ({
      value: c.name || c.category_Name || c.label,
      label: c.name || c.category_Name || c.label,
    }));
    if (fromLookups.length > 0) return fromLookups;
    const set = new Set();
    rawRows.forEach((r) => {
      if (r.categoryName && r.categoryName !== "-") set.add(r.categoryName);
    });
    return Array.from(set).map((name) => ({ value: name, label: name }));
  }, [lookupsData, rawRows]);

  const paymentMethodOptions = useMemo(() => {
    const set = new Set();
    rawRows.forEach((r) => {
      const pm = r.paymentMethodName || r.paymentMethod;
      if (pm && pm !== "-") set.add(pm);
    });
    return Array.from(set).map((name) => ({ value: name, label: name }));
  }, [rawRows]);

  const filterConfigs = [
    {
      key: "category",
      label: "Filter by Category",
      placeholder: "All Categories",
      options: categoryOptions,
    },
    {
      key: "paymentMethod",
      label: "Filter by Payment Method",
      placeholder: "All Payment Methods",
      options: paymentMethodOptions,
    },
  ];

  const displayRows = useMemo(() => {
    return rawRows.filter((row) => {
      if (filters.category && row.categoryName !== filters.category) return false;
      if (
        filters.paymentMethod &&
        (row.paymentMethodName || row.paymentMethod) !== filters.paymentMethod
      )
        return false;
      return true;
    });
  }, [rawRows, filters]);

  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "details",
            label: "Details",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/accounting/operating-expenses/${row.id}`),
          },
        ],
      },
      // {
      //   items: [
      //     {
      //       key: "edit",
      //       label: "Edit",
      //       icon: Pencil,
      //       onClick: (row) =>
      //         navigate(`/dashboard/accounting/operating-expenses/edit/${row.id}`),
      //     },
      //   ],
      // },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.id.substring(0, 4)}`,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => (row.date ? String(row.date).split("T")[0] : "-"),
    },
    {
      key: "categoryName",
      label: "Category",
    },
    {
      key: "vendorName",
      label: "Vendor",
    },
    {
      key: "paymentMethodName",
      label: "Payment Method",
      render: (row) => row.paymentMethodName || row.paymentMethod || "-",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) =>
        `$${
          row.totalAmount != null
            ? Number(row.totalAmount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : Number(row.amount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
        }`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Operating Expenses
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span
                  className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={filterConfigs}
        filters={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ category: "", paymentMethod: "" });
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        search={{
          placeholder: "Search by id or category...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {}}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/operating-expenses/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText, // Need to make sure FileText is imported if used
          title: (row) => row.categoryName,
          subtitle: (row) => row.vendorName,
          fields: [
            {
              icon: Building,
              label: "Amount:",
              value: (row) => `$${row.amount}`,
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No expenses found"
      />
    </div>
  );
}

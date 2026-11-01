import { useMemo, useState } from "react";
import {
  Pencil,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { useQuery } from "@tanstack/react-query";
import { getAllFixedExpenses } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function FixedExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ cycle: "", status: "", autoGenerateJournal: "" });

  const navigate = useNavigate();

  const filterConfigs = [
    {
      key: "cycle",
      label: "Filter by Cycle",
      placeholder: "All Cycles",
      options: [
        { value: "Daily", label: "Daily" },
        { value: "Weekly", label: "Weekly" },
        { value: "Monthly", label: "Monthly" },
        { value: "Quarterly", label: "Quarterly" },
        { value: "Yearly", label: "Yearly" },
      ],
    },
    {
      key: "status",
      label: "Filter by Status",
      placeholder: "All Statuses",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "autoGenerateJournal",
      label: "Auto Journal Entry",
      placeholder: "All",
      options: [
        { value: "true", label: "Enabled" },
        { value: "false", label: "Disabled" },
      ],
    },
  ];

  const params = useMemo(
    () => ({
      Search: search,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllFixedExpenses", params],
    queryFn: () => getAllFixedExpenses(params),
  });

  const rawRows = data?.data?.items || [];
  const displayRows = useMemo(() => {
    return rawRows.filter((row) => {
      if (filters.cycle && row.cycle !== filters.cycle) return false;
      if (filters.status === "active" && !row.isActive) return false;
      if (filters.status === "inactive" && row.isActive) return false;
      if (filters.autoGenerateJournal === "true" && !row.autoGenerateJournal) return false;
      if (filters.autoGenerateJournal === "false" && row.autoGenerateJournal) return false;
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
              navigate(`/dashboard/accounting/fixed-expenses/${row.id}`),
          },
        ],
      },
      {
        items: [
          // {
          //   key: "edit",
          //   label: "Edit",
          //   icon: Pencil,
          //   onClick: (row) =>
          //     navigate(`/dashboard/accounting/fixed-expenses/edit/${row.id}`),
          // },
        ],
      },
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
      key: "description",
      label: "Description",
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
    {
      key: "paymentMethod",
      label: "Payment Method",
    },
    {
      key: "cycle",
      label: "Cycle",
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (row) => (row.startDate ? String(row.startDate).split("T")[0] : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "autoGen",
      label: "Auto JE",
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.autoGenerateJournal ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
          {row.autoGenerateJournal ? "Enabled" : "Disabled"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={filterConfigs}
        filters={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ cycle: "", status: "", autoGenerateJournal: "" });
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search by description...",
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
          onClick: () => navigate("/dashboard/accounting/fixed-expenses/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.description,
          subtitle: (row) => row.categoryName,
          fields: [
            {
              icon: FileText,
              label: "Amount:",
              value: (row) => `$${row.totalAmount}`,
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
        emptyMessage="No fixed expenses found"
      />
    </div>
  );
}

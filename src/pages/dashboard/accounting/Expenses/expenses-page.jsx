import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllExpenses } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      Search: search,
      Status: selectedStatus || undefined,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search, selectedStatus],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllExpenses", params],
    queryFn: () => getAllExpenses(params),
  });

  const displayRows = data?.data?.items || [];
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
              navigate(`/dashboard/accounting/expenses/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Posted":
        return "bg-green-100 text-green-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const columns = [
    {
      key: "expense_No",
      label: "Expense No.",
      render: (row) => row.expense_No || "-",
      link: true,
      onLinkClick: (row) => navigate(`/dashboard/accounting/expenses/${row.id}`),
    },
    {
      key: "expense_Account_Name",
      label: "Account",
      render: (row) => row.expense_Account_Name || "-",
    },
    {
      key: "paid_To_Account_Name",
      label: "Paid To",
      render: (row) => row.paid_To_Account_Name || "-",
    },
    {
      key: "costCenter_Name",
      label: "Cost Center",
      render: (row) => row.costCenter_Name || "-",
    },
    {
      key: "total_Amount",
      label: "Total Amount",
      render: (row) => (
        <span className="font-medium text-foreground">
          ${row.total_Amount?.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status_Name",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status_Name)}`}>
          {row.status_Name || "Unknown"}
        </span>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">General Expenses</h2>
      </div>

      {/* Filter Menu */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: "Filter by Status",
            placeholder: "All Statuses",
            options: [
              { value: "Draft", label: "Draft" },
              { value: "Posted", label: "Posted" },
            ],
          },
        ]}
        filters={{
          status: selectedStatus,
        }}
        onFilterChange={(key, val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        onClear={() => {
          setSelectedStatus("");
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search expenses...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {}}
        addButton={{
          label: "Add Expense",
          onClick: () => navigate("/dashboard/accounting/expenses/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.expense_No,
          subtitle: (row) => row.expense_Account_Name,
          fields: [
            {
              label: "Amount:",
              value: (row) => `$${row.total_Amount?.toLocaleString()}`,
            },
            {
              label: "Status:",
              value: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status_Name)}`}>
                  {row.status_Name || "Unknown"}
                </span>
              ),
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

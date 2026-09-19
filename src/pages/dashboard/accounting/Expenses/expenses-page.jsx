import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllExpenses } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

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
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 w-full sm:max-w-[250px]">
              <label className="text-sm font-medium text-foreground">
                Filter by Status
              </label>
              <Select
                value={selectedStatus || "all"}
                onValueChange={(val) => {
                  setSelectedStatus(val === "all" ? "" : val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-transparent h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus("");
                setPage(1);
              }}
              className="w-full sm:w-auto h-10"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

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
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add Expense",
          onClick: () => navigate("/dashboard/accounting/expenses/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
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

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
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function ExpensesPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

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
        <h2 className="text-2xl font-bold text-foreground">
          {isAr ? "المصروفات العامة" : "General Expenses"}
        </h2>
      </div>

      {/* Filter Menu */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: isAr ? "فلترة حسب الحالة" : "Filter by Status",
            placeholder: isAr ? "جميع الحالات" : "All Statuses",
            options: [
              { value: "Draft", label: isAr ? "مسودة" : "Draft" },
              { value: "Posted", label: isAr ? "مرحل" : "Posted" },
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
          placeholder: isAr ? "البحث في المصروفات..." : "Search expenses...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: isAr ? "فلترة" : "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {}}
        addButton={{
          label: isAr ? "إضافة مصروف" : "Add Expense",
          onClick: () => navigate("/dashboard/accounting/expenses/add"),
          icon: <Plus className={`w-4 h-4 ${isAr ? 'ml-1' : 'mr-1'}`} />
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.expense_No,
          subtitle: (row) => row.expense_Account_Name,
          fields: [
            {
              label: isAr ? "المبلغ:" : "Amount:",
              value: (row) => `${row.total_Amount?.toLocaleString()} ${isAr ? "ر.س" : "$"}`,
            },
            {
              label: isAr ? "الحالة:" : "Status:",
              value: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status_Name)}`}>
                  {isAr ? translateErp(row.status_Name, locale) : (row.status_Name || "Unknown")}
                </span>
              ),
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: isAr ? "السابق" : "Prev",
          nextLabel: isAr ? "التالي" : "Next",
        }}
        emptyMessage={isAr ? "لا توجد مصروفات" : "No expenses found"}
      />
    </div>
  );
}

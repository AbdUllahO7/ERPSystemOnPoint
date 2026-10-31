import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Building,
  CreditCard,
  Eye,
  Info,
  Users as UsersIcon,
  Banknote,
  FileText
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllAccountsFlat,
} from "../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import toast from "react-hot-toast";

const stats = [
  {
    title: "Total Accounts",
    value: "150",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Banknote,
  },
  {
    title: "Active Accounts",
    value: "140",
    trend: "+2%",
    isUp: true,
    color: "bg-emerald-500",
    icon: FileText,
  },
];

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterNature, setFilterNature] = useState("all");
  const [filterFinalAccount, setFilterFinalAccount] = useState("all");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      // NOTE: Replace with actual delete function if added in the future
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllAccountsFlat"]);
      toast.success("Account deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete account", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete account!");
    },
  });

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllAccountsFlat", params],
    queryFn: () => getAllAccountsFlat(params),
  });

  const displayRows = useMemo(() => {
    let rows = data?.data?.items || [];
    if (filterNature !== "all") {
      rows = rows.filter((r) =>
        String(r.accountNature || "")
          .toLowerCase()
          .includes(filterNature.toLowerCase())
      );
    }
    if (filterFinalAccount !== "all") {
      rows = rows.filter((r) =>
        String(r.finalAccount || "")
          .toLowerCase()
          .includes(filterFinalAccount.toLowerCase())
      );
    }
    return rows;
  }, [data, filterNature, filterFinalAccount]);
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
              navigate(`/dashboard/accounting/accounts/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) =>
              navigate(`/dashboard/accounting/accounts/edit/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "accountNumber",
      label: "Number",
    
    },
    {
      key: "accountName",
      label: "Name",
    
    },
    {
      key: "parentAccountName",
      label: "Parent Account",
    },
    {
      key: "accountNature",
      label: "Nature",
    },
    {
      key: "finalAccount",
      label: "Final Account",
    },
    {
      key: "financialStatement",
      label: "Financial Statement",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Accounts
        </h2>
        <Info className="w-4 h-4 text-muted-foreground" />
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

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "nature",
            label: "Account Nature",
            placeholder: "All Natures",
            options: [
              { value: "Debit", label: "Debit" },
              { value: "Credit", label: "Credit" },
            ],
          },
          {
            key: "finalAccount",
            label: "Final Account",
            placeholder: "All Final Accounts",
            options: [
              { value: "BalanceSheet", label: "Balance Sheet" },
              { value: "IncomeStatement", label: "Income Statement" },
              { value: "Trading", label: "Trading Account" },
              { value: "ProfitAndLoss", label: "Profit & Loss" },
            ],
          },
        ]}
        filters={{
          nature: filterNature !== "all" ? filterNature : "",
          finalAccount: filterFinalAccount !== "all" ? filterFinalAccount : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "nature") setFilterNature(val || "all");
          if (key === "finalAccount") setFilterFinalAccount(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterNature("all");
          setFilterFinalAccount("all");
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        search={{
          placeholder: "Search accounts...",
          value: search,
          onChange: handleSearch,
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllAccountsFlat"])}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/accounts/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Banknote,
          title: (row) => row.accountName,
          subtitle: (row) => `Number: ${row.accountNumber}`,
          fields: [
            {
              icon: Building,
              label: "Parent:",
              value: (row) => row.parentAccountName || "-",
            },
            {
              icon: Info,
              label: "Nature:",
              value: (row) => row.accountNature,
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
        emptyMessage="No accounts found"
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteRowId);
        }}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
      />
    </div>
  );
}

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
      sortable: true,
    },
    {
      key: "accountName",
      label: "Name",
      sortable: true,
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

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search accounts...",
          value: search,
          onChange: handleSearch,
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllAccountsFlat"])}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/accounts/add"),
        }}
        onColumnSettings={() => console.log("columns")}
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

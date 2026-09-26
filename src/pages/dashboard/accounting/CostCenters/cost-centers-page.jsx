import { useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Building,
  CreditCard,
  Eye,
  Info,
  Users as UsersIcon,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCostCenters,
  deleteCostCenter,
} from "../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

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

export default function CostCenters() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllCostCenters"]);
      toast.success("Cost center deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete cost center", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete cost center!");
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
    queryKey: ["getAllCostCenters", params],
    queryFn: () => getAllCostCenters(params),
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
              navigate(`/dashboard/accounting/cost-centers/${row.id}`),
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
              navigate(`/dashboard/accounting/cost-centers/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "cost_Center_Number",
      label: "Number",
      
    },
    {
      key: "cost_Center_Name",
      label: "Name",
      
    },
    {
      key: "linked_Account_Name",
      label: "Linked Account",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Cost Centers
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
      
        search={{
          placeholder: "Search cost centers...",
          value: search,
          onChange: handleSearch,
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllCostCenters"])}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/cost-centers/add"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Building,
          title: (row) => row.cost_Center_Name,
          subtitle: (row) => `Number: ${row.cost_Center_Number}`,
          fields: [
            {
              icon: CreditCard,
              label: "Account:",
              value: (row) => row.linked_Account_Name,
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
        emptyMessage="No cost centers found"
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteRowId);
        }}
        title="Delete Cost Center"
        description="Are you sure you want to delete this cost center? This action cannot be undone."
      />
    </div>
  );
}

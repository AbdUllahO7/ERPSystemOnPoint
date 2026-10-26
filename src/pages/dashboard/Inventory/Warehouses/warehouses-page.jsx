import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building,
  Package,
  Power,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { getWarehouses, deleteWarehouse, toggleWarehouseStatus } from "@/lib/api";
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

export default function WarehousesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Delete warehouse mutation using POST /api/inventory/Warehouses/DeleteWarehouse/Delete/{id}
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteWarehouse(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["getWarehouses"]);
      toast.success(res?.message || "Warehouse deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete warehouse:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to delete warehouse!"
      );
      setDeleteRowId(null);
    },
  });

  // Toggle warehouse status mutation using POST /api/inventory/Warehouses/ToggleStatus/ToggleStatus/{id}
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => toggleWarehouseStatus(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["getWarehouses"]);
      toast.success(res?.message || "Warehouse status updated successfully!");
    },
    onError: (error) => {
      console.error("Failed to toggle warehouse status:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to update warehouse status!"
      );
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
    queryKey: ["getWarehouses", params],
    queryFn: () => getWarehouses(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "details",
            label: "Basic Info",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/inventory/warehouses/${row.id}?tab=basic`),
          },
          {
            key: "materials",
            label: "Materials",
            icon: Package,
            onClick: (row) =>
              navigate(
                `/dashboard/inventory/warehouses/${row.id}?tab=materials`,
              ),
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
              navigate(`/dashboard/inventory/warehouses/edit/${row.id}`),
          },
          {
            key: "toggle",
            label: "Toggle Status",
            icon: Power,
            onClick: (row) => toggleStatusMutation.mutate(row.id),
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
    [navigate, toggleStatusMutation],
  );

  const columns = [
    {
      key: "warehouse_Code",
      label: "Code",
      render: (row) => (
        <span className="text-blue-600 font-medium">{row.warehouse_Code}</span>
      ),
    },
    {
      key: "name_Warehouse",
      label: "Warehouse Name",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isActive = Boolean(
          row.isActive ??
            row.is_Active ??
            (typeof row.status === "string"
              ? row.status.toLowerCase() === "active"
              : true)
        );
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              disabled={toggleStatusMutation.isPending}
              onCheckedChange={() => toggleStatusMutation.mutate(row.id)}
            />
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <DataView
        title="Warehouses"
        stats={stats}
        data={displayRows}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          title: (row) => row.name_Warehouse,
          subtitle: (row) => row.warehouse_Code,
          fields: [
            { label: "Location", value: (row) => row.location },
            {
              label: "Status",
              value: (row) => {
                const isActive = Boolean(
                  row.isActive ??
                    row.is_Active ??
                    (typeof row.status === "string"
                      ? row.status.toLowerCase() === "active"
                      : true)
                );
                return (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                );
              },
            },
          ],
        }}
        search={{
          value: search,
          onChange: handleSearch,
          placeholder: "Search warehouses...",
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/inventory/warehouses/add"),
        }}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setPage,
        }}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        title="Delete Warehouse"
        description="Are you sure you want to delete this warehouse? This action cannot be undone."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}


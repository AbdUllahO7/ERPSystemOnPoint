import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building,
  Package,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { getWarehouses, deleteWarehouse } from "@/lib/api";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState("all");

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

  const displayRows = useMemo(() => {
    let rows = data?.data?.items || [];
    if (filterLocation !== "all") {
      rows = rows.filter((r) =>
        String(r.location || "")
          .toLowerCase()
          .includes(filterLocation.toLowerCase())
      );
    }
    return rows;
  }, [data, filterLocation]);
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
  ];

  return (
    <div className="space-y-6">
      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "location",
            label: "Location",
            placeholder: "All Locations",
            type: "text",
          },
        ]}
        filters={{
          location: filterLocation !== "all" ? filterLocation : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "location") setFilterLocation(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setFilterLocation("all");
          setPage(1);
        }}
      />

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
          ],
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
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


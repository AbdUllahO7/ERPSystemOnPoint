import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  User,
  Waypoints,
  Building2,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPositions, deletePosition } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

const stats = [
  {
    title: "Number of Positions",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Waypoints
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon
  },
  {
    title: "Number of Positions",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Waypoints
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon
  }
];

export default function Positions() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const params = useMemo(() => ({
    search: search,
    pageNumber: page,
    pageSize: 10,
  }), [page, search]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getPositions"]);
      toast.success("Position deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete position:", error);
      toast.error("Failed to delete position!");
      setDeleteRowId(null);
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["getPositions", params],
    queryFn: () => getPositions(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
  }
  
  const navigate = useNavigate();

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "details",
            label: "Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/positions/${row.position_Id}?tab=details`),  
          },
          {
            key: "employee",
            label: "Employee",
            icon: User,
            onClick: (row) => navigate(`/dashboard/hr/positions/${row.position_Id}?tab=employee`),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/hr/positions/edit/${row.position_Id}`),
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
            onClick: (row) => setDeleteRowId(row.position_Id),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "position_Id",
      label: "ID",
      render: (row) => `#${row.position_Id.substring(0, 8)}`,
    },
    {
      key: "position_name",
      label: "Position Name",
    },
    {
      key: "total_employees",
      label: "Total Employees",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Positions List</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} {stat.isUp ? '↑' : '↓'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.position_Id}
        search={{
          placeholder: "Search positions...",
          value: search,
          onChange: handleSearch,
        }}
        // filter={{
        //   label: "Filter",
        //   onClick: () => console.log("filter"),
        // }}
        onRefresh={() => console.log("refresh")}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/hr/positions/add"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Waypoints,
          title: (row) => row.position_name,
          subtitle: (row) => `Employees: ${row.total_employees}`,
          fields: [
            {
              icon: UsersIcon,
              label: "Total Employees:",
              value: (row) => row.total_employees,
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
        emptyMessage="No positions found"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          if (deleteRowId) {
            deleteMutation.mutate(deleteRowId);
          }
        }}
        isLoading={deleteMutation.isPending || deleteMutation.isLoading}
        title="Delete Position"
        description="Are you sure you want to delete this position? This action cannot be undone and will permanently remove the position from the system."
      />
    </div>
  );
}

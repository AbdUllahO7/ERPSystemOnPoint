import { StatTitle } from "@/components/common/stat-title";
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
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPositions, deletePosition, getDepartments } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";

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
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ departmentId: "" });

  const { data: departmentsResponse } = useQuery({
    queryKey: ["getDepartmentsList"],
    queryFn: () => getDepartments({ PageSize: 1000 }),
  });
  const departments = departmentsResponse?.data?.items || [];

  const filterConfigs = [
    {
      key: "departmentId",
      label: t('positions.filterDepartment'),
      placeholder: t('positions.allDepartments'),
      options: departments.map((d) => ({
        value: d.id,
        label: d.departmentName || d.name,
      })),
    },
  ];

  const params = useMemo(() => ({
    search: search,
    pageNumber: page,
    pageSize: 10,
    ...(filters.departmentId && { department_Id: filters.departmentId }),
  }), [page, search, filters.departmentId]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePosition(id),
    onSuccess: (res) => {
      if (res && (res.success === false || res.status >= 400)) {
        toast.error(res.message || t('positions.deleteError'));
        setDeleteRowId(null);
        return;
      }
      queryClient.invalidateQueries(["getPositions"]);
      toast.success(res?.message || t('positions.deleteSuccess'));
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete position:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        t('positions.deleteError');
      toast.error(errMsg);
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
      <h2 className="text-xl font-semibold text-foreground">
        {t('positions.title')}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground"><StatTitle>{stat.title}</StatTitle></p>
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

      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={filterConfigs}
        filters={filters}
        onFilterChange={(key, val) => {
          setFilters((prev) => ({ ...prev, [key]: val }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ departmentId: "" });
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.position_Id}
        search={{
          placeholder: t('positions.searchPlaceholder'),
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: t('common.filter'),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => queryClient.invalidateQueries(["getPositions"])}
        addButton={{
          label: t('common.add'),
          onClick: () => navigate("/dashboard/hr/positions/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Waypoints,
          title: (row) => row.position_name,
          subtitle: (row) => `${t('employees', 'Employees')}: ${row.total_employees}`,
          fields: [
            {
              icon: UsersIcon,
              label: t('employees', 'Employees') + ":",
              value: (row) => row.total_employees,
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: t('common.prev'),
          nextLabel: t('common.next'),
        }}
        emptyMessage={t('positions.empty')}
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
        title={t('positions.deleteTitle')}
        description={t('positions.deleteDesc')}
      />
    </div>
  );
}

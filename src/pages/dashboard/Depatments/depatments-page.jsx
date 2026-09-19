import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  GitBranch,
  User,
  Archive,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import {
  getDepartments,
  deleteDepartment,
  getAllManagers,
  getBranches,
} from "../../../lib/api";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { DepartmentForm } from "./_components/department-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Depatments() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ ManagerId: "", BranchId: "" });

  const { data: managersData } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
  });
  const managers = managersData?.data?.items || [];

  const { data: branchData } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });
  const branches = branchData?.data?.items || [];

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDepartments"]);
      toast.success("Department deleted successfully");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete department", error);
      toast.error("Failed to delete department");
    },
  });

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
      ...(filters.ManagerId && { ManagerId: filters.ManagerId }),
      ...(filters.BranchId && { BranchId: filters.BranchId }),
    }),
    [page, search, filters],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["getDepartments", params],
    queryFn: () => getDepartments(params),
  });
  console.log(branches);

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    console.log(value);
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
            onClick: (row) =>
              navigate(`/dashboard/hr/departments/${row.id}?tab=details`),
          },
          {
            key: "sections",
            label: "Sections/Departments",
            icon: GitBranch,
            onClick: (row) =>
              navigate(`/dashboard/hr/departments/${row.id}?tab=section`),
          },
          {
            key: "employee",
            label: "Employee",
            icon: User,
            onClick: (row) =>
              navigate(`/dashboard/hr/departments/${row.id}?tab=employee`),
          },
          {
            key: "archive",
            label: "Archive",
            icon: Archive,
            onClick: (row) =>
              navigate(`/dashboard/hr/departments/${row.id}?tab=archive`),
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
              navigate(`/dashboard/hr/departments/edit/${row.id}`),
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
    [],
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.id.substring(0, 8)}`,
    },
    {
      key: "departmentName",
      label: "Department Name",
      sortable: true,
    },
    {
      key: "manager_name",
      label: "Manager Name",
    },
    {
      key: "number_Employees_Of_Each_Section",
      label: "Employees Count",
      emphasize: true,
    },
  ];

  return (
    <div className="space-y-4 ">
      <h2 className="text-xl font-semibold text-foreground ">
        Departments List
      </h2>

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
            {[
              {
                key: "ManagerId",
                label: "Filter by Manager",
                placeholder: "All Managers",
                options: managers.map((m) => ({
                  value: m.managerId || m.id,
                  label: m.managerName || "Unnamed Manager",
                })),
              },
              {
                key: "BranchId",
                label: "Filter by Branch",
                placeholder: "All Branches",
                options: branches.map((b) => ({
                  value: b.id,
                  label: b.branchName || "Unnamed Branch",
                })),
              },
            ].map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ ManagerId: "", BranchId: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search departments...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => console.log("refresh")}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/hr/departments/add"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: UsersIcon,
          title: (row) => row.departmentName,
          subtitle: (row) => `Manager: ${row.manager_name}`,
          fields: [
            {
              icon: UsersIcon,
              label: "Employees:",
              value: (row) => row.number_Employees_Of_Each_Section,
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
        emptyMessage="No departments found"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          deleteMutation.mutate(deleteRowId);
        }}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone and will permanently remove the department from the system."
      />
    </div>
  );
}

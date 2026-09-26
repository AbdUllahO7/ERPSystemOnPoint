import { useMemo, useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  FileSignature,
  TrendingUp,
  Plus,
  Minus,
  Fingerprint
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEmployees, deleteEmployee, getDepartments, getSections, getPositions, getOffices } from "../../../lib/api";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-[#0066d1]", 
    icon: Building2
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#5ebc93]", 
    icon: UsersIcon
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-[#0b386a]", 
    icon: Building2
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-[#ff9548]", 
    icon: UsersIcon
  }
];

export default function Employees() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ dep_id: "", section_id: "", position_id: "", office_id: "" });

  const params = useMemo(() => ({
    Search: search || undefined,
    PageNumber: page,
    PageSize: 10,
    dep_id: filters.dep_id || undefined,
    section_id: filters.section_id || undefined,
    position_id: filters.position_id || undefined,
    office_id: filters.office_id || undefined
  }), [page, search, filters]);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getEmployees"]);
      toast.success("Employee deleted successfully!");
      setDeleteRowId(null);
    },
    onError: (error) => {
      console.error("Failed to delete employee:", error);
      toast.error("Failed to delete employee!");
      setDeleteRowId(null);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getEmployees", params],
    queryFn: () => getEmployees(params),
  });

  const { data: departmentsResponse } = useQuery({
    queryKey: ["getDepartmentsList"],
    queryFn: () => getDepartments({ PageSize: 1000 }),
  });

  const { data: sectionsResponse } = useQuery({
    queryKey: ["getSectionsList"],
    queryFn: () => getSections({ PageSize: 1000 }),
  });

  const { data: positionsResponse } = useQuery({
    queryKey: ["getPositionsList"],
    queryFn: () => getPositions({ PageSize: 1000 }),
  });

  const { data: officesResponse } = useQuery({
    queryKey: ["getOfficesList"],
    queryFn: () => getOffices({ PageSize: 1000 }),
  });
  console.log("officesResponse", officesResponse);
  console.log("positionsResponse", positionsResponse);
  console.log("sectionsResponse", sectionsResponse);
  console.log("departmentsResponse", departmentsResponse);

  const departmentOptions = useMemo(() => departmentsResponse?.data?.items?.map(d => ({ value: d.id, label: d.departmentName })) || [], [departmentsResponse]);
  const sectionOptions = useMemo(() => sectionsResponse?.data?.items?.map(s => ({ value: s.id, label: s.section_name })) || [], [sectionsResponse]);
  const positionOptions = useMemo(() => positionsResponse?.data?.items?.map(p => ({ value: p.position_Id, label: p.position_name })) || [], [positionsResponse]);
  const officeOptions = useMemo(() => officesResponse?.data?.items?.map(o => ({ value: o.id, label: o.office_name })) || [], [officesResponse]);

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
            key: "basic-info",
            label: "Basic Info",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=basic-info`),
          },
          {
            key: "attendance",
            label: "Attendance",
            icon: Fingerprint,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=attendance`),
          },
          {
            key: "leaves",
            label: "Leaves",
            icon: Calendar,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=leaves`),
          },
          {
            key: "salary",
            label: "Salary",
            icon: DollarSign,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=salary`),
          },
          {
            key: "documents",
            label: "Documents",
            icon: FileText,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=documents`),
          },
          {
            key: "contracts",
            label: "Contracts",
            icon: FileSignature,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=contracts`),
          },
          {
            key: "performance",
            label: "Performance",
            icon: TrendingUp,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=performance`),
          },
        ],
      },
      {
        label: "Add",
        items: [
          {
            key: "add-leaves",
            label: "Leaves",
            icon: Calendar,
            onClick: (row) => console.log("Add Leaves", row),
          },
          {
            key: "add-bounses",
            label: "Bounses",
            icon: Plus,
            onClick: (row) => console.log("Add Bounses", row),
          },
          {
            key: "add-deductions",
            label: "Deductions",
            icon: Minus,
            onClick: (row) => console.log("Add Deductions", row),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/hr/employees/edit/${row.id}`),
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
      key: "jobNumber",
      label: "Job Number",
      render: (row) => <span className="text-primary font-medium">{row.jobNumber !== "N/A" ? `#${row.jobNumber}` : row.jobNumber}</span>,
      sortable: true,
    },
    {
      key: "fullName",
      label: "Employee Name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-primary hover:underline cursor-pointer">{row.fullName}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "jobTitle",
      label: "Position",
      sortable: true,
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true,
    },
    {
      key: "sectionName",
      label: "Section",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs whitespace-nowrap">{row.status}</span>,
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
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
                key: "dep_id",
                label: "Filter by Department",
                placeholder: "All Departments",
                options: departmentOptions,
              },
              {
                key: "section_id",
                label: "Filter by Section",
                placeholder: "All Sections",
                options: sectionOptions,
              },
              {
                key: "position_id",
                label: "Filter by Position",
                placeholder: "All Positions",
                options: positionOptions,
              },
              {
                key: "office_id",
                label: "Filter by Office",
                placeholder: "All Offices",
                options: officeOptions,
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
                  setFilters({ dep_id: "", section_id: "", position_id: "", office_id: "" });
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
        search={{
          placeholder: "Search by id or employee name...",
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
          onClick: () => navigate("/dashboard/hr/employees/add"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: UsersIcon,
          title: (row) => row.fullName,
          subtitle: (row) => row.jobTitle,
          fields: [
            {
              label: "Job Number:",
              value: (row) => row.jobNumber,
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No employees found"
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
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone and will permanently remove the employee from the system."
      />
    </div>
  );
}

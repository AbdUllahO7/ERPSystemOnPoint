import { useMemo, useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Edit, Trash2, Building2, Users as UsersIcon, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLeaveRequests, approveLeave, rejectLeave, getLeaveTypes, getEmployees } from "../../../lib/api";
import toast from "react-hot-toast";

const stats = [
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0066d1]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#5ebc93]", icon: UsersIcon },
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0b386a]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#ff9548]", icon: UsersIcon }
];

const mockLeaves = [
  { id: "1", employeeName: "Employee Name", date: "23/7/2025", type: "Type", startDate: "23/7/2025", endDate: "30/7/2025" },
  { id: "2", employeeName: "Employee Name", date: "23/7/2025", type: "Type", startDate: "23/7/2025", endDate: "30/7/2025" },
  { id: "3", employeeName: "Employee Name", date: "23/7/2025", type: "Type", startDate: "23/7/2025", endDate: "30/7/2025" },
  { id: "4", employeeName: "Employee Name", date: "23/7/2025", type: "Type", startDate: "23/7/2025", endDate: "30/7/2025" },
  { id: "5", employeeName: "Employee Name", date: "23/7/2025", type: "Type", startDate: "23/7/2025", endDate: "30/7/2025" },
];

export default function LeavesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ Status: "", StartDateFrom: "", StartDateTo: "", LeaveTypeId: "", EmployeeId: "" });

  const { data: leaveTypesResponse } = useQuery({
    queryKey: ["getLeaveTypes"],
    queryFn: () => getLeaveTypes({ PageSize: 100 }),
  });
  const leaveTypeOptions = useMemo(() => leaveTypesResponse?.data?.items?.map(t => ({ value: t.id, label: t.leaveTypeName })) || [], [leaveTypesResponse]);

  const { data: employeesResponse } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }), // large page size for dropdown
  });
  const employeeOptions = useMemo(() => employeesResponse?.data?.items?.map(e => ({ value: e.id, label: e.fullName })) || [], [employeesResponse]);

  const params = useMemo(() => ({
    Search: search || undefined,
    PageNumber: page,
    PageSize: 10,
    Status: filters.Status || undefined,
    LeaveTypeId: filters.LeaveTypeId || undefined,
    EmployeeId: filters.EmployeeId || undefined,
    StartDateFrom: filters.StartDateFrom || undefined,
    StartDateTo: filters.StartDateTo || undefined,
  }), [search, page, filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["getAllLeaveRequests", params],
    queryFn: () => getAllLeaveRequests(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const approveMutation = useMutation({
    mutationFn: (id) => approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllLeaveRequests"]);
      toast.success("Leave approved successfully!");
    },
    onError: (error) => {
      console.error("Failed to approve leave:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to approve leave!");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllLeaveRequests"]);
      toast.success("Leave rejected successfully!");
    },
    onError: (error) => {
      console.error("Failed to reject leave:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to reject leave!");
    }
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-primary font-medium">#{row.id.slice(0, 8)}</span>,
    },
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="text-primary font-medium hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/hr/employees/${row.employee_id}`)}>{row.employee_Name}</span>,
    },
    { 
      key: "leave_Type_Dto", 
      label: "Leave Type",
      render: (row) => row.leave_Type_Dto?.leave_Type_Name || "-"
    },
    { 
      key: "start_Date", 
      label: "Start Date",
      render: (row) => new Date(row.start_Date).toLocaleDateString()
    },
    { 
      key: "end_Date", 
      label: "End Date",
      render: (row) => new Date(row.end_Date).toLocaleDateString()
    },
    { key: "total_Days", label: "Total Days" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === "0" ? "bg-yellow-100 text-yellow-800" : 
          row.status === "1" ? "bg-green-100 text-green-800" : 
          "bg-red-100 text-red-800"
        }`}>
          {row.status === "0" ? "Pending" : row.status === "1" ? "Approved" : row.status === "2" ? "Rejected" : row.status}
        </span>
      )
    },
  ];

  const rowActionsMenu = useMemo(() => [
    {
      items: [
        {
          key: "approve",
          label: "Approve",
          icon: Check,
          onClick: (row) => approveMutation.mutate(row.id),
        },
        {
          key: "reject",
          label: "Reject",
          icon: X,
          destructive: true,
          onClick: (row) => rejectMutation.mutate(row.id),
        },
      ],
    },
  ], [approveMutation, rejectMutation]);

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
                key: "EmployeeId",
                label: "Filter by Employee",
                placeholder: "All Employees",
                options: employeeOptions,
              },
              {
                key: "LeaveTypeId",
                label: "Filter by Leave Type",
                placeholder: "All Types",
                options: leaveTypeOptions,
              },
              {
                key: "Status",
                label: "Filter by Status",
                placeholder: "All Statuses",
                options: [
                  { value: "0", label: "Pending" }, 
                  { value: "1", label: "Approved" },
                  { value: "2", label: "Rejected" },
                  { value: "3", label: "Cancelled" }
                ],
              },
            ].map((config) => (
              <div key={config.key} className="flex flex-col gap-2 w-full sm:max-w-[200px]">
                <label className="text-sm font-medium text-foreground">{config.label}</label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({ ...prev, [config.key]: val === "all" ? "" : val }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Start Date From</label>
              <Input
                type="date"
                value={filters.StartDateFrom}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, StartDateFrom: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Start Date To</label>
              <Input
                type="date"
                value={filters.StartDateTo}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, StartDateTo: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button variant="outline" onClick={() => { setFilters({ Status: "", StartDateFrom: "", StartDateTo: "", LeaveTypeId: "", EmployeeId: "" }); setPage(1); }}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DataView */}
      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{ placeholder: "Search leaves...", value: search, onChange: setSearch }}
        filter={{ label: "Filter", onClick: () => setIsFilterOpen(!isFilterOpen) }}
        card={{
          icon: Calendar,
          title: (row) => row.employee_Name,
          subtitle: (row) => `Status: ${row.status === "0" ? "Pending" : row.status === "1" ? "Approved" : row.status === "2" ? "Rejected" : row.status}`,
          fields: [
            { label: "Type:", value: (row) => row.leave_Type_Dto?.leave_Type_Name },
            { label: "Duration:", value: (row) => `${new Date(row.start_Date).toLocaleDateString()} to ${new Date(row.end_Date).toLocaleDateString()}` },
          ],
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllLeaveRequests"])}
        onPrint={() => window.print()}
        export={{ label: "Export", onClick: () => console.log("export") }}
        addButton={{ label: "Add", onClick: () => navigate("/dashboard/hr/leaves/add") }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{ page: currentPage, totalPages: totalPages, onPageChange: setPage, prevLabel: "Pre", nextLabel: "Next" }}
        emptyMessage="No leaves found"
      />
    </div>
  );
}

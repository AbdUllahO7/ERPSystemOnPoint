import { useMemo, useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Edit, Trash2, Building2, Users as UsersIcon, FileText, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllContracts, deleteContract, restoreContract } from "../../../lib/api";
import toast from "react-hot-toast";

const stats = [
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0066d1]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#5ebc93]", icon: UsersIcon },
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0b386a]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#ff9548]", icon: UsersIcon }
];

const mockContracts = [
  { id: "1", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Active" },
  { id: "2", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "3", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "4", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Cancelled" },
  { id: "5", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Completed" },
  { id: "6", employeeName: "Employee Name", startDate: "23/7/2025", endDate: "23/7/2026", status: "Completed" },
];

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    MinSalary: "", 
    MaxSalary: "", 
    StartDateFrom: "", 
    StartDateTo: "" 
  });

  const params = useMemo(() => ({
    Search: search || undefined,
    PageNumber: page,
    PageSize: 10,
    MinSalary: filters.MinSalary || undefined,
    MaxSalary: filters.MaxSalary || undefined,
    StartDateFrom: filters.StartDateFrom || undefined,
    StartDateTo: filters.StartDateTo || undefined,
  }), [search, page, filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["getAllContracts", params],
    queryFn: () => getAllContracts(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllContracts"]);
      toast.success("Contract deleted successfully!");
    },
    onError: (error) => {
      console.error("Failed to delete contract:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete contract!");
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => restoreContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllContracts"]);
      toast.success("Contract restored successfully!");
    },
    onError: (error) => {
      console.error("Failed to restore contract:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to restore contract!");
    }
  });

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-[#0066d1] font-medium">#{row.id.slice(0, 8)}</span>,
      sortable: true,
    },
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="text-primary font-medium hover:underline cursor-pointer" onClick={() => navigate(`/dashboard/hr/employees/${row.employeeId}`)}>{row.employeeName}</span>,
      sortable: true,
    },
    { key: "salary", label: "Salary", render: (row) => `$${row.salary}` },
    { key: "startDate", label: "Start Date", render: (row) => new Date(row.startDate).toLocaleDateString(), sortable: true },
    { key: "endDate", label: "End Date", render: (row) => new Date(row.endDate).toLocaleDateString(), sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const statusText = row.status || "Active";
        const bg = statusText === "Cancelled" ? "bg-red-50 text-red-600" : statusText === "Completed" ? "bg-blue-50 text-blue-600" : "bg-green-100 text-green-700";
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
            {statusText}
          </span>
        );
      },
      sortable: true,
    },
  ];

  const rowActionsMenu = useMemo(() => [
    {
      items: [
        { label: "Details", icon: Eye, onClick: (row) => navigate(`/dashboard/hr/employees/${row.employeeId}/contracts/${row.id}`) },
        { label: "Update", icon: Edit, onClick: (row) => navigate(`/dashboard/hr/contracts/edit/${row.id}`) },
        { label: "Restore", icon: Undo2, onClick: (row) => restoreMutation.mutate(row.id) },
        { label: "Delete", icon: Trash2, destructive: true, onClick: (row) => deleteMutation.mutate(row.id) },
      ],
    },
  ], [navigate, deleteMutation, restoreMutation]);

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
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Min Salary</label>
              <Input
                type="number"
                placeholder="Min Salary"
                value={filters.MinSalary}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, MinSalary: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Max Salary</label>
              <Input
                type="number"
                placeholder="Max Salary"
                value={filters.MaxSalary}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, MaxSalary: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

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
              <Button variant="outline" onClick={() => { setFilters({ MinSalary: "", MaxSalary: "", StartDateFrom: "", StartDateTo: "" }); setPage(1); }}>
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
        search={{ placeholder: "Search contracts...", value: search, onChange: setSearch }}
        filter={{ label: "Filter", onClick: () => setIsFilterOpen(!isFilterOpen) }}
        card={{
          icon: FileText,
          title: (row) => `Contract #${row.id.slice(0, 8)}`,
          subtitle: (row) => `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}`,
          fields: [
            { label: "Status:", value: (row) => row.status || "Active" },
            { label: "Employee:", value: (row) => row.employeeName },
          ],
        }}
        onRefresh={() => queryClient.invalidateQueries(["getAllContracts"])}
        onPrint={() => window.print()}
        export={{ label: "Export", onClick: () => console.log("export") }}
        addButton={{ label: "Add", onClick: () => navigate("/dashboard/hr/contracts/add") }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{ page: currentPage, totalPages: totalPages, onPageChange: setPage, prevLabel: "Pre", nextLabel: "Next" }}
        emptyMessage="No contracts found"
      />
    </div>
  );
}

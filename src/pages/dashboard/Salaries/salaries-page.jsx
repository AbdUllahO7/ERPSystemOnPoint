import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Edit, Trash2, Building2, Users as UsersIcon, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getSalaries, getEmployees, getDepartments } from "@/lib/api";

const stats = [
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0066d1]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#5ebc93]", icon: UsersIcon },
  { title: "Number of system Departments", value: "32", trend: "+5%", isUp: true, color: "bg-[#0b386a]", icon: Building2 },
  { title: "Total number of employees", value: "32", trend: "-1%", isUp: false, color: "bg-[#ff9548]", icon: UsersIcon }
];

export default function SalariesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    EmployeeId: "",
    DepartmentId: "",
    Month: "",
    Year: ""
  });

  const params = useMemo(() => ({
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    EmployeeId: filters.EmployeeId || undefined,
    DepartmentId: filters.DepartmentId || undefined,
    Month: filters.Month ? parseInt(filters.Month) : undefined,
    Year: filters.Year ? parseInt(filters.Year) : undefined,
  }), [page, search, filters]);

  const { data: employeesResponse } = useQuery({
    queryKey: ["getEmployeesList"],
    queryFn: () => getEmployees({ PageSize: 1000 }),
  });

  const { data: departmentsResponse } = useQuery({
    queryKey: ["getDepartmentsList"],
    queryFn: () => getDepartments({ pageNumber: 1, pageSize: 1000 }),
  });

  const { data: salariesData, isLoading, refetch } = useQuery({
    queryKey: ["getSalaries", params],
    queryFn: () => getSalaries(params),
  });
  console.log(salariesData)

  const employeeOptions = useMemo(() => employeesResponse?.data?.items?.map(e => ({ value: e.id, label: e.fullName })) || [], [employeesResponse]);
  const departmentOptions = useMemo(() => departmentsResponse?.data?.items?.map(d => ({ value: d.department_Id || d.id, label: d.departmentName ||""})) || [], [departmentsResponse]);
  const displayRows = salariesData?.data?.items || [];
  const totalPages = salariesData?.data?.totalPages || 1;
  const currentPage = salariesData?.data?.pageNumber || page;

  const columns = [
    {
      key: "employee_Name",
      label: "Employee Name",
      render: (row) => (
        <span 
          className="text-primary font-medium hover:underline cursor-pointer"
          onClick={() => navigate(`/dashboard/hr/employees/${row.employee_id}`)}
        >
          {row.employee_Name}
        </span>
      ),
      sortable: true,
    },
    { key: "department_name", label: "Department", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "baseSalary", label: "Base Salary", sortable: true },
    { key: "netSalary", label: "Net Salary", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const bg = row.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-green-100 text-green-700";
        return <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>{row.status}</span>;
      },
      sortable: true,
    },
  ];

  const rowActionsMenu = useMemo(() => [
    {
      items: [
        { label: "Details", icon: Eye, onClick: (row) => navigate(`/dashboard/hr/employees/${row.employee_id}`) },
      ],
    },
  ], [navigate]);

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
              <label className="text-sm font-medium text-foreground">Employee</label>
              <Select
                value={filters.EmployeeId || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, EmployeeId: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employeeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Department</label>
              <Select
                value={filters.DepartmentId || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, DepartmentId: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Month</label>
              <Select
                value={filters.Month || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, Month: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[150px]">
              <label className="text-sm font-medium text-foreground">Year</label>
              <Input
                type="number"
                placeholder="Year (e.g. 2026)"
                value={filters.Year || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, Year: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button variant="outline" onClick={() => { setFilters({ EmployeeId: "", DepartmentId: "", Month: "", Year: "" }); setPage(1); }}>
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
        // selectable
        search={{ placeholder: "Search salaries...", value: search, onChange: setSearch }}
        filter={{ label: "Filter", onClick: () => setIsFilterOpen(!isFilterOpen) }}
        card={{
          icon: DollarSign,
          title: (row) => row.employee_Name,
          subtitle: (row) => row.department_name,
          fields: [
            { label: "Date:", value: (row) => row.date },
            { label: "Net Salary:", value: (row) => row.netSalary },
            { label: "Status:", value: (row) => <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${row.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-green-100 text-green-700"}`}>{row.status}</span> },
          ],
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{ label: "Export", onClick: () => console.log("export") }}
        // addButton={{ label: "Generate Payroll", onClick: () => console.log("generate payroll") }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{ page: currentPage, totalPages: totalPages, onPageChange: setPage, prevLabel: "Pre", nextLabel: "Next" }}
        emptyMessage="No salaries found"
      />
    </div>
  );
}

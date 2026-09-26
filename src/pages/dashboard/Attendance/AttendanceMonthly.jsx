import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Calculator, Calendar, UsersIcon, AlertTriangle, Building, CheckCircle, XCircle } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { getMonthlySummary } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function StatusCell({ status }) {
  const isCompleted = status === "Calculated" || status === "Completed";
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs ${
        isCompleted
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isCompleted ? "Completed" : "There are errors"}
    </span>
  );
}

export default function AttendanceMonthly() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ year: "all", isFinalized: "all" });

  const params = useMemo(() => {
    const p = {
      search: search,
      pageNumber: page,
      pageSize: 10,
    };
    if (filters.year !== "all") {
      p.year = filters.year;
    }
    if (filters.isFinalized !== "all") {
      p.IsFinalized = filters.isFinalized === "true";
    }
    return p;
  }, [page, search, filters]);

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ["getMonthlySummary", params],
    queryFn: () => getMonthlySummary(params),
  });

  const displayRows = queryData?.data?.items || [];
  const totalPages = queryData?.data?.totalPages || 1;
  const currentPage = queryData?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "view",
            label: "View",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/attendance/${row.year}/${row.month}`),
          },
          {
            key: "count",
            label: "Count",
            icon: Calculator,
            onClick: (row) => navigate(`/dashboard/hr/attendance/${row.year}/${row.month}/count`),
          },
        ],
      },
    ],
    [navigate]
  );

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.year}${row.month.toString().padStart(2, "0")}`,
    },
    {
      key: "month",
      label: "Month",
      render: (row) => `${getMonthName(row.month)} ${row.year}`,
    },
    {
      key: "numOfEmployees",
      label: "Num of employees",
      render: (row) => row.totalDaysProcessed,
    },
    {
      key: "attendancePercent",
      label: "Attendance percent",
      render: (row) => <span className="text-primary">{row.attendancePercentage}%</span>,
    },
    {
      key: "absences",
      label: "Absences",
      render: (row) => <span className="text-red-500">{row.errorsCount}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
    {
      key: "lastUpdate",
      label: "Last update",
      render: () => "12-12-2024",
    },
  ];

  const statCards = [
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
      value: "50",
      trend: "-1%",
      isUp: false,
      color: "bg-emerald-500",
      icon: UsersIcon,
    },
    {
      title: "Processed Months",
      value: "12",
      trend: "Up to date",
      isUp: true,
      color: "bg-blue-900",
      icon: CheckCircle,
    },
    {
      title: "Pending Issues",
      value: "2",
      trend: "Requires action",
      isUp: false,
      color: "bg-red-500",
      icon: XCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
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
                  {stat.trend}
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
              <label className="text-sm font-medium text-foreground">
                Filter by Year
              </label>
              <Select
                value={filters.year}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, year: val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">
                Filter by Status
              </label>
              <Select
                value={filters.isFinalized}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, isFinalized: val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                  <SelectItem value="false">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(filters.year !== "all" || filters.isFinalized !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ year: "all", isFinalized: "all" });
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
        getRowId={(row) => `${row.year}-${row.month}`}
        
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        card={{
          icon: Calendar,
          title: (row) => `${getMonthName(row.month)} ${row.year}`,
          subtitle: (row) => `Status: ${row.status === "Calculated" || row.status === "Completed" ? "Completed" : "There are errors"}`,
          fields: [
            {
              icon: UsersIcon,
              label: "Num of employees:",
              value: (row) => row.totalDaysProcessed,
            },
            {
              icon: Calculator,
              label: "Attendance percent:",
              value: (row) => `${row.attendancePercentage}%`,
            },
            {
              icon: AlertTriangle,
              label: "Absences:",
              value: (row) => row.errorsCount,
            }
          ],
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No attendance summaries found"
      />
    </div>
  );
}

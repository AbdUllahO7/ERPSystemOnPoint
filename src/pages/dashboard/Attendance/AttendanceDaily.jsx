import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Info, Eye, UsersIcon, Building, CalendarDays, AlertTriangle } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { Button } from "@/components/ui/button";
import { getDailySummary, getMonthStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttendanceDaily() {
  const { year, month } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ isFinalized: "all" });

  const { data: statsData } = useQuery({
    queryKey: ["getMonthStats", year, month],
    queryFn: () => getMonthStats(year, month),
  });
  
  const stats = statsData?.data || { totalRecords: 0, correctRecords: 0, errorsCount: 0 };

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
      IsActive: true,
      ...(filters.isFinalized !== "all" && { IsFinalized: filters.isFinalized === "true" }),
    }),
    [page, search, filters]
  );

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["getDailySummary", year, month, params],
    queryFn: () => getDailySummary(year, month, params),
  });

  const displayRows = queryData?.data?.items || [];
  const totalPages = queryData?.data?.totalPages || 1;
  const currentPage = queryData?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }),
    },
    {
      key: "totalEmployees",
      label: "Total Employees",
      render: (row) => row.totalEmployees,
    },
    {
      key: "absences",
      label: "Absences",
      render: (row) => <span className="text-red-500">{row.absencesCount}</span>,
    },
    {
      key: "errors",
      label: "Errors",
      render: (row) => <span className="text-orange-500">{row.errorsCount}</span>,
    },
    {
      key: "attendancePercentage",
      label: "Attendance Percentage",
      render: (row) => <span className="text-primary">{Number(row.dailyAttendancePercentage).toFixed(2)}%</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-xs ${
            row.isFinalized
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isFinalized ? "Completed" : "Needs Review"}
        </span>
      ),
    },
  ];

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "view",
            label: "View",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/attendance/${year}/${month}/${row.date}`),
          },
        ],
      },
    ],
    [navigate, year, month]
  );

  const statCards = [
    {
      title: "Records processed",
      value: stats.totalRecords,
      trend: "Up to date",
      isUp: true,
      color: "bg-blue-600",
      icon: Building,
    },
    {
      title: "Valid records",
      value: stats.correctRecords,
      trend: "Verified",
      isUp: true,
      color: "bg-emerald-500",
      icon: CheckCircle,
    },
    {
      title: "Errors detected",
      value: stats.errorsCount,
      trend: "Requires action",
      isUp: false,
      color: "bg-red-500",
      icon: XCircle,
    },
    {
      title: "Total Employees",
      value: "50",
      trend: "Active",
      isUp: true,
      color: "bg-blue-900",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Attendance statistics</h2>
        <Info className="w-4 h-4 text-neutral-400" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-lg text-neutral-900">Processing is complete</h4>
              <p className="text-sm text-neutral-500">{month}/{year} - One Point ERP System</p>
            </div>
          </div>
        </div>
        <div className="flex-2 bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center justify-between">
           <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2 rounded-md">
             <XCircle className="w-4 h-4" />
             <span className="text-sm font-medium">There are {stats.errorsCount} errors that require manual review before the month is finally approved</span>
           </div>
           <Button onClick={() => navigate(`/dashboard/hr/attendance/${year}/${month}/errors`)}>Error display</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
            ? "grid-rows-[1fr] opacity-100 mt-6"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">
                Filter by Status
              </label>
              <Select
                value={filters.isFinalized}
                onValueChange={(val) => {
                  setFilters({ isFinalized: val });
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

            {filters.isFinalized !== "all" && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ isFinalized: "all" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Live processing log</h3>
        <DataView
          data={displayRows}
          isLoading={isLoading}
          getRowId={(row) => row.date}
          search={{
            placeholder: "Search date...",
            value: search,
            onChange: handleSearch,
          }}
          filter={{
            label: "Filter",
            onClick: () => setIsFilterOpen(!isFilterOpen),
          }}
          card={{
            icon: CalendarDays,
            title: (row) => new Date(row.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }),
            subtitle: (row) => `Status: ${row.isFinalized ? "Completed" : "Needs Review"}`,
            fields: [
              {
                icon: UsersIcon,
                label: "Total Employees:",
                value: (row) => row.totalEmployees,
              },
              {
                icon: AlertTriangle,
                label: "Errors:",
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
          emptyMessage="No daily summaries found"
        />
      </div>
    </div>
  );
}

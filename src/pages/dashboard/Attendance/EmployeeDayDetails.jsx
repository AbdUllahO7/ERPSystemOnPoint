import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Info, Pencil, User, Clock, Briefcase } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { getEmployeeDayDetails } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ManualUpdateModal } from "./components/ManualUpdateModal";

function StatusCell({ status }) {
  const getStatusStyle = (s) => {
    switch (s) {
      case "Present": return "bg-green-100 text-green-700";
      case "Absent": return "bg-red-100 text-red-700";
      case "EarlyLeave": return "bg-orange-100 text-orange-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
}

export default function EmployeeDayDetails() {
  const { year, month, date } = useParams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ isFinalized: "all" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

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

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ["getEmployeeDayDetails", date, params],
    queryFn: () => getEmployeeDayDetails(date, params),
  });

  const displayRows = queryData?.data?.items || [];
  const totalPages = queryData?.data?.totalPages || 1;
  const currentPage = queryData?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const t = new Date(timeString);
    return t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getMonthName = (monthNumber) => {
    const d = new Date();
    d.setMonth(monthNumber - 1);
    return d.toLocaleString("en-US", { month: "long" });
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const columns = [
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="font-medium">{row.employeeName}</span>,
    },
    {
      key: "jobNumber",
      label: "Job Number",
      render: (row) => row.jobNumber || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
    {
      key: "checkInTime",
      label: "Check In",
      render: (row) => formatTime(row.checkInTime),
    },
    {
      key: "checkOutTime",
      label: "Check Out",
      render: (row) => formatTime(row.checkOutTime),
    },
    {
      key: "workingHours",
      label: "Working Hours",
      render: (row) => row.workingHours,
    },
    {
      key: "isFinalized",
      label: "Finalized",
      render: (row) => (
        <span
          className={`inline-flex h-6 items-center rounded px-2 text-xs font-medium ${
            row.isFinalized
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {row.isFinalized ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "edit",
            label: "Resolve Error / Edit",
            icon: Pencil,
            onClick: (row) => {
              setSelectedRecordId(row.attendId);
              setModalOpen(true);
            },
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-neutral-900">Employee day details</h2>
        <Info className="w-4 h-4 text-neutral-400" />
      </div>
      <div className="text-sm text-neutral-500 flex gap-1">
        <Link to={`/dashboard/hr/attendance/${year}/${month}`} className="hover:underline">
          {getMonthName(month)} {year} Processing log
        </Link> / 
        <span className="text-neutral-900">{formattedDate}</span>
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
                Filter by Finalized Status
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
                  <SelectItem value="true">Finalized (Yes)</SelectItem>
                  <SelectItem value="false">Not Finalized (No)</SelectItem>
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

      <div className="mt-4">
        <DataView
          data={displayRows}
          isLoading={isLoading}
          getRowId={(row) => row.attendId}
          search={{
            placeholder: "Search by employee name or job number...",
            value: search,
            onChange: handleSearch,
          }}
          filter={{
            label: "Filter",
            onClick: () => setIsFilterOpen(!isFilterOpen),
          }}
          card={{
            icon: User,
            title: (row) => row.employeeName,
            subtitle: (row) => `Job Number: ${row.jobNumber || "-"}`,
            fields: [
              {
                icon: Clock,
                label: "Check In:",
                value: (row) => formatTime(row.checkInTime),
              },
              {
                icon: Clock,
                label: "Check Out:",
                value: (row) => formatTime(row.checkOutTime),
              },
              {
                icon: Briefcase,
                label: "Status:",
                value: (row) => row.status,
              }
            ],
          }}
          columns={columns}
          rowActionsMenu={rowActionsMenu}
          onRefresh={() => refetch()}
          pagination={{
            page: currentPage,
            totalPages,
            onPageChange: setPage,
            prevLabel: "Pre",
            nextLabel: "Next",
          }}
          emptyMessage="No details found"
        />
      </div>

      <ManualUpdateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        recordId={selectedRecordId}
      />
    </div>
  );
}

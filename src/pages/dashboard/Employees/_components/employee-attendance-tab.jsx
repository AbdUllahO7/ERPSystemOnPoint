import { useState, useMemo } from "react";
import { DataView } from "@/components/data-view/DataView";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeAttendanceHistory } from "@/lib/api";

export default function EmployeeAttendanceTab() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ logDate: "" });

  const params = useMemo(() => ({
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    LogDate: filters.logDate || undefined,
  }), [page, search, filters]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["getEmployeeAttendanceHistory", id, params],
    queryFn: () => getEmployeeAttendanceHistory(id, params),
    enabled: !!id,
  });

  const displayRows = useMemo(() => {
    if (!data?.data?.items) return [];
    return data.data.items.map((item, index) => {
      const dateObj = new Date(item.logTime);
      return {
        id: index + 1,
        date: dateObj.toLocaleDateString('en-GB'),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: item.logType === "CheckIn" ? "Check In" : item.logType === "CheckOut" ? "Check Out" : item.logType,
        notes: item.notes || "",
      };
    });
  }, [data]);
  
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-primary font-medium">#{row.id}</span>,
      sortable: true,
    },
    {
      key: "datetime",
      label: "Date & Time",
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.date}</span>
          <span className="text-muted-foreground">{row.time}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "type",
      label: "Log Type",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            row.type === "Check In"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.type}
        </span>
      ),
      sortable: true,
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => <span>{row.notes}</span>,
      sortable: true,
    },
  ];

  return (
    <div className="mt-4">
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
                Date
              </label>
              <Input
                type="date"
                value={filters.logDate || ""}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, logDate: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ logDate: "" });
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
          placeholder: "Search attendance...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        card={{
          icon: Clock,
          title: (row) => row.type,
          subtitle: (row) => `${row.date} ${row.time}`,
          fields: [
            {
              label: "ID:",
              value: (row) => `#${row.id}`,
            },
            {
              label: "Notes:",
              value: (row) => row.notes,
            },
          ],
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No attendance records found"
      />
    </div>
  );
}

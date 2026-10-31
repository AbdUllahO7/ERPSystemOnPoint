import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getSalaries } from "@/lib/api";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function EmployeeSalaryArchive() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ month: "", year: "" });

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => [
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear - 2), label: String(currentYear - 2) },
    { value: String(currentYear - 3), label: String(currentYear - 3) },
  ], [currentYear]);

  const params = useMemo(() => ({
    EmployeeId: id,
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    Month: filters.month ? parseInt(filters.month) : undefined,
    Year: filters.year ? parseInt(filters.year) : undefined,
  }), [id, page, search, filters]);

  const { data: salariesData, isLoading, refetch } = useQuery({
    queryKey: ["getSalariesArchive", params],
    queryFn: () => getSalaries(params),
    enabled: !!id,
  });

  const displayRows = salariesData?.data?.items || [];
  const totalPages = salariesData?.data?.totalPages || 1;
  const currentPage = salariesData?.data?.pageNumber || page;

  const formatMonthYear = (row) => {
    if (row.month) {
      const m = parseInt(row.month);
      const mLabel = !isNaN(m) && m >= 1 && m <= 12 ? MONTHS[m - 1].label : row.month;
      return `${mLabel} ${row.year || ""}`.trim();
    }
    if (row.date) {
      return new Date(row.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return "-";
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => (
        <span className="text-primary font-medium">
          #{typeof row.id === "string" ? row.id.slice(0, 8) : row.id}
        </span>
      ),
      sortable: true,
    },
    {
      key: "month",
      label: "Month",
      render: (row) => formatMonthYear(row),
      sortable: true,
    },
    {
      key: "baseSalary",
      label: "Base Salary",
      render: (row) => `$${Number(row.baseSalary || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "netSalary",
      label: "Net Amount",
      render: (row) => (
        <span className="font-semibold text-primary">
          ${Number(row.netSalary ?? row.netAmount ?? 0).toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isPaid = row.status === "Paid" || row.status === "Completed";
        const bg = isPaid
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
            {row.status || "Paid"}
          </span>
        );
      },
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4">
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
                Filter by Month
              </label>
              <Select
                value={filters.month || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({
                    ...prev,
                    month: val === "all" ? "" : val,
                  }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">
                Filter by Year
              </label>
              <Select
                value={filters.year || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({
                    ...prev,
                    year: val === "all" ? "" : val,
                  }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ month: "", year: "" });
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
          placeholder: "Search payroll records...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        card={{
          icon: DollarSign,
          title: (row) => formatMonthYear(row),
          subtitle: (row) => `Status: ${row.status || "Paid"}`,
          fields: [
            {
              label: "Net Amount:",
              value: (row) => `$${Number(row.netSalary ?? row.netAmount ?? 0).toLocaleString()}`,
            },
            {
              label: "Base Salary:",
              value: (row) => `$${Number(row.baseSalary || 0).toLocaleString()}`,
            },
          ],
        }}
        onRefresh={() => refetch()}
        columns={columns}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No payroll records found"
      />
    </div>
  );
}

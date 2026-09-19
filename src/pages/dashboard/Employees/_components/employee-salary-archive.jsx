import { useState } from "react";
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

export default function EmployeeSalaryArchive() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ month: "", year: "" });

  const mockData = [
    { id: "1", month: "October 2025", netAmount: "$18,500", status: "Paid" },
    { id: "2", month: "October 2025", netAmount: "$18,500", status: "Paid" },
  ];

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-primary font-medium">#{row.id}</span>,
      sortable: true,
    },
    { key: "month", label: "Month", sortable: true },
    { key: "netAmount", label: "Net Amount", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
          {row.status}
        </span>
      ),
      sortable: true 
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
            {[
              {
                key: "month",
                label: "Filter by Month",
                placeholder: "All Months",
                options: [{ value: "1", label: "January" }, { value: "2", label: "February" }],
              },
              {
                key: "year",
                label: "Filter by Year",
                placeholder: "All Years",
                options: [{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }],
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
      data={mockData}
      getRowId={(row) => row.id}
      selectable
      search={{
        placeholder: "Search by id or employee name...",
        value: search,
        onChange: setSearch,
      }}
      filter={{
        label: "Filter",
        onClick: () => setIsFilterOpen(!isFilterOpen),
      }}
      card={{
        icon: DollarSign,
        title: (row) => row.month,
        subtitle: (row) => `Status: ${row.status}`,
        fields: [
          {
            label: "Net Amount:",
            value: (row) => row.netAmount,
          },
        ],
      }}
      onRefresh={() => console.log("refresh")}
      onPrint={() => window.print()}
      export={{
        label: "Export",
        onClick: () => console.log("export"),
      }}
      onColumnSettings={() => console.log("columns")}
      columns={columns}
      pagination={{
        page: page,
        totalPages: 20,
        onPageChange: setPage,
        prevLabel: "Pre",
        nextLabel: "Next",
      }}
      emptyMessage="No payroll records found"
    />
    </div>
  );
}

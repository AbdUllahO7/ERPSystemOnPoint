import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataView } from "@/components/data-view/DataView";
import { Eye, Activity, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPerformance, deletePerformance } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

export default function EmployeePerformanceTab() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ month: "", year: "" });
  
  const [deleteId, setDeleteId] = useState(null);

  const params = useMemo(() => ({
    PageNumber: page,
    PageSize: 10,
    Search: search || undefined,
    Month: filters.month ? parseInt(filters.month) : undefined,
    Year: filters.year ? parseInt(filters.year) : undefined,
  }), [page, search, filters]);

  const { data: performanceData, isLoading, refetch } = useQuery({
    queryKey: ["getPerformance", id, params],
    queryFn: () => getPerformance(id, params),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (delId) => deletePerformance(delId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getPerformance"]);
      toast.success("Performance record deleted successfully!");
      setDeleteId(null);
    },
    onError: (error) => {
      console.error("Failed to delete performance:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete performance record!");
      setDeleteId(null);
    }
  });

  const displayRows = performanceData?.data?.items || [];
  const totalPages = performanceData?.data?.totalPages || 1;
  const currentPage = performanceData?.data?.pageNumber || page;

  const columns = [
    {
      key: "date",
      label: "Date Added",
      render: (row) => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "type",
      label: "Status",
      render: (row) => {
        const bg = row.type === "Negative" ? "bg-red-50 text-red-600" : "bg-green-100 text-green-700";
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
            {row.type}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "note",
      label: "Notes",
      sortable: true,
    }
  ];

  const rowActionsMenu = useMemo(() => [
    {
      items: [
        {
          label: "Edit",
          icon: Edit,
          onClick: (row) => navigate(`/dashboard/hr/employees/${id || 1}/performance/add`, { state: { editItem: row } }),
        },
        {
          label: "Delete",
          icon: Trash2,
          destructive: true,
          onClick: (row) => setDeleteId(row.id),
        },
      ],
    },
  ], [navigate, id]);

  const renderRowActions = (row) => (
    <Button
      variant="ghost"
      size="icon"
      className="text-[#0066d1] hover:bg-blue-50 hover:text-blue-700"
      onClick={() => navigate(`/dashboard/hr/employees/${id || 1}/performance/${row.id}`)}
    >
      <Eye className="w-5 h-5" />
    </Button>
  );

  return (
    <div className="mt-4 space-y-4">
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
                options: Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() })),
              },
              {
                key: "year",
                label: "Filter by Year",
                placeholder: "All Years",
                options: [{ value: "2026", label: "2026" }, { value: "2025", label: "2025" }, { value: "2024", label: "2024" }],
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
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search performances...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        card={{
          icon: Activity,
          title: (row) => row.type,
          subtitle: (row) => new Date(row.date).toLocaleDateString(),
          fields: [
            {
              label: "Status:",
              value: (row) => {
                const bg = row.type === "Negative" ? "bg-red-50 text-red-600" : "bg-green-100 text-green-700";
                return (
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${bg}`}>
                    {row.type}
                  </span>
                );
              },
            },
          ],
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add Performance",
          onClick: () => navigate(`/dashboard/hr/employees/${id}/performance/add`),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        renderRowActions={renderRowActions}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No performance records found"
      />

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Performance Record"
        description="Are you sure you want to delete this record? This action cannot be undone."
      />
    </div>
  );
}

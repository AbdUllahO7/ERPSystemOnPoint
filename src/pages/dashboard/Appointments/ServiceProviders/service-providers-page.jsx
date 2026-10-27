import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { PageTitle } from "@/components/common/page-title";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  getServiceProviders,
  getServiceProvidersStats,
  deleteServiceProvider,
  DAYS_OF_WEEK,
  INITIAL_SERVICE_PROVIDERS_STATS,
} from "@/services/appointments";

export default function ServiceProvidersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["serviceProvidersStats"],
    queryFn: getServiceProvidersStats,
  });
  const stats =
    statsData?.data && statsData.data.length > 0
      ? statsData.data
      : INITIAL_SERVICE_PROVIDERS_STATS;

  // Params for Providers Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: selectedStatus !== "all" ? selectedStatus : undefined,
      Day: selectedDay !== "all" ? selectedDay : undefined,
    }),
    [page, search, selectedStatus, selectedDay]
  );

  // Providers Query
  const {
    data: providersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["serviceProviders", params],
    queryFn: () => getServiceProviders(params),
  });

  const displayRows = providersData?.data?.items || [];
  const totalPages = providersData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteServiceProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["serviceProviders"]);
      toast.success("Service provider deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete service provider!");
      setDeleteRowId(null);
    },
  });

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "view",
            label: "View Details",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/appointments/service-providers/${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Provider",
            icon: Pencil,
            onClick: (row) =>
              navigate(`/dashboard/appointments/service-providers/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete Provider",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Provider ID",
        cell: ({ row }) => {
          const id = row.original.id;
          const shortId =
            typeof id === "string" && id.length > 8
              ? `${id.slice(0, 8)}...`
              : id;
          return (
            <Link
              to={`/dashboard/appointments/service-providers/${id}`}
              className="font-semibold text-primary hover:underline font-mono text-xs"
              title={id}
            >
              {shortId}
            </Link>
          );
        },
      },
      {
        accessorKey: "hrEmployeeId",
        header: "HR Employee ID",
        cell: ({ row }) => {
          const empId = row.original.hrEmployeeId;
          return empId ? (
            <span
              className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded"
              title={empId}
            >
              {empId.length > 8 ? `${empId.slice(0, 8)}...` : empId}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60">— (Unassigned)</span>
          );
        },
      },
      {
        accessorKey: "workingDays",
        header: "Working Days",
        cell: ({ row }) => {
          const days = row.original.workingDays;
          const daysList = Array.isArray(days) ? days : [];
          return (
            <div className="flex flex-wrap gap-1">
              {daysList.length > 0 ? (
                daysList.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {d}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">All Days Off</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = Boolean(row.original.isActive);
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Service Providers"
        infoTooltip="Manage and schedule your service providers and doctors"
      />

      {/* Top 4 Stats Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${card.color}`}
                >
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-normal leading-snug">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-bold text-slate-800">
                      {card.value}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        card.isUp ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {card.trend}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {card.isUp ? (
                  <ArrowUp className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table with DataView */}
      <DataView
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        rowActionsMenu={rowActionsMenu}
        searchPlaceholder="Search by provider ID or HR employee ID..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => navigate("/dashboard/appointments/service-providers/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting service providers...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Filter by Status
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => {
                  setSelectedStatus(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Working Day
              </Label>
              <Select
                value={selectedDay}
                onValueChange={(val) => {
                  setSelectedDay(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full} ({d.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus("all");
                  setSelectedDay("all");
                  setPage(1);
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="bg-[#0066d1] hover:bg-[#0052a8]"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        }
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="Delete Service Provider"
        description="Are you sure you want to delete this service provider? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

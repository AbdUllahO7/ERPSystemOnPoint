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
  const stats = statsData?.data || [];

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
        accessorKey: "employeeId",
        header: "Employee ID",
        cell: ({ row }) => (
          <span className="font-normal text-[#1e293b] text-sm">
            {row.original.employeeId}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/appointments/service-providers/${row.original.id}`}
            className="text-sm font-normal text-slate-800 hover:text-blue-600 transition-colors"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm font-normal text-slate-700">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: "workingDays",
        header: "Working Days",
        cell: ({ row }) => {
          const days = row.original.workingDays;
          const text = Array.isArray(days) ? days.join("-") : days || "-";
          return <span className="text-sm font-normal text-slate-700">{text}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "Active";
          const isActive = status.toLowerCase() === "active";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-normal ${
                isActive
                  ? "bg-[#eaf8f1] text-[#22c55e]"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {status}
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
        searchPlaceholder="Search by id or employee name..."
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

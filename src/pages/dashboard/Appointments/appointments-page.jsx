import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  Eye,
  RefreshCcw,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
  getAppointments,
  getAppointmentStats,
  deleteAppointment,
  changeAppointmentStatus,
  getAppointmentLookups,
} from "@/services/appointments";

const statusStyles = {
  Completed:
    "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Scheduled:
    "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Confirmed:
    "bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
  "In Progress":
    "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  "No Show":
    "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [filters, setFilters] = useState({
    provider: "all",
    service: "all",
    status: "all",
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["appointmentLookups"],
    queryFn: getAppointmentLookups,
  });
  const lookups = lookupsData?.data || {
    statuses: ["All", "Scheduled", "Confirmed", "In Progress", "Completed", "No Show"],
    providers: [],
    services: [],
  };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["appointmentStats"],
    queryFn: getAppointmentStats,
  });
  const stats = statsData?.data || [];

  // Params for Appointments Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: activeTab !== "All" ? activeTab : undefined,
      Provider: filters.provider !== "all" ? filters.provider : undefined,
      Service: filters.service !== "all" ? filters.service : undefined,
    }),
    [page, search, activeTab, filters]
  );

  // Appointments Query
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ["appointments", params],
    queryFn: () => getAppointments(params),
  });

  const displayRows = appointmentsData?.data?.items || [];
  const totalPages = appointmentsData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete appointment!");
      setDeleteRowId(null);
    },
  });

  // Change Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeAppointmentStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment status updated!");
      setIsStatusDialogOpen(false);
      setSelectedAppointment(null);
    },
    onError: () => {
      toast.error("Failed to update status!");
    },
  });

  const handleStatusChange = () => {
    if (selectedAppointment && newStatus) {
      statusMutation.mutate({
        id: selectedAppointment.id,
        status: newStatus,
      });
    }
  };

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "Actions",
        items: [
          {
            key: "view",
            label: "View Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/appointments/${row.id}`),
          },
          {
            key: "change-status",
            label: "Change Status",
            icon: RefreshCcw,
            onClick: (row) => {
              setSelectedAppointment(row);
              setNewStatus(row.status);
              setIsStatusDialogOpen(true);
            },
          },
          {
            key: "edit",
            label: "Edit Appointment",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/appointments/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete",
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
        key: "id",
        label: "ID",
        sortable: true,
        render: (row) => (
          <Link
            to={`/dashboard/appointments/${row.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.id}
          </Link>
        ),
      },
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-foreground">{row.customer}</span>
        ),
      },
      {
        key: "service",
        label: "Service",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.service}</span>
        ),
      },
      {
        key: "provider",
        label: "Provider",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.provider}</span>
        ),
      },
      {
        key: "date",
        label: "Date",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.date}</span>
        ),
      },
      {
        key: "time",
        label: "Time",
        sortable: true,
        render: (row) => (
          <span className="text-muted-foreground">{row.time}</span>
        ),
      },
      {
        key: "total",
        label: "Total",
        sortable: true,
        render: (row) => (
          <span className="font-semibold text-primary">{row.total}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        render: (row) => {
          const badgeClass =
            statusStyles[row.status] ||
            "bg-muted text-muted-foreground border border-border";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
            >
              {row.status}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <PageTitle
        title="Appointments"
        infoText="Overview and appointments schedule management"
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${stat.color}`}
              >
                {Icon && <Icon className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      stat.isUp ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {stat.trend} {stat.isUp ? "↑" : "↓"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DataView Table with Integrated Tabs & Toolbar */}
      <DataView
        tabs={{
          items: lookups.statuses,
          activeTab: activeTab,
          onChange: (tab) => {
            setActiveTab(tab);
            setPage(1);
          },
        }}
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen((prev) => !prev),
        }}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="flex flex-wrap items-end gap-4 p-2">
            <div className="w-full flex-1 min-w-[180px]">
              <Label className="mb-1.5 block text-xs font-medium text-foreground">
                Filter by Provider
              </Label>
              <Select
                value={filters.provider}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, provider: val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-card">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {lookups.providers.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex-1 min-w-[180px]">
              <Label className="mb-1.5 block text-xs font-medium text-foreground">
                Filter by Service
              </Label>
              <Select
                value={filters.service}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, service: val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full bg-card">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {lookups.services.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(filters.provider !== "all" || filters.service !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ provider: "all", service: "all", status: "all" });
                  setPage(1);
                }}
                className="h-10"
              >
                Clear Filters
              </Button>
            )}
          </div>
        }
        onRefresh={() => {
          refetch();
          toast.success("Appointments refreshed!");
        }}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => toast.success("Exporting appointments..."),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/appointments/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No appointments found"
      />

      {/* Change Status Modal */}
      <DynamicModal
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Change Appointment Status"
        description={`Update status for Appointment #${selectedAppointment?.id} (${selectedAppointment?.customer})`}
        icon={RefreshCcw}
        submitLabel="Update Status"
        onSubmit={handleStatusChange}
        isLoading={statusMutation.isPending}
      >
        <div className="py-2 space-y-2">
          <Label className="text-xs font-medium text-foreground">
            Select New Status
          </Label>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {lookups.statuses
                .filter((t) => t !== "All")
                .map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </DynamicModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteRowId}
        onClose={() => setDeleteRowId(null)}
        onConfirm={() => {
          if (deleteRowId) {
            deleteMutation.mutate(deleteRowId);
          }
        }}
        isLoading={deleteMutation.isPending}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calendar,
  Sparkles,
  Building2,
  Users,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";
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
  getEvents,
  getEventsStats,
  deleteEvent,
  EVENT_STATUS_TABS,
  getEventLookups,
} from "@/services/events";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedService, setSelectedService] = useState("all");
  const [selectedResource, setSelectedResource] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["eventLookups"],
    queryFn: getEventLookups,
  });
  const lookups = lookupsData?.data || {
    services: [],
    resources: [],
    providers: [],
    statuses: [],
  };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["eventsStats"],
    queryFn: getEventsStats,
  });
  const stats = statsData?.data || [];

  // Params for Events Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: activeTab !== "all" ? activeTab : undefined,
      Service: selectedService !== "all" ? selectedService : undefined,
      ResourceId: selectedResource !== "all" ? selectedResource : undefined,
      Provider: selectedProvider !== "all" ? selectedProvider : undefined,
    }),
    [page, search, activeTab, selectedService, selectedResource, selectedProvider]
  );

  // Events Query
  const {
    data: eventsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["events", params],
    queryFn: () => getEvents(params),
  });

  const displayRows = eventsData?.data?.items || [];
  const totalPages = eventsData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["events"]);
      toast.success("Event deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete event!");
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
            label: "View Details (عرض التفاصيل)",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/events/${row.id}`),
          },
          {
            key: "reservations",
            label: "View Reservations (عرض سجل الحجوزات)",
            icon: Users,
            onClick: (row) => navigate(`/dashboard/reservations?bookingEventId=${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Event (تعديل الحدث)",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/events/edit/${row.id}`),
          },
          {
            key: "delete",
            label: "Delete (حذف)",
            icon: Trash2,
            variant: "destructive",
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "booked") return "bg-blue-50 text-[#0066d1] border-blue-200";
    if (s.includes("checked")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "completed") return "bg-slate-100 text-slate-700 border-slate-200";
    if (s === "canceled") return "bg-rose-50 text-rose-700 border-rose-200 line-through";
    if (s.includes("show")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-blue-50 text-[#0066d1] border-blue-200";
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Ref / Code",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/events/${row.original.id}`}
            className="font-semibold text-[#0066d1] hover:underline text-xs flex items-center gap-1.5 font-mono"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {row.original.code || `EVT-${row.original.id}`}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Event & Service",
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              {row.original.title}
            </span>
            <span className="text-[11px] text-slate-500">
              {row.original.service || "Standard Service"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "resource",
        header: "Resource / Venue",
        cell: ({ row }) => {
          const resId = row.original.resourceId;
          return (
            <div>
              {resId ? (
                <Link
                  to={`/dashboard/resources/${resId}`}
                  className="text-xs font-medium text-slate-800 hover:text-[#0066d1] hover:underline flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {row.original.resource}
                </Link>
              ) : (
                <span className="text-xs font-normal text-slate-700">
                  {row.original.resource}
                </span>
              )}
              <span className="text-[10px] text-slate-400 block">
                {row.original.provider || "General Host"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "period",
        header: "Period & Time",
        cell: ({ row }) => {
          const isOvernight = row.original.startTime && row.original.endTime && row.original.endTime <= row.original.startTime;
          return (
            <div>
              <span className="text-xs font-medium text-slate-700 block">
                {row.original.period || "All Season"}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                {row.original.time}
                {isOvernight && (
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded border border-indigo-200">
                    Overnight
                  </span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "recurringDays",
        header: "Recurring Days",
        cell: ({ row }) => {
          const days = row.original.recurringDays || [];
          if (days.length === 0) {
            return <span className="text-xs text-slate-400">Daily / Single</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[130px]">
              {days.map((d) => (
                <span
                  key={d}
                  className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#0066d1] border border-blue-200/60"
                >
                  {d}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <div>
            <span className="text-xs font-bold text-[#0066d1]">
              {row.original.price}
            </span>
            {row.original.deposit && (
              <span className="text-[10px] text-slate-400 block">
                عربون: {row.original.deposit}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "reservedMax",
        header: "Capacity (Reserved / Max)",
        cell: ({ row }) => {
          const reserved = row.original.reserved || 0;
          const max = row.original.maxCapacity || 20;
          const pct = max > 0 ? Math.min(100, Math.round((reserved / max) * 100)) : 0;
          return (
            <div className="space-y-1 min-w-[85px]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{reserved}/{max}</span>
                <span className="text-[10px] text-slate-400 font-normal">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 100 ? "bg-rose-500" : pct >= 75 ? "bg-amber-500" : "bg-[#0066d1]"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
              row.original.status
            )}`}
          >
            {row.original.status || "Booked"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Title with Info Badge */}
      <PageTitle
        title="Events & Bookings (الأحداث والأيام المتكررة)"
        infoTooltip="طرح الخدمات في موارد ومواعيد محددة مع ضبط الأيام المتكررة، السعة المحجوزة، وأسعار التذاكر."
      />

    
      {/* Top 4 Stats Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
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

      {/* Main Table with DataView & Tabs inside table container */}
      <DataView
        tabs={{
          items: EVENT_STATUS_TABS,
          activeTab: activeTab,
          onChange: (tabId) => {
            setActiveTab(tabId);
            setPage(1);
          },
        }}
        data={displayRows}
        columns={columns}
        isLoading={isLoading}
        rowActionsMenu={rowActionsMenu}
        searchPlaceholder="ابحث باسم الحدث، الرقم المرجعي، أو القاعة..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => navigate("/dashboard/events/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting events...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Service (الخدمة / الصنف)
              </Label>
              <Select
                value={selectedService}
                onValueChange={(val) => {
                  setSelectedService(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services (جميع الخدمات)</SelectItem>
                  {lookups.services.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Resource (المكان / المورد)
              </Label>
              <Select
                value={selectedResource}
                onValueChange={(val) => {
                  setSelectedResource(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources (جميع الموارد)</SelectItem>
                  {lookups.resources.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Provider (مقدم الخدمة)
              </Label>
              <Select
                value={selectedProvider}
                onValueChange={(val) => {
                  setSelectedProvider(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers (جميع مقدمي الخدمات)</SelectItem>
                  {lookups.providers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
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
                  setSelectedService("all");
                  setSelectedResource("all");
                  setSelectedProvider("all");
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
                Apply Filters
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
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

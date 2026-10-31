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
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";
import toast from "react-hot-toast";
import { useI18n } from "@/context/translate-api";
import {
  getEvents,
  getEventsStats,
  deleteEvent,
  EVENT_STATUS_TABS,
  getEventLookups,
} from "@/services/events";

export default function EventsPage() {
  const { t } = useI18n();
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
            label: t?.eventsModule?.viewDetails || "View Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/events/${row.id}`),
          },
          {
            key: "reservations",
            label: t?.eventsModule?.viewReservations || "View Reservations",
            icon: Users,
            onClick: (row) => {
              const targetId = row?.id || row?.original?.id;
              const targetTitle = row?.title || row?.original?.title || "";
              navigate(`/dashboard/reservations?bookingEventId=${targetId}`, {
                state: { bookingEventId: targetId, eventTitle: targetTitle },
              });
            },
          },
          {
            key: "edit",
            label: t?.eventsModule?.editEvent || "Edit Event",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/events/edit/${row.id}`),
          },
          {
            key: "delete",
            label: t?.eventsModule?.delete || "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate, t]
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
          const targetId = row.original.id;
          const targetTitle = row.original.title;
          return (
            <div
              className="space-y-1 min-w-[85px] cursor-pointer group"
              title="Click to view reservations for this event"
              onClick={() =>
                navigate(`/dashboard/reservations?bookingEventId=${targetId}`, {
                  state: { bookingEventId: targetId, eventTitle: targetTitle },
                })
              }
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-[#0066d1] transition-colors">
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
        title={t?.eventsModule?.title || "Events & Bookings"}
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

      {/* Collapsible Filter Bar */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "service",
            label: t?.eventsModule?.service || "Service",
            placeholder: t?.eventsModule?.allServices || "All Services",
            options: (lookups.services || []).map((s) => ({
              value: String(s.id),
              label: s.name,
            })),
          },
          {
            key: "resource",
            label: t?.eventsModule?.resource || "Resource",
            placeholder: t?.eventsModule?.allResources || "All Resources",
            options: (lookups.resources || []).map((r) => ({
              value: String(r.id),
              label: r.name,
            })),
          },
          {
            key: "provider",
            label: t?.eventsModule?.provider || "Provider",
            placeholder: t?.eventsModule?.allProviders || "All Providers",
            options: (lookups.providers || []).map((p) => ({
              value: String(p.id),
              label: p.name,
            })),
          },
        ]}
        filters={{
          service: selectedService !== "all" ? selectedService : "",
          resource: selectedResource !== "all" ? selectedResource : "",
          provider: selectedProvider !== "all" ? selectedProvider : "",
        }}
        onFilterChange={(key, val) => {
          if (key === "service") setSelectedService(val || "all");
          if (key === "resource") setSelectedResource(val || "all");
          if (key === "provider") setSelectedProvider(val || "all");
          setPage(1);
        }}
        onClear={() => {
          setSelectedService("all");
          setSelectedResource("all");
          setSelectedProvider("all");
          setPage(1);
        }}
      />

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
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
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

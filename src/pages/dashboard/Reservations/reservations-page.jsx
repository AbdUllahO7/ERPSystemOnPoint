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
  FileText,
  Building2,
  Users,
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
import { useI18n } from "@/context/translate-api";
import {
  getReservations,
  getReservationsStats,
  deleteReservation,
  RESERVATION_STATUS_TABS,
  getReservationLookups,
  INITIAL_RESERVATIONS_STATS,
} from "@/services/reservations";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ReservationsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || { customers: [], events: [] };

  // Stats Query with Fallback
  const { data: statsData } = useQuery({
    queryKey: ["reservationsStats"],
    queryFn: getReservationsStats,
  });
  const stats =
    statsData?.data && statsData.data.length > 0
      ? statsData.data
      : INITIAL_RESERVATIONS_STATS;

  // Params for Reservations Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: activeTab !== "all" ? activeTab : undefined,
      CustomerId: selectedCustomer !== "all" ? selectedCustomer : undefined,
      BookingEventId: selectedEvent !== "all" ? selectedEvent : undefined,
    }),
    [page, search, activeTab, selectedCustomer, selectedEvent]
  );

  // Reservations Query
  const {
    data: reservationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["reservations", params],
    queryFn: () => getReservations(params),
  });

  const displayRows = reservationsData?.data?.items || [];
  const totalPages = reservationsData?.data?.totalPages || 1;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["events"]);
      toast.success("Reservation canceled successfully!");
      setDeleteRowId(null);
    },
    onError: (err) => {
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to cancel reservation!";
      toast.error(errMsg);
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
            label: t?.reservationsModule?.viewDetails || "View Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/reservations/${row.id}`),
          },
          {
            key: "delete",
            label: t?.reservationsModule?.cancelReservation || "Cancel Reservation",
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
    const s = String(status || "").toLowerCase().replace("-", "");
    switch (s) {
      case "booked":
        return "bg-blue-50 text-[#0066d1] border-blue-200";
      case "checkedin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "canceled":
        return "bg-rose-50 text-rose-700 border-rose-200 line-through";
      case "noshow":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Ref / ID",
        cell: ({ row }) => {
          const id = row.original.id;
          const shortId =
            typeof id === "string" && id.length > 8
              ? `${id.slice(0, 8)}...`
              : id;
          return (
            <Link
              to={`/dashboard/reservations/${id}`}
              className="text-xs font-semibold text-[#0066d1] hover:underline font-mono"
              title={id}
            >
              #{shortId}
            </Link>
          );
        },
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-800 block">
            {row.original.customerName || row.original.customer || "—"}
          </span>
        ),
      },
      {
        accessorKey: "bookingEventTitle",
        header: "Event",
        cell: ({ row }) => {
          const eventTitle = row.original.bookingEventTitle || row.original.event || "—";
          const eventId = row.original.bookingEventId;
          return eventId ? (
            <Link
              to={`/dashboard/events/${eventId}`}
              className="text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors block"
            >
              {eventTitle}
            </Link>
          ) : (
            <span className="text-xs font-medium text-slate-700 block">
              {eventTitle}
            </span>
          );
        },
      },
      {
        accessorKey: "eventPeriod",
        header: "Event Dates",
        cell: ({ row }) => {
          const start = formatDate(row.original.eventStartDate);
          const end = formatDate(row.original.eventEndDate);
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {start} – {end}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "seats",
        header: "Seats (Active / Total)",
        cell: ({ row }) => {
          const total = Number(row.original.quantity) || 1;
          const canceled = Number(row.original.canceledQuantity) || 0;
          const active = Math.max(0, total - canceled);
          return (
            <div>
              <span className="text-xs font-bold text-slate-800">
                {active} نشط
              </span>
              <span className="text-[11px] text-slate-400 block">
                من أصل {total} مقعد {canceled > 0 && `(${canceled} ملغى)`}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "invoiceId",
        header: "Invoice",
        cell: ({ row }) => {
          const invoiceId = row.original.invoiceId;
          if (!invoiceId) {
            return <span className="text-xs text-slate-400">—</span>;
          }
          const shortInvoice =
            typeof invoiceId === "string" && invoiceId.length > 8
              ? `${invoiceId.slice(0, 8)}...`
              : invoiceId;
          return (
            <Link
              to={`/dashboard/accounting/invoices/${invoiceId}`}
              className="inline-flex items-center gap-1 text-xs font-mono text-[#0066d1] hover:underline"
              title={invoiceId}
            >
              <FileText className="w-3 h-3 text-slate-400" />
              <span>#{shortInvoice}</span>
            </Link>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "Booked";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                status
              )}`}
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
        title={t?.reservationsModule?.title || "Reservations & Bookings"}
        infoTooltip="إدارة حجوزات العملاء في الفعاليات، متابعة المقاعد، وتفاصيل الفواتير."
      />

      {/* Top 4 Stats Cards */}
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

      {/* Main Table with DataView */}
      <DataView
        tabs={{
          items: RESERVATION_STATUS_TABS,
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
        searchPlaceholder="ابحث برقم الحجز، اسم العميل، أو الفعالية..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onAdd={() => navigate("/dashboard/reservations/add")}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        onExport={() => toast.success("Exporting reservations...")}
        onFilter={() => setIsFilterOpen(true)}
        isFilterOpen={isFilterOpen}
        onCloseFilter={() => setIsFilterOpen(false)}
        filterContent={
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                {t?.reservationsModule?.customer || "Customer"}
              </Label>
              <Select
                value={selectedCustomer}
                onValueChange={(val) => {
                  setSelectedCustomer(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.reservationsModule?.allCustomers || "All Customers"}</SelectItem>
                  {lookups.customers?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                {t?.reservationsModule?.event || "Booking Event"}
              </Label>
              <Select
                value={selectedEvent}
                onValueChange={(val) => {
                  setSelectedEvent(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.reservationsModule?.allEvents || "All Events"}</SelectItem>
                  {lookups.events?.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
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
                  setSelectedCustomer("all");
                  setSelectedEvent("all");
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

      {/* Delete / Cancel Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!deleteRowId}
        onOpenChange={(open) => !open && setDeleteRowId(null)}
        title="Cancel Reservation"
        description="Are you sure you want to cancel this reservation?"
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

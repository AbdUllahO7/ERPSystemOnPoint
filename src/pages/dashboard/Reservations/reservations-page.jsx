import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Users,
  Calendar,
  CheckCircle2,
  DollarSign,
  XCircle,
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
  getReservations,
  getReservationsStats,
  deleteReservation,
  RESERVATION_STATUS_TABS,
  getReservationLookups,
} from "@/services/reservations";

export default function ReservationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || { paymentMethods: [], customers: [], events: [] };

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["reservationsStats"],
    queryFn: getReservationsStats,
  });
  const stats = statsData?.data || [];

  // Params for Reservations Query
  const params = useMemo(
    () => ({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      Status: activeTab !== "all" ? activeTab : undefined,
      Payment: selectedPayment !== "all" ? selectedPayment : undefined,
      CustomerId: selectedCustomer !== "all" ? selectedCustomer : undefined,
      BookingEventId: selectedEvent !== "all" ? selectedEvent : undefined,
    }),
    [page, search, activeTab, selectedPayment, selectedCustomer, selectedEvent]
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
      toast.success("Reservation canceled and released successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to cancel reservation!");
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
            onClick: (row) => navigate(`/dashboard/reservations/${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Reservation (تعديل الحجز)",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/reservations/edit/${row.id}`),
          },
          {
            key: "delete",
            label: "Cancel / Refund (إلغاء واسترداد)",
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
        cell: ({ row }) => (
          <Link
            to={`/dashboard/reservations/${row.original.id}`}
            className="text-xs font-semibold text-[#0066d1] hover:underline font-mono"
          >
            #{row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-800 block">
            {row.original.customer}
          </span>
        ),
      },
      {
        accessorKey: "event",
        header: "Event",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700 block">
            {row.original.event}
          </span>
        ),
      },
      {
        accessorKey: "qty",
        header: "Seats (Active / Total)",
        cell: ({ row }) => {
          const total = row.original.qty || 1;
          const canceled = row.original.canceled || 0;
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
        accessorKey: "payment",
        header: "Payment Method",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-600">
            {row.original.payment}
          </span>
        ),
      },
      {
        accessorKey: "paid",
        header: "Paid (المستلم)",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-[#0066d1]">
            {row.original.paid}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total (الإجمالي)",
        cell: ({ row }) => (
          <span className="text-xs font-bold text-slate-800">
            {row.original.total}
          </span>
        ),
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
        title="Reservations & Bookings (حجز العميل والإلغاء الجزئي)"
        infoTooltip="إدارة حجوزات العملاء في الفعاليات، متابعة المقاعد النشطة والملغاة، وتسوية المستحقات المالية."
      />

      {/* Page 8 System Guidance Banner */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-indigo-50/30 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0066d1] text-white">
                <Sparkles className="w-3.5 h-3.5" />
                08 / فهم النظام: حجز العميل والإلغاء الجزئي
              </span>
              <span className="text-xs text-slate-500">الحدث يحدد العرض المتاح، والحجز يربط العميل بالكمية التي اختارها</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>قواعد الحجز والإلغاء المعتمدة:</strong> التحقق من توفر المقاعد (المحجوز الحالي + الطلب &le; سعة الحدث). عند الإلغاء الجزئي أو الكامل، يتم تحرير المقاعد للحدث آلياً، والتحقق من التسوية المالية: <em>المرتجع ليس دائماً استرداداً نقدياً</em>؛ فالفواتير الآجلة أو المدفوعة جزئياً يقل الدين على العميل أولاً قبل دفع أي مبالغ نقدية.
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>تحقق السعة: المحجوز + الطلب &le; السعة</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>إلغاء جزئي: تحرير المقاعد وتسوية الدين</span>
            </div>
          </div>
        </div>
      </div>

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
                Customer (العميل)
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
                  <SelectItem value="all">All Customers (جميع العملاء)</SelectItem>
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
                Booking Event (الحدث)
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
                  <SelectItem value="all">All Events (جميع الأحداث)</SelectItem>
                  {lookups.events?.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600">
                Payment Method (طريقة الدفع)
              </Label>
              <Select
                value={selectedPayment}
                onValueChange={(val) => {
                  setSelectedPayment(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {lookups.paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
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
                  setSelectedPayment("all");
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
        title="Cancel Reservation & Release Seats"
        description="Are you sure you want to cancel this reservation? All remaining seats will be released back to the event capacity."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

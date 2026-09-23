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

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || { paymentMethods: [] };

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
    }),
    [page, search, activeTab, selectedPayment]
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
      toast.success("Reservation deleted successfully!");
      setDeleteRowId(null);
    },
    onError: () => {
      toast.error("Failed to delete reservation!");
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
            onClick: (row) => navigate(`/dashboard/reservations/${row.id}`),
          },
          {
            key: "edit",
            label: "Edit Reservation",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/reservations/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete Reservation",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteRowId(row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-[#eaf4ff] text-[#0066d1]";
      case "checked-in":
        return "bg-[#f3e8ff] text-[#9333ea]";
      case "completed":
        return "bg-[#eaf8f1] text-[#22c55e]";
      case "canceled":
        return "bg-[#fee2e2] text-[#ef4444]";
      case "no-show":
        return "bg-[#fff7ed] text-[#ea580c]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Link
            to={`/dashboard/reservations/${row.original.id}`}
            className="text-xs font-semibold text-[#0066d1] hover:underline"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.customer}
          </span>
        ),
      },
      {
        accessorKey: "event",
        header: "Event",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.event}
          </span>
        ),
      },
      {
        accessorKey: "qty",
        header: "Qty",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.qty}
          </span>
        ),
      },
      {
        accessorKey: "canceled",
        header: "Canceled",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.canceled ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <span className="text-xs font-normal text-slate-700">
            {row.original.payment}
          </span>
        ),
      },
      {
        accessorKey: "paid",
        header: "Paid",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
            {row.original.paid}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-[#0066d1]">
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
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
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
        title="Reservations"
        infoTooltip="Manage all customer reservations, event ticket bookings, and attendee check-ins."
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
        searchPlaceholder="Search by id or employee name..."
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
                Payment Method
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
        title="Delete Reservation"
        description="Are you sure you want to delete this reservation? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteRowId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

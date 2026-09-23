import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "@/components/common/dynamic-modal";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getEventById,
  changeEventStatus,
  getEventLookups,
} from "@/services/events";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Booked");
  const [page, setPage] = useState(1);

  // Event Details Query
  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
  });
  const event = eventData?.data || {};

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["eventLookups"],
    queryFn: getEventLookups,
  });
  const lookups = lookupsData?.data || { statuses: [] };

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeEventStatus({ id, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["event", id]);
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || "Event status updated!");
      setIsStatusModalOpen(false);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleStatusSubmit = (e) => {
    e?.preventDefault();
    statusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "booked":
        return "bg-blue-50 text-[#0066d1]";
      case "checked-in":
        return "bg-emerald-50 text-emerald-600";
      case "completed":
        return "bg-slate-100 text-slate-700";
      case "canceled":
        return "bg-rose-50 text-rose-600 line-through";
      case "no-show":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-blue-50 text-[#0066d1]";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const reservedCount = event.reserved ?? 1;
  const maxCap = event.maxCapacity ?? 10;
  const remainingSeats = Math.max(0, maxCap - reservedCount);
  const capacityPercent = maxCap > 0 ? Math.min(100, Math.round((reservedCount / maxCap) * 100)) : 0;
  const reservationsList = event.reservations || [];

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumbs and Change Status Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title="Event Details"
          breadcrumbLinks={[
            { label: "Events", href: "/dashboard/events" },
            { label: "Event Details" },
          ]}
          infoTooltip="Detailed event specifications, allocated capacity, and attendee reservation list."
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setNewStatus(event.status || "Booked");
            setIsStatusModalOpen(true);
          }}
          className="h-10 gap-2 rounded-xl border-[#0066d1]/40 text-[#0066d1] bg-white hover:bg-blue-50/50 text-xs font-semibold px-4 cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-[#0066d1]" />
          Change Status
        </Button>
      </div>

      {/* Top Grid: Left 8 cols (Event Details) + Right 4 cols (Capacity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Event Details (8 cols) matching Image 3 */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">
            Event Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-800">Code</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.code || "code"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Service</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.service || "Service"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Resource</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.resource || "Resource"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Provider</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.provider || "Provider"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Period</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.period || "Period"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Time</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.time || "Time"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Price</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.price || "Price"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Deposit</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.deposit || "Deposit"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Recurring</p>
              <p className="text-xs text-slate-500 mt-1">
                {event.recurringDays && event.recurringDays.length > 0
                  ? event.recurringDays.join(", ")
                  : "Sat, Mon, Wed"}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Capacity Card (4 cols) matching Image 3 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">
            Capacity
          </h2>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">
                {reservedCount}
              </span>
              <span className="text-xl font-bold text-slate-400">
                / {maxCap}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {remainingSeats} seats remaining
            </p>
          </div>

          {/* Progress Bar matching mockup */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-3">
            <div
              className="bg-[#0066d1] h-full rounded-full transition-all duration-500"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Card: Reservations on this Event matching Image 3 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-800">
          Reservations on this Event
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-start font-medium">
                <th className="py-3 px-4 text-start font-semibold text-slate-700">
                  ID
                </th>
                <th className="py-3 px-4 text-start font-semibold text-slate-700">
                  Customer
                </th>
                <th className="py-3 px-4 text-start font-semibold text-slate-700">
                  Qty
                </th>
                <th className="py-3 px-4 text-start font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservationsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No reservations found for this event
                  </td>
                </tr>
              ) : (
                reservationsList.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-[#0066d1]">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal">
                      {item.customer}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-normal">
                      {item.qty}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination matching Figma Image 3 */}
        <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-slate-100 text-xs">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
          >
            Pre
          </button>
          <button
            type="button"
            onClick={() => setPage(1)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 1
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setPage(2)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 2
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            2
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button
            type="button"
            onClick={() => setPage(20)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer ${
              page === 20
                ? "bg-[#0066d1] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            20
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Change Status Modal */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="Change Event Status"
        icon={RefreshCcw}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {lookups.statuses
                  .filter((s) => s !== "All")
                  .map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={statusMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              {statusMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              Save
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}

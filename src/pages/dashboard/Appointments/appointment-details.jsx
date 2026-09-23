import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Info,
  RefreshCcw,
  Plus,
  Wallet,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DynamicModal } from "@/components/common/dynamic-modal";
import { PageTitle } from "@/components/common/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getAppointmentById,
  changeAppointmentStatus,
  addPaymentSchedule,
  getAppointmentLookups,
} from "@/services/appointments";

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newScheduleAmount, setNewScheduleAmount] = useState("");
  const [newScheduleDueDate, setNewScheduleDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [newScheduleNotes, setNewScheduleNotes] = useState("");

  // Fetch Appointment
  const { data: appointmentResponse, isLoading } = useQuery({
    queryKey: ["appointmentDetail", id],
    queryFn: () => getAppointmentById(id),
  });
  const appointment = appointmentResponse?.data || {};

  // Fetch Lookups
  const { data: lookupsData } = useQuery({
    queryKey: ["appointmentLookups"],
    queryFn: getAppointmentLookups,
  });
  const lookups = lookupsData?.data || {
    statuses: ["Scheduled", "Confirmed", "In Progress", "Completed", "No Show"],
  };

  // Change Status Mutation
  const statusMutation = useMutation({
    mutationFn: (status) => changeAppointmentStatus({ id: appointment.id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointmentDetail", id]);
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment status updated successfully!");
      setIsStatusDialogOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  // Add Payment Schedule Mutation
  const scheduleMutation = useMutation({
    mutationFn: (scheduleData) => addPaymentSchedule(appointment.id, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointmentDetail", id]);
      toast.success("Payment schedule added!");
      setIsAddScheduleOpen(false);
      setNewScheduleAmount("");
      setNewScheduleDueDate(new Date().toISOString().split("T")[0]);
      setNewScheduleNotes("");
    },
    onError: () => toast.error("Failed to add payment schedule"),
  });

  const handleStatusChange = () => {
    if (newStatus) {
      statusMutation.mutate(newStatus);
    }
  };

  const handleAddSchedule = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newScheduleAmount) {
      toast.error("Please enter an amount");
      return;
    }

    const formattedDate = newScheduleDueDate
      ? new Date(newScheduleDueDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

    scheduleMutation.mutate({
      amount: Number(newScheduleAmount),
      date: formattedDate,
      dueDate: newScheduleDueDate,
      notes: newScheduleNotes || "Scheduled installment payment.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading appointment details...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb & Action */}
      <PageTitle
        title="Appointment Details"
        infoText="Detailed view and payment schedule for appointment"
        breadcrumb={
          <>
            <Link
              to="/dashboard/appointments"
              className="hover:text-foreground transition-colors"
            >
              Appointments
            </Link>
            <span>/</span>
            <span className="text-foreground">Appointment Details</span>
          </>
        }
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setNewStatus(appointment.status || "Scheduled");
              setIsStatusDialogOpen(true);
            }}
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Change Status</span>
          </Button>
        }
      />

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Appointment Overview Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                    {appointment.status || "Scheduled"}
                  </span>
                  {appointment.isInvoiced && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <FileCheck className="h-3.5 w-3.5" />
                      Invoiced
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {appointment.service}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {appointment.customer} • {appointment.provider}
                </p>
              </div>

              <div className="text-end">
                <div className="text-3xl font-extrabold text-foreground">
                  ${appointment.price || 60}
                </div>
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  {appointment.currency || "USD"}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {appointment.notes || "No additional notes provided."}
              </p>
            </div>
          </div>

          {/* Payment Schedule Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-6">
              <h3 className="text-lg font-bold text-foreground">
                Payment Schedule
              </h3>
              <Button
                size="sm"
                onClick={() => setIsAddScheduleOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {(!appointment.paymentSchedules ||
                appointment.paymentSchedules.length === 0) ? (
                <p className="text-sm text-muted-foreground">
                  No payment schedules recorded yet.
                </p>
              ) : (
                appointment.paymentSchedules.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">
                            ${item.amount}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.date}
                        </p>
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-foreground">
                            Notes
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {item.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right col: Appointment info box */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground pb-4 border-b border-border">
              Appointment
            </h3>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {appointment.date || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {appointment.time || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {appointment.customer || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {appointment.provider || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Status Modal (Using DynamicModal) */}
      <DynamicModal
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Change Appointment Status"
        description="Select a new status for this appointment."
        icon={RefreshCcw}
        submitLabel="Update Status"
        onSubmit={handleStatusChange}
        isLoading={statusMutation.isPending}
      >
        <div className="space-y-2 py-2">
          <label className="text-xs font-medium text-foreground">Status</label>
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

      {/* Add Payment Schedule Modal (Using DynamicModal with Due Date) */}
      <DynamicModal
        isOpen={isAddScheduleOpen}
        onClose={() => setIsAddScheduleOpen(false)}
        title="Add Payment Schedule"
        description="Add a new installment or scheduled payment with due date."
        icon={Wallet}
        submitLabel="Save Payment"
        onSubmit={handleAddSchedule}
        isLoading={scheduleMutation.isPending}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Amount ($) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              required
              value={newScheduleAmount}
              onChange={(e) => setNewScheduleAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Due Date <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              required
              value={newScheduleDueDate}
              onChange={(e) => setNewScheduleDueDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Notes</label>
            <Textarea
              rows={3}
              value={newScheduleNotes}
              onChange={(e) => setNewScheduleNotes(e.target.value)}
              placeholder="Details about this payment installment..."
              className="w-full"
            />
          </div>
        </div>
      </DynamicModal>
    </div>
  );
}

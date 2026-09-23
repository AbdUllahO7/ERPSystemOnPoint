import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Plus, Trash2, Save, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  createAppointment,
  updateAppointment,
  getAppointmentLookups,
} from "@/services/appointments";

export default function AddEditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    customer: "",
    service: "",
    provider: "",
    status: "Scheduled",
    date: new Date().toISOString().split("T")[0],
    start: "09:00",
    end: "12:00",
    despose: "0",
    notes: "",
    billingMethod: "per-visit",
    currency: "USD",
    paymentMethod: "",
    costCenter: "",
    warehouse: "",
    amountPaidNow: "0",
    materialDetails: "",
    paymentSchedules: [],
  });

  // Modal State for Adding Schedule
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleAmount, setScheduleAmount] = useState("");
  const [scheduleDueDate, setScheduleDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [scheduleNotes, setScheduleNotes] = useState("");

  // Fetch Lookups
  const { data: lookupsData } = useQuery({
    queryKey: ["appointmentLookups"],
    queryFn: getAppointmentLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    services: [],
    providers: [],
    statuses: ["Scheduled", "Confirmed", "In Progress", "Completed", "No Show"],
    currencies: [],
    paymentMethods: [],
    costCenters: [],
    warehouses: [],
  };

  // Fetch existing appointment if editing
  const { data: existingData } = useQuery({
    queryKey: ["appointmentDetail", id],
    queryFn: () => getAppointmentById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && existingData?.data) {
      setFormData((prev) => ({
        ...prev,
        ...existingData.data,
      }));
    }
  }, [isEdit, existingData]);

  // Create / Update Mutations
  const createMutation = useMutation({
    mutationFn: (data) => createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      toast.success("Appointment created successfully!");
      navigate("/dashboard/appointments");
    },
    onError: () => toast.error("Failed to create appointment"),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointmentDetail", id]);
      toast.success("Appointment updated successfully!");
      navigate("/dashboard/appointments");
    },
    onError: () => toast.error("Failed to update appointment"),
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenScheduleModal = () => {
    setScheduleAmount("");
    setScheduleDueDate(new Date().toISOString().split("T")[0]);
    setScheduleNotes("");
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleAmount) {
      toast.error("Please enter an installment amount");
      return;
    }

    const formattedDate = scheduleDueDate
      ? new Date(scheduleDueDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

    setFormData((prev) => ({
      ...prev,
      paymentSchedules: [
        ...prev.paymentSchedules,
        {
          id: Date.now(),
          amount: Number(scheduleAmount),
          date: formattedDate,
          dueDate: scheduleDueDate,
          notes: scheduleNotes || "",
        },
      ],
    }));

    setIsScheduleModalOpen(false);
    toast.success("Payment installment added to schedule");
  };

  const handleRemoveSchedule = (scheduleId) => {
    setFormData((prev) => ({
      ...prev,
      paymentSchedules: prev.paymentSchedules.filter((s) => s.id !== scheduleId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Page Header */}
      <PageTitle
        title={isEdit ? "Edit Appointment" : "Add Appointment"}
        infoText="Fill in appointment and billing details"
        breadcrumbs={[
          { label: "Appointments", href: "/dashboard/appointments" },
          { label: isEdit ? "Edit Appointment" : "Add Appointment" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/appointments")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {/* Section 1: Appointment Details */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-foreground">
          Appointment Details
        </h2>

        {/* Row 1: Customer, Service, Provider */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Customer
            </Label>
            <Select
              value={formData.customer}
              onValueChange={(val) => handleChange("customer", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {lookups.customers.map((c) => (
                  <SelectItem key={c.id} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Service
            </Label>
            <Select
              value={formData.service}
              onValueChange={(val) => handleChange("service", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {lookups.services.map((s) => (
                  <SelectItem key={s.id} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Provider
            </Label>
            <Select
              value={formData.provider}
              onValueChange={(val) => handleChange("provider", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {lookups.providers.map((p) => (
                  <SelectItem key={p.id} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Status, Date, Start, End */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {lookups.statuses
                  .filter((st) => st !== "All")
                  .map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Start</Label>
            <Input
              type="time"
              value={formData.start}
              onChange={(e) => handleChange("start", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">End</Label>
            <Input
              type="time"
              value={formData.end}
              onChange={(e) => handleChange("end", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Row 3: Despose */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Despose
            </Label>
            <Input
              type="number"
              value={formData.despose}
              onChange={(e) => handleChange("despose", e.target.value)}
              placeholder="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Row 4: Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Notes</Label>
          <Textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Notes"
            className="w-full"
          />
        </div>
      </div>

      {/* Section 2: Invoice / Billing */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-foreground">
          Invoice / Billing
        </h2>

        {/* Row 1: Billing Method, Currency, Payment Method */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Billing Method
            </Label>
            <Input
              value={formData.billingMethod}
              onChange={(e) => handleChange("billingMethod", e.target.value)}
              placeholder="per-visit"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(val) => handleChange("currency", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {lookups.currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Payment Method
            </Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(val) => handleChange("paymentMethod", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {lookups.paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Cost Center, Warehouse, Amount Paid Now */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Cost Center
            </Label>
            <Select
              value={formData.costCenter}
              onValueChange={(val) => handleChange("costCenter", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Cost Center" />
              </SelectTrigger>
              <SelectContent>
                {lookups.costCenters.map((cc) => (
                  <SelectItem key={cc.value} value={cc.value}>
                    {cc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Warehouse
            </Label>
            <Select
              value={formData.warehouse}
              onValueChange={(val) => handleChange("warehouse", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Warehouse" />
              </SelectTrigger>
              <SelectContent>
                {lookups.warehouses.map((wh) => (
                  <SelectItem key={wh.value} value={wh.value}>
                    {wh.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Amount Paid Now
            </Label>
            <Input
              type="number"
              value={formData.amountPaidNow}
              onChange={(e) => handleChange("amountPaidNow", e.target.value)}
              placeholder="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Row 3: Material Details */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">
            Material Details
          </Label>
          <Textarea
            rows={3}
            value={formData.materialDetails}
            onChange={(e) => handleChange("materialDetails", e.target.value)}
            placeholder="Material Details"
            className="w-full"
          />
        </div>
      </div>

      {/* Section 3: Payment Schedule */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Payment Schedule
          </h2>
          <Button
            type="button"
            onClick={handleOpenScheduleModal}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {formData.paymentSchedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No installments — full amount due at appointment
          </p>
        ) : (
          <div className="space-y-3 pt-2">
            {formData.paymentSchedules.map((schedule, idx) => (
              <div
                key={schedule.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">
                        ${schedule.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • Due: {schedule.date || schedule.dueDate}
                      </span>
                    </div>
                    {schedule.notes && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {schedule.notes}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="text-destructive hover:bg-destructive/10 self-end sm:self-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Modal for Adding Schedule in Add/Edit form */}
      <DynamicModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Add Installment / Payment Schedule"
        description="Add a scheduled payment with due date and notes."
        icon={Wallet}
        submitLabel="Add Installment"
        onSubmit={handleSaveSchedule}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Amount ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              required
              value={scheduleAmount}
              onChange={(e) => setScheduleAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              required
              value={scheduleDueDate}
              onChange={(e) => setScheduleDueDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Notes</Label>
            <Textarea
              rows={3}
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Installment notes..."
              className="w-full"
            />
          </div>
        </div>
      </DynamicModal>
    </form>
  );
}

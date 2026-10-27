import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Plus, Trash2, Save, Wallet, Loader2 } from "lucide-react";
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
  const { data: lookupsData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["appointmentLookups"],
    queryFn: getAppointmentLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    services: [],
    providers: [],
    statuses: [
      "Scheduled",
      "Confirmed",
      "CheckedIn",
      "In Progress",
      "Completed",
      "Canceled",
      "Cancelled",
      "No Show",
      "NoShow",
    ],
    currencies: [],
    paymentMethods: [],
    costCenters: [],
    warehouses: [],
  };

  // Ensure all common statuses are present
  if (lookups.statuses && !lookups.statuses.includes("Canceled")) {
    lookups.statuses.push("Canceled");
  }
  if (lookups.statuses && !lookups.statuses.includes("Cancelled")) {
    lookups.statuses.push("Cancelled");
  }

  // Fetch existing appointment if editing
  const { data: existingData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["appointmentDetail", id],
    queryFn: () => getAppointmentById(id),
    enabled: isEdit,
  });

  const isPageLoading = isLoadingLookups || (isEdit && isLoadingDetails);

  useEffect(() => {
    if (isEdit && existingData) {
      const d = existingData?.data?.raw || existingData?.data?.data || existingData?.data || existingData;
      if (!d) return;

      const customerId = d.customerId || d.customer?.id;
      const customerName = d.customerName || d.customer?.name || d.customer || "";
      const serviceId = d.productVariantId || d.productVariant?.id || d.serviceId;
      const serviceName = d.serviceName || d.productVariant?.name || d.service || "";
      const providerId = d.serviceProviderId || d.serviceProvider?.id || d.providerId;
      const providerName = d.serviceProviderName || d.serviceProvider?.name || d.provider || "";

      const appointmentDate = d.appointmentDate || d.date;
      const startTime = d.startTime || d.start;
      const endTime = d.endTime || d.end;

      setFormData((prev) => ({
        ...prev,
        ...d,
        customer: customerId || customerName || prev.customer,
        customerId: customerId || prev.customerId,
        customerName: customerName || prev.customerName,
        service: serviceId || serviceName || prev.service,
        productVariantId: serviceId || prev.productVariantId,
        serviceName: serviceName || prev.serviceName,
        provider: providerId || providerName || prev.provider,
        serviceProviderId: providerId || prev.serviceProviderId,
        serviceProviderName: providerName || prev.serviceProviderName,
        date: appointmentDate ? String(appointmentDate).split("T")[0] : prev.date,
        start: startTime ? String(startTime).slice(0, 5) : prev.start,
        end: endTime ? String(endTime).slice(0, 5) : prev.end,
        status: d.status || prev.status,
      }));
    }
  }, [isEdit, existingData]);

  // Dynamically ensure Select options contain the current customer/service/provider/status
  const customerOptions = useMemo(() => {
    const list = [...(lookups.customers || [])];
    const currentVal = formData.customerId || formData.customer;
    if (currentVal && !list.some((c) => c.id === currentVal || c.value === currentVal)) {
      list.unshift({
        id: currentVal,
        value: currentVal,
        label: formData.customerName || currentVal,
      });
    }
    return list;
  }, [lookups.customers, formData.customer, formData.customerId, formData.customerName]);

  const serviceOptions = useMemo(() => {
    const list = [...(lookups.services || [])];
    const currentVal = formData.productVariantId || formData.service;
    if (currentVal && !list.some((s) => s.id === currentVal || s.value === currentVal)) {
      list.unshift({
        id: currentVal,
        value: currentVal,
        label: formData.serviceName || currentVal,
      });
    }
    return list;
  }, [lookups.services, formData.service, formData.productVariantId, formData.serviceName]);

  const providerOptions = useMemo(() => {
    const list = [...(lookups.providers || [])];
    const currentVal = formData.serviceProviderId || formData.provider;
    if (currentVal && !list.some((p) => p.id === currentVal || p.value === currentVal)) {
      list.unshift({
        id: currentVal,
        value: currentVal,
        label: formData.serviceProviderName || currentVal,
      });
    }
    return list;
  }, [lookups.providers, formData.provider, formData.serviceProviderId, formData.serviceProviderName]);

  const statusOptions = useMemo(() => {
    const list = [...(lookups.statuses || [])].filter((st) => st !== "All");
    if (formData.status && !list.some((st) => st.toLowerCase() === formData.status.toLowerCase())) {
      list.unshift(formData.status);
    }
    return list;
  }, [lookups.statuses, formData.status]);

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
    const payload = {
      ...formData,
      customerId: formData.customerId || formData.customer,
      productVariantId: formData.productVariantId || formData.service,
      serviceProviderId: formData.serviceProviderId || formData.provider,
      appointmentDate: formData.date ? new Date(formData.date).toISOString() : formData.appointmentDate,
      startTime: formData.start ? (formData.start.length === 5 ? `${formData.start}:00` : formData.start) : undefined,
      endTime: formData.end ? (formData.end.length === 5 ? `${formData.end}:00` : formData.end) : undefined,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
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
            <Button type="submit" disabled={isSaving || isPageLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      />

      {isPageLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-muted-foreground rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">
            {isEdit
              ? "Loading appointment details & lookups..."
              : "Loading form data..."}
          </p>
        </div>
      ) : (
        <>
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
              key={formData.customerId || formData.customer || "customer-select"}
              value={formData.customerId || formData.customer}
              onValueChange={(val) => {
                const item = customerOptions.find((c) => c.id === val || c.value === val);
                setFormData((prev) => ({
                  ...prev,
                  customer: val,
                  customerId: item?.id || val,
                  customerName: item?.label || val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                {customerOptions.map((c) => (
                  <SelectItem key={c.id || c.value} value={c.id || c.value}>
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
              key={formData.productVariantId || formData.service || "service-select"}
              value={formData.productVariantId || formData.service}
              onValueChange={(val) => {
                const item = serviceOptions.find((s) => s.id === val || s.value === val);
                setFormData((prev) => ({
                  ...prev,
                  service: val,
                  productVariantId: item?.id || val,
                  serviceName: item?.label || val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((s) => (
                  <SelectItem key={s.id || s.value} value={s.id || s.value}>
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
              key={formData.serviceProviderId || formData.provider || "provider-select"}
              value={formData.serviceProviderId || formData.provider}
              onValueChange={(val) => {
                const item = providerOptions.find((p) => p.id === val || p.value === val);
                setFormData((prev) => ({
                  ...prev,
                  provider: val,
                  serviceProviderId: item?.id || val,
                  serviceProviderName: item?.label || val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((p) => (
                  <SelectItem key={p.id || p.value} value={p.id || p.value}>
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
              key={formData.status || "status-select"}
              value={formData.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((st) => (
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
      </>
      )}

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

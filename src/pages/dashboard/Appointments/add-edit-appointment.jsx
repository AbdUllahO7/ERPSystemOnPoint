import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  getAppointmentPricingLookup,
  getServiceProviderLookups,
  getServiceProviders,
} from "@/services/appointments";

const isGenericProviderName = (val) => {
  if (!val || typeof val !== "string") return true;
  const s = val.trim().toLowerCase();
  return (
    s === "" ||
    s === "service provider" ||
    s === "provider" ||
    s === "unnamed provider" ||
    s === "unnamed" ||
    s === "null" ||
    s === "undefined" ||
    s === "n/a" ||
    s === "—"
  );
};

export default function AddEditAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: "",
    productVariantId: "",
    serviceProviderId: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "09:30",
    deposit: 0,
    unitOfMeasurementId: null,
    status: "Pending",
    // Helper labels for display
    customerName: "",
    serviceName: "",
    serviceProviderName: "",
  });

  // Fetch Lookups (Customers, Providers, Statuses, and default Services)
  const { data: lookupsData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["appointmentLookups"],
    queryFn: getAppointmentLookups,
  });

  // Fetch Appointment Pricing Lookup (Direct Endpoint: /api/HR/Lookups/GetAppointmentPricing/GetAppointmentPricing)
  const { data: pricingLookupData, isLoading: isLoadingPricing } = useQuery({
    queryKey: ["appointmentPricingLookup"],
    queryFn: getAppointmentPricingLookup,
  });

  // Fetch Provider Lookups (HR Employees) to guarantee provider names always resolve
  const { data: providerEmployeesData } = useQuery({
    queryKey: ["serviceProviderLookups"],
    queryFn: getServiceProviderLookups,
  });

  // Direct fetch of service providers as a primary / fallback source
  const { data: directProvidersData } = useQuery({
    queryKey: ["allServiceProvidersDirect"],
    queryFn: () => getServiceProviders({ PageSize: 100 }),
  });

  const lookups = lookupsData?.data || {
    customers: [],
    services: [],
    providers: [],
    statuses: [
      "Pending",
      "Confirmed",
      "CheckedIn",
      "Completed",
      "Canceled",
      "NoShow",
    ],
  };

  // Fetch existing appointment if editing
  const { data: existingData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["appointmentDetail", id],
    queryFn: () => getAppointmentById(id),
    enabled: isEdit,
  });

  const isPageLoading = (isLoadingLookups && isLoadingPricing) || (isEdit && isLoadingDetails);

  useEffect(() => {
    if (isEdit && existingData) {
      const d =
        existingData?.data?.raw ||
        existingData?.data?.data ||
        existingData?.data ||
        existingData;
      if (!d) return;

      const customerId = d.customerId || d.customer?.id || "";
      const customerName = d.customerName || d.customer?.name || d.customer || "";
      const productVariantId =
        d.productVariantId || d.productVariant?.id || d.serviceId || "";
      const serviceName =
        d.serviceName || d.productVariant?.name || d.service || "";
      const serviceProviderId =
        d.serviceProviderId || d.serviceProvider?.id || d.providerId || "";
      const serviceProviderName =
        d.serviceProviderName || d.serviceProvider?.name || d.provider || "";

      const appointmentDate = d.appointmentDate || d.date;
      const startTime = d.startTime || d.start;
      const endTime = d.endTime || d.end;

      setFormData({
        customerId,
        customerName,
        productVariantId,
        serviceName,
        serviceProviderId,
        serviceProviderName,
        appointmentDate: appointmentDate
          ? String(appointmentDate).split("T")[0]
          : new Date().toISOString().split("T")[0],
        startTime: startTime
          ? typeof startTime === "object"
            ? "09:00"
            : String(startTime).slice(0, 5)
          : "09:00",
        endTime: endTime
          ? typeof endTime === "object"
            ? "09:30"
            : String(endTime).slice(0, 5)
          : "09:30",
        deposit: Number(d.deposit ?? d.amountPaidNow ?? 0),
        unitOfMeasurementId: d.unitOfMeasurementId || "33333333-3333-3333-3333-333333333333",
        status: d.status || "Pending",
      });
    }
  }, [isEdit, existingData]);

  // Dynamically ensure Select options contain the current customer/service/provider
  const customerOptions = useMemo(() => {
    const list = [...(lookups.customers || [])];
    if (
      formData.customerId &&
      !list.some((c) => c.value === formData.customerId || c.id === formData.customerId)
    ) {
      list.unshift({
        id: formData.customerId,
        value: formData.customerId,
        label: formData.customerName || formData.customerId,
      });
    }
    return list;
  }, [lookups.customers, formData.customerId, formData.customerName]);

  const serviceOptions = useMemo(() => {
    // Priority 1: items from direct GetAppointmentPricing lookup
    let items = [];
    const directPricing = Array.isArray(pricingLookupData?.data)
      ? pricingLookupData.data
      : Array.isArray(pricingLookupData?.data?.data)
      ? pricingLookupData.data.data
      : null;

    if (directPricing && directPricing.length > 0) {
      items = directPricing.map((s) => {
        const price = Number(s.consumerPrice ?? s.consumer_Price ?? 0);
        const name = s.productName || s.name || "Unnamed Service";
        const unitName = s.unitName || "خدمة مقطوعة";
        return {
          id: s.productVariantId,
          value: s.productVariantId,
          productVariantId: s.productVariantId,
          name: name,
          unitOfMeasurementId: s.unitOfMeasurementId || "33333333-3333-3333-3333-333333333333",
          unitName: unitName,
          price: price,
          consumerPrice: price,
          label: price > 0 ? `${name} ($${price})` : name,
          raw: s,
        };
      });
    } else if (Array.isArray(lookups.services) && lookups.services.length > 0) {
      items = [...lookups.services];
    }

    const list = [...items];
    if (
      formData.productVariantId &&
      !list.some(
        (s) =>
          s.value === formData.productVariantId ||
          s.id === formData.productVariantId ||
          s.productVariantId === formData.productVariantId
      )
    ) {
      list.unshift({
        id: formData.productVariantId,
        value: formData.productVariantId,
        productVariantId: formData.productVariantId,
        label: formData.serviceName || formData.productVariantId,
        name: formData.serviceName || formData.productVariantId,
        unitOfMeasurementId: formData.unitOfMeasurementId || "33333333-3333-3333-3333-333333333333",
      });
    }
    return list;
  }, [pricingLookupData, lookups.services, formData.productVariantId, formData.serviceName, formData.unitOfMeasurementId]);

  const providerOptions = useMemo(() => {
    // 1. Build employee map with case-insensitive / trimmed keys
    const employees = providerEmployeesData?.data?.employees || [];
    const empMap = new Map();
    employees.forEach((e) => {
      const name =
        e.fullName ||
        `${e.first_Name || e.firstName || ""} ${e.last_Name || e.lastName || ""}`.trim() ||
        e.name ||
        e.employeeName ||
        e.user_Name ||
        e.userName ||
        "";
      const code = e.jobNumber || e.employee_Code || e.employeeCode || "";
      const display = name ? (code ? `${name} (#${code})` : name) : (code ? `Employee #${code}` : "");

      if (e.id) {
        empMap.set(String(e.id).toLowerCase().trim(), { name, code, display });
      }
      if (e.jobNumber) {
        empMap.set(String(e.jobNumber).toLowerCase().trim(), { name, code, display });
      }
    });

    // 2. Base list of providers: from direct fetch or lookups
    const directList = directProvidersData?.data?.items || [];
    const lookupList = lookups.providers || [];
    const baseList = directList.length > 0 ? directList : lookupList;

    const list = baseList.map((p, idx) => {
      const raw = p.raw || p;
      const rawEmpId = p.hrEmployeeId || raw.hrEmployeeId || raw.employeeId || raw.hr_Employee_Id;
      const normalizedEmpId = rawEmpId ? String(rawEmpId).toLowerCase().trim() : null;
      const matchedEmp = normalizedEmpId ? empMap.get(normalizedEmpId) : null;
      const directMatch = p.id ? empMap.get(String(p.id).toLowerCase().trim()) : null;
      const empInfo = matchedEmp || directMatch;

      const candidates = [
        empInfo?.display,
        empInfo?.name,
        p.employeeName,
        raw.employeeName,
        p.fullName,
        raw.fullName,
        p.name,
        raw.name,
        p.label,
      ];
      const validName = candidates.find((c) => !isGenericProviderName(c));

      const fallback = rawEmpId
        ? `Employee (${String(rawEmpId).slice(0, 8)})`
        : p.id
        ? `Provider #${String(p.id).slice(0, 8).toUpperCase()}`
        : `Provider ${idx + 1}`;

      const finalLabel = validName || fallback;

      return {
        ...p,
        id: p.id,
        value: p.id,
        label: finalLabel,
        name: finalLabel,
        hrEmployeeId: rawEmpId || null,
        raw,
      };
    });

    // 3. Ensure currently selected provider in edit mode is always present
    if (
      formData.serviceProviderId &&
      !list.some(
        (p) =>
          String(p.value).toLowerCase() === String(formData.serviceProviderId).toLowerCase() ||
          String(p.id).toLowerCase() === String(formData.serviceProviderId).toLowerCase()
      )
    ) {
      const selKey = String(formData.serviceProviderId).toLowerCase().trim();
      const emp = empMap.get(selKey);
      const customLabel = !isGenericProviderName(formData.serviceProviderName)
        ? formData.serviceProviderName
        : emp?.display || emp?.name || `Provider #${String(formData.serviceProviderId).slice(0, 8).toUpperCase()}`;

      list.unshift({
        id: formData.serviceProviderId,
        value: formData.serviceProviderId,
        label: customLabel,
        name: customLabel,
      });
    }

    return list;
  }, [directProvidersData, lookups.providers, providerEmployeesData, formData.serviceProviderId, formData.serviceProviderName]);

  const statusOptions = useMemo(() => {
    const list = [...(lookups.statuses || [])].filter((st) => st !== "All");
    if (
      formData.status &&
      !list.some((st) => st.toLowerCase() === formData.status.toLowerCase())
    ) {
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
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create appointment";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      queryClient.invalidateQueries(["appointmentDetail", id]);
      toast.success("Appointment updated successfully!");
      navigate("/dashboard/appointments");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update appointment";
      toast.error(msg);
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.productVariantId) {
      toast.error("Please select a service (productVariantId is required)");
      return;
    }

    const payload = {
      customerId: formData.customerId || null,
      productVariantId: formData.productVariantId,
      serviceProviderId: formData.serviceProviderId || null,
      appointmentDate: formData.appointmentDate
        ? new Date(formData.appointmentDate).toISOString()
        : new Date().toISOString(),
      startTime: formData.startTime || "09:00",
      endTime: formData.endTime || "09:30",
      deposit: Number(formData.deposit || 0),
      unitOfMeasurementId: formData.unitOfMeasurementId || "33333333-3333-3333-3333-333333333333",
      status: formData.status,
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
        infoText="Book appointment with customer, service, provider, and schedule."
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
            <Button
              type="submit"
              disabled={isSaving || isPageLoading || !formData.productVariantId || !formData.appointmentDate}
              className="gap-2"
              title={!formData.productVariantId || !formData.appointmentDate ? "Please select service and appointment date" : ""}
            >
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
              ? "Loading appointment details..."
              : "Loading form data..."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-foreground">
            Appointment Information
          </h2>

          {/* Row 1: Customer, Service, Provider */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Customer
              </Label>
              <Select
                key={`customer-${formData.customerId || "none"}`}
                value={formData.customerId || undefined}
                onValueChange={(val) => {
                  const item = customerOptions.find(
                    (c) => c.value === val || c.id === val
                  );
                  setFormData((prev) => ({
                    ...prev,
                    customerId: val,
                    customerName: item?.label || "",
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Customer">
                    {formData.customerName || customerOptions.find((c) => c.value === formData.customerId)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customerOptions.map((c) => (
                    <SelectItem key={c.id || c.value} value={c.value || c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Service <span className="text-destructive">*</span>
              </Label>
              <Select
                key={`service-${formData.productVariantId || "none"}`}
                value={formData.productVariantId || undefined}
                onValueChange={(val) => {
                  const item = serviceOptions.find(
                    (s) => s.value === val || s.id === val || s.productVariantId === val
                  );
                  setFormData((prev) => ({
                    ...prev,
                    productVariantId: val,
                    serviceName: item?.name || item?.label || "",
                    unitOfMeasurementId:
                      item?.unitOfMeasurementId || prev.unitOfMeasurementId || "33333333-3333-3333-3333-333333333333",
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Service">
                    {formData.serviceName || serviceOptions.find((s) => s.value === formData.productVariantId)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((s) => (
                    <SelectItem key={s.id || s.value} value={s.value || s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Service Provider
              </Label>
              <Select
                key={`provider-${formData.serviceProviderId || "none"}`}
                value={formData.serviceProviderId || undefined}
                onValueChange={(val) => {
                  const item = providerOptions.find(
                    (p) => p.value === val || p.id === val
                  );
                  setFormData((prev) => ({
                    ...prev,
                    serviceProviderId: val,
                    serviceProviderName: item?.label || "",
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Provider">
                    {providerOptions.find((p) => String(p.value).toLowerCase() === String(formData.serviceProviderId).toLowerCase() || String(p.id).toLowerCase() === String(formData.serviceProviderId).toLowerCase())?.label || (!isGenericProviderName(formData.serviceProviderName) ? formData.serviceProviderName : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((p) => (
                    <SelectItem key={p.id || p.value} value={p.value || p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Appointment Date, Start Time, End Time, Deposit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Appointment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => handleChange("appointmentDate", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Deposit Amount ($)
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                value={formData.deposit}
                onChange={(e) => handleChange("deposit", e.target.value)}
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Row 3 (Edit mode only): Status */}
          {isEdit && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Appointment Status
                </Label>
                <Select
                  key={`status-${formData.status || "none"}`}
                  value={formData.status || undefined}
                  onValueChange={(val) => handleChange("status", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status">
                      {formData.status}
                    </SelectValue>
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
            </div>
          )}
        </div>
      )}
    </form>
  );
}

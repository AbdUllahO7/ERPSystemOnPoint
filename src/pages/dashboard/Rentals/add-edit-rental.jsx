import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicModal } from "@/components/common/dynamic-modal";
import toast from "react-hot-toast";
import {
  createRental,
  updateRental,
  getRentalById,
  getRentalLookups,
} from "@/services/rentals";

export default function AddEditRentalPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dynamic Custom Fields State
  const [dynamicFields, setDynamicFields] = useState([]);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    contractNumber: "",
    customerId: "",
    customerName: "",
    resource: "",
    service: "",
    costCenter: "",
    currency: "USD",
    startDate: "",
    endDate: "",
    status: "Active",
    paymentMethod: "Card",
    notes: "",
    rentalPrice: "0",
    rateType: "1=Day",
    quantity: "1",
    discount: "0",
    taxPercent: "0",
    securityDeposit: "0",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["rentalLookups"],
    queryFn: getRentalLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    resources: [],
    services: [],
    costCenters: [],
    currencies: [],
    paymentMethods: [],
    rateTypes: [],
    statuses: [],
  };

  // Fetch contract if in edit mode
  const { data: contractData, isLoading: isFetching } = useQuery({
    queryKey: ["rental", id],
    queryFn: () => getRentalById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && contractData?.data) {
      const c = contractData.data;
      setFormData({
        contractNumber: c.contractNumber || c.id || "",
        customerId: c.customerId || "",
        customerName: c.customerName || c.customer || "",
        resource: c.resourceName || c.resource || "",
        service: c.title || c.service || "",
        costCenter: c.costCenter || "",
        currency: c.currency || "USD",
        startDate: c.startDate || "",
        endDate: c.endDate || "",
        status: c.status || "Active",
        paymentMethod: c.paymentMethod || "Card",
        notes: c.notes || "",
        rentalPrice: String(c.rentalPrice || c.totalAmount || 0),
        rateType: c.rateType || "1=Day",
        quantity: String(c.quantity || 1),
        discount: String(c.discount || 0),
        taxPercent: String(c.taxPercent || 0),
        securityDeposit: String(c.numericDeposit || 0),
      });

      if (c.additionalData) {
        const fields = Object.entries(c.additionalData).map(([key, val]) => ({
          key,
          value: val,
        }));
        setDynamicFields(fields);
      }
    }
  }, [isEdit, contractData]);

  // Calculations for Summary Card
  const calculations = useMemo(() => {
    const price = Number(formData.rentalPrice) || 0;
    const qty = Number(formData.quantity) || 1;
    const discount = Number(formData.discount) || 0;
    const taxRate = Number(formData.taxPercent) || 0;
    const deposit = Number(formData.securityDeposit) || 0;

    const subtotal = Math.max(0, price * qty - discount);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const collectedOnSigning = total + deposit;

    return {
      unitsDay: price * qty,
      subtotal,
      discount,
      taxAmount,
      taxRate,
      total,
      deposit,
      collectedOnSigning,
    };
  }, [formData]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateRental(id, data) : createRental(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rentals"]);
      toast.success(res?.message || (isEdit ? "Contract updated!" : "Contract created!"));
      navigate("/dashboard/rentals");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? "Failed to update contract" : "Failed to create contract");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDynamicField = () => {
    if (!newFieldName.trim()) {
      toast.error("Please enter variable name");
      return;
    }
    setDynamicFields((prev) => [
      ...prev,
      { key: newFieldName.trim(), value: newFieldValue.trim() },
    ]);
    setNewFieldName("");
    setNewFieldValue("");
    setIsFieldModalOpen(false);
  };

  const handleRemoveDynamicField = (index) => {
    setDynamicFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.customerName && !formData.customerId) {
      toast.error("Please enter or select a customer");
      return;
    }

    const dynamicDetails = dynamicFields.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    saveMutation.mutate({
      ...formData,
      total: calculations.total,
      dynamicDetails,
    });
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={isEdit ? "Edit Rental Contract" : "Add Rental Contract"}
          breadcrumbLinks={[
            { label: "Rental Contracts", href: "/dashboard/rentals" },
            { label: isEdit ? "Edit Contract" : "Add Contract" },
          ]}
          infoTooltip="Create rental agreements, allocate equipment/units, configure rate terms, and add dynamic variables."
        />

        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
        >
          {saveMutation.isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Main Grid: Left 8 cols (Form Cards), Right 4 cols (Summary Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Rental Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-800">
              Rental Info
            </h2>

            {/* Row 1: Contract Number, Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Number
                </Label>
                <Input
                  placeholder="e.g. RC-1001"
                  value={formData.contractNumber}
                  onChange={(e) => handleInputChange("contractNumber", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Customer <span className="text-rose-500">*</span>
                </Label>
                {lookups.customers.length > 0 ? (
                  <Select
                    value={formData.customerId || "custom"}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        handleInputChange("customerId", "");
                      } else {
                        const cust = lookups.customers.find((c) => String(c.id) === String(val));
                        handleInputChange("customerId", val);
                        handleInputChange("customerName", cust?.name || "");
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                      <SelectValue placeholder={formData.customerName || "Select Customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Customer Name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                  />
                )}
              </div>
            </div>

            {/* Row 2: Resource, Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Resource / Equipment
                </Label>
                <Select
                  value={formData.resource}
                  onValueChange={(val) => {
                    handleInputChange("resource", val);
                    const selRes = lookups.resources.find((r) => r.name === val || String(r.id) === String(val));
                    if (selRes && selRes.dailyRentalCost && Number(formData.rentalPrice) === 0) {
                      handleInputChange("rentalPrice", String(selRes.dailyRentalCost));
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.resources.map((res) => (
                      <SelectItem key={res.id} value={res.name}>
                        {res.name} {res.dailyRentalCost ? `($${res.dailyRentalCost}/day)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Title / Service
                </Label>
                <Input
                  placeholder="e.g. Vehicle / Facility Rental"
                  value={formData.service}
                  onChange={(e) => handleInputChange("service", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            </div>

            {/* Row 3: Cost Center Account, Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Cost Center
                </Label>
                <Select
                  value={formData.costCenter}
                  onValueChange={(val) => handleInputChange("costCenter", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Cost Center" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.costCenters.map((cc) => (
                      <SelectItem key={cc.id} value={cc.name}>
                        {cc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(val) => handleInputChange("currency", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.currencies.map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Start Date, End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Start Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
                  />
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  End Date
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
                  />
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Row 5: Status, Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.statuses.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Payment Method
                </Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(val) => handleInputChange("paymentMethod", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 6: Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Notes & Terms
              </Label>
              <Textarea
                rows={4}
                placeholder="Contract guidelines, terms, or conditions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Terms */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-800">
              Pricing & Rate Terms
            </h2>

            {/* Row 1: Rental Price, Rate Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Rental Price
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.rentalPrice}
                  onChange={(e) => handleInputChange("rentalPrice", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Rate Type
                </Label>
                <Select
                  value={formData.rateType}
                  onValueChange={(val) => handleInputChange("rateType", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Rate Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.rateTypes.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id}>
                        {rt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Quantity, Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Quantity
                </Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Discount
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.discount}
                  onChange={(e) => handleInputChange("discount", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            </div>

            {/* Row 3: Tax %, Security Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Tax %
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.taxPercent}
                  onChange={(e) => handleInputChange("taxPercent", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Security Deposit
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">
            Summary
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Base Rate:</span>
              <span className="font-semibold text-slate-800">
                ${calculations.unitsDay.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Discount:</span>
              <span className="font-semibold text-slate-800">
                -${calculations.discount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                ${calculations.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Tax ({calculations.taxRate}%):</span>
              <span className="font-semibold text-slate-800">
                ${calculations.taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-slate-900 font-bold text-sm">
              <span>Total:</span>
              <span className="text-[#0066d1]">
                ${calculations.total.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-1">
              <span>Security Deposit:</span>
              <span className="font-semibold text-slate-800">
                ${calculations.deposit.toFixed(2)}
              </span>
            </div>

            <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl flex items-center justify-between text-slate-800 font-bold text-xs mt-2">
              <span>Collected on Signing:</span>
              <span className="text-[#0066d1] text-sm">
                ${calculations.collectedOnSigning.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

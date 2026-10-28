import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
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

  // Dynamic Custom Fields State matching dynamicDetails
  const [dynamicFields, setDynamicFields] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  // Form State conforming to POST /api/Inventory/RentalContract/CreateContract/create-contract
  const [formData, setFormData] = useState({
    contractNumber: "",
    customerId: "",
    customerName: "",
    resourceId: "",
    resourceName: "",
    productVariantId: "",
    serviceName: "",
    costCenterId: "",
    currencyId: "",
    startDate: new Date().toISOString().slice(0, 10),
    expectedEndDate: "",
    status: "Active",
    paymentAccountId: "",
    notes: "",
    rentalRate: "0",
    rateType: "Day",
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
    paymentAccounts: [],
    invoicePatterns: [],
    paymentMethods: [],
    rateTypes: [],
    statuses: [],
  };

  // Set default currency & payment account when lookups load
  useEffect(() => {
    if (!formData.currencyId && lookups.currencies?.length > 0) {
      setFormData((prev) => ({ ...prev, currencyId: String(lookups.currencies[0].id) }));
    }
    if (!formData.paymentAccountId && lookups.paymentAccounts?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        paymentAccountId: String(lookups.paymentAccounts[0].id),
      }));
    }
  }, [lookups.currencies, lookups.paymentAccounts]);

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
        resourceId: c.resourceId || "",
        resourceName: c.resourceName || c.resource || "",
        productVariantId: c.productVariantId || "",
        serviceName: c.serviceName || c.title || "",
        costCenterId: c.costCenterId || "",
        currencyId: c.currencyId || "",
        startDate: c.startDate || new Date().toISOString().slice(0, 10),
        expectedEndDate: c.expectedEndDate || c.endDate || "",
        status: c.status || "Active",
        paymentAccountId: c.paymentAccountId || "",
        notes: c.notes || c.terms_And_Conditions || "",
        rentalRate: String(c.rentalRate || c.rentalPrice || c.totalAmount || 0),
        rateType: c.rateType || "Day",
        quantity: String(c.quantity || 1),
        discount: String(c.discount || 0),
        taxPercent: String(c.taxPercent || 0),
        securityDeposit: String(c.securityDeposit || c.numericDeposit || 0),
      });

      const details = c.dynamicDetails || c.additionalData;
      if (details && typeof details === "object") {
        const fields = Object.entries(details).map(([key, val]) => ({
          key,
          value: String(val ?? ""),
        }));
        setDynamicFields(fields);
      }
    }
  }, [isEdit, contractData]);

  // Calculations for Summary Card
  const calculations = useMemo(() => {
    const rate = Number(formData.rentalRate) || 0;
    const qty = Number(formData.quantity) || 1;
    const discount = Number(formData.discount) || 0;
    const taxRate = Number(formData.taxPercent) || 0;
    const deposit = Number(formData.securityDeposit) || 0;

    const baseAmount = rate * qty;
    const subtotal = Math.max(0, baseAmount - discount);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    const collectedOnSigning = total + deposit;

    return {
      baseAmount,
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
      toast.success(res?.message || (isEdit ? "Contract updated!" : "Rental contract created!"));
      navigate("/dashboard/rentals");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        (isEdit ? "Failed to update contract" : "Failed to create contract");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDynamicField = () => {
    if (!newKey.trim()) {
      toast.error("Please enter a property name");
      return;
    }
    setDynamicFields((prev) => [
      ...prev,
      { key: newKey.trim(), value: newValue.trim() },
    ]);
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveDynamicField = (index) => {
    setDynamicFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    const dynamicDetails = dynamicFields.reduce((acc, curr) => {
      if (curr.key && curr.key.trim()) {
        acc[curr.key.trim()] = curr.value || "";
      }
      return acc;
    }, {});

    const payload = {
      customerId: formData.customerId,
      resourceId: formData.resourceId || null,
      productVariantId: formData.productVariantId || null,
      costCenterId: formData.costCenterId || null,
      currencyId: formData.currencyId || null,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      expectedEndDate: formData.expectedEndDate
        ? new Date(formData.expectedEndDate).toISOString()
        : new Date(Date.now() + 86400000 * 30).toISOString(),
      rentalRate: Number(formData.rentalRate || 0),
      rateType: formData.rateType || "Day",
      quantity: Number(formData.quantity || 1),
      discount: Number(formData.discount || 0),
      taxAmount: Number(calculations.taxAmount.toFixed(2)),
      securityDeposit: Number(formData.securityDeposit || 0),
      paymentAccountId: formData.paymentAccountId || null,
      notes: formData.notes || "",
      dynamicDetails,
    };

    saveMutation.mutate(payload);
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
                <Select
                  value={formData.customerId}
                  onValueChange={(val) => {
                    const cust = lookups.customers.find((c) => String(c.id) === String(val));
                    handleInputChange("customerId", val);
                    handleInputChange("customerName", cust?.name || "");
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Resource, Service / Product Variant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Resource / Equipment
                </Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(val) => {
                    handleInputChange("resourceId", val);
                    const selRes = lookups.resources.find((r) => String(r.id) === String(val));
                    if (selRes) {
                      handleInputChange("resourceName", selRes.name);
                      if (selRes.dailyRentalCost && Number(formData.rentalRate) === 0) {
                        handleInputChange("rentalRate", String(selRes.dailyRentalCost));
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Resource / Equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.resources.map((res) => (
                      <SelectItem key={res.id} value={String(res.id)}>
                        {res.name} {res.dailyRentalCost ? `($${res.dailyRentalCost}/day)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Service / Product Variant
                </Label>
                <Select
                  value={formData.productVariantId}
                  onValueChange={(val) => {
                    handleInputChange("productVariantId", val);
                    const selServ = lookups.services.find(
                      (s) => String(s.variantId) === String(val) || String(s.id) === String(val)
                    );
                    if (selServ) {
                      handleInputChange("serviceName", selServ.name);
                      if (selServ.price && Number(formData.rentalRate) === 0) {
                        handleInputChange("rentalRate", String(selServ.price));
                      }
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Service / Product Variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.services.map((serv) => (
                      <SelectItem
                        key={serv.variantId || serv.id}
                        value={String(serv.variantId || serv.id)}
                      >
                        {serv.name} {serv.price ? `($${serv.price})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Cost Center, Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Cost Center
                </Label>
                <Select
                  value={formData.costCenterId}
                  onValueChange={(val) => handleInputChange("costCenterId", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Cost Center" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.costCenters.map((cc) => (
                      <SelectItem key={cc.id} value={String(cc.id)}>
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
                  value={formData.currencyId}
                  onValueChange={(val) => handleInputChange("currencyId", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.currencies.map((curr) => (
                      <SelectItem key={curr.id} value={String(curr.id)}>
                        {curr.name} {curr.symbol ? `(${curr.symbol})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Start Date, Expected End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Start Date <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
                    required
                  />
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Expected End Date <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.expectedEndDate}
                    onChange={(e) => handleInputChange("expectedEndDate", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
                    required
                  />
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Row 5: Payment Account, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Payment / Deposit Account
                </Label>
                <Select
                  value={formData.paymentAccountId}
                  onValueChange={(val) => handleInputChange("paymentAccountId", val)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Payment Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.paymentAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={String(acc.id)}>
                        {acc.name} {acc.accountNumber ? `(${acc.accountNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            {/* Row 6: Notes */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Notes & Terms
              </Label>
              <Textarea
                rows={3}
                placeholder="Contract guidelines, terms, or conditions..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Rate Terms */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-800">
              Pricing & Rate Terms
            </h2>

            {/* Row 1: Rental Rate, Rate Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Rental Rate ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.rentalRate}
                  onChange={(e) => handleInputChange("rentalRate", e.target.value)}
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
                  Discount ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
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
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-700">
                    Tax Rate (%)
                  </Label>
                  <span className="text-[11px] text-slate-400">
                    Amount: ${calculations.taxAmount.toFixed(2)}
                  </span>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.taxPercent}
                  onChange={(e) => handleInputChange("taxPercent", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Security Deposit ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Dynamic Details & Specifications */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0066d1]" />
                  Dynamic Details & Custom Specifications
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach custom key-value specifications, inspection checkpoints, or contract attributes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Input
                placeholder="Property Key (e.g. MileageLimit, DeliveryLocation)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200 w-1/2"
              />
              <Input
                placeholder="Value (e.g. 500 km/day, Main Facility)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200 w-1/2"
              />
              <Button
                type="button"
                onClick={handleAddDynamicField}
                className="h-10 rounded-xl px-4 text-xs font-semibold bg-[#0066d1] hover:bg-[#0052a8] text-white shrink-0"
              >
                <Plus className="w-3.5 h-3.5 me-1" />
                Add
              </Button>
            </div>

            {dynamicFields.length > 0 && (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl mt-3 overflow-hidden">
                {dynamicFields.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700">{f.key}:</span>
                      <span className="text-slate-600">{f.value}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDynamicField(idx)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">
            Summary
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Base Rate ({formData.quantity} × ${Number(formData.rentalRate || 0).toFixed(2)}):</span>
              <span className="font-semibold text-slate-800">
                ${calculations.baseAmount.toFixed(2)}
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
              <span>Rental Total:</span>
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

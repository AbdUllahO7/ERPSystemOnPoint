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

  // Form State strictly conforming to Customer Contract API Schema
  const [formData, setFormData] = useState({
    contractNumber: "",
    customerId: "",
    customerName: "",
    title: "",
    description: "",
    terms_And_Conditions: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "Active",
    currencyId: "",
    currencyCode: "USD",
  });

  // Contract Items State
  const [items, setItems] = useState([
    {
      id: "item-1",
      productVariantId: null,
      customItemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    },
  ]);

  // Installments State
  const [installments, setInstallments] = useState([
    {
      id: "inst-1",
      installmentName: "Initial Installment",
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      status: "Pending",
    },
  ]);

  // Lookups Query
  const { data: lookupsData, isLoading: isLoadingLookups } = useQuery({
    queryKey: ["rentalLookups"],
    queryFn: getRentalLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    currencies: [],
    statuses: [
      { id: "Active", name: "Active" },
      { id: "Draft", name: "Draft" },
      { id: "Closed", name: "Closed" },
      { id: "Canceled", name: "Canceled" },
    ],
  };

  // Pre-select default currency if new contract
  useEffect(() => {
    if (!formData.currencyId && lookups.currencies?.length > 0) {
      const defaultCurr = lookups.currencies[0];
      setFormData((prev) => ({
        ...prev,
        currencyId: String(defaultCurr.id),
        currencyCode: defaultCurr.code || defaultCurr.name || "USD",
      }));
    }
  }, [lookups.currencies, formData.currencyId]);

  // Fetch contract if in edit mode
  const { data: contractData, isLoading: isFetching } = useQuery({
    queryKey: ["rental", id],
    queryFn: () => getRentalById(id),
    enabled: isEdit,
  });

  // Prefill in Edit mode
  useEffect(() => {
    if (isEdit && contractData?.data) {
      const c = contractData.data;
      setFormData({
        contractNumber: c.contractNumber || `CNT-${String(id).slice(0, 8)}`,
        customerId: c.customerId ? String(c.customerId) : "",
        customerName: c.customerName || c.customer || "",
        title: c.title || "",
        description: c.description || "",
        terms_And_Conditions: c.terms_And_Conditions || c.notes || "",
        startDate: c.startDate ? c.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        endDate: c.endDate ? c.endDate.slice(0, 10) : "",
        status: c.status || "Active",
        currencyId: c.currencyId ? String(c.currencyId) : "",
        currencyCode: c.currencyCode || "USD",
      });

      if (Array.isArray(c.items) && c.items.length > 0) {
        setItems(
          c.items.map((itm, idx) => ({
            id: itm.id || `item-${idx + 1}`,
            productVariantId: itm.productVariantId || itm.productVariant_Id || null,
            customItemName: itm.custom_Item_Name || itm.customItemName || itm.productName || itm.name || "",
            description: itm.description || "",
            quantity: Number(itm.quantity || 1),
            unitPrice: Number(itm.unit_Price ?? itm.unitPrice ?? 0),
            totalPrice: Number(itm.total_Price ?? itm.totalPrice ?? (Number(itm.quantity || 1) * Number(itm.unitPrice || 0))),
          }))
        );
      }

      if (Array.isArray(c.installments) && c.installments.length > 0) {
        setInstallments(
          c.installments.map((ins, idx) => ({
            id: ins.id || `inst-${idx + 1}`,
            installmentName: ins.installment_Name || ins.installmentName || ins.name || `Installment #${idx + 1}`,
            amount: Number(ins.amount || 0),
            dueDate: (ins.due_Date || ins.dueDate) ? (ins.due_Date || ins.dueDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
            status: ins.status || "Pending",
          }))
        );
      }
    }
  }, [isEdit, contractData, id]);

  // Effective Customers: guarantee selected customer is ALWAYS in list even if not in first lookup page
  const effectiveCustomers = useMemo(() => {
    const list = [...(lookups.customers || [])];
    if (
      formData.customerId &&
      !list.some((c) => String(c.id).toLowerCase() === String(formData.customerId).toLowerCase())
    ) {
      list.unshift({
        id: formData.customerId,
        name: formData.customerName || "Selected Customer",
      });
    }
    return list;
  }, [lookups.customers, formData.customerId, formData.customerName]);

  // Effective Currencies: guarantee selected currency is ALWAYS in list
  const effectiveCurrencies = useMemo(() => {
    const list = [...(lookups.currencies || [])];
    if (
      formData.currencyId &&
      !list.some((curr) => String(curr.id).toLowerCase() === String(formData.currencyId).toLowerCase())
    ) {
      list.unshift({
        id: formData.currencyId,
        code: formData.currencyCode || "USD",
        name: formData.currencyCode || "USD",
      });
    }
    return list;
  }, [lookups.currencies, formData.currencyId, formData.currencyCode]);

  // Total Contract Calculations
  const calculations = useMemo(() => {
    const totalItemsAmount = items.reduce(
      (sum, itm) => sum + (Number(itm.totalPrice) || 0),
      0
    );
    const totalInstallmentsAmount = installments.reduce(
      (sum, ins) => sum + (Number(ins.amount) || 0),
      0
    );
    const difference = totalItemsAmount - totalInstallmentsAmount;

    return {
      totalItemsAmount,
      totalInstallmentsAmount,
      difference,
      isBalanced: Math.abs(difference) < 0.01,
    };
  }, [items, installments]);

  // Items Handlers
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const q = field === "quantity" ? Number(value) || 0 : Number(target.quantity) || 0;
        const p = field === "unitPrice" ? Number(value) || 0 : Number(target.unitPrice) || 0;
        target.totalPrice = q * p;
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productVariantId: null,
        customItemName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error("Contract must contain at least one item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Installments Handlers
  const handleInstallmentChange = (index, field, value) => {
    setInstallments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      {
        id: `inst-${Date.now()}`,
        installmentName: `Installment #${prev.length + 1}`,
        amount: Math.max(0, calculations.difference),
        dueDate: new Date().toISOString().slice(0, 10),
        status: "Pending",
      },
    ]);
  };

  const handleRemoveInstallment = (index) => {
    if (installments.length <= 1) {
      toast.error("Contract must contain at least one installment");
      return;
    }
    setInstallments((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateRental(id, data) : createRental(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rentals"]);
      queryClient.invalidateQueries(["rental", id]);
      toast.success(res?.message || (isEdit ? "Contract updated successfully!" : "Contract created successfully!"));
      navigate("/dashboard/rentals");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (isEdit ? "Failed to update contract" : "Failed to create contract");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (!formData.customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!formData.title?.trim()) {
      toast.error("Please provide a contract title");
      return;
    }

    const hasEmptyItem = items.some(
      (itm) => !(itm.customItemName || itm.custom_Item_Name || itm.name || "").trim()
    );
    if (hasEmptyItem) {
      toast.error("Please enter an item/service name for all contract items");
      return;
    }

    const hasEmptyInstallment = installments.some(
      (ins) => !(ins.installmentName || ins.installment_Name || ins.name || "").trim()
    );
    if (hasEmptyInstallment) {
      toast.error("Please enter a name for all installments");
      return;
    }

    const payload = {
      id: isEdit ? id : undefined,
      customerId: formData.customerId,
      contractNumber: formData.contractNumber || `CNT-${Date.now().toString().slice(-5)}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      terms_And_Conditions: formData.terms_And_Conditions.trim(),
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date(Date.now() + 86400000 * 90).toISOString(),
      totalAmount: calculations.totalItemsAmount,
      currencyId: formData.currencyId || null,
      status: formData.status,
      items: items.map((itm) => {
        const itemName = (
          itm.custom_Item_Name ||
          itm.customItemName ||
          itm.name ||
          formData.title ||
          "Item"
        ).trim();
        const q = Number(itm.quantity || 1);
        const p = Number(itm.unit_Price ?? itm.unitPrice ?? 0);
        return {
          productVariantId: itm.productVariantId || itm.productVariant_Id || null,
          productVariant_Id: itm.productVariantId || itm.productVariant_Id || null,
          custom_Item_Name: itemName,
          customItemName: itemName,
          description: itm.description || "",
          quantity: q,
          unit_Price: p,
          unitPrice: p,
          total_Price: Number(itm.totalPrice || q * p),
          totalPrice: Number(itm.totalPrice || q * p),
        };
      }),
      installments: installments.map((ins, idx) => {
        const insName = (
          ins.installment_Name ||
          ins.installmentName ||
          ins.name ||
          `Installment #${idx + 1}`
        ).trim();
        const dateIso = ins.due_Date || ins.dueDate
          ? new Date(ins.due_Date || ins.dueDate).toISOString()
          : new Date().toISOString();
        return {
          installment_Name: insName,
          installmentName: insName,
          amount: Number(ins.amount || 0),
          due_Date: dateIso,
          dueDate: dateIso,
        };
      }),
    };

    saveMutation.mutate(payload);
  };

  if (isFetching || (isLoadingLookups && isEdit)) {
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
          infoTooltip="Create or edit rental agreements, configure contract items and installment schedule matching API schema."
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/rentals")}
            className="h-10 px-6 rounded-xl text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            Save Contract
          </Button>
        </div>
      </div>

      {/* Main Grid: Left 8 cols (Form Sections), Right 4 cols (Summary Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Contract Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-800">
              Contract Information
            </h2>

            {/* Row 1: Contract Number, Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Number
                </Label>
                <Input
                  placeholder="e.g. CNT-2026-002"
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
                  key={`customer-${formData.customerId || "none"}`}
                  value={formData.customerId || undefined}
                  onValueChange={(val) => {
                    const cust = effectiveCustomers.find((c) => String(c.id) === String(val));
                    handleInputChange("customerId", val);
                    handleInputChange("customerName", cust?.name || "");
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Customer">
                      {effectiveCustomers.find((c) => String(c.id) === String(formData.customerId))?.name || formData.customerName || "Select Customer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveCustomers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Contract Title, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Contract Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. ERP System Development & Rental Agreement"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                  required
                />
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Start Date, End Date, Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Currency
                </Label>
                <Select
                  key={`curr-${formData.currencyId || "none"}`}
                  value={formData.currencyId || undefined}
                  onValueChange={(val) => {
                    const selCurr = effectiveCurrencies.find((curr) => String(curr.id) === String(val));
                    handleInputChange("currencyId", val);
                    if (selCurr) {
                      handleInputChange("currencyCode", selCurr.code || selCurr.name || "USD");
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                    <SelectValue placeholder="Select Currency">
                      {effectiveCurrencies.find((curr) => String(curr.id) === String(formData.currencyId))?.code || formData.currencyCode || "USD"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveCurrencies.map((curr) => (
                      <SelectItem key={curr.id} value={String(curr.id)}>
                        {curr.name} {curr.code ? `(${curr.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Description
              </Label>
              <Textarea
                rows={2}
                placeholder="Brief summary of contract scope and deliverables..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
              />
            </div>

            {/* Row 5: Terms and Conditions */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Terms & Conditions
              </Label>
              <Textarea
                rows={3}
                placeholder="Payment obligations, termination clauses, and operational policies..."
                value={formData.terms_And_Conditions}
                onChange={(e) => handleInputChange("terms_And_Conditions", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
              />
            </div>
          </div>

          {/* Card 2: Contract Items Table */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Contract Items & Services
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itemized modules, services, or equipment included in this contract.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-semibold gap-1 text-[#0066d1] border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-2 text-start w-[30%]">Item / Service Name</th>
                    <th className="py-2.5 px-2 text-start w-[30%]">Description</th>
                    <th className="py-2.5 px-2 text-start w-[12%]">Qty</th>
                    <th className="py-2.5 px-2 text-start w-[15%]">Unit Price</th>
                    <th className="py-2.5 px-2 text-start w-[13%]">Total</th>
                    <th className="py-2.5 px-2 text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2">
                        <Input
                          placeholder="e.g. Accounting Module"
                          value={item.customItemName}
                          onChange={(e) => handleItemChange(idx, "customItemName", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Input
                          placeholder="Deliverable details..."
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-slate-800">
                        ${Number(item.totalPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Installments Table */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Payment Installments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestone payments and due dates scheduled for this contract.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleAddInstallment}
                variant="outline"
                size="sm"
                className="h-9 rounded-xl text-xs font-semibold gap-1 text-[#0066d1] border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Installment
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-2.5 px-2 text-start w-[40%]">Installment Name / Milestone</th>
                    <th className="py-2.5 px-2 text-start w-[25%]">Amount</th>
                    <th className="py-2.5 px-2 text-start w-[25%]">Due Date</th>
                    <th className="py-2.5 px-2 text-center w-[10%]">Status</th>
                    <th className="py-2.5 px-2 text-center w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {installments.map((ins, idx) => (
                    <tr key={ins.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2">
                        <Input
                          placeholder="e.g. Advance Payment upon signing"
                          value={ins.installmentName}
                          onChange={(e) => handleInstallmentChange(idx, "installmentName", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ins.amount}
                          onChange={(e) => handleInstallmentChange(idx, "amount", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Input
                          type="date"
                          value={ins.dueDate}
                          onChange={(e) => handleInstallmentChange(idx, "dueDate", e.target.value)}
                          className="h-9 rounded-lg text-xs border-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          ins.status === "Invoiced" || ins.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {ins.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInstallment(idx)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5 sticky top-6">
          <h2 className="text-base font-bold text-slate-800">
            Contract Financial Summary
          </h2>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Total ({items.length} items):</span>
              <span className="font-semibold text-slate-800">
                ${calculations.totalItemsAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Scheduled Installments ({installments.length}):</span>
              <span className="font-semibold text-slate-800">
                ${calculations.totalInstallmentsAmount.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-slate-900 font-bold text-sm">
              <span>Total Contract Amount:</span>
              <span className="text-[#0066d1] text-base">
                ${calculations.totalItemsAmount.toLocaleString()}
              </span>
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              calculations.isBalanced
                ? "bg-emerald-50/70 border-emerald-100 text-emerald-800"
                : "bg-amber-50/70 border-amber-100 text-amber-800"
            }`}>
              <span className="font-medium">
                {calculations.isBalanced ? "Installments fully allocated" : "Unallocated Balance:"}
              </span>
              <span className="font-bold">
                ${Math.abs(calculations.difference).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

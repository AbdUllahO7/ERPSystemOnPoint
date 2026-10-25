import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Layers,
  DollarSign,
  AlertCircle,
  FileText,
  Building2,
  CreditCard,
  Banknote,
  Landmark,
  X,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import {
  getAllInvoicePatterns,
  getWarehouses,
  getCustomerContractById,
  createSalesInvoice,
  checkoutCustomerContractInstallment,
} from "@/lib/api";

export function IssueContractInvoiceDialog({
  contract,
  open,
  onOpenChange,
  onSuccess,
}) {
  const queryClient = useQueryClient();

  // Load latest contract details (equivalent to GetAvailableDataForInvoiceAsync)
  const { data: contractDetailData, isLoading: isLoadingContract } = useQuery({
    queryKey: ["customerContractDetail", contract?.id],
    queryFn: () => getCustomerContractById(contract.id),
    enabled: !!contract?.id && open,
  });

  const liveContract = contractDetailData?.data || contract || {};

  // Load Sales Invoice Patterns
  const { data: patternsData } = useQuery({
    queryKey: ["invoicePatterns", "Sales"],
    queryFn: () => getAllInvoicePatterns({ Type: "Sales", pageSize: 50 }),
    enabled: open,
  });
  const invoicePatterns = patternsData?.data?.items || [];

  // Load Warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["warehousesList"],
    queryFn: () => getWarehouses({ pageSize: 50 }),
    enabled: open,
  });
  const warehouses = warehousesData?.data?.items || [];

  // Form State
  const [invoicePatternId, setInvoicePatternId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit"); // Default to Credit (آجل) to safely allow partial payments
  const [paidAmount, setPaidAmount] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");

  // List 1: Contract Items with quantities to bill
  const [billedQuantities, setBilledQuantities] = useState({});

  // List 2: Selected Installment IDs
  const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);

  // Auto-select initial pattern and warehouse if available
  useEffect(() => {
    if (invoicePatterns.length > 0 && !invoicePatternId) {
      const defaultPattern =
        invoicePatterns.find((p) => p.isDefault) || invoicePatterns[0];
      if (defaultPattern) {
        setInvoicePatternId(String(defaultPattern.id));
        if (defaultPattern.wareHouse_Id) {
          setWarehouseId(String(defaultPattern.wareHouse_Id));
        }
      }
    }
  }, [invoicePatterns, invoicePatternId]);

  // Available contract items (GetAvailableDataForInvoiceAsync representation)
  const availableItems = useMemo(() => {
    const rawItems = liveContract.items || [];
    if (rawItems.length === 0) {
      const contractedQty = Number(liveContract.quantity || 1);
      const invoicedQty = Number(liveContract.invoicedQuantity || 0);
      const availableQty = Math.max(0, contractedQty - invoicedQty);
      const unitPrice = Number(
        liveContract.totalAmount || liveContract.total || 0
      );

      return [
        {
          id: liveContract.id || "default-item",
          custom_Item_Name:
            liveContract.title ||
            liveContract.resource ||
            "خدمات وبنود العقد (Contract Items)",
          quantity: contractedQty,
          invoicedQuantity: invoicedQty,
          availableQuantity: availableQty,
          unit_Price: unitPrice,
        },
      ];
    }

    return rawItems.map((item, idx) => {
      const contractedQty = Number(item.quantity || 1);
      const invoicedQty = Number(item.invoicedQuantity || 0);
      const availableQty = Math.max(0, contractedQty - invoicedQty);
      const unitPrice = Number(item.unit_Price || 0);

      return {
        ...item,
        keyId: item.id || `item-${idx}`,
        quantity: contractedQty,
        invoicedQuantity: invoicedQty,
        availableQuantity: availableQty,
        unit_Price: unitPrice,
      };
    });
  }, [liveContract]);

  // Available contract installments
  const availableInstallments = useMemo(() => {
    const rawInst = liveContract.installments || [];
    return rawInst.map((inst, idx) => ({
      ...inst,
      keyId: inst.id || `inst-${idx}`,
      amount: Number(inst.amount || 0),
      isBilled: !!inst.isBilled || !!inst.invoiceId || !!inst.invoice_Id,
    }));
  }, [liveContract]);

  // Initialize billed quantities when availableItems changes
  useEffect(() => {
    if (availableItems.length > 0) {
      const initial = {};
      availableItems.forEach((it) => {
        initial[it.keyId || it.id] = it.availableQuantity;
      });
      setBilledQuantities(initial);
    }
  }, [availableItems]);

  // Total invoice calculation based on selected billed quantities
  const invoiceTotal = useMemo(() => {
    return availableItems.reduce((acc, it) => {
      const billQty = Number(billedQuantities[it.keyId || it.id] || 0);
      return acc + billQty * it.unit_Price;
    }, 0);
  }, [availableItems, billedQuantities]);

  // Adjust paid amount default when invoice total changes if user hasn't typed a custom amount
  useEffect(() => {
    if (paymentMethod === "Cash" || paymentMethod === "Bank") {
      setPaidAmount(invoiceTotal);
    }
  }, [invoiceTotal, paymentMethod]);

  // Total of selected installments (List 2)
  const installmentsTotal = useMemo(() => {
    return availableInstallments
      .filter((inst) => selectedInstallmentIds.includes(inst.keyId || inst.id))
      .reduce((acc, inst) => acc + inst.amount, 0);
  }, [availableInstallments, selectedInstallmentIds]);

  // Installment sum difference
  const installmentDifference = installmentsTotal - invoiceTotal;
  const hasSelectedInstallments = selectedInstallmentIds.length > 0;
  const isInstallmentSumMatching =
    !hasSelectedInstallments || Math.abs(installmentDifference) < 0.01;

  // Payment Method Compatibility Rule (Image Page 6):
  // Cash / Bank requires full payment, partial payment requires Credit (آجل)
  const isPaymentMethodIncompatible =
    (paymentMethod === "Cash" || paymentMethod === "Bank") &&
    Number(paidAmount) < Number(invoiceTotal) &&
    Number(invoiceTotal) > 0;

  // Validation Checks
  const hasValidQuantities = useMemo(() => {
    let hasAtLeastOne = false;
    for (const it of availableItems) {
      const qty = Number(billedQuantities[it.keyId || it.id] || 0);
      if (qty < 0 || qty > it.availableQuantity) {
        return false;
      }
      if (qty > 0) {
        hasAtLeastOne = true;
      }
    }
    return hasAtLeastOne;
  }, [availableItems, billedQuantities]);

  const canSubmit =
    hasValidQuantities &&
    invoiceTotal > 0 &&
    isInstallmentSumMatching &&
    !isPaymentMethodIncompatible &&
    !!invoicePatternId;

  // Submit Mutation
  const issueMutation = useMutation({
    mutationFn: async () => {
      // 1. Re-validate contract validity & pattern
      if (!invoicePatternId) {
        throw new Error("يرجى اختيار نمط فاتورة مبيعات صالح.");
      }

      // 2. Aggregate duplicate items and verify positive quantities <= remaining
      const itemsToBill = [];
      for (const it of availableItems) {
        const qty = Number(billedQuantities[it.keyId || it.id] || 0);
        if (qty > 0) {
          if (qty > it.availableQuantity) {
            throw new Error(
              `الكمية المطلوبة للبند (${it.custom_Item_Name}) تتجاوز المتبقي المتاح (${it.availableQuantity}).`
            );
          }
          itemsToBill.push({
            productVariant_Id: it.productVariantId || it.productVariant_Id || null,
            unitOfMeasurement_Id: it.unitOfMeasurementId || it.unitOfMeasurement_Id || null,
            custom_Item_Name: it.custom_Item_Name || "Contract Item",
            quantity: qty,
            unit_Price: it.unit_Price,
            discount_Percentage: 0,
            tax_Percentage: 0,
          });
        }
      }

      if (itemsToBill.length === 0) {
        throw new Error("يجب تحديد كمية موجبة لبند واحد على الأقل.");
      }

      // 3. Verify installments condition: if selected, sum must strictly equal invoice total
      if (hasSelectedInstallments && !isInstallmentSumMatching) {
        throw new Error(
          `مجموع الأقساط المختارة (${installmentsTotal}) لا يطابق إجمالي الفاتورة (${invoiceTotal}).`
        );
      }

      // 4. Verify payment method compatibility
      if (isPaymentMethodIncompatible) {
        throw new Error(
          "نمط الدفع النقدي أو البنكي يجعل الفاتورة مدفوعة بالكامل. للتحصيل الجزئي يرجى استخدام نمط آجل (Credit)."
        );
      }

      // 5. Build structured Invoice payload with formal contract reference
      const contractRefNote = `[عقد رقم: ${liveContract.contractNumber || liveContract.id}] ${
        liveContract.title ? "- " + liveContract.title : ""
      } ${note ? "| " + note : ""}`;

      const salesPayload = {
        invoice_Number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_Date: new Date(invoiceDate).toISOString(),
        invoicePattern_Id: invoicePatternId,
        customer_id: liveContract.customerId || null,
        warehouse_Id: warehouseId || null,
        payment_Method: paymentMethod,
        paid_Amount: Number(paidAmount) || 0,
        contractId: liveContract.id,
        contractNumber: liveContract.contractNumber,
        note: contractRefNote,
        createInvoiceDetailsDto: itemsToBill,
        // Optional installments linked to the invoice
        paymentSchedules: availableInstallments
          .filter((inst) =>
            selectedInstallmentIds.includes(inst.keyId || inst.id)
          )
          .map((inst) => ({
            description: inst.installment_Name || "قسط عقد",
            amountDue: inst.amount,
            dueDate: inst.due_Date
              ? new Date(inst.due_Date).toISOString()
              : new Date().toISOString(),
          })),
      };

      // Call createSalesInvoice
      return await createSalesInvoice(salesPayload);
    },
    onSuccess: (res) => {
      toast.success("تم إصدار الفاتورة من العقد وربط البنود والأقساط بنجاح!");
      queryClient.invalidateQueries(["customerContracts"]);
      queryClient.invalidateQueries(["customerContractDetail"]);
      queryClient.invalidateQueries(["customerInvoices"]);
      queryClient.invalidateQueries(["getAllInvoices"]);
      if (onSuccess) onSuccess(res);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err?.message || "فشل إصدار الفاتورة من العقد");
    },
  });

  const handleQuantityChange = (keyId, val, maxAvailable) => {
    const num = Math.max(0, Math.min(Number(val) || 0, maxAvailable));
    setBilledQuantities((prev) => ({
      ...prev,
      [keyId]: num,
    }));
  };

  const toggleInstallment = (id) => {
    setSelectedInstallmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  إصدار فاتورة من العقد (Issue Invoice from Contract)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  اختيار ما ستفوتره الآن، مع فصل الفاتورة عن التحصيل الفعلي.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-blue-700 block">
                {liveContract.contractNumber || "Contract"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {liveContract.title || "عقد خدمات"}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="px-6 py-4 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Executive Overview Banner & Guidance Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                لماذا يوجد قائمتان في الطلب؟ (Lists Purpose):
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                GetAvailableDataForInvoiceAsync
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-blue-700 block mb-0.5">
                  1. ContractItemsDtoInvoices:
                </span>
                <span className="text-slate-600">
                  تختار بنود العقد وكمياتها التي ستظهر في الفاتورة (موجبة ولا تتجاوز المتبقي).
                </span>
              </div>
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-purple-700 block mb-0.5">
                  2. InstallmentIds (اختيارية):
                </span>
                <span className="text-slate-600">
                  تحدد الأقساط التي ستُربط بالفاتورة الناتجة، ويُشترط تطابق مجموعها مع قيمة الفاتورة بدقة.
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Invoicing Patterns & Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                نمط الفاتورة (Sales Pattern) <span className="text-red-500">*</span>
              </Label>
              <Select
                value={invoicePatternId}
                onValueChange={(val) => {
                  setInvoicePatternId(val);
                  const p = invoicePatterns.find((ip) => String(ip.id) === val);
                  if (p?.wareHouse_Id) setWarehouseId(String(p.wareHouse_Id));
                  if (p?.paymentPay) setPaymentMethod(p.paymentPay);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اختر نمط الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  {invoicePatterns.map((pat) => (
                    <SelectItem key={pat.id} value={String(pat.id)}>
                      {pat.pattern_Name || pat.name || "نمط مبيعات"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">المستودع (Warehouse)</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="اختر المستودع" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={String(wh.id)}>
                      {wh.warehouse_Name || wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">تاريخ الفاتورة (Date)</Label>
              <Input
                type="date"
                className="h-9"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* List 1: ContractItemsDtoInvoices Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <Label className="font-bold text-xs">
                  القائمة الأولى: بنود العقد والكميات (ContractItemsDtoInvoices)
                </Label>
              </div>
              <span className="text-[11px] text-muted-foreground">
                الكميات موجبة ولا تتجاوز المتبقي
              </span>
            </div>

            <div className="border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">البند (Item)</th>
                    <th className="p-2.5 text-center">المتعاقد (Contracted)</th>
                    <th className="p-2.5 text-center">المفوتر مسبقاً (Billed)</th>
                    <th className="p-2.5 text-center">المتبقي (Available)</th>
                    <th className="p-2.5 text-right">سعر الوحدة</th>
                    <th className="p-2.5 w-32 text-center bg-blue-50/50">
                      الكمية للفوترة الآن
                    </th>
                    <th className="p-2.5 text-right">إجمالي البند</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {availableItems.map((it) => {
                    const key = it.keyId || it.id;
                    const billQty = Number(billedQuantities[key] || 0);
                    const lineTotal = billQty * it.unit_Price;
                    const isOver = billQty > it.availableQuantity;

                    return (
                      <tr key={key} className={isOver ? "bg-red-50/60" : ""}>
                        <td className="p-2.5 font-medium">{it.custom_Item_Name}</td>
                        <td className="p-2.5 text-center text-slate-600">
                          {it.quantity}
                        </td>
                        <td className="p-2.5 text-center text-amber-700 font-semibold">
                          {it.invoicedQuantity}
                        </td>
                        <td className="p-2.5 text-center text-emerald-700 font-bold">
                          {it.availableQuantity}
                        </td>
                        <td className="p-2.5 text-right font-medium">
                          ${it.unit_Price.toLocaleString()}
                        </td>
                        <td className="p-2.5 bg-blue-50/30">
                          <Input
                            type="number"
                            min="0"
                            max={it.availableQuantity}
                            step="any"
                            value={billedQuantities[key] ?? ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                key,
                                e.target.value,
                                it.availableQuantity
                              )
                            }
                            className={`h-8 text-center font-bold text-xs ${
                              isOver ? "border-red-500 text-red-600" : ""
                            }`}
                          />
                        </td>
                        <td className="p-2.5 text-right font-bold text-blue-700">
                          ${lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-2 bg-slate-50 border rounded-lg text-xs font-semibold">
              <span className="text-muted-foreground me-2">
                إجمالي الفاتورة المحسوبة (Invoice Total):
              </span>
              <span className="text-blue-700 font-bold text-sm">
                ${invoiceTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* List 2: InstallmentIds Table (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <Label className="font-bold text-xs">
                  القائمة الثانية: ربط الأقساط بالفاتورة (InstallmentIds - اختيارية)
                </Label>
              </div>
              <span className="text-[11px] text-muted-foreground">
                يُشترط تطابق مجموع الأقساط مع قيمة الفاتورة عند اختيارها
              </span>
            </div>

            {availableInstallments.length === 0 ? (
              <div className="p-3 bg-slate-50 border rounded-xl text-center text-slate-500 text-xs">
                لا توجد أقساط مجدولة في هذا العقد. سيتم إصدار الفاتورة بدون ربط أقساط.
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5 w-12 text-center">اختيار</th>
                      <th className="p-2.5">القسط (Installment)</th>
                      <th className="p-2.5 text-center">تاريخ الاستحقاق</th>
                      <th className="p-2.5 text-center">الحالة</th>
                      <th className="p-2.5 text-right">المبلغ ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {availableInstallments.map((inst) => {
                      const key = inst.keyId || inst.id;
                      const isSelected = selectedInstallmentIds.includes(key);

                      return (
                        <tr
                          key={key}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-purple-50/50" : "hover:bg-slate-50/60"
                          }`}
                          onClick={() => toggleInstallment(key)}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleInstallment(key)}
                              className="w-4 h-4 rounded border-slate-300 accent-purple-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 font-medium">
                            {inst.installment_Name || "قسط مجدول"}
                          </td>
                          <td className="p-2.5 text-center text-slate-600">
                            {inst.due_Date
                              ? new Date(inst.due_Date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="p-2.5 text-center">
                            {inst.isBilled ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">
                                مفوتر سابقاً
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">
                                متاح للربط
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-bold text-purple-700">
                            ${inst.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Installment Validation Status Badge */}
            {hasSelectedInstallments && (
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                  isInstallmentSumMatching
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isInstallmentSumMatching ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    مجموع الأقساط المختارة:{" "}
                    <strong>${installmentsTotal.toLocaleString()}</strong> | إجمالي
                    الفاتورة: <strong>${invoiceTotal.toLocaleString()}</strong>
                  </span>
                </div>
                <div>
                  {isInstallmentSumMatching ? (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-semibold text-[11px]">
                      ✓ متطابق تماماً
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded font-bold text-[11px]">
                      عدم تطابق (الفارق: ${Math.abs(installmentDifference).toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method & Compatibility Rule */}
          <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                طريقة الدفع ومبلغ التحصيل الفعلي (Payment & Paid Amount)
              </Label>
              <span className="text-[11px] text-muted-foreground">
                فصل الفاتورة عن التحصيل الفعلي
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  طريقة الدفع (Payment Method)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Cash", label: "نقدي (Cash)", icon: Banknote },
                    { id: "Bank", label: "بنكي (Bank)", icon: Landmark },
                    { id: "Credit", label: "آجل (Credit)", icon: CreditCard },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === pm.id
                          ? "border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <pm.icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Amount Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>المبلغ المحصل الآن (Paid Amount)</span>
                  <span className="text-muted-foreground font-normal text-[11px]">
                    المتبقي ديناً: ${(Math.max(0, invoiceTotal - paidAmount)).toLocaleString()}
                  </span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                  className="h-10 text-base font-bold text-blue-700 bg-white"
                />
              </div>
            </div>

            {/* Payment Compatibility Callout from Page 6 */}
            {isPaymentMethodIncompatible ? (
              <div className="p-3 bg-amber-50 border-r-4 border-amber-600 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    توافق طريقة الدفع: نمط غير متوافق مع التحصيل الجزئي!
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    خدمة المبيعات تجعل الفاتورة النقدية أو البنكية مدفوعة بالكامل (${invoiceTotal}).
                    لذلك يجب دفع كامل المبلغ الآن، أو التبديل إلى <strong>نمط آجل (Credit)</strong> للسماح
                    بالمبلغ الجزئي (${paidAmount}) حتى لا تختلف مالية العقد عن مالية الفاتورة.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] mt-1 bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                    onClick={() => setPaymentMethod("Credit")}
                  >
                    تبديل إلى نمط دفع آجل (Credit) الآن
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>تذكير مهم:</strong> حالة القسط «مفوتر» لا تعني «مدفوع». التحصيل اللاحق
                  ينعكس على العقد عبر معرف الفاتورة.
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Notes & Contract Reference */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              ملاحظات ومرجع الفاتورة (Structured Reference & Notes)
            </Label>
            <Textarea
              placeholder="أدخل أي ملاحظات إضافية للفاتورة..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[55px] text-xs resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-border bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-muted-foreground">
            <span>إجمالي الفاتورة: </span>
            <strong className="text-blue-700 text-sm">
              ${invoiceTotal.toLocaleString()}
            </strong>
            <span className="mx-2">•</span>
            <span>التحصيل: </span>
            <strong className="text-emerald-700">
              ${Number(paidAmount).toLocaleString()}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              إلغاء (Cancel)
            </Button>

            <Button
              type="button"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 gap-1.5"
              disabled={!canSubmit || issueMutation.isPending}
              onClick={() => issueMutation.mutate()}
            >
              {issueMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري إصدار الفاتورة...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  إصدار الفاتورة وحفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

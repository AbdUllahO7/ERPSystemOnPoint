import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  DollarSign,
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  Landmark,
  Wallet,
  Building2,
  Percent,
  Package,
  FileText,
  Clock,
  Info,
  RotateCw,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  createPurchaseInvoice,
  getAllInvoicePatterns,
  getWarehouses,
  getAllCurrencies,
  getAllCostCenters,
  getInventoryPricingLookup,
  searchMaterialsForInvoice,
  getAllUnitOfMeasurements,
} from "@/lib/api";

const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash", subLabel: "نقداً", icon: Banknote },
  { id: "Card", label: "Card", subLabel: "بطاقة", icon: CreditCard },
  { id: "Bank", label: "Bank", subLabel: "تحويل بنكي", icon: Landmark },
  { id: "Wallet", label: "Wallet", subLabel: "محفظة", icon: Wallet },
  { id: "Credit", label: "Credit", subLabel: "آجل", icon: Clock },
];

export function CreateContractPurchaseInvoiceDialog({
  contract,
  contracts = [],
  supplierId,
  open,
  onOpenChange,
}) {
  const queryClient = useQueryClient();

  // Selected Contract ID
  const [selectedContractId, setSelectedContractId] = useState(contract?.id || "");

  useEffect(() => {
    if (contract?.id) {
      setSelectedContractId(contract.id);
    } else if (contracts.length > 0 && !selectedContractId) {
      setSelectedContractId(contracts[0].id);
    }
  }, [contract, contracts, selectedContractId]);

  const activeContract = useMemo(() => {
    return (
      contracts.find((c) => String(c.id) === String(selectedContractId)) ||
      contract ||
      null
    );
  }, [contracts, selectedContractId, contract]);

  const contractCeiling = Number(activeContract?.totalValue || 0);
  const contractConsumed = Number(activeContract?.consumedAmount || 0);
  const contractRemaining = Math.max(0, contractCeiling - contractConsumed);

  // Generate random invoice number
  const generateNewInvoiceNumber = () => {
    return `PINV-${Math.floor(100000 + Math.random() * 900000)}`;
  };

  // Form Basic Fields
  const [invoiceNumber, setInvoiceNumber] = useState(generateNewInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [invoicePatternId, setInvoicePatternId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [costCenterId, setCostCenterId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [note, setNote] = useState("");

  // Pay in installments state
  const [payInInstallments, setPayInInstallments] = useState(false);
  const [paymentSchedules, setPaymentSchedules] = useState([]);

  // Line Items state
  const [lineItems, setLineItems] = useState([
    {
      id: "item-1",
      productVariant_Id: "",
      quantity: 1,
      unitOfMeasurement_Id: "",
      unit_Price: 0,
      discount_Percentage: 0,
      discount_Amount: 0,
      tax_Percentage: 0,
      tax_Amount: 0,
      barcode: "",
      is_Service_Item: false,
    },
  ]);

  // Load Invoice Patterns (Purchases)
  const { data: patternsData } = useQuery({
    queryKey: ["getAllInvoicePatterns", "Purchases"],
    queryFn: () => getAllInvoicePatterns({ Type: "Purchases", pageSize: 100 }),
    enabled: open,
  });
  const invoicePatterns = patternsData?.data?.items || [];

  // Load Warehouses
  const { data: warehousesData } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
    enabled: open,
  });
  const warehouses = warehousesData?.data?.items || [];

  // Load Currencies
  const { data: currenciesData } = useQuery({
    queryKey: ["getAllCurrencies"],
    queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }),
    enabled: open,
  });
  const currencies = currenciesData?.data?.items || [];

  // Load Cost Centers
  const { data: costCentersData } = useQuery({
    queryKey: ["getAllCostCenters"],
    queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }),
    enabled: open,
  });
  const costCenters = costCentersData?.data?.items || [];

  // Load Unit of Measurements
  const { data: unitsData } = useQuery({
    queryKey: ["getAllUnitOfMeasurements"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
    enabled: open,
  });

  // Load Materials from GET /api/HR/Lookups/GetInventoryPricing/GetInventoryPricing
  const { data: pricingData, isLoading: isLoadingMaterials } = useQuery({
    queryKey: ["getInventoryPricingLookup"],
    queryFn: () => getInventoryPricingLookup(),
    enabled: open,
  });

  // Fallback search materials
  const { data: searchMaterialsData } = useQuery({
    queryKey: ["searchMaterialsForInvoice"],
    queryFn: () => searchMaterialsForInvoice({ PageNumber: 1, PageSize: 1000 }),
    enabled: open,
  });

  const availableMaterials = useMemo(() => {
    // 1. Primary: HR/Lookups/GetInventoryPricing/GetInventoryPricing
    const pricingList =
      pricingData?.data?.items ||
      pricingData?.data ||
      pricingData?.items ||
      (Array.isArray(pricingData) ? pricingData : []);

    if (Array.isArray(pricingList) && pricingList.length > 0) {
      return pricingList;
    }

    // 2. Fallback: searchMaterialsForInvoice
    const fallbackList =
      searchMaterialsData?.data?.items ||
      searchMaterialsData?.data ||
      searchMaterialsData?.items ||
      (Array.isArray(searchMaterialsData) ? searchMaterialsData : []);

    if (Array.isArray(fallbackList) && fallbackList.length > 0) {
      return fallbackList;
    }

    return [];
  }, [pricingData, searchMaterialsData]);

  const globalUnits = useMemo(() => {
    const list =
      unitsData?.data?.items ||
      unitsData?.data ||
      unitsData?.items ||
      (Array.isArray(unitsData) ? unitsData : []);

    const stdFallback = [
      { id: "a3419b47-923a-4ca5-aacd-61a216d2bf6b", name: "Piece (قطعة)" },
      { id: "56d99347-0fde-4ee5-9e70-e7a8df510eb3", name: "Box (صندوق)" },
      { id: "c18df685-6184-4824-aeb5-3168d8767798", name: "Kg (كيلوغرام)" },
      { id: "d29ea796-7295-4935-bfc6-4279e98788a9", name: "Meter (متر)" },
    ];

    if (Array.isArray(list) && list.length > 0) {
      return list.map((u) => ({
        id: String(u.id || u.unitOfMesuranse_Id || u.unitOfMeasurement_Id),
        name: u.name || u.unitName || u.name_Unit || "Unit",
      }));
    }
    return stdFallback;
  }, [unitsData]);

  const getUnitsForMaterial = (materialId) => {
    if (!materialId) return globalUnits;

    const prod = availableMaterials.find((p) => {
      const id = p.productVariantId || p.productVariant_Id || p.variantId || p.variant_Id || p.id || p.materialId;
      return String(id) === String(materialId);
    });

    if (prod) {
      // 1. Array of units
      const units =
        prod.availableUnits ||
        prod.productUnitDtos ||
        prod.units ||
        prod.unitOfMeasurements ||
        prod.pricingUnits ||
        [];

      if (Array.isArray(units) && units.length > 0) {
        return units.map((u) => ({
          id: String(u.unitOfMesuranse_Id || u.unitOfMeasurement_Id || u.unitId || u.productUnitId || u.id),
          name: u.unitName || u.name || u.name_Unit || "Unit",
          price: u.consumerPrice || u.purchasePrice || u.price || prod.consumerPrice || prod.purchasePrice || prod.price || 0,
        }));
      }

      // 2. Direct unit field on material
      const directUnitId = prod.unitOfMeasurement_Id || prod.unitOfMeasurementId || prod.unitId || prod.unit_Of_Measurement_Id;
      if (directUnitId) {
        return [
          {
            id: String(directUnitId),
            name: prod.unitName || prod.unit_Name || prod.name_Unit || "Default Unit",
            price: prod.consumerPrice || prod.purchasePrice || prod.price || prod.unit_Price || 0,
          },
        ];
      }
    }

    return globalUnits;
  };

  // Auto-select defaults
  useEffect(() => {
    if (invoicePatterns.length > 0 && !invoicePatternId) {
      const def = invoicePatterns.find((p) => p.isDefault) || invoicePatterns[0];
      if (def) {
        setInvoicePatternId(String(def.id));
        if (def.wareHouse_Id) setWarehouseId(String(def.wareHouse_Id));
        if (def.costCenter_id) setCostCenterId(String(def.costCenter_id));
        if (def.paymentPay) setPaymentMethod(def.paymentPay);
      }
    }
  }, [invoicePatterns, invoicePatternId]);

  useEffect(() => {
    if (currencies.length > 0 && !currencyId) {
      const def = currencies.find((c) => c.isDefault) || currencies[0];
      if (def) setCurrencyId(String(def.id));
    }
  }, [currencies, currencyId]);

  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(String(warehouses[0].id));
    }
  }, [warehouses, warehouseId]);

  // Handle Invoice Pattern change
  const handlePatternChange = (patId) => {
    setInvoicePatternId(patId);
    const pat = invoicePatterns.find((p) => String(p.id) === String(patId));
    if (pat) {
      if (pat.wareHouse_Id) setWarehouseId(String(pat.wareHouse_Id));
      if (pat.costCenter_id) setCostCenterId(String(pat.costCenter_id));
      if (pat.paymentPay) setPaymentMethod(pat.paymentPay);
    }
  };

  // Line item handlers
  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        productVariant_Id: "",
        quantity: 1,
        unitOfMeasurement_Id: "",
        unit_Price: 0,
        discount_Percentage: 0,
        discount_Amount: 0,
        tax_Percentage: 0,
        tax_Amount: 0,
        barcode: "",
        is_Service_Item: false,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (lineItems.length <= 1) {
      toast.error("Invoice must contain at least one line item.");
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, prodId) => {
    const prod = availableMaterials.find((p) => {
      const id = p.productVariantId || p.productVariant_Id || p.variantId || p.variant_Id || p.id || p.materialId;
      return String(id) === String(prodId);
    });

    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.productVariant_Id = prodId;

      if (prod) {
        item.barcode = prod.barcode || "";
        item.is_Service_Item = Boolean(prod.isServiceItem || prod.is_Service_Item || prod.isService);

        const units = getUnitsForMaterial(prodId);
        if (units.length > 0) {
          const firstUnit = units[0];
          item.unitOfMeasurement_Id = String(firstUnit.id);
          item.unit_Price = Number(
            firstUnit.price ||
            prod.consumerPrice ||
            prod.purchasePrice ||
            prod.price ||
            prod.unit_Price ||
            prod.unitPrice ||
            0
          );
        } else {
          item.unitOfMeasurement_Id = String(globalUnits[0]?.id || "");
          item.unit_Price = Number(
            prod.consumerPrice ||
            prod.purchasePrice ||
            prod.price ||
            prod.unit_Price ||
            prod.unitPrice ||
            0
          );
        }

        // Recalculate discount & tax
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_Price) || 0;
        const gross = qty * price;
        item.discount_Amount = gross * ((Number(item.discount_Percentage) || 0) / 100);
        const afterDisc = Math.max(0, gross - item.discount_Amount);
        item.tax_Amount = afterDisc * ((Number(item.tax_Percentage) || 0) / 100);
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleUnitSelect = (index, unitId) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.unitOfMeasurement_Id = unitId;

      const units = getUnitsForMaterial(item.productVariant_Id);
      const chosenUnit = units.find((u) => String(u.id) === String(unitId));
      if (chosenUnit && chosenUnit.price && chosenUnit.price > 0) {
        item.unit_Price = Number(chosenUnit.price);
        const qty = Number(item.quantity) || 1;
        const gross = qty * item.unit_Price;
        item.discount_Amount = gross * ((Number(item.discount_Percentage) || 0) / 100);
        const afterDisc = Math.max(0, gross - item.discount_Amount);
        item.tax_Amount = afterDisc * ((Number(item.tax_Percentage) || 0) / 100);
      }
      updated[index] = item;
      return updated;
    });
  };

  // Auto-populate first line item once materials load if it was empty
  useEffect(() => {
    if (availableMaterials.length > 0) {
      setLineItems((prev) => {
        if (prev.length > 0 && !prev[0].productVariant_Id) {
          const firstMat = availableMaterials[0];
          const firstId = String(
            firstMat.productVariantId ||
            firstMat.productVariant_Id ||
            firstMat.variantId ||
            firstMat.variant_Id ||
            firstMat.id ||
            firstMat.materialId ||
            ""
          );
          if (firstId) {
            const units = getUnitsForMaterial(firstId);
            const firstUnitId = units[0]?.id || globalUnits[0]?.id || "";
            const unitPrice = Number(
              units[0]?.price ||
              firstMat.consumerPrice ||
              firstMat.purchasePrice ||
              firstMat.price ||
              firstMat.unit_Price ||
              firstMat.unitPrice ||
              0
            );

            return [
              {
                ...prev[0],
                productVariant_Id: firstId,
                unitOfMeasurement_Id: firstUnitId,
                unit_Price: unitPrice,
                barcode: firstMat.barcode || "",
                is_Service_Item: Boolean(firstMat.isServiceItem || firstMat.is_Service_Item),
              },
              ...prev.slice(1),
            ];
          }
        }
        return prev;
      });
    }
  }, [availableMaterials, globalUnits]);

  const handleItemFieldChange = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      const qty = field === "quantity" ? Number(value) || 0 : Number(item.quantity) || 0;
      const price = field === "unit_Price" ? Number(value) || 0 : Number(item.unit_Price) || 0;
      const gross = qty * price;

      if (field === "discount_Percentage") {
        const perc = Number(value) || 0;
        item.discount_Amount = gross * (perc / 100);
      } else if (field === "discount_Amount") {
        const amt = Number(value) || 0;
        item.discount_Percentage = gross > 0 ? (amt / gross) * 100 : 0;
      } else if (field === "quantity" || field === "unit_Price") {
        const perc = Number(item.discount_Percentage) || 0;
        item.discount_Amount = gross * (perc / 100);
      }

      const discAmt = Number(item.discount_Amount) || 0;
      const afterDisc = Math.max(0, gross - discAmt);

      if (field === "tax_Percentage") {
        const taxPerc = Number(value) || 0;
        item.tax_Amount = afterDisc * (taxPerc / 100);
      } else if (field === "tax_Amount") {
        const taxAmt = Number(value) || 0;
        item.tax_Percentage = afterDisc > 0 ? (taxAmt / afterDisc) * 100 : 0;
      } else if (field === "quantity" || field === "unit_Price" || field === "discount_Percentage" || field === "discount_Amount") {
        const taxPerc = Number(item.tax_Percentage) || 0;
        item.tax_Amount = afterDisc * (taxPerc / 100);
      }

      updated[index] = item;
      return updated;
    });
  };

  // Installment schedules handlers
  const handleAddSchedule = () => {
    setPaymentSchedules((prev) => [
      ...prev,
      {
        id: `sch-${Date.now()}`,
        description: `Installment #${prev.length + 1}`,
        amountDue: 0,
        dueDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveSchedule = (index) => {
    setPaymentSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index, field, value) => {
    setPaymentSchedules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Financial Summary
  const summary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    lineItems.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_Price) || 0;
      const gross = qty * price;
      const disc = Number(item.discount_Amount) || 0;
      const tax = Number(item.tax_Amount) || 0;

      subtotal += gross;
      totalDiscount += disc;
      totalTax += tax;
    });

    const netTotal = Math.max(0, subtotal - totalDiscount + totalTax);
    return {
      subtotal,
      totalDiscount,
      totalTax,
      total: netTotal,
    };
  }, [lineItems]);

  // Auto set paid amount if Cash/Bank and paid amount was 0 or untouched
  useEffect(() => {
    if (paymentMethod === "Cash" || paymentMethod === "Bank") {
      setPaidAmount(summary.total);
    }
  }, [paymentMethod, summary.total]);

  // Projected ceiling calculations
  const projectedRemainingCeiling = contractRemaining - summary.total;
  const isCeilingExceeded = summary.total > contractRemaining && contractCeiling > 0;
  const consumedPercent = contractCeiling > 0 ? Math.min(100, Math.round((contractConsumed / contractCeiling) * 100)) : 0;

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => createPurchaseInvoice(payload),
    onSuccess: () => {
      toast.success("Purchase invoice created and linked to contract successfully!");
      queryClient.invalidateQueries({ queryKey: ["supplierContracts", supplierId] });
      queryClient.invalidateQueries({ queryKey: ["getSupplierInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["getAllInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
      onOpenChange(false);
    },
    onError: (err) => {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.message ||
        "Failed to create purchase invoice";
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error("Supplier ID is missing.");
      return;
    }
    if (!invoiceNumber.trim()) {
      toast.error("Please enter an Invoice Number.");
      return;
    }
    if (!invoicePatternId) {
      toast.error("Please select an Invoice Pattern.");
      return;
    }
    if (!warehouseId) {
      toast.error("Please select a Warehouse.");
      return;
    }
    if (!currencyId) {
      toast.error("Please select a Currency.");
      return;
    }

    const formattedDetails = lineItems.map((item) => ({
      productVariant_Id: item.productVariant_Id || null,
      quantity: Number(item.quantity) || 1,
      unitOfMeasurement_Id: item.unitOfMeasurement_Id || null,
      unit_Price: Number(item.unit_Price) || 0,
      discount_Percentage: Number(item.discount_Percentage) || 0,
      discount_Amount: Number(item.discount_Amount) || 0,
      tax_Percentage: Number(item.tax_Percentage) || 0,
      tax_Amount: Number(item.tax_Amount) || 0,
      barcode: item.barcode || "",
      is_Service_Item: Boolean(item.is_Service_Item),
    }));

    if (formattedDetails.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    let formattedSchedules = [];
    if (payInInstallments && paymentSchedules.length > 0) {
      formattedSchedules = paymentSchedules.map((sch) => ({
        description: sch.description || "Installment",
        amountDue: Number(sch.amountDue) || 0,
        dueDate: sch.dueDate
          ? new Date(sch.dueDate).toISOString()
          : new Date().toISOString(),
      }));
    }

    const payload = {
      invoice_Number: invoiceNumber.trim(),
      invoice_Date: new Date(invoiceDate).toISOString(),
      note: note.trim(),
      invoicePattern_Id: invoicePatternId,
      suppler_id: supplierId,
      supplierId: supplierId,
      warehouse_Id: warehouseId,
      currency_Id: currencyId,
      costCenter_Id: costCenterId || null,
      payment_Method: paymentMethod,
      paid_Amount: Number(paidAmount) || 0,
      contractSupplierId: selectedContractId || null,
      createInvoiceDetailsDto: formattedDetails,
      paymentSchedules: formattedSchedules,
    };

    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          display: "flex",
          flexDirection: "column",
          width: "min(96vw, 1260px)",
          maxWidth: "1260px",
          height: "90vh",
          maxHeight: "90vh",
        }}
        className="!flex !flex-col !p-0 !gap-0 !max-w-[1260px] !w-[96vw] h-[90vh] max-h-[90vh] overflow-hidden rounded-2xl border bg-background shadow-2xl"
      >
        {/* Modern Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-slate-50/90 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Create Purchase Invoice
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Issue invoice linked directly to supplier contract ceiling & inventory
                </p>
              </div>
            </div>

            {activeContract && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Contract: <strong>{activeContract.contractName}</strong></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span className="text-blue-700">Available: ${contractRemaining.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Modal Form Container with Fixed Header and Fixed Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Content Body */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 overscroll-contain"
            style={{ overflowY: "auto" }}
          >
            {/* Executive Contract Status Banner */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60 p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Contract Ceiling Balance
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 px-2 py-0.5 bg-blue-100 rounded-full">
                      {activeContract?.contractName || "Active Contract"}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    Net invoice amount will deduct automatically from this contract ceiling upon issuing.
                  </p>
                </div>
              </div>

              {contracts.length > 1 && (
                <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-xl border border-blue-200">
                  <Label className="text-[11px] font-semibold text-blue-900 whitespace-nowrap pl-1">
                    Contract:
                  </Label>
                  <Select
                    value={selectedContractId}
                    onValueChange={(val) => setSelectedContractId(val)}
                  >
                    <SelectTrigger className="h-7 text-xs bg-transparent border-0 font-medium min-w-[180px]">
                      <SelectValue placeholder="Select Contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.contractName} (Remaining: ${Math.max(0, Number(c.totalValue || 0) - Number(c.consumedAmount || 0)).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="bg-white/95 rounded-xl p-3 border border-blue-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Agreed Ceiling
                </span>
                <span className="text-base font-bold text-blue-950 mt-0.5 block">
                  ${contractCeiling.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">Contract maximum</span>
              </div>

              <div className="bg-white/95 rounded-xl p-3 border border-blue-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                  Already Invoiced
                </span>
                <span className="text-base font-bold text-amber-800 mt-0.5 block">
                  ${contractConsumed.toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-600">{consumedPercent}% consumed</span>
              </div>

              <div className="bg-white/95 rounded-xl p-3 border border-emerald-100 shadow-2xs">
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  Available Balance
                </span>
                <span className="text-base font-bold text-emerald-800 mt-0.5 block">
                  ${contractRemaining.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600">Ready to bill</span>
              </div>

              <div
                className={`rounded-xl p-3 border shadow-2xs ${
                  isCeilingExceeded
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-white/95 border-blue-100"
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wider block ${isCeilingExceeded ? "text-rose-700" : "text-blue-900"}`}>
                  Projected Remaining
                </span>
                <span className={`text-base font-bold mt-0.5 block ${isCeilingExceeded ? "text-rose-700" : "text-blue-950"}`}>
                  ${projectedRemainingCeiling.toLocaleString()}
                </span>
                <span className={`text-[10px] ${isCeilingExceeded ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                  {isCeilingExceeded ? "⚠️ Exceeds ceiling" : "After this invoice"}
                </span>
              </div>
            </div>

            {/* Ceiling Exceeded Alert */}
            {isCeilingExceeded && (
              <div className="flex items-center gap-2.5 p-3 bg-rose-500/10 border border-rose-300 rounded-xl text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                  <strong>Ceiling Limit Warning:</strong> Invoice total (${summary.total.toLocaleString()}) exceeds the available contract ceiling (${contractRemaining.toLocaleString()}) by ${Math.abs(projectedRemainingCeiling).toLocaleString()}.
                </span>
              </div>
            )}
          </div>

          {/* 2-Column Split Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Details, Line Items, Notes (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Invoice Core Information */}
              <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-foreground">Invoice Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Invoice Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground">
                        Invoice # <span className="text-red-500">*</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => setInvoiceNumber(generateNewInvoiceNumber())}
                        className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                        title="Generate random invoice number"
                      >
                        <RotateCw className="w-2.5 h-2.5" /> Auto
                      </button>
                    </div>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="PINV-0001"
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Invoice Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  {/* Invoice Pattern */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Invoice Pattern <span className="text-red-500">*</span>
                    </Label>
                    <Select value={invoicePatternId} onValueChange={handlePatternChange}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Pattern" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {invoicePatterns.map((pat) => (
                          <SelectItem key={pat.id} value={String(pat.id)} className="text-xs">
                            {pat.pattern_Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Warehouse */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Warehouse <span className="text-red-500">*</span>
                    </Label>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Warehouse" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {warehouses.map((w) => (
                          <SelectItem key={w.id} value={String(w.id)} className="text-xs">
                            {w.name_Warehouse || w.name || "Warehouse"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Currency <span className="text-red-500">*</span>
                    </Label>
                    <Select value={currencyId} onValueChange={setCurrencyId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {currencies.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                            {c.currency_Name} ({c.currency_Symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Center */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Cost Center</Label>
                    <Select value={costCenterId} onValueChange={setCostCenterId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Cost Center (Optional)" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {costCenters.map((cc) => (
                          <SelectItem key={cc.id} value={String(cc.id)} className="text-xs">
                            {cc.cost_Center_Name || cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-foreground">Invoice Line Items</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      {lineItems.length} {lineItems.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="gap-1.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 h-8 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item Line
                  </Button>
                </div>

                {/* Styled Items Table */}
                <div className="border rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 border-b text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-3 text-left min-w-[220px]">Item / Product</th>
                          <th className="py-3 px-2 text-left min-w-[120px]">Unit</th>
                          <th className="py-3 px-2 text-center w-20">Qty</th>
                          <th className="py-3 px-2 text-right w-24">Price</th>
                          <th className="py-3 px-2 text-center w-20">Disc %</th>
                          <th className="py-3 px-2 text-center w-20">Tax %</th>
                          <th className="py-3 px-3 text-right w-24">Total</th>
                          <th className="py-3 px-2 text-center w-14">Service</th>
                          <th className="py-3 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {lineItems.map((item, index) => {
                          const gross = (Number(item.quantity) || 0) * (Number(item.unit_Price) || 0);
                          const disc = Number(item.discount_Amount) || 0;
                          const tax = Number(item.tax_Amount) || 0;
                          const lineNet = Math.max(0, gross - disc + tax);

                          const unitsForThisRow = getUnitsForMaterial(item.productVariant_Id);

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              {/* Product Select */}
                              <td className="py-2.5 px-3">
                                <select
                                  className="w-full h-8 text-xs rounded-lg border border-input bg-transparent px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={item.productVariant_Id}
                                  onChange={(e) => handleProductSelect(index, e.target.value)}
                                >
                                  <option value="">
                                    {isLoadingMaterials ? "Loading materials..." : "-- Select Material / Item --"}
                                  </option>
                                  {availableMaterials.map((p, pIdx) => {
                                    const pId = String(
                                      p.productVariantId ||
                                      p.productVariant_Id ||
                                      p.variantId ||
                                      p.variant_Id ||
                                      p.id ||
                                      p.materialId ||
                                      `mat-${pIdx}`
                                    );
                                    const pName =
                                      p.productName ||
                                      p.name_Product ||
                                      p.materialName ||
                                      p.name ||
                                      p.product_Name ||
                                      p.itemName ||
                                      `Material #${pId.substring(0, 6)}`;
                                    const pPrice =
                                      p.consumerPrice ||
                                      p.purchasePrice ||
                                      p.price ||
                                      p.unit_Price ||
                                      p.unitPrice ||
                                      0;
                                    return (
                                      <option key={pId} value={pId}>
                                        {pName} {pPrice > 0 ? `($${Number(pPrice).toFixed(2)})` : ""}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>

                              {/* Unit Select */}
                              <td className="py-2.5 px-2">
                                <select
                                  className="w-full h-8 text-xs rounded-lg border border-input bg-transparent px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={item.unitOfMeasurement_Id}
                                  onChange={(e) => handleUnitSelect(index, e.target.value)}
                                >
                                  {unitsForThisRow.length === 0 && (
                                    <option value="">Select Unit</option>
                                  )}
                                  {unitsForThisRow.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Qty */}
                              <td className="py-2.5 px-2">
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  value={item.quantity}
                                  onChange={(e) => handleItemFieldChange(index, "quantity", e.target.value)}
                                  className="h-8 text-xs text-center px-1"
                                />
                              </td>

                              {/* Price */}
                              <td className="py-2.5 px-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_Price}
                                  onChange={(e) => handleItemFieldChange(index, "unit_Price", e.target.value)}
                                  className="h-8 text-xs text-right px-1"
                                />
                              </td>

                              {/* Discount % */}
                              <td className="py-2.5 px-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={item.discount_Percentage}
                                  onChange={(e) => handleItemFieldChange(index, "discount_Percentage", e.target.value)}
                                  className="h-8 text-xs text-center px-1"
                                />
                              </td>

                              {/* Tax % */}
                              <td className="py-2.5 px-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={item.tax_Percentage}
                                  onChange={(e) => handleItemFieldChange(index, "tax_Percentage", e.target.value)}
                                  className="h-8 text-xs text-center px-1"
                                />
                              </td>

                              {/* Line Total */}
                              <td className="py-2.5 px-3 text-right font-bold text-foreground">
                                ${lineNet.toFixed(2)}
                              </td>

                              {/* Service Toggle */}
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.is_Service_Item}
                                  onChange={(e) => handleItemFieldChange(index, "is_Service_Item", e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                  title="Is Service Item"
                                />
                              </td>

                              {/* Remove */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer Bar */}
                  <div className="bg-slate-50/70 dark:bg-slate-900/40 px-4 py-2.5 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Items Subtotal: <strong className="text-foreground">${summary.subtotal.toFixed(2)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add another item
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-2">
                <Label className="text-xs font-semibold text-foreground">Internal Notes & Memo</Label>
                <Textarea
                  placeholder={`Remarks or instructions for invoice #${invoiceNumber} linked to ${activeContract?.contractName || "contract"}...`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs min-h-[70px] resize-y"
                />
              </div>
            </div>

            {/* Right Column: Payment, Installments, Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Payment Method Card */}
              <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-foreground">Payment Method</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs ring-1 ring-blue-600"
                            : "border-input hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className="w-4 h-4" />
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                        </div>
                        <span className="font-bold text-foreground">{method.label}</span>
                        <span className="text-[10px] text-muted-foreground">{method.subLabel}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Paid Amount */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-foreground">Paid Amount (المدفوع)</Label>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(summary.total)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Pay Full Amount
                    </button>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    className="h-9 text-xs font-semibold"
                  />
                </div>

                {/* Installments Switch */}
                <div className="pt-3 border-t flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Pay in Installments</div>
                    <div className="text-[10px] text-muted-foreground">جدول دفعات مؤجلة</div>
                  </div>
                  <Switch
                    checked={payInInstallments}
                    onCheckedChange={setPayInInstallments}
                  />
                </div>

                {payInInstallments && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Payment Milestones</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSchedule}
                        className="h-7 text-[10px] gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Schedule
                      </Button>
                    </div>

                    {paymentSchedules.length > 0 ? (
                      <div className="space-y-2">
                        {paymentSchedules.map((sch, sIdx) => (
                          <div
                            key={sch.id}
                            className="p-2.5 border rounded-xl bg-slate-50/50 space-y-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground">
                                Milestone #{sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSchedule(sIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <Input
                              placeholder="Description"
                              value={sch.description}
                              onChange={(e) => handleScheduleChange(sIdx, "description", e.target.value)}
                              className="h-7 text-xs"
                            />
                            <div className="grid grid-cols-2 gap-1.5">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Amount"
                                value={sch.amountDue}
                                onChange={(e) => handleScheduleChange(sIdx, "amountDue", e.target.value)}
                                className="h-7 text-xs"
                              />
                              <Input
                                type="date"
                                value={sch.dueDate}
                                onChange={(e) => handleScheduleChange(sIdx, "dueDate", e.target.value)}
                                className="h-7 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground py-2 border rounded-xl bg-slate-50/50">
                        No schedules defined yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Summary Card */}
              <div className="bg-card p-5 rounded-2xl border shadow-xs space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Invoice Financial Summary
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${summary.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Total Discount</span>
                    <span>-${summary.totalDiscount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Tax</span>
                    <span>+${summary.totalTax.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-foreground">Net Invoice Total</span>
                    <span className="text-xl font-extrabold text-blue-600">
                      ${summary.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Paid Amount</span>
                    <span className="font-semibold text-emerald-700">${Number(paidAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Balance Due</span>
                    <span className="font-semibold text-foreground">
                      ${Math.max(0, summary.total - Number(paidAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End of Scrollable Body */}

        {/* Fixed Pinned Dialog Footer */}
        <div className="shrink-0 bg-slate-50/95 dark:bg-slate-900/80 px-6 py-3.5 border-t flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Net Total: <strong className="text-foreground text-sm">${summary.total.toFixed(2)}</strong> • Deducted from contract <strong className="text-blue-700">{activeContract?.contractName}</strong>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
              className="h-10 px-5 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[170px] h-10 text-xs font-bold gap-2 shadow-sm"
              disabled={createMutation.isPending || summary.total <= 0}
            >
              {createMutation.isPending ? (
                "Creating Invoice..."
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  Create Purchase Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      </DialogContent>
    </Dialog>
  );
}

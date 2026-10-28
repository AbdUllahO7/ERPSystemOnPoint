import { useState, useMemo } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getCustomerContracts,
  createCustomerContract,
  getCustomerProjects,
  getCustomerById,
} from "@/lib/api";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Layers,
  DollarSign,
  Info,
  X,
  Trash2,
  Eye,
  Receipt,
  HelpCircle,
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
  DialogClose,
} from "@/components/ui/dialog";
import { IssueContractInvoiceDialog } from "./issue-contract-invoice-dialog";
import { toast } from "react-hot-toast";
import { useI18n } from "@/context/translate-api";

export function ContractsTab({ customerId: propCustomerId }) {
  const { t } = useI18n();
  const params = useParams();
  const customerId = propCustomerId || params.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [invoicingContract, setInvoicingContract] = useState(null);

  const { data: contractsData, isLoading } = useQuery({
    queryKey: ["customerContracts", customerId, page, search],
    queryFn: () =>
      getCustomerContracts({
        CustomerId: customerId,
        PageNumber: page,
        PageSize: pageSize,
        Search: search || undefined,
      }),
    enabled: !!customerId,
  });

  const raw = contractsData?.data || contractsData || {};
  const allItems = raw?.items || (Array.isArray(raw) ? raw : []);

  // Filter to ensure strict customer scoping
  const filteredContracts = useMemo(() => {
    let list = allItems;
    if (customerId) {
      const match = list.filter((c) => String(c.customerId) === String(customerId));
      if (match.length > 0) list = match;
    }
    if (search) {
      list = list.filter(
        (c) =>
          c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
          c.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [allItems, customerId, search]);

  const totalPages =
    raw?.totalPages ||
    Math.ceil((raw?.totalCount || filteredContracts.length) / pageSize) ||
    1;

  // Financial Aggregates
  const totalAgreedValue = filteredContracts.reduce(
    (acc, c) => acc + Number(c.totalAmount || c.total || 0),
    0
  );
  const totalAdvanceCollected = filteredContracts.reduce(
    (acc, c) => acc + Number(c.advancePayment || c.securityDeposit || 0),
    0
  );
  const totalRemainingToCollect = Math.max(0, totalAgreedValue - totalAdvanceCollected);

  const columns = [
    {
      key: "contractNumber",
      label: "Contract #",
      render: (row) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold text-blue-600 block">
              {row.contractNumber || `CC-${String(row.id).substring(0, 6)}`}
            </span>
            <span className="text-[11px] text-muted-foreground">{row.title}</span>
          </div>
        </div>
      ),
    },
    {
      key: "itemsBreakdown",
      label: t?.customerContracts?.itemsAndQuantities || "Items & Quantities",
      render: (row) => {
        const items = row.items || [];
        const firstItem = items[0];
        const contractedQty = firstItem ? Number(firstItem.quantity || 1) : 1;
        const invoicedQty = Number(firstItem?.invoicedQuantity || row.invoicedQuantity || 0);
        const remainingToInvoice = Math.max(0, contractedQty - invoicedQty);

        return (
          <div className="text-xs">
            <span className="font-medium text-foreground block">
              {firstItem?.custom_Item_Name || row.resource || "Services / Units"}
            </span>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Qty: {contractedQty}</span>
              <span>•</span>
              <span className="text-amber-700 font-medium">Billed: {invoicedQty}</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Available: {remainingToInvoice}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "financials",
      label: t?.customerContracts?.contractValueAndAdvance || "Contract Value & Advance",
      render: (row) => {
        const total = Number(row.totalAmount || row.total || 0);
        const advance = Number(row.advancePayment || row.securityDeposit || 0);
        const remaining = Math.max(0, total - advance);

        return (
          <div className="text-xs">
            <span className="font-bold text-blue-600 block">${total.toLocaleString()}</span>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Advance: ${advance.toLocaleString()}</span>
              <span>•</span>
              <span className="text-purple-700 font-medium">
                Remaining to Collect: ${remaining.toLocaleString()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "dates",
      label: "Duration",
      render: (row) => {
        const start = row.startDate ? new Date(row.startDate).toLocaleDateString() : "-";
        const end = row.endDate ? new Date(row.endDate).toLocaleDateString() : "-";
        return (
          <div className="text-xs text-muted-foreground">
            <span>{start}</span>
            <span className="mx-1">→</span>
            <span>{end}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.status || (row.isActive ? "Active" : "Completed");
        const colorClass =
          status === "Active"
            ? "bg-green-100 text-green-700 border-green-200"
            : status === "Completed"
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "bg-gray-100 text-gray-700 border-gray-200";

        return (
          <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => setSelectedContract(row)}
          >
            <Eye className="w-3.5 h-3.5" />
            Breakdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
            onClick={() => setInvoicingContract(row)}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            إصدار فاتورة
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-blue-50/50 border-blue-200">
          <span className="text-xs text-blue-700 font-semibold block uppercase">
            {t?.customerContracts?.totalContractValue || "Total Contract Value"}
          </span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block">
            ${totalAgreedValue.toLocaleString()}
          </span>
          <p className="text-[11px] text-blue-700 mt-0.5">Agreed commercial commitment</p>
        </div>
        <div className="p-4 border rounded-xl bg-emerald-50/50 border-emerald-200">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">
            {t?.customerContracts?.advanceReceived || "Advance Received"}
          </span>
          <span className="text-2xl font-bold text-emerald-900 mt-1 block">
            ${totalAdvanceCollected.toLocaleString()}
          </span>
          <p className="text-[11px] text-emerald-700 mt-0.5">Paid upfront prior to full billing</p>
        </div>
        <div className="p-4 border rounded-xl bg-purple-50/50 border-purple-200">
          <span className="text-xs text-purple-700 font-semibold block uppercase">
            {t?.customerContracts?.remainingToCollect || "Remaining to Collect"}
          </span>
          <span className="text-2xl font-bold text-purple-900 mt-1 block">
            ${totalRemainingToCollect.toLocaleString()}
          </span>
          <p className="text-[11px] text-purple-700 mt-0.5">
            Total Commitment minus upfront advance
          </p>
        </div>
      </div>

      {/* Rules & Concepts Callout from Page 5 & Page 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-teal-50/90 border-r-4 border-teal-600 rounded-xl text-xs space-y-2">
          <p className="font-bold text-teal-950 flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            مثال لفهم الكميات والفوترة (Quantities vs Payment):
          </p>
          <p className="text-teal-900 leading-relaxed">
            عقد يتضمن 10 جلسات بسعر 100 للجلسة؛ إجماليه 1,000. إذا فُوترت 3 جلسات، تصبح الكمية المفوترة 3 والمتاحة للفوترة 7. إذا لم يدفع العميل، فلا يصبح العقد مدفوعاً لمجرد إصدار الفاتورة.
          </p>
          <div className="pt-1 text-[11px] text-teal-800 font-medium">
            • المتبقي للفوترة = الكمية المتعاقد عليها ناقص الكمية المفوترة.
          </div>
        </div>

        <div className="p-4 bg-amber-50/90 border-r-4 border-amber-600 rounded-xl text-xs space-y-2">
          <p className="font-bold text-amber-950 flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            الأقساط والعربون ومنع احتسابه مرتين (Advance & Installments):
          </p>
          <p className="text-amber-900 leading-relaxed">
            عقد 1,000 وعربون 200 يعني أن المتبقي للتحصيل 800. عند إصدار الفواتير يجب تخصيص العربون لها بآلية واضحة، دون تسجيل مبلغ 200 نفسه مرة أخرى كتحصيل جديد.
          </p>
          <div className="pt-1 text-[11px] text-amber-800 font-medium">
            • قاعدة متسقة: مجموع الأقساط يمثل إما العقد كاملاً أو الرصيد بعد العربون دون خلط.
          </div>
        </div>

        {/* Page 6: إصدار فاتورة من العقد */}
        <div className="p-4 bg-blue-50/90 border-r-4 border-blue-600 rounded-xl text-xs space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
              <Receipt className="w-4 h-4 text-blue-600" />
              إصدار فاتورة من العقد (Invoicing from Contract - دليل وسام):
            </p>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
              GetAvailableDataForInvoiceAsync
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-900 leading-relaxed">
            <div>
              • <strong>قائمتان بالطلب:</strong> قائمة بنود العقد والكميات المراد فوترتها (ContractItemsDtoInvoices) وقائمة الأقساط المرتبطة بها اختيارياً (InstallmentIds)، ويُشترط تطابق مجموع الأقساط المختارة بدقة مع إجمالي الفاتورة.
            </div>
            <div>
              • <strong>توافق الدفع وفصل التحصيل:</strong> الدفع النقدي أو البنكي يجعل الفاتورة مدفوعة بالكامل. للتحصيل الجزئي يجب استخدام نمط آجل (Credit). الفاتورة تسجل المرجع المنظم للعقد مباشرة.
            </div>
          </div>
        </div>
      </div>

      <DataView
        data={filteredContracts}
        isLoading={isLoading}
        getRowId={(row, idx) => row.id || `contract-${idx}`}
        search={{
          placeholder: "Search contracts by number or title...",
          value: search,
          onChange: setSearch,
        }}
        addButton={{
          label: "Add Customer Contract",
          onClick: () => setIsAddOpen(true),
        }}
        columns={columns}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
      />

      <AddContractDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        customerId={customerId}
      />

      {selectedContract && (
        <ContractBreakdownDialog
          contract={selectedContract}
          open={!!selectedContract}
          onOpenChange={(val) => {
            if (!val) setSelectedContract(null);
          }}
          onIssueInvoice={() => {
            setInvoicingContract(selectedContract);
            setSelectedContract(null);
          }}
        />
      )}

      {invoicingContract && (
        <IssueContractInvoiceDialog
          contract={invoicingContract}
          open={!!invoicingContract}
          onOpenChange={(val) => {
            if (!val) setInvoicingContract(null);
          }}
        />
      )}
    </div>
  );
}

function AddContractDialog({ open, onOpenChange, customerId }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Load Projects belonging strictly to this customer ("فحص مهم: انتماء المشروع إلى العميل نفسه")
  const { data: customerProjectsData } = useQuery({
    queryKey: ["customerProjectsList", customerId],
    queryFn: () => getCustomerProjects({ CustomerId: customerId, PageSize: 50 }),
    enabled: !!customerId && open,
  });

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: !!customerId && open,
  });

  const customerName =
    customerData?.data?.customerName ||
    customerData?.customerName ||
    customerData?.name ||
    "Customer";
  const projects = customerProjectsData?.data?.items || [];

  const [formData, setFormData] = useState({
    contractNumber: `CC-${Date.now().toString().slice(-5)}`,
    title: "",
    projectName: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
    terms_And_Conditions: "",
    description: "",
    advancePayment: "0",
    installmentRule: "afterAdvance", // "full" | "afterAdvance"
  });

  // Multiple Items State
  const [items, setItems] = useState([
    {
      id: "1",
      custom_Item_Name: "",
      itemType: "Service", // "Service" | "Inventory"
      quantity: "10",
      unit_Price: "100",
    },
  ]);

  // Installments Schedule State
  const [installments, setInstallments] = useState([
    {
      id: "1",
      installment_Name: "القسط الأول (First Installment)",
      amount: "400",
      due_Date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    },
    {
      id: "2",
      installment_Name: "القسط الثاني (Second Installment)",
      amount: "400",
      due_Date: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
    },
  ]);

  // Computations
  const totalContractAmount = useMemo(() => {
    return items.reduce((acc, it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unit_Price) || 0;
      return acc + q * p;
    }, 0);
  }, [items]);

  const advanceNum = Number(formData.advancePayment) || 0;
  const remainingToCollect = Math.max(0, totalContractAmount - advanceNum);

  const installmentsSum = useMemo(() => {
    return installments.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
  }, [installments]);

  const targetInstallmentsTotal =
    formData.installmentRule === "afterAdvance" ? remainingToCollect : totalContractAmount;

  const installmentDifference = targetInstallmentsTotal - installmentsSum;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        custom_Item_Name: "",
        itemType: "Service",
        quantity: "1",
        unit_Price: "0",
      },
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length <= 1) {
      toast.error("Contract must have at least one item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const handleAddInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        installment_Name: `Installment #${prev.length + 1}`,
        amount: "0",
        due_Date: new Date(Date.now() + (prev.length + 1) * 30 * 86400000)
          .toISOString()
          .split("T")[0],
      },
    ]);
  };

  const handleRemoveInstallment = (idx) => {
    setInstallments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleInstallmentChange = (idx, field, value) => {
    setInstallments((prev) => {
      const copy = [...prev];
      copy[idx][field] = value;
      return copy;
    });
  };

  const autoSplitInstallments = (count) => {
    const target = targetInstallmentsTotal;
    const splitAmount = Math.round((target / count) * 100) / 100;
    const newInsts = [];
    for (let i = 1; i <= count; i++) {
      newInsts.push({
        id: `auto-${i}`,
        installment_Name: `قسط شهر ${i}`,
        amount: i === count ? (target - splitAmount * (count - 1)).toFixed(2) : splitAmount.toFixed(2),
        due_Date: new Date(Date.now() + i * 30 * 86400000).toISOString().split("T")[0],
      });
    }
    setInstallments(newInsts);
  };

  const createMutation = useMutation({
    mutationFn: (data) => createCustomerContract(data),
    onSuccess: () => {
      toast.success("Contract created successfully");
      queryClient.invalidateQueries(["customerContracts", customerId]);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to create contract");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a contract title");
      return;
    }
    if (items.some((it) => !it.custom_Item_Name.trim())) {
      toast.error("Please fill in names for all contract items");
      return;
    }

    // Check installment alignment
    if (Math.abs(installmentDifference) > 1 && installments.length > 0) {
      toast.error(
        `Installments sum ($${installmentsSum.toLocaleString()}) does not match target ($${targetInstallmentsTotal.toLocaleString()}) under rule: ${
          formData.installmentRule === "afterAdvance"
            ? "الرصيد بعد العربون"
            : "كامل قيمة العقد"
        }`
      );
      return;
    }

    const payload = {
      customerId,
      contractNumber: formData.contractNumber,
      title: formData.title,
      projectName: formData.projectName || null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalAmount: totalContractAmount,
      advancePayment: advanceNum,
      terms_And_Conditions: formData.terms_And_Conditions,
      description: formData.description,
      items: items.map((it) => ({
        custom_Item_Name: it.custom_Item_Name,
        quantity: Number(it.quantity) || 1,
        unit_Price: Number(it.unit_Price) || 0,
        description: `Type: ${it.itemType}`,
      })),
      installments: installments.map((inst) => ({
        installment_Name: inst.installment_Name,
        amount: Number(inst.amount) || 0,
        due_Date: inst.due_Date,
      })),
    };

    createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[760px] max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background rounded-2xl border-0 shadow-xl"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {t?.customerContracts?.addContract || "Add Customer Contract & Items"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define services/goods, quantities, advance payment, and installment schedule
              </p>
            </div>
          </div>
          <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted border border-border cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>

        <form
          id="add-customer-contract-form"
          onSubmit={handleSubmit}
          className="px-6 py-4 space-y-6 overflow-y-auto flex-1 min-h-0 text-xs"
        >
          {/* Section 1: Basic Info & Project Association */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              1. بيانات العقد والمشروع المرتبط
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">{t?.customerContracts?.customer || "Customer"}</Label>
                <Input value={customerName} disabled className="h-9 bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">
                  {t?.customerContracts?.linkProject || "Link Project"}
                </Label>
                <Select
                  value={formData.projectName || "none"}
                  onValueChange={(val) =>
                    setFormData({ ...formData, projectName: val === "none" ? "" : val })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Customer Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t?.customerContracts?.noProjectLink || "No project link"}</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.projectName}>
                        {p.projectName} (${Number(p.projectValue || p.value || 0).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">
                  {t?.customerContracts?.contractTitle || "Contract Title"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. عقد تقديم خدمات استشارية / تجهيز"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Contract Number</Label>
                <Input
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                2. بنود العقد (الأصناف أو الخدمات، الكميات، والأسعار)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Item / Service Name</th>
                    <th className="p-2.5 w-32">Type</th>
                    <th className="p-2.5 w-24">Qty</th>
                    <th className="p-2.5 w-28">Unit Price ($)</th>
                    <th className="p-2.5 w-28 text-right">Line Total</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {items.map((item, idx) => {
                    const lineTot = (Number(item.quantity) || 0) * (Number(item.unit_Price) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <Input
                            placeholder="e.g. جلسات استشارية / منتج"
                            value={item.custom_Item_Name}
                            onChange={(e) =>
                              handleItemChange(idx, "custom_Item_Name", e.target.value)
                            }
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={item.itemType}
                            onValueChange={(val) => handleItemChange(idx, "itemType", val)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Service">{t?.customerContracts?.service || "Service"}</SelectItem>
                              <SelectItem value="Inventory">{t?.customerContracts?.stock || "Stock"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_Price}
                            onChange={(e) => handleItemChange(idx, "unit_Price", e.target.value)}
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-blue-600">
                          ${lineTot.toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
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

            <div className="flex justify-end pr-4 text-xs font-bold text-slate-800">
              Total Contract Amount: ${totalContractAmount.toLocaleString()}
            </div>
          </div>

          {/* Section 3: Advance Payment & Installments Rule (الأقساط والعربون: اختر قاعدة واحدة) */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b pb-1">
              <DollarSign className="w-4 h-4 text-purple-600" />
              3. العربون المستلم وجدول الأقساط (اختيار القاعدة المحاسبية)
            </h4>

            {/* Advance payment input */}
            <div className="grid grid-cols-2 gap-4 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-purple-950">
                  {t?.customerContracts?.advancePayment || "Advance Payment"} ($)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max={totalContractAmount}
                  value={formData.advancePayment}
                  onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                  className="h-9 bg-white"
                />
                <span className="text-[10px] text-purple-800 block">
                  مبلغ مستلم فعلياً يقلل المتبقي للتحصيل
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-xs text-purple-950">
                  قاعدة احتساب الأقساط (Consistency Rule)
                </Label>
                <Select
                  value={formData.installmentRule}
                  onValueChange={(val) => setFormData({ ...formData, installmentRule: val })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="afterAdvance">
                      تمثل الرصيد بعد العربون (${remainingToCollect.toLocaleString()})
                    </SelectItem>
                    <SelectItem value="full">
                      تمثل قيمة العقد كاملة (${totalContractAmount.toLocaleString()})
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-purple-800 block">
                  تجنب الخلط بين مجموع الأقساط والعربون
                </span>
              </div>
            </div>

            {/* Installments Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  جدول استحقاقات الأقساط (ليست إيصالات دفع بل مواعيد استحقاق)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground mr-1">Quick Split:</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => autoSplitInstallments(2)}
                    className="h-6 text-[10px] px-2"
                  >
                    2 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => autoSplitInstallments(4)}
                    className="h-6 text-[10px] px-2"
                  >
                    4 Months
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInstallment}
                    className="h-6 text-[10px] px-2 gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </Button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5">Installment Name</th>
                      <th className="p-2.5 w-36">Due Date</th>
                      <th className="p-2.5 w-32">Amount ($)</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {installments.map((inst, idx) => (
                      <tr key={inst.id} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <Input
                            value={inst.installment_Name}
                            onChange={(e) =>
                              handleInstallmentChange(idx, "installment_Name", e.target.value)
                            }
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="date"
                            value={inst.due_Date}
                            onChange={(e) =>
                              handleInstallmentChange(idx, "due_Date", e.target.value)
                            }
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            value={inst.amount}
                            onChange={(e) =>
                              handleInstallmentChange(idx, "amount", e.target.value)
                            }
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveInstallment(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Installment sum validation badge */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border">
                <div>
                  <span className="text-muted-foreground">Target Installments Total: </span>
                  <span className="font-bold text-foreground">
                    ${targetInstallmentsTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sum: </span>
                  <span className="font-bold text-blue-600">
                    ${installmentsSum.toLocaleString()}
                  </span>
                  {Math.abs(installmentDifference) < 0.01 ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold">
                      ✓ Matched
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[11px] font-semibold">
                      Difference: ${installmentDifference.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Terms and Conditions */}
          <div className="space-y-2">
            <Label className="font-semibold text-xs">
              {t?.customerContracts?.termsAndConditions || "Terms & Conditions"}
            </Label>
            <Textarea
              placeholder="Contractual obligations, handover dates, cancellation terms..."
              value={formData.terms_And_Conditions}
              onChange={(e) => setFormData({ ...formData, terms_And_Conditions: e.target.value })}
              className="min-h-[70px] resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border bg-background shrink-0 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-customer-contract-form"
            className="bg-blue-600 hover:bg-blue-700 px-6 font-medium"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Save Contract"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContractBreakdownDialog({ contract, open, onOpenChange, onIssueInvoice }) {
  const { t } = useI18n();
  const items = contract.items || [];
  const installments = contract.installments || [];
  const total = Number(contract.totalAmount || contract.total || 0);
  const advance = Number(contract.advancePayment || contract.securityDeposit || 0);
  const remaining = Math.max(0, total - advance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <DialogTitle className="text-base font-bold">
                Contract Breakdown: {contract.contractNumber || contract.title}
              </DialogTitle>
            </div>
            {onIssueInvoice && (
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-8 font-semibold"
                onClick={onIssueInvoice}
              >
                <Receipt className="w-3.5 h-3.5" />
                إصدار فاتورة الآن
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-xs">
          {/* Summary Financials */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border rounded-xl">
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Contract</span>
              <span className="font-bold text-blue-600 text-sm">${total.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t?.customerContracts?.advance || "Advance"}
              </span>
              <span className="font-bold text-emerald-600 text-sm">${advance.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t?.customerContracts?.remainingToCollect || "Remaining to Collect"}
              </span>
              <span className="font-bold text-purple-700 text-sm">
                ${remaining.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Items & Quantities Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Contract Items & Invoiced Quantities</h4>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Contracted Qty</th>
                    <th className="p-2">Billed Qty</th>
                    <th className="p-2">Available to Invoice</th>
                    <th className="p-2 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-muted-foreground">
                        Standard contract item (1 Unit)
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const q = Number(it.quantity || 1);
                      const b = Number(it.invoicedQuantity || 0);
                      const rem = Math.max(0, q - b);
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.custom_Item_Name}</td>
                          <td className="p-2">{q}</td>
                          <td className="p-2 text-amber-700 font-semibold">{b}</td>
                          <td className="p-2 text-emerald-700 font-bold">{rem}</td>
                          <td className="p-2 text-right">${Number(it.unit_Price || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Installments Schedule */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground">
              {t?.customerContracts?.installmentsSchedule || "Installments Schedule"}
            </h4>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[11px] font-semibold text-slate-700">
                  <tr>
                    <th className="p-2">Installment</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {installments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-muted-foreground">
                        Single full installment (${total.toLocaleString()})
                      </td>
                    </tr>
                  ) : (
                    installments.map((inst, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{inst.installment_Name}</td>
                        <td className="p-2 text-muted-foreground">
                          {inst.due_Date ? new Date(inst.due_Date).toLocaleDateString() : "-"}
                        </td>
                        <td className="p-2 text-right font-bold text-blue-600">
                          ${Number(inst.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

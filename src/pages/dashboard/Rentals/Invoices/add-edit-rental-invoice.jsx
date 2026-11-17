import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  Receipt,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from "lucide-react";
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
  createRentalInvoice,
  getRentalInvoiceLookups,
} from "@/services/rentals";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export default function AddEditRentalInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const [dynamicFields, setDynamicFields] = useState([]);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Form state matching Image 2 & Page 6
  const [formData, setFormData] = useState({
    rentalContract: "",
    returnDate: "",
    invoiceMode: "",
    damageAmount: "0",
    closeContractAfterInvoicing: false,
    damageNote: "",
    paymentMethod: "Credit", // Default to Credit to support partial cash collection
    paidAmount: "0",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["rentalInvoiceLookups"],
    queryFn: getRentalInvoiceLookups,
  });
  const lookups = lookupsData?.data || { contracts: [] };

  // Calculations for Summary Card
  const calculations = useMemo(() => {
    const damage = Number(formData.damageAmount) || 0;
    const selectedContract = lookups.contracts.find(
      (c) => String(c.id) === String(formData.rentalContract)
    );
    const contractBase = selectedContract ? (selectedContract.totalAmount || 0) : 0;
    const invoiceTotal = contractBase + damage;

    return {
      summary: contractBase,
      damageFees: damage,
      invoiceTotal,
    };
  }, [formData, lookups]);


  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) => createRentalInvoice(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rentalInvoices"]);
      toast.success(res?.message || t("rentalsModule.invoiceCreated"));
      navigate("/dashboard/rentals/invoices");
    },
    onError: () => {
      toast.error(t("rentalsModule.invoiceCreateFailed"));
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDynamicField = () => {
    if (!newFieldName.trim()) {
      toast.error(t("rentalsModule.pleaseEnterVariableName"));
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

  const selectedContract = useMemo(() => {
    return (lookups.contracts || []).find(
      (c) => String(c.id) === String(formData.rentalContract)
    ) || null;
  }, [formData.rentalContract, lookups.contracts]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.rentalContract) {
      toast.error(t("rentalsModule.pleaseSelectContract"));
      return;
    }

    // Payment method compatibility check (Page 6 from guide)
    const paid = Number(formData.paidAmount) || 0;
    if (
      (formData.paymentMethod === "Cash" || formData.paymentMethod === "Bank") &&
      paid < calculations.invoiceTotal &&
      calculations.invoiceTotal > 0
    ) {
      toast.error(
        `${t("rentalsModule.paymentCompatibilityAlert")} ($${calculations.invoiceTotal.toFixed(2)}).`
      );
      return;
    }

    const dynamicDetails = dynamicFields.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    saveMutation.mutate({
      ...formData,
      dynamicDetails,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={t("rentalsModule.addRentalInvoice")}
          breadcrumbLinks={[
            { label: t("rentalsModule.rentalInvoices"), href: "/dashboard/rentals/invoices" },
            { label: t("rentalsModule.addRentalInvoice") },
          ]}
          infoTooltip={t("rentalsModule.createInvoiceTooltip")}
        />

        <Button
          type="submit"
          disabled={saveMutation.isPending || !formData.rentalContract}
          className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
          title={!formData.rentalContract ? t("rentalsModule.selectRentalContractPrompt") : ""}
        >
          {saveMutation.isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
          )}
          {t("common.save")}
        </Button>
      </div>

      {/* Page 6 Guidance Alert */}
      <div className="p-4 bg-blue-50/90 border-r-4 border-blue-600 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
            <Receipt className="w-4 h-4 text-blue-600" />
            {t("rentalsModule.invoicingPaymentCompatibilityHeader")}
          </p>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            ContractItemsDtoInvoices & Collections
          </span>
        </div>
        <p className="text-blue-900 leading-relaxed">
          {t("rentalsModule.invoicingPaymentCompatibilityDesc")}
        </p>
      </div>

      {/* Main Grid: Left 8 cols (Form) + Right 4 cols (Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Invoice Details matching Image 2 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              {t("rentalsModule.invoiceDetails")}
            </h2>

            {/* Row 1: Rental Contract */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                {t("rentalsModule.rentalContract")}
              </Label>
              <Select
                value={formData.rentalContract}
                onValueChange={(val) => handleInputChange("rentalContract", val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder={t("rentalsModule.selectRentalContract")} />
                </SelectTrigger>
                <SelectContent>
                  {(lookups.contracts || []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedContract && (
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1.5 text-xs mt-2">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {t("rentalsModule.contractNumberRef")} {selectedContract.contractNumber}
                    </span>
                    <span className="text-blue-700">
                      {t("rentalsModule.amountRef")} ${Number(selectedContract.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {`${selectedContract.installments?.length || 0} ${t("rentalsModule.scheduledInstallmentsAvailable")}`}
                  </p>
                </div>
              )}
            </div>

            {/* Row 2: Return Date, Invoice Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {t("rentalsModule.returnDate")}
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleInputChange("returnDate", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
                  />
                  <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {t("rentalsModule.invoiceMode")}
                </Label>
                <Input
                  placeholder={t("rentalsModule.contractNumberPlaceholder")}
                  value={formData.invoiceMode}
                  onChange={(e) => handleInputChange("invoiceMode", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>
            </div>

            {/* Row 3: Damage Amount + Close Contract Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  {t("rentalsModule.damageAmount")}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.damageAmount}
                  onChange={(e) => handleInputChange("damageAmount", e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                />
              </div>

              <div className="pt-6 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="closeContract"
                  checked={formData.closeContractAfterInvoicing}
                  onChange={(e) =>
                    handleInputChange("closeContractAfterInvoicing", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-slate-300 accent-[#0066d1] cursor-pointer"
                />
                <label
                  htmlFor="closeContract"
                  className="text-xs font-medium text-slate-600 cursor-pointer"
                >
                  {t("rentalsModule.closeContractAfterInvoicing")}
                </label>
              </div>
            </div>

            {/* Row 4: Damage Note */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                {t("rentalsModule.damageNote")}
              </Label>
              <Textarea
                rows={4}
                placeholder={t("rentalsModule.notesPlaceholder")}
                value={formData.damageNote}
                onChange={(e) => handleInputChange("damageNote", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>

            {/* Row 5: Payment Method & Paid Amount (Page 6) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    {t("rentalsModule.paymentMethod")}
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(val) => handleInputChange("paymentMethod", val)}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                      <SelectValue placeholder={t("rentalsModule.paymentMethod")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit">{t("invoicePatterns.payments.credit")}</SelectItem>
                      <SelectItem value="Cash">{t("invoicePatterns.payments.cash")}</SelectItem>
                      <SelectItem value="Bank">{t("rentalsModule.bankTransfer")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{t("rentalsModule.paidAmount")}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {`${t("rentalsModule.debtBalance")} $${(Math.max(0, calculations.invoiceTotal - (Number(formData.paidAmount) || 0))).toFixed(2)}`}
                    </span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange("paidAmount", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
                  />
                </div>
              </div>

              {((formData.paymentMethod === "Cash" || formData.paymentMethod === "Bank") &&
                Number(formData.paidAmount) < calculations.invoiceTotal &&
                calculations.invoiceTotal > 0) && (
                <div className="p-3 bg-amber-50 border-r-4 border-amber-600 rounded-lg text-amber-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    {t("rentalsModule.paymentCompatibility")}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    {`${t("rentalsModule.paymentCompatibilityAlert")} ($${calculations.invoiceTotal.toFixed(2)}).`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Additional Data (dynamicDetails) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {t("rentalsModule.additionalData")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {dynamicFields.length === 0
                    ? t("rentalsModule.noExtraFields")
                    : `${dynamicFields.length} ${t("rentalsModule.customFieldsDefined")}`}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsFieldModalOpen(true)}
                className="bg-[#0066d1] hover:bg-[#0052a8] text-white h-10 px-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t("common.add")}
              </Button>
            </div>

            {dynamicFields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                {dynamicFields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {field.key}
                      </p>
                      <p className="text-xs text-slate-500">{field.value}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDynamicField(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Card (4 cols) matching Image 2 */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5 sticky top-6">
          <h2 className="text-base font-bold text-slate-800">
            {t("common.all") || "Summary"}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>{t("rentalsModule.contractTotal")}</span>
              <span className="font-semibold text-slate-800">
                ${calculations.summary.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>{t("rentalsModule.damagePenaltyCharges")}</span>
              <span className="font-semibold text-slate-800">
                ${calculations.damageFees.toFixed(2)}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#0066d1]">
                {t("rentalsModule.total")}
              </span>
              <span className="text-base font-bold text-[#0066d1]">
                ${calculations.invoiceTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("rentalsModule.creditInvoiceNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Add Custom Field Modal */}
      <DynamicModal
        open={isFieldModalOpen}
        onOpenChange={setIsFieldModalOpen}
        title={t("rentalsModule.addDynamicField")}
        icon={Plus}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {t("rentalsModule.fieldNameKey")}
            </Label>
            <Input
              placeholder={t("rentalsModule.fieldNamePlaceholder")}
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              {t("rentalsModule.fieldValue")}
            </Label>
            <Input
              placeholder={t("rentalsModule.fieldValuePlaceholder")}
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFieldModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleAddDynamicField}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              {t("rentalsModule.addField")}
            </Button>
          </div>
        </div>
      </DynamicModal>
    </form>
  );
}

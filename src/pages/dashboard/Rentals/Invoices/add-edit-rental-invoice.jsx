import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  createRentalInvoice,
  getRentalInvoiceLookups,
} from "@/services/rentals";

export default function AddEditRentalInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dynamicFields, setDynamicFields] = useState([]);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Form state matching Image 2
  const [formData, setFormData] = useState({
    rentalContract: "",
    returnDate: "",
    invoiceMode: "",
    damageAmount: "0",
    closeContractAfterInvoicing: false,
    damageNote: "",
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
    const contractBase = formData.rentalContract ? 300 : 0;
    const invoiceTotal = contractBase + damage;

    return {
      summary: contractBase,
      damageFees: damage,
      invoiceTotal,
    };
  }, [formData]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) => createRentalInvoice(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["rentalInvoices"]);
      toast.success(res?.message || "Rental invoice created!");
      navigate("/dashboard/rentals/invoices");
    },
    onError: () => {
      toast.error("Failed to create rental invoice");
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
    if (!formData.rentalContract) {
      toast.error("Please select a rental contract");
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
          title="Add New Rental Invoice"
          breadcrumbLinks={[
            { label: "Rental Invoices", href: "/dashboard/rentals/invoices" },
            { label: "Add New Rental Invoice" },
          ]}
          infoTooltip="Create a closing return invoice for an active rental contract and record damages."
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

      {/* Main Grid: Left 8 cols (Form) + Right 4 cols (Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Invoice Details matching Image 2 */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800">
              Invoice Details
            </h2>

            {/* Row 1: Rental Contract */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Rental Contract
              </Label>
              <Select
                value={formData.rentalContract}
                onValueChange={(val) => handleInputChange("rentalContract", val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="Rental Contract" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Return Date, Invoice Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Return Date
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
                  Invoice Mode
                </Label>
                <Input
                  placeholder="Contract Number"
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
                  Damage Amount
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
                  Close contract after invoicing
                </label>
              </div>
            </div>

            {/* Row 4: Damage Note */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Damage Note
              </Label>
              <Textarea
                rows={4}
                placeholder="Notes"
                value={formData.damageNote}
                onChange={(e) => handleInputChange("damageNote", e.target.value)}
                className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>

          {/* Card 2: Additional Data (dynamicDetails) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Additional Data (dynamicDetails)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {dynamicFields.length === 0
                    ? "No extra fields. Add custom variables like DriverLicenseNumber, FuelLevel..."
                    : `${dynamicFields.length} custom field(s) defined.`}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsFieldModalOpen(true)}
                className="bg-[#0066d1] hover:bg-[#0052a8] text-white h-10 px-4 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add
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
            Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Summary</span>
              <span className="font-semibold text-slate-800">
                ${calculations.summary.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Damage Fees</span>
              <span className="font-semibold text-slate-800">
                ${calculations.damageFees.toFixed(2)}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-[#0066d1]">
                Invoice Total
              </span>
              <span className="text-base font-bold text-[#0066d1]">
                ${calculations.invoiceTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Issued as a credit invoice — payments are recorded afterwards on the invoice page
            </p>
          </div>
        </div>
      </div>

      {/* Add Custom Field Modal */}
      <DynamicModal
        open={isFieldModalOpen}
        onOpenChange={setIsFieldModalOpen}
        title="Add Dynamic Field"
        icon={Plus}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Field Name / Key
            </Label>
            <Input
              placeholder="e.g. ReturnedBy, InspectionReportId"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Field Value
            </Label>
            <Input
              placeholder="e.g. Ahmed Ali, PASS"
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
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddDynamicField}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              Add Field
            </Button>
          </div>
        </div>
      </DynamicModal>
    </form>
  );
}

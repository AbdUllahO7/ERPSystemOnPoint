import { useState, useEffect } from "react";
import { FileCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccountingSettings, updateAccountingSettings } from "@/lib/api";
import toast from "react-hot-toast";

export default function AccountingSettingsTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    inventory_Valuation_Method: "FIFO",
    entitlement_Basis: "Accrual",
    automatic_Posting_Of_Journal_Entries: true,
    require_Cost_Center_For_Each_Entry: false,
    require_Approval_Before_Posting: false,
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["getAccountingSettings"],
    queryFn: getAccountingSettings,
  });

  useEffect(() => {
    const raw = settingsData?.data || settingsData;
    if (raw && typeof raw === "object") {
      setFormData({
        id: raw.id,
        inventory_Valuation_Method: raw.inventory_Valuation_Method || "FIFO",
        entitlement_Basis: raw.entitlement_Basis || "Accrual",
        automatic_Posting_Of_Journal_Entries: Boolean(raw.automatic_Posting_Of_Journal_Entries),
        require_Cost_Center_For_Each_Entry: Boolean(raw.require_Cost_Center_For_Each_Entry),
        require_Approval_Before_Posting: Boolean(raw.require_Approval_Before_Posting),
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateAccountingSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAccountingSettings"]);
      toast.success("Accounting settings saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save accounting settings:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save accounting settings!"
      );
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-primary bg-primary/10">
            <FileCog className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Accounting Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Valuation methods, entitlement basis, and journal posting policies
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || saveMutation.isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {saveMutation.isPending || saveMutation.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground">Accounting Policies</h4>
          <p className="text-sm text-muted-foreground mt-1">
            General accounting and valuation rules adopted across the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Inventory Valuation Method
            </Label>
            <Select
              value={formData.inventory_Valuation_Method}
              onValueChange={(val) => handleChange("inventory_Valuation_Method", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Valuation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                <SelectItem value="WeightedAverage">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Entitlement Basis
            </Label>
            <Select
              value={formData.entitlement_Basis}
              onValueChange={(val) => handleChange("entitlement_Basis", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Entitlement Basis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Accrual">Accrual Basis</SelectItem>
                <SelectItem value="Cash">Cash Basis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Automatic posting of journal entries
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically post invoices and vouchers directly to the general ledger
              </p>
            </div>
            <Switch
              checked={formData.automatic_Posting_Of_Journal_Entries}
              onCheckedChange={(val) => handleChange("automatic_Posting_Of_Journal_Entries", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Require cost center for each journal entry
              </p>
              <p className="text-xs text-muted-foreground">
                Mandates assigning a cost center on all debit/credit voucher lines
              </p>
            </div>
            <Switch
              checked={formData.require_Cost_Center_For_Each_Entry}
              onCheckedChange={(val) => handleChange("require_Cost_Center_For_Each_Entry", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Require approval before posting
              </p>
              <p className="text-xs text-muted-foreground">
                Requires managerial approval before transactions are locked
              </p>
            </div>
            <Switch
              checked={formData.require_Approval_Before_Posting}
              onCheckedChange={(val) => handleChange("require_Approval_Before_Posting", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

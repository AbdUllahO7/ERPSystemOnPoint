import { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getFiscalYearSettings, updateFiscalYearSettings } from "@/lib/api";
import toast from "react-hot-toast";

export default function FiscalYearTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    startFiscalYear: "",
    endFiscalYear: "",
    lastClosingDate: "",
    periodType: "Monthly",
    preventModificationOfClosedPeriods: true,
    monthlyAutomaticShutdown: false,
    allowRetroactiveEntries: false,
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["getFiscalYearSettings"],
    queryFn: getFiscalYearSettings,
  });

  useEffect(() => {
    const raw = settingsData?.data || settingsData;
    if (raw && typeof raw === "object") {
      setFormData({
        startFiscalYear: raw.startFiscalYear ? raw.startFiscalYear.split("T")[0] : "",
        endFiscalYear: raw.endFiscalYear ? raw.endFiscalYear.split("T")[0] : "",
        lastClosingDate: raw.lastClosingDate ? raw.lastClosingDate.split("T")[0] : "",
        periodType: raw.periodType || "Monthly",
        preventModificationOfClosedPeriods: Boolean(raw.preventModificationOfClosedPeriods),
        monthlyAutomaticShutdown: Boolean(raw.monthlyAutomaticShutdown),
        allowRetroactiveEntries: Boolean(raw.allowRetroactiveEntries),
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateFiscalYearSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getFiscalYearSettings"]);
      toast.success("Fiscal year settings saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save fiscal year settings:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save fiscal year settings!"
      );
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      startFiscalYear: formData.startFiscalYear ? new Date(formData.startFiscalYear).toISOString() : new Date().toISOString(),
      endFiscalYear: formData.endFiscalYear ? new Date(formData.endFiscalYear).toISOString() : new Date().toISOString(),
      lastClosingDate: formData.lastClosingDate ? new Date(formData.lastClosingDate).toISOString() : null,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-primary bg-primary/10">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Fiscal Year</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Preparing accounting periods and closings
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
          <h4 className="text-lg font-semibold text-foreground">Fiscal year and periods</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Setting the start and end of the fiscal year and accounting periods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Beginning of the fiscal year
            </Label>
            <Input
              type="date"
              value={formData.startFiscalYear}
              onChange={(e) => handleChange("startFiscalYear", e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              End of fiscal year
            </Label>
            <Input
              type="date"
              value={formData.endFiscalYear}
              onChange={(e) => handleChange("endFiscalYear", e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Type of periods</Label>
            <Select
              value={formData.periodType}
              onValueChange={(val) => handleChange("periodType", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Type of periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly (شهري)</SelectItem>
                <SelectItem value="Quarterly">Quarterly (ربع سنوي)</SelectItem>
                <SelectItem value="SemiAnnual">Semi-Annual (نصف سنوي)</SelectItem>
                <SelectItem value="Annual">Annual (سنوي)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Last closing date
            </Label>
            <Input
              type="date"
              value={formData.lastClosingDate}
              onChange={(e) => handleChange("lastClosingDate", e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Prevent modification of closed periods
              </p>
              <p className="text-xs text-muted-foreground">
                Locks all journal entries and invoices in completed fiscal periods
              </p>
            </div>
            <Switch
              checked={formData.preventModificationOfClosedPeriods}
              onCheckedChange={(val) => handleChange("preventModificationOfClosedPeriods", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Monthly automatic shutdown / closing
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically finalizes the accounting balance at month end
              </p>
            </div>
            <Switch
              checked={formData.monthlyAutomaticShutdown}
              onCheckedChange={(val) => handleChange("monthlyAutomaticShutdown", val)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <p className="font-semibold text-sm text-foreground">
                Allow retroactive entries
              </p>
              <p className="text-xs text-muted-foreground">
                Permits authorized users to back-date transactions
              </p>
            </div>
            <Switch
              checked={formData.allowRetroactiveEntries}
              onCheckedChange={(val) => handleChange("allowRetroactiveEntries", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

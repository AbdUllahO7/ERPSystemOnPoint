import { useState, useEffect } from "react";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLanguageAndRegionSettings,
  updateLanguageAndRegionSettings,
} from "@/lib/api";
import toast from "react-hot-toast";

export default function LanguageRegionTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    defaultLanguage: "ar",
    systemDirection: "rtl",
    calendar: "Gregorian",
    timeZoneId: "Asia/Riyadh",
    dateFormat: "DD/MM/YYYY",
    numberFormula: "1,234.56",
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["getLanguageAndRegionSettings"],
    queryFn: getLanguageAndRegionSettings,
  });

  useEffect(() => {
    const raw = settingsData?.data || settingsData;
    if (raw && typeof raw === "object") {
      setFormData({
        defaultLanguage: raw.defaultLanguage || "ar",
        systemDirection: raw.systemDirection || "rtl",
        calendar: raw.calendar || "Gregorian",
        timeZoneId: raw.timeZoneId || "Asia/Riyadh",
        dateFormat: raw.dateFormat || "DD/MM/YYYY",
        numberFormula: raw.numberFormula || "1,234.56",
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateLanguageAndRegionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getLanguageAndRegionSettings"]);
      toast.success("Language & region settings saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save language settings:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save language & region settings!"
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
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Language & Region</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Language, calendar, date format, and timezone
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
        <h4 className="text-lg font-semibold text-foreground mb-6">
          Regional Preferences
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Default Language</Label>
            <Select
              value={formData.defaultLanguage}
              onValueChange={(val) => {
                handleChange("defaultLanguage", val);
                handleChange("systemDirection", val === "ar" ? "rtl" : "ltr");
              }}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select default language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">System Direction</Label>
            <Select
              value={formData.systemDirection}
              onValueChange={(val) => handleChange("systemDirection", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select System direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rtl">Right to Left (RTL)</SelectItem>
                <SelectItem value="ltr">Left to Right (LTR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Calendar System</Label>
            <Select
              value={formData.calendar}
              onValueChange={(val) => handleChange("calendar", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gregorian">Gregorian</SelectItem>
                <SelectItem value="Hijri">Hijri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Time Zone</Label>
            <Select
              value={formData.timeZoneId}
              onValueChange={(val) => handleChange("timeZoneId", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Riyadh">Riyadh (GMT+3)</SelectItem>
                <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                <SelectItem value="Africa/Cairo">Cairo (GMT+2)</SelectItem>
                <SelectItem value="UTC">UTC (Universal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Date Format</Label>
            <Select
              value={formData.dateFormat}
              onValueChange={(val) => handleChange("dateFormat", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Date Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (26/10/2026)</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-10-26)</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (10/26/2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Number Format</Label>
            <Select
              value={formData.numberFormula}
              onValueChange={(val) => handleChange("numberFormula", val)}
            >
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Number Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1,234.56">1,234.56 (Standard comma)</SelectItem>
                <SelectItem value="1.234,56">1.234,56 (European dot)</SelectItem>
                <SelectItem value="1 234.56">1 234.56 (Space separated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

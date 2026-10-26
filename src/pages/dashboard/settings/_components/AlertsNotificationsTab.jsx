import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlertSettings, updateAlertSettings } from "@/lib/api";
import toast from "react-hot-toast";

const DEFAULT_ALERT_ITEMS = [
  { id: "1", title: "New sales invoice created (فاتورة مبيعات جديدة)" },
  { id: "2", title: "Low inventory stock warning (تنبيه نقص المخزون)" },
  { id: "3", title: "Contract expiration reminder (تنبيه قرب انتهاء العقد)" },
  { id: "4", title: "New employee leave request (طلب إجازة موظف)" },
  { id: "5", title: "Appointment booked or rescheduled (حجز موعد جديد)" },
];

export default function AlertsNotificationsTab() {
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState([]);

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["getAlertSettings"],
    queryFn: getAlertSettings,
  });

  useEffect(() => {
    const raw = alertsData?.data || alertsData;
    const items = Array.isArray(raw) ? raw : (raw?.items ? raw.items : []);
    if (items.length > 0) {
      setAlerts(
        items.map((item, idx) => ({
          id: item.id || String(idx + 1),
          title: item.title || item.name || DEFAULT_ALERT_ITEMS[idx]?.title || `Notification ${idx + 1}`,
          notifyWithinSystem: Boolean(item.notifyWithinSystem),
          notifyViaSMS: Boolean(item.notifyViaSMS),
          notifyViaEmail: Boolean(item.notifyViaEmail),
          notifyViaWhatsApp: Boolean(item.notifyViaWhatsApp),
        }))
      );
    } else {
      setAlerts(
        DEFAULT_ALERT_ITEMS.map((item) => ({
          ...item,
          notifyWithinSystem: true,
          notifyViaSMS: false,
          notifyViaEmail: true,
          notifyViaWhatsApp: false,
        }))
      );
    }
  }, [alertsData]);

  const saveMutation = useMutation({
    mutationFn: async (updatedAlerts) => {
      // Save each or send payload
      const promises = updatedAlerts.map((a) => updateAlertSettings(a));
      return Promise.allSettled(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getAlertSettings"]);
      toast.success("Notification settings saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save alert settings:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save alert settings!"
      );
    },
  });

  const handleToggle = (id, field) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: !a[field] } : a))
    );
  };

  const handleSave = () => {
    saveMutation.mutate(alerts);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-primary bg-primary/10">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Alerts & Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure system, SMS, email, and WhatsApp notifications
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

      {/* List of alerts */}
      <div className="space-y-4">
        {alerts.map((item) => (
          <div
            key={item.id}
            className="bg-card text-card-foreground rounded-xl border shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{item.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">In-App</span>
                <Switch
                  checked={item.notifyWithinSystem}
                  onCheckedChange={() => handleToggle(item.id, "notifyWithinSystem")}
                />
              </div>

              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">SMS</span>
                <Switch
                  checked={item.notifyViaSMS}
                  onCheckedChange={() => handleToggle(item.id, "notifyViaSMS")}
                />
              </div>

              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <Switch
                  checked={item.notifyViaEmail}
                  onCheckedChange={() => handleToggle(item.id, "notifyViaEmail")}
                />
              </div>

              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-muted/30">
                <span className="text-xs font-medium text-muted-foreground">WhatsApp</span>
                <Switch
                  checked={item.notifyViaWhatsApp}
                  onCheckedChange={() => handleToggle(item.id, "notifyViaWhatsApp")}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

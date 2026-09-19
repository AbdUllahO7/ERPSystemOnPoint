import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AlertsNotificationsTab() {
  const notifications = [
    { id: 1, title: "New invoice" },
    { id: 2, title: "New invoice" },
    { id: 3, title: "New invoice" },
    { id: 4, title: "New invoice" },
    { id: 5, title: "New invoice" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Alerts & Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">Email / SMS / WhatsApp / Push</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          Save Changes
        </Button>
      </div>

      {/* List of alerts */}
      <div className="space-y-4">
        {notifications.map((item) => (
          <div key={item.id} className="bg-card text-card-foreground rounded-xl border shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="font-semibold text-foreground">{item.title}</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 border rounded-lg px-4 py-2 bg-gray-50/50">
                <span className="text-sm font-medium text-muted-foreground">within the system</span>
                <Switch />
              </div>
              
              <div className="flex items-center gap-3 border rounded-lg px-4 py-2 bg-gray-50/50">
                <span className="text-sm font-medium text-muted-foreground">SMS</span>
                <Switch />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

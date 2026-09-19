import { useState } from "react";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function PreferencesTab() {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc");

  const themes = [
    {
      id: "light",
      label: "Light",
      bgClass: "bg-white border-gray-200",
      contentClass: "bg-gray-100",
    },
    {
      id: "dark",
      label: "Dark",
      bgClass: "bg-zinc-950 border-zinc-800",
      contentClass: "bg-zinc-800",
    },
    {
      id: "system",
      label: "System",
      bgClass: "bg-gradient-to-br from-white to-zinc-950 border-gray-200",
      contentClass: "bg-gray-500",
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* Appearance Section */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Appearance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Customize how your workspace looks on this device.
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {themes.map((t) => (
              <div key={t.id} className="space-y-3">
                <button
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`w-full aspect-[4/3] rounded-lg border-2 flex flex-col p-2 transition-all overflow-hidden ${
                    theme === t.id
                      ? "border-[#0070E0] ring-4 ring-[#0070E0]/10"
                      : "border-border hover:border-border/80"
                  } ${t.bgClass}`}
                >
                  <div className="flex items-center justify-between w-full mb-auto">
                    <div className="w-8 h-2 rounded-full bg-muted/50" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted/50" />
                      <div className="w-2 h-2 rounded-full bg-muted/50" />
                    </div>
                  </div>
                  <div className="w-full flex gap-2 h-2/3">
                    <div className="w-1/4 h-full rounded bg-muted/50" />
                    <div className={`w-3/4 h-full rounded ${t.contentClass}`} />
                  </div>
                </button>
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium">{t.label}</span>
                  {theme === t.id && (
                    <div className="w-4 h-4 rounded-full bg-[#0070E0] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-card rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Language</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select your preferred language for the interface.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="en">English (US)</option>
            <option value="ar">Arabic (العربية)</option>
            <option value="fr">French (Français)</option>
          </select>
        </div>
      </div>

      {/* Timezone Section */}
      <div className="bg-card rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Timezone</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Set your local timezone for dates and times.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="utc">UTC (Coordinated Universal Time)</option>
            <option value="est">EST (Eastern Standard Time)</option>
            <option value="pst">PST (Pacific Standard Time)</option>
            <option value="gmt">GMT (Greenwich Mean Time)</option>
          </select>
        </div>
      </div>
      
    </div>
  );
}

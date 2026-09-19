import { Database, RefreshCw } from "lucide-react";
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

export default function BackupTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex items-center gap-4">
        <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white shadow-sm">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Backup</h3>
          <p className="text-sm text-muted-foreground mt-1">Automatic daily backups and restores</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <h4 className="text-lg font-semibold text-foreground mb-6">Backup & Restore</h4>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border rounded-xl p-4">
            <p className="text-sm text-muted-foreground font-medium mb-2">Latest version</p>
            <p className="text-xl font-bold">4 hours ago</p>
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-sm text-muted-foreground font-medium mb-2">Size of all copy</p>
            <p className="text-xl font-bold">2.4 GB</p>
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-sm text-muted-foreground font-medium mb-2">Number of copies</p>
            <p className="text-xl font-bold">128</p>
          </div>
        </div>

        {/* Selects Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Copy scheduling</Label>
            <Select defaultValue="every_hour">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="every hour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="every_hour">every hour</SelectItem>
                <SelectItem value="daily">daily</SelectItem>
                <SelectItem value="weekly">weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Storage Location</Label>
            <Select defaultValue="">
              <SelectTrigger className="h-11 w-full bg-transparent">
                <SelectValue placeholder="Select storage location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Server</SelectItem>
                <SelectItem value="cloud">Cloud Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Switches */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <Label className="text-sm font-semibold text-foreground">Encrypting backups</Label>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <Label className="text-sm font-semibold text-foreground">Encrypting backups; automatically deleting backups older than 90 days</Label>
            <Switch />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button className="bg-[#0070F0] hover:bg-blue-700 text-white gap-2 h-11 px-6">
            <RefreshCw className="w-4 h-4" />
            Create Backup Now
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 h-11 px-6">
            Restore Backup
          </Button>
        </div>
      </div>
    </div>
  );
}
